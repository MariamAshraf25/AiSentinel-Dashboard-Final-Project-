from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.responses import JSONResponse
from jose import jwt
from pwdlib import PasswordHash
from pydantic import BaseModel
from datetime import datetime, timedelta
from typing import Optional
from datetime import timezone
import sqlite3
import uvicorn
import logging
import csv
import os
import time
import socketio
import pandas as pd
import json

from core.redis_client import redis_client as r
from anomaly.inference_pipeline import InferencePipeline
from security.security_pipeline import SecurityPipeline
from threat.inference_pipeline_td import ThreatInferencePipeline

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BASE_DIR, "users.db")

app = FastAPI()

# =========================================================
# Socket.io Setup
# =========================================================
sio = socketio.AsyncServer(
    async_mode='asgi',
    cors_allowed_origins='*',
    logger=True, 
    engineio_logger=True
)
app_sio = socketio.ASGIApp(sio)
combined_app = socketio.ASGIApp(
    socketio_server=sio, 
    other_asgi_app=app,
     )

# =========================================================
# 2. CORS Middleware 
# =========================================================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================================================
# Logging (Professional)
# =========================================================
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
    handlers=[
        # delay=False تضمن الكتابة في الملف فوراً دون انتظار
        logging.FileHandler("aisentinel.log", mode="a", delay=False), 
        logging.StreamHandler() 
    ]
)
logger = logging.getLogger(__name__)
# =========================================================
# Helper Function to Save Logs in JSONL Format
# =========================================================
def save_log_to_jsonl(log_entry, result):
    try:
        file_path = os.path.join(BASE_DIR, "aisentinel_raw_data.jsonl")
        
        data_to_save = {
            "@timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "source_ip": log_entry.get("source_ip"),
            "request_url": log_entry.get("request_url"),
            "stages": result.get("stages", []),
            "sub_type": result.get("sub_type", "None"),
            "anomaly_score": result.get("anomaly_score", 0.0),
            "status": result.get("status")
        }
        
        with open(file_path, "a", encoding="utf-8") as f:
            f.write(json.dumps(data_to_save) + "\n")
    except Exception as e:
        logger.error(f"Error saving JSONL log: {e}")
# =========================================================
# App Initialization
# =========================================================
anomaly_model = InferencePipeline()
threat_model = ThreatInferencePipeline()
pipeline = SecurityPipeline( anomaly_model=anomaly_model, threat_model=threat_model )
password_hasher = PasswordHash.recommended()

# =========================================================
# Middleware (WAF Layer)
# =========================================================
@app.middleware("http")
async def security_middleware(request: Request, call_next):
    # --- IP extraction (proxy-safe) ---
    client_ip = request.headers.get("x-forwarded-for", request.client.host)
    path = request.url.path
    if path.startswith("/socket.io") or path == "/login":
        return await call_next(request)
    
    allowed_paths = ["/login", "/change-password", "/docs", "/openapi.json", "/socket.io"]
    
    is_static = any(path.endswith(ext) for ext in [".ico", ".png", ".jpg", ".css", ".js"])
    is_allowed = path in allowed_paths or path.startswith("/users")

    if is_allowed or is_static:
        return await call_next(request)
    
        # blocked IP
    if r and r.exists(f"block:{client_ip}"):
        return JSONResponse(status_code=403, content={"detail": "Blocked"})

    body_bytes = await request.body()
    body_str = body_bytes.decode('utf-8', errors='ignore') if body_bytes else ""

    async def receive():
        return {"type": "http.request", "body": body_bytes}

    request._receive = receive

    # --- Build log entry ---
    log_entry = {
        "source_ip": client_ip,
        "request_url": str(request.url),
        "query_params": str(request.query_params),
        "body": body_str,
        "headers": dict(request.headers),
        "method": request.method
    }

    logger.info(f"WAF Check | IP={client_ip} | PATH={path}")

    # --- Run pipeline ---
    result = pipeline.run(log_entry)

    # Storing logs in JSONL format for the history endpoint
    try:
        save_log_to_jsonl(log_entry, result)
    except:
        pass 

    if result["status"] == "blocked":
        return JSONResponse(
            status_code=403,
            content={
                "detail": f"Security Alert: {result['reason']}",
                "severity": result["severity"],
                "type": result.get("sub_type")
            }
        )

    return await call_next(request)

# =========================================================
# Secrets & Auth Setup
# =========================================================
# SECRET_KEY = os.getenv("SECRET_KEY", "fallback_secret")

SECRET_KEY = "AISENTINEL_SUPER_SECRET_KEY_2026"
ALGORITHM = "HS256"

ACCESS_TOKEN_EXPIRE_MINUTES = 60
FILE_PATH = os.path.join(BASE_DIR, "aisentinel_raw_data.jsonl")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

class PasswordChangeRequest(BaseModel):
    new_password: str

class UserCreateRequest(BaseModel):
    username: str
    role: str

# --- Database Setup ---
def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''CREATE TABLE IF NOT EXISTS users 
                      (username TEXT PRIMARY KEY, hashed_password TEXT, role TEXT, must_change_password INTEGER)''')
    temp_pass = password_hasher.hash("temp123")
    users = [('admin_boss', temp_pass, 'super_admin', 1)]
    for u in users:
        cursor.execute("INSERT OR IGNORE INTO users VALUES (?, ?, ?, ?)", u)
    conn.commit()
    conn.close()

init_db()

# --- Auth Functions ---
def create_access_token(data: dict):
    to_encode = data.copy()
    # expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# -----------------------------------------------------------------------
# Routes
# -----------------------------------------------------------------------
@app.post("/predict")
async def predict_endpoint(log: dict):

    normalized_log = {
        "source_ip": log.get("ip") or log.get("source_ip") or "unknown",
        "request_url": log.get("request") or log.get("request_url") or "/",
        "headers": log.get("headers") if isinstance(log.get("headers"), dict) else {
            "user-agent": log.get("browser", "unknown"),
            "referer": log.get("referer", "Unknown")
        },
        "method": log.get("method", "POST")
    }

    # result = pipeline.run(normalized_log)

    #*********************
    # التعديل الوحيد: تأمين تشغيل الموديل
    try:
        result = pipeline.run(normalized_log)
    except Exception as e:
        logger.error(f"Pipeline Error: {e}")
        # رد افتراضي في حالة فشل الـ Preprocessing عشان الكود اللي تحت مبيوظش
        result = {"status": "error", "stages": ["Failed"], "sub_type": "None", "anomaly_score": 0.0}

    print(f"DEBUG RESULT: {result}")
    #**********************

    # التخزين الموحد في JSONL
    save_log_to_jsonl(normalized_log, result)
    # =============================
    # CSV Logging
    # =============================
    base_path = r"C:\AiSentinel"
    log_file = os.path.join(base_path, "security_detections.csv")
    file_exists = os.path.isfile(log_file)

    try:
        with open(log_file, mode='a', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)

            if not file_exists:
                writer.writerow([
                    'Timestamp',
                    'IP',
                    'Request',
                    'Stage',
                    'Threat_Type',
                    'Anomaly_Score',
                    'Final_Status'
                ])

            writer.writerow([
                time.strftime("%Y-%m-%d %H:%M:%S"),
                normalized_log["source_ip"],
                normalized_log["request_url"],
                " | ".join(result.get("stages", [])),
                result.get("sub_type"),
                result.get("anomaly_score"),
                result.get("status")
            ])
            f.flush() # إجبار الويندوز على الكتابة حالاً
    except Exception as e:
        logger.error(f"[ERROR] Failed to write CSV: {e}")
    # =============================
    # Terminal Output
    # =============================
    stages_str = " -> ".join(result.get("stages", ["Start"]))
    logger.info(
        f"[DETECTION] IP: {normalized_log['source_ip']} | "
        f"Path: {stages_str} | "
        f"Verdict: {result.get('status').upper()} | "
        f"Score: {result.get('anomaly_score', 0.0)}"
    )

    return result

@app.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT hashed_password, role, must_change_password FROM users WHERE username = ?", (form_data.username,))
    user = cursor.fetchone()
    conn.close()

    if not user or not password_hasher.verify(form_data.password, user[0]):
        raise HTTPException(status_code=401, detail="Incorrect username or password")

    access_token = create_access_token(data={"sub": form_data.username, "role": user[1]})
    return {"access_token": access_token, "token_type": "bearer", "role": user[1], "username": form_data.username, "must_change_password": bool(user[2])}


@app.post("/users")
def create_user(request: UserCreateRequest, token: str = Depends(oauth2_scheme)):
    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    admin_role = payload.get("role")
    
    if admin_role != "super_admin":
        raise HTTPException(status_code=403, detail="Only Super Admins can create users")

    temp_password = password_hasher.hash("temp123") # باسورد افتراضية
    
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("INSERT INTO users (username, hashed_password, role, must_change_password) VALUES (?, ?, ?, ?)", 
                       (request.username, temp_password, request.role, 1))
        conn.commit()
        conn.close()
        return {"status": "success", "message": f"User {request.username} created successfully"}
    except sqlite3.IntegrityError:
        raise HTTPException(status_code=400, detail="Username already exists")
    except Exception as e:
        logger.error(f"Error creating user: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")

@app.get("/users")
def get_all_users(token: str = Depends(oauth2_scheme)):
    try:
        jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except:
        raise HTTPException(status_code=401, detail="Invalid token")

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT username, role, must_change_password FROM users")
    user_list = cursor.fetchall()
    conn.close()

    return [{"username": u[0], "role": u[1], "must_change": bool(u[2])} for u in user_list]

@app.delete("/users/{username}")
def delete_user(username: str, token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("role") != "super_admin":
            raise HTTPException(status_code=403, detail="Forbidden: Admins only")

        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        cursor.execute("DELETE FROM users WHERE username = ?", (username,))
        conn.commit()
        
        if cursor.rowcount == 0:
            conn.close()
            raise HTTPException(status_code=404, detail="User not found")
            
        conn.close()
        return {"status": "success", "message": f"User {username} deleted"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

@app.post("/change-password")
def change_password(request: PasswordChangeRequest, token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()

        cursor.execute("SELECT hashed_password, username FROM users")
        all_users = cursor.fetchall()
        for hashed_pass, user_owner in all_users:
            if password_hasher.verify(request.new_password, hashed_pass):
                conn.close()
                raise HTTPException(
                    status_code=400, 
                    detail="Security Policy Violation: Please choose a different password."
                )
             
        new_hashed_password = password_hasher.hash(request.new_password)
        
        cursor.execute("UPDATE users SET hashed_password = ?, must_change_password = 0 WHERE username = ?", 
                       (new_hashed_password, username))
        conn.commit()
        conn.close()
        return {"status": "success", "message": "Password updated successfully"}
    except HTTPException as he:
        raise he
    
    except Exception as e:
        logger.error(f"DATABASE ERROR: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal Server Error")

    

@app.get("/logs")
def get_logs(type: str = "all", limit: Optional[str] = "50", token: str = Depends(oauth2_scheme)):
    return {"status": "success", "data": "Logs will be here"}

@app.get("/test-waf")
async def test_waf():
    return {"status": "If you see this, the WAF failed to stop the attack."}

@app.get("/")
def home():
    return {"status": "normal request passed"}

@app.get("/history")
async def get_history(page: int = 1, size: int = 15, q: str = None, token: str = Depends(oauth2_scheme)):
    try:
        # فك التوكن (تأكدي إن الـ Roles مكتوبة صح)
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        role = payload.get("role")
        
        # لو السيستم مش عارف يقرأ الـ Role، الطلب هيفشل
        if role not in ["super_admin", "analyst"]:
             raise HTTPException(status_code=403, detail="Access Denied")

        file_path = os.path.join(BASE_DIR, "aisentinel_raw_data.jsonl")
        all_logs = []
        
        if os.path.exists(file_path):
            with open(file_path, "r", encoding="utf-8") as f:
                for line in f:
                    if line.strip():
                        all_logs.append(json.loads(line))
        
        all_logs.reverse()
        total_count = len(all_logs)
        total_pages = (total_count // size) + (1 if total_count % size > 0 else 0)
        
        start = (page - 1) * size
        end = start + size
        
        return {
            "logs": all_logs[start:end],
            "total_pages": total_pages
        }
    except Exception as e:
        print(f"DEBUG ERROR: {e}") # عشان تشوفي الخطأ في الـ Terminal بتاع البايثون
        return {"logs": [], "total_pages": 0}

if __name__ == "__main__":
    uvicorn.run(combined_app, host="0.0.0.0", port=8000)
