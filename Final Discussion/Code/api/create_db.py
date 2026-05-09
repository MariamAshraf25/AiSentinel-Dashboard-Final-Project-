import sqlite3
import bcrypt

def init_db():
    # إنشاء اتصال بقاعدة البيانات
    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()
    
    # إنشاء جدول المستخدمين
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            hashed_password TEXT NOT NULL
        )
    ''')
    
    # بيانات الأدمن
    username = "admin"
    password = "P@$$w0rd2026" # غيريه براحتك
    
    # تحويل الباسورد لـ bytes وتشفيره باستخدام bcrypt مباشرة
    password_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed_p = bcrypt.hashpw(password_bytes, salt).decode('utf-8')
    
    try:
        cursor.execute("INSERT INTO users (username, hashed_password) VALUES (?, ?)", (username, hashed_p))
        conn.commit()
        print(f"✅ User '{username}' created successfully!")
    except sqlite3.IntegrityError:
        print("ℹ️ User already exists.")
    
    conn.close()

if __name__ == "__main__":
    init_db()