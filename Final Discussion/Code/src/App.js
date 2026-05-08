import React, { useState, useEffect, useCallback } from 'react';
import io from 'socket.io-client';
import Dashboard from './pages/Dashboard';
import LogsHistory from './pages/LogsHistory';
import LoginPage from './pages/LoginPage';
import ChangePasswordPage from './pages/ChangePasswordPage';
import UserManagement from './pages/UserManagement';
import DetectionHub from './pages/DetectionHub';
import MainLayout from './components/MainLayout';
import ThemeToggle from './components/ThemeToggle';
import { initParticlesEngine } from "@tsparticles/react";
import { loadFull } from "tsparticles";

function App() {
  const [init, setInit] = useState(false);
  const [view, setView] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const [mustChangePwd, setMustChangePwd] = useState(localStorage.getItem('mustChange') === 'true');
  const [currentUser, setCurrentUser] = useState(null); 

  const [userRole, setUserRole] = useState(localStorage.getItem('role') || "");
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [stats, setStats] = useState({
      totalLogs: "0",
      normalTraffic: "0%",
      activeThreats: 0,
      blockedIPs: 0
  });
  
  useEffect(() => {
      if (!isLoggedIn) return;

      const socket = io('http://localhost:8000', {
          transports: ['polling', 'websocket'], 
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 5000,
      });
      socket.on('connect', () => {
          setIsConnected(true);
          console.log("Connected to AiSentinel Backend via WebSockets ");
      });

      socket.on('disconnect', () => {
          setIsConnected(false);
          console.log("Disconnected from Backend ");
      });

      socket.on('security_update', (data) => {
          if (!data) return;
          setStats(prev => ({
              ...prev,
              activeThreats: data.activeThreats ?? prev.activeThreats,
              blockedIPs: data.blockedIPs ?? prev.blockedIPs,
              totalLogs: data.totalLogs ?? prev.totalLogs,
              normalTraffic: data.normalTraffic || prev.normalTraffic
          }));
          
          if (data.newAlert) {
              setRecentAlerts(prev => [data.newAlert, ...prev].slice(0, 10)); // بنشيل آخر 10 تنبيهات
          }
      });
      socket.on('connect_error', (err) => {
          console.error("Socket Connection Error: ", err.message);
      });

      return () => {
          socket.off('security_update');
          socket.disconnect();
      };
  }, [isLoggedIn]);

  const particlesInit = useCallback(async (engine) => { 
    await loadFull(engine); 
  }, []);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadFull(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  // --- Session Timeout Logic (15 Minutes) ---
  useEffect(() => {
    if (!isLoggedIn) return;

    let timeout;
    const resetTimer = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        handleLogout();
        alert("Session expired due to inactivity. Please login again.");
      }, 900000); 
    };

    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keypress', resetTimer);
    resetTimer();

    return () => {
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keypress', resetTimer);
      clearTimeout(timeout);
    };
  }, [isLoggedIn]);

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    setCurrentUser(null);
    setUserRole("");
    setView('dashboard');
  };

  const handleLoginSuccess = (username, token, role, mustChange) => {
    localStorage.setItem('token', token);
    localStorage.setItem('role', role);
    localStorage.setItem('username', username);
    localStorage.setItem('mustChange', String(mustChange));
    
    setMustChangePwd(Boolean(mustChange));
    setUserRole(role);
    setCurrentUser(username); 
    setIsLoggedIn(true);
  };

  if (!isLoggedIn) {
    return (
      <div className={darkMode ? "dark" : ""}>
        <LoginPage onLoginSuccess={handleLoginSuccess} particlesInit={particlesInit} />
        <ThemeToggle darkMode={darkMode} setDarkMode={setDarkMode} />
      </div>
    );
  }

  if (mustChangePwd) {
    return (
      <div className={darkMode ? "dark" : ""}>
        <div className="min-h-screen bg-gray-50 dark:bg-[#060a14] transition-colors duration-300">
          <ChangePasswordPage 
            onPasswordChanged={() => {
              setMustChangePwd(false);
              localStorage.setItem('mustChange', 'false');
            }} 
            particlesInit={particlesInit} 
          />
          <ThemeToggle darkMode={darkMode} setDarkMode={setDarkMode} />
        </div>
      </div>
    );
  }

  

  return (
    <div className={darkMode ? "dark" : ""}>
      <MainLayout 
        particlesInit={init}
        darkMode={darkMode}             
        setDarkMode={setDarkMode}      
        isLoggedIn={isLoggedIn}        
        onNavigate={setView} 
        onLogout={handleLogout}
        currentView={view}
        user={currentUser}
        userRole={userRole}
        recentAlerts={recentAlerts}
      >
          {view === 'dashboard' && (
            <Dashboard 
              stats={stats} 
              recentAlerts={recentAlerts} 
            />
          )}
          {view === 'hub' && (
            <DetectionHub 
              recentAlerts={recentAlerts} 
              onNavigate={setView} 
              onBack={() => setView('dashboard')} 
              isConnected={isConnected}
            />
          )}
          {view === 'archive' && <LogsHistory onBack={() => setView('dashboard')} />}
          {view === 'users' && <UserManagement onBack={() => setView('dashboard')} />}
      </MainLayout>
    </div>
  );
}

export default App;
// ******************
// import React, { useState, useEffect, useCallback } from 'react';
// import { Sun, Moon } from 'lucide-react';
// import Dashboard from './pages/Dashboard';
// import LogsHistory from './pages/LogsHistory';
// import LoginPage from './pages/LoginPage';
// import ChangePasswordPage from './pages/ChangePasswordPage';
// import UserManagement from './pages/UserManagement';
// import DetectionHub from './pages/DetectionHub';
// import MainLayout from './components/MainLayout';
// import ThemeToggle from './components/ThemeToggle';
// import { initParticlesEngine } from "@tsparticles/react";
// import { loadFull } from "tsparticles";

// function App() {
//   const [init, setInit] = useState(false);
//   const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
//   const [view, setView] = useState('dashboard');
//   const [darkMode, setDarkMode] = useState(true);
//   const [mustChangePwd, setMustChangePwd] = useState(localStorage.getItem('mustChange') === 'true');
//   const [currentUser, setCurrentUser] = useState(null); 
//   const [userRole, setUserRole] = useState(""); 
//   const [isLoggedIn, setIsLoggedIn] = useState(false);
//   const particlesInit = useCallback(async (engine) => { await loadFull(engine); }, []);
//   useEffect(() => {
//     initParticlesEngine(async (engine) => {
//       await loadFull(engine);
//     }).then(() => {
//       setInit(true);
//     });
//   }, []);
//   // --- Session Timeout Logic (15 Minutes) ---
//   useEffect(() => {
//     if (!isLoggedIn) return;

//     let timeout;
//     const resetTimer = () => {
//       clearTimeout(timeout);
//       // 15 minutes = 15 * 60 * 1000 ms
//       timeout = setTimeout(() => {
//         handleLogout();
//         alert("Session expired due to inactivity. Please login again.");
//       }, 900000); 
//     };

//     window.addEventListener('mousemove', resetTimer);
//     window.addEventListener('keypress', resetTimer);
//     resetTimer(); // Start timer on login

//     return () => {
//       window.removeEventListener('mousemove', resetTimer);
//       window.removeEventListener('keypress', resetTimer);
//       clearTimeout(timeout);
//     };
//   }, [isLoggedIn]);

//   const handleLogout = () => {
//     localStorage.clear();
//     setIsLoggedIn(false);
//     window.location.reload();
//   };

//   const handleLoginSuccess = (token, role, mustChange) => {
//     localStorage.setItem('token', token);
//     localStorage.setItem('role', role);
//     localStorage.setItem('mustChange', String(mustChange));
//     setMustChangePwd(Boolean(mustChange));
//     setIsLoggedIn(true);
//   };

//  if (!isLoggedIn) {
//   return (
//     <div className={darkMode ? "dark" : ""}>
//       <LoginPage onLoginSuccess={handleLoginSuccess} particlesInit={particlesInit} />
//       <ThemeToggle darkMode={darkMode} setDarkMode={setDarkMode} />
//     </div>
//   );
// }

// if (mustChangePwd) {
//   return (
//     <div className={darkMode ? "dark" : ""}>
//       <div className="min-h-screen bg-gray-50 dark:bg-[#060a14] transition-colors duration-300">
//         <ChangePasswordPage 
//           onPasswordChanged={() => {
//             setMustChangePwd(false);
//             localStorage.setItem('mustChange', 'false');
//           }} 
//           particlesInit={particlesInit} 
//         />
//         {/* بما إننا عملنا ملف مستقل للـ ThemeToggle هننادي عليه كدة */}
//         <ThemeToggle darkMode={darkMode} setDarkMode={setDarkMode} />
//       </div>
//     </div>
//   );
// }

// return (
//   <div className={darkMode ? "dark" : ""}>
//     <MainLayout 
//       particlesInit={init}
//       darkMode={darkMode}             
//       setDarkMode={setDarkMode}      
//       isLoggedIn={isLoggedIn}        
//       userRole={localStorage.getItem('role')} 
//       onNavigate={setView} 
//       onLogout={handleLogout}
//       currentView={view}
//       user={currentUser}
//       userRole={userRole}
      
//     >
//        {view === 'dashboard' && <Dashboard />}
//        {view === 'hub' && <DetectionHub onNavigate={setView} onBack={() => setView('dashboard')} />}
//        {view === 'archive' && <LogsHistory onBack={() => setView('dashboard')} />}
//        {view === 'users' && <UserManagement onBack={() => setView('dashboard')} />}
//     </MainLayout>
  
//   </div>
// );
// }

// export default App;
// ******************************
// return (
//   <div className={darkMode ? "dark" : ""}>
//     <div className="min-h-screen bg-gray-50 dark:bg-[#060a14] transition-colors duration-300">
      
//       <MainLayout 
//         darkMode={darkMode} 
//         setDarkMode={setDarkMode}
//         particlesInit={particlesInit}
//         userRole={localStorage.getItem('role')} 
//         onNavigate={(target) => setView(target)} 
//         onLogout={handleLogout}
//         currentView={view}
//         isLoggedIn={isLoggedIn}
//       >
//         {view === 'dashboard' ? (
//           <Dashboard /> 
//         ) : view === 'hub' ? (
//           <DetectionHub 
//             onNavigate={(target) => setView(target)} 
//             onBack={() => setView('dashboard')} 
//           />
//         ) : view === 'archive' ? (
//           <LogsHistory onBack={() => setView('dashboard')} />
//         ) : view === 'users' ? (
//           <UserManagement onBack={() => setView('dashboard')} />
//         ) : (
//           <div className="p-8 text-center">
//              <h2 className="text-2xl text-white uppercase font-black">{view} Analysis View</h2>
//              <p className="text-gray-400 mt-2">Detailed results for {view} will appear here.</p>
//           </div>
//         )}
//       </MainLayout>

//       {/* زر الـ Theme Toggle مكانه ثابت بره الـ Layout */}
//       <ThemeToggle darkMode={darkMode} setDarkMode={setDarkMode} />

//       {/* الـ Footer يظهر فقط في أسفل الـ Sidebar أو أسفل المحتوى حسب رغبتك */}
//       <footer className="fixed bottom-4 left-1/2 -translate-x-1/2 pointer-events-none opacity-30 text-[10px] text-gray-500 uppercase tracking-[0.3em] hidden md:block">
//         &copy; 2026 AiSentinel | Adaptive Data Protection
//       </footer>
//     </div>
//   </div>
// );


// import React, { useState, useEffect } from 'react';
// import { Sun, Moon } from 'lucide-react';
// import Dashboard from './pages/Dashboard';
// import LogsHistory from './pages/LogsHistory';
// import LoginPage from './pages/LoginPage';
// import ChangePasswordPage from './pages/ChangePasswordPage';
// import UserManagement from './pages/UserManagement';
// import DetectionHub from './pages/DetectionHub';

// function App() {
//   const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
//   const [view, setView] = useState('dashboard');
//   const [darkMode, setDarkMode] = useState(true);
//   const [mustChangePwd, setMustChangePwd] = useState(localStorage.getItem('mustChange') === 'true');

//   // --- Session Timeout Logic (15 Minutes) ---
//   useEffect(() => {
//     if (!isLoggedIn) return;

//     let timeout;
//     const resetTimer = () => {
//       clearTimeout(timeout);
//       // 15 minutes = 15 * 60 * 1000 ms
//       timeout = setTimeout(() => {
//         handleLogout();
//         alert("Session expired due to inactivity. Please login again.");
//       }, 900000); 
//     };

//     window.addEventListener('mousemove', resetTimer);
//     window.addEventListener('keypress', resetTimer);
//     resetTimer(); // Start timer on login

//     return () => {
//       window.removeEventListener('mousemove', resetTimer);
//       window.removeEventListener('keypress', resetTimer);
//       clearTimeout(timeout);
//     };
//   }, [isLoggedIn]);

//   const handleLogout = () => {
//     localStorage.clear();
//     setIsLoggedIn(false);
//     window.location.reload();
//   };

//   const handleLoginSuccess = (token, role, mustChange) => {
//     localStorage.setItem('token', token);
//     localStorage.setItem('role', role);
//     localStorage.setItem('mustChange', String(mustChange));
//     setMustChangePwd(Boolean(mustChange));
//     setIsLoggedIn(true);
//   };

//   if (!isLoggedIn) {
//     return (
//       <div className={darkMode ? "dark" : ""}>
//         {/* ضفنا خلفية متغيرة هنا عشان تغطي الشاشة كلها باللون الصح */}
//         <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
//           <LoginPage onLoginSuccess={handleLoginSuccess} />
//           <ThemeToggle darkMode={darkMode} setDarkMode={setDarkMode} />
//         </div>
//       </div>
//     );
//   }

//   // if (!isLoggedIn) {
//   //   return (
//   //     <div className={darkMode ? "dark" : ""}>
//   //       <LoginPage onLoginSuccess={handleLoginSuccess} />
//   //       <ThemeToggle darkMode={darkMode} setDarkMode={setDarkMode} />
//   //     </div>
//   //   );
//   // }

//   if (mustChangePwd) {
//     return (
//       <div className={darkMode ? "dark" : ""}>
//         {/* ضفنا خلفية متغيرة هنا برضه */}
//         <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
//           <ChangePasswordPage onPasswordChanged={() => {
//             setMustChangePwd(false);
//             localStorage.setItem('mustChange', 'false');
//           }} />
//           <ThemeToggle darkMode={darkMode} setDarkMode={setDarkMode} />
//         </div>
//       </div>
//     );
//   }

//   // if (mustChangePwd) {
//   //   return (
//   //     <div className={darkMode ? "dark" : ""}>
//   //       <ChangePasswordPage onPasswordChanged={() => {
//   //         setMustChangePwd(false);
//   //         localStorage.setItem('mustChange', 'false');
//   //       }} />
//   //       <ThemeToggle darkMode={darkMode} setDarkMode={setDarkMode} />
//   //     </div>
//   //   );
//   // }
//   return (
//   <div className={darkMode ? "dark" : ""}>
//     <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col transition-colors duration-300">
      
//       <div className="flex-grow">
//         {view === 'dashboard' ? (
//           <Dashboard 
//             onGoToArchive={() => setView('archive')} 
//             onGoToHub={() => setView('hub')}         
//             onGoToUsers={() => setView('users')} 
//             onLogout={handleLogout} 
//           />
//         ) : view === 'hub' ? (
//           <DetectionHub 
//             onNavigate={(target) => setView(target)} 
//             onBack={() => setView('dashboard')} 
//           />
//         ) : view === 'archive' ? (
//           <LogsHistory onBack={() => setView('dashboard')} />
//         ) : view === 'users' ? (
//           <UserManagement onBack={() => setView('dashboard')} />
//         ) : (
//           <div className="p-8">
//              <button onClick={() => setView('hub')} className="text-blue-500 mb-4">Back to Hub</button>
//              <h2 className="text-2xl text-white uppercase font-black">{view} Analysis View</h2>
//              <p className="text-gray-400 mt-2">Detailed results for {view} will appear here.</p>
//           </div>
//         )}
//       </div>
      
//       <ThemeToggle darkMode={darkMode} setDarkMode={setDarkMode} />

//       <footer className="p-8 text-center text-gray-500 text-xs font-medium uppercase tracking-widest transition-colors">
//         &copy; 2026 AiSentinel Modular AI System | Adaptive Data Protection
//       </footer>
//     </div>
//   </div>
// );

// }

// // مكون الزر العائم ليكون الكود نظيفاً
// const ThemeToggle = ({ darkMode, setDarkMode }) => (
//   <button 
//     onClick={() => setDarkMode(!darkMode)} 
//     className="fixed bottom-8 right-8 p-4 rounded-full bg-white dark:bg-gray-800 shadow-2xl border border-gray-200 dark:border-gray-700 hover:scale-110 active:scale-95 transition-all duration-300 z-[9999] group"
//   >
//     {darkMode ? (
//       <Sun size={24} className="text-yellow-400 group-hover:rotate-45 transition-transform" />
//     ) : (
//       <Moon size={24} className="text-blue-600 group-hover:-rotate-12 transition-transform" />
//     )}
//   </button>
// );

// export default App;


// ***************************************************************
// import React, { useState, useEffect } from 'react';
// import { Sun, Moon } from 'lucide-react';
// import Dashboard from './pages/Dashboard';
// import LogsHistory from './pages/LogsHistory';
// import LoginPage from './pages/LoginPage';
// import ChangePasswordPage from './pages/ChangePasswordPage';
// import UserManagement from './pages/UserManagement';

// function App() {
//   const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
//   const [view, setView] = useState('dashboard');
//   const [darkMode, setDarkMode] = useState(true);
//   const [mustChangePwd, setMustChangePwd] = useState(localStorage.getItem('mustChange') === 'true');

//   // --- Session Timeout Logic (15 Minutes) ---
//   useEffect(() => {
//     if (!isLoggedIn) return;

//     let timeout;
//     const resetTimer = () => {
//       clearTimeout(timeout);
//       timeout = setTimeout(() => {
//         handleLogout();
//         alert("Session expired due to inactivity. Please login again.");
//       }, 900000); 
//     };

//     window.addEventListener('mousemove', resetTimer);
//     window.addEventListener('keypress', resetTimer);
//     resetTimer();

//     return () => {
//       window.removeEventListener('mousemove', resetTimer);
//       window.removeEventListener('keypress', resetTimer);
//       clearTimeout(timeout);
//     };
//   }, [isLoggedIn]);

//   const handleLogout = () => {
//     localStorage.clear();
//     setIsLoggedIn(false);
//     window.location.reload();
//   };

//   const handleLoginSuccess = (token, role, mustChange) => {
//     localStorage.setItem('token', token);
//     localStorage.setItem('role', role);
//     localStorage.setItem('mustChange', mustChange);
//     setMustChangePwd(mustChange);
//     setIsLoggedIn(true);
//   };

//   if (!isLoggedIn) {
//     return (
//       <div className={darkMode ? "dark" : ""}>
//         <LoginPage onLoginSuccess={handleLoginSuccess} />
//         <ThemeToggle darkMode={darkMode} setDarkMode={setDarkMode} />
//       </div>
//     );
//   }

//   if (mustChangePwd) {
//     return (
//       <div className={darkMode ? "dark" : ""}>
//         <ChangePasswordPage onPasswordChanged={() => {
//           setMustChangePwd(false);
//           localStorage.setItem('mustChange', 'false');
//         }} />
//         <ThemeToggle darkMode={darkMode} setDarkMode={setDarkMode} />
//       </div>
//     );
//   }

//   return (
//     <div className={darkMode ? "dark" : ""}>
//       <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
//         {/* Navigation Logic for 3 Pages */}
//         {view === 'dashboard' ? (
//           <Dashboard 
//             onGoToArchive={() => setView('archive')} 
//             onGoToUsers={() => setView('users')} 
//             onLogout={handleLogout} 
//           />
//         ) : view === 'archive' ? (
//           <LogsHistory onBack={() => setView('dashboard')} />
//         ) : (
//           <UserManagement onBack={() => setView('dashboard')} />
//         )}
        
//         <ThemeToggle darkMode={darkMode} setDarkMode={setDarkMode} />
//       </div>
//       <footer className="fixed bottom-0 left-0 w-full p-4 text-center text-[10px] text-gray-400 dark:text-gray-600 font-bold uppercase tracking-[0.5em] pointer-events-none">
//         AiSentinel 2026
//       </footer>
//     </div>
//   );
// }

// const ThemeToggle = ({ darkMode, setDarkMode }) => (
//   <button onClick={() => setDarkMode(!darkMode)} className="fixed bottom-8 right-8 p-4 rounded-full bg-white dark:bg-gray-800 shadow-2xl border border-gray-200 dark:border-gray-700 z-[9999] group transition-all hover:scale-110">
//     {darkMode ? <Sun size={24} className="text-yellow-400" /> : <Moon size={24} className="text-blue-600" />}
//   </button>
// );

// export default App;
// import React, { useState, useEffect } from 'react';
// import { Sun, Moon } from 'lucide-react';
// import Dashboard from './pages/Dashboard';
// import LogsHistory from './pages/LogsHistory';
// import LoginPage from './pages/LoginPage';
// import ChangePasswordPage from './pages/ChangePasswordPage';
// import UserManagement from './pages/UserManagement';

// function App() {
//   const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
//   const [view, setView] = useState('dashboard');
//   const [darkMode, setDarkMode] = useState(true);
//   const [mustChangePwd, setMustChangePwd] = useState(localStorage.getItem('mustChange') === 'true');

//   // --- تنفيذ الـ Session Timeout (15 Minutes) ---
//   useEffect(() => {
//     if (!isLoggedIn) return;

//     let timeout;
//     const resetTimer = () => {
//       clearTimeout(timeout);
//       // 15 minutes = 15 * 60 * 1000 ms
//       timeout = setTimeout(() => {
//         handleLogout();
//         alert("Session expired due to inactivity. Please login again.");
//       }, 900000); 
//     };

//     // مراقبة النشاط
//     window.addEventListener('mousemove', resetTimer);
//     window.addEventListener('keypress', resetTimer);
//     resetTimer(); // تشغيل التايمر أول ما يسجل دخول

//     return () => {
//       window.removeEventListener('mousemove', resetTimer);
//       window.removeEventListener('keypress', resetTimer);
//       clearTimeout(timeout);
//     };
//   }, [isLoggedIn]);

//   const handleLogout = () => {
//     localStorage.clear();
//     setIsLoggedIn(false);
//     window.location.reload();
//   };

//   const handleLoginSuccess = (token, role, mustChange) => {
//     localStorage.setItem('token', token);
//     localStorage.setItem('role', role);
//     localStorage.setItem('mustChange', mustChange);
//     setMustChangePwd(mustChange);
//     setIsLoggedIn(true);
//   };

//   if (!isLoggedIn) {
//     return (
//       <div className={darkMode ? "dark" : ""}>
//         <LoginPage onLoginSuccess={handleLoginSuccess} />
//         <ThemeToggle darkMode={darkMode} setDarkMode={setDarkMode} />
//       </div>
//     );
//   }

//   if (mustChangePwd) {
//     return (
//       <div className={darkMode ? "dark" : ""}>
//         <ChangePasswordPage onPasswordChanged={() => {
//           setMustChangePwd(false);
//           localStorage.setItem('mustChange', 'false');
//         }} />
//         <ThemeToggle darkMode={darkMode} setDarkMode={setDarkMode} />
//       </div>
//     );
//   }

//   return (
//     <div className={darkMode ? "dark" : ""}>
//       <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
//         {view === 'dashboard' ? (
//           <Dashboard onGoToArchive={() => setView('archive')} onLogout={handleLogout} />
//         ) : (
//           <LogsHistory onBack={() => setView('dashboard')} />
//         )}
//         <ThemeToggle darkMode={darkMode} setDarkMode={setDarkMode} />
//       </div>
//     </div>
//   );
// }

// const ThemeToggle = ({ darkMode, setDarkMode }) => (
//   <button onClick={() => setDarkMode(!darkMode)} className="fixed bottom-8 right-8 p-4 rounded-full bg-white dark:bg-gray-800 shadow-2xl border border-gray-200 dark:border-gray-700 z-[9999]">
//     {darkMode ? <Sun size={24} className="text-yellow-400" /> : <Moon size={24} className="text-blue-600" />}
//   </button>
// );

// export default App;
// import React, { useState } from 'react';
// import { Sun, Moon } from 'lucide-react';
// import Dashboard from './pages/Dashboard';
// import LogsHistory from './pages/LogsHistory';
// import LoginPage from './pages/LoginPage';
// import ChangePasswordPage from './pages/ChangePasswordPage';

// function App() {
//   const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
//   const [view, setView] = useState('dashboard');
//   const [darkMode, setDarkMode] = useState(true);
//   const [mustChangePwd, setMustChangePwd] = useState(localStorage.getItem('mustChange') === 'true');

//   const handleLoginSuccess = (token, role, mustChange) => {
//     localStorage.setItem('token', token);
//     localStorage.setItem('role', role);
//     localStorage.setItem('mustChange', mustChange);
//     setMustChangePwd(mustChange);
//     setIsLoggedIn(true);
//   };

//   if (!isLoggedIn) {
//     return (
//       <div className={darkMode ? "dark" : ""}>
//         <LoginPage onLoginSuccess={handleLoginSuccess} />
//         <ThemeToggle darkMode={darkMode} setDarkMode={setDarkMode} />
//       </div>
//     );
//   }

//   if (mustChangePwd) {
//     return (
//       <div className={darkMode ? "dark" : ""}>
//         <ChangePasswordPage onPasswordChanged={() => setMustChangePwd(false)} />
//         <ThemeToggle darkMode={darkMode} setDarkMode={setDarkMode} />
//       </div>
//     );
//   }

//   return (
//     <div className={darkMode ? "dark" : ""}>
//       <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
//         {view === 'dashboard' ? (
//           <Dashboard onGoToArchive={() => setView('archive')} />
//         ) : (
//           <LogsHistory onBack={() => setView('dashboard')} />
//         )}
//         <ThemeToggle darkMode={darkMode} setDarkMode={setDarkMode} />
//       </div>
//     </div>
//   );
// }

// const ThemeToggle = ({ darkMode, setDarkMode }) => (
//   <button onClick={() => setDarkMode(!darkMode)} className="fixed bottom-8 right-8 p-4 rounded-full bg-white dark:bg-gray-800 shadow-2xl border border-gray-200 dark:border-gray-700 z-[9999]">
//     {darkMode ? <Sun size={24} className="text-yellow-400" /> : <Moon size={24} className="text-blue-600" />}
//   </button>
// );

// useEffect(() => {
//   let timeout;
//   const resetTimer = () => {
//     clearTimeout(timeout);
//     // لو مفيش حركة لمدة 15 دقيقة (900000 مللي ثانية)
//     timeout = setTimeout(() => {
//       localStorage.clear();
//       window.location.reload(); 
//     }, 900000); 
//   };

//   // مراقبة حركة الماوس أو الضغط على الزراير
//   window.addEventListener('mousemove', resetTimer);
//   window.addEventListener('keypress', resetTimer);

//   return () => {
//     window.removeEventListener('mousemove', resetTimer);
//     window.removeEventListener('keypress', resetTimer);
//   };
// }, []);

// export default App;
// import React, { useState } from 'react';
// import { Sun, Moon } from 'lucide-react';
// import Dashboard from './pages/Dashboard';
// import LogsHistory from './pages/LogsHistory';
// import LoginPage from './pages/LoginPage';

// function App() {
//   const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
//   const [view, setView] = useState('dashboard');
//   const [darkMode, setDarkMode] = useState(true); // التحكم المركزي في الوضع الليلي

//   if (!isLoggedIn) {
//     return (
//       <div className={darkMode ? "dark" : ""}>
//         <LoginPage onLogin={() => setIsLoggedIn(true)} />
//         {/* Floating Toggle Button */}
//         <ThemeToggle darkMode={darkMode} setDarkMode={setDarkMode} />
//       </div>
//     );
//   }

//   return (
//     <div className={darkMode ? "dark" : ""}>
//       <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
//         {view === 'dashboard' ? (
//           <Dashboard onGoToArchive={() => setView('archive')} />
//         ) : (
//           <LogsHistory onBack={() => setView('dashboard')} />
//         )}
        
//         {/* Floating Toggle Button */}
//         <ThemeToggle darkMode={darkMode} setDarkMode={setDarkMode} />
//       </div>
//     </div>
//   );
// }

// // مكون الزر العائم ليكون الكود نظيفاً
// const ThemeToggle = ({ darkMode, setDarkMode }) => (
//   <button 
//     onClick={() => setDarkMode(!darkMode)} 
//     className="fixed bottom-8 right-8 p-4 rounded-full bg-white dark:bg-gray-800 shadow-2xl border border-gray-200 dark:border-gray-700 hover:scale-110 active:scale-95 transition-all duration-300 z-[9999] group"
//   >
//     {darkMode ? (
//       <Sun size={24} className="text-yellow-400 group-hover:rotate-45 transition-transform" />
//     ) : (
//       <Moon size={24} className="text-blue-600 group-hover:-rotate-12 transition-transform" />
//     )}
//   </button>
// );

// export default App;
// import React, { useState } from 'react';
// import Dashboard from './pages/Dashboard';
// import LogsHistory from './pages/LogsHistory';
// import LoginPage from './pages/LoginPage';

// function App() {
//   // التأكد من وجود توكن (تسجيل دخول سابق)
//   const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  
//   // تحديد الصفحة الحالية (dashboard أو archive)
//   const [view, setView] = useState('dashboard');

//   // لو مش مسجل دخول، اعرض صفحة الـ Login فوراً
//   if (!isLoggedIn) {
//     return <LoginPage onLogin={() => setIsLoggedIn(true)} />;
//   }

//   // لو مسجل دخول، ابدأ التبديل بين الداشبورد والأرشيف
//   return (
//     <div className="App">
//       {view === 'dashboard' ? (
//         <Dashboard onGoToArchive={() => setView('archive')} />
//       ) : (
//         <LogsHistory onBack={() => setView('dashboard')} />
//       )}
//     </div>
//   );
// }

// export default App;












// return (
//     <div className={darkMode ? "dark" : ""}>
//       <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col transition-colors duration-300">
        
//         {/* المحتوى الأساسي */}
//         <div className="flex-grow">
//           {view === 'dashboard' ? (
//             <Dashboard 
//               onGoToArchive={() => setView('archive')} 
//               onGoToUsers={() => setView('users')} 
//               onLogout={handleLogout} 
//             />
//           ) : view === 'archive' ? (
//             <LogsHistory onBack={() => setView('dashboard')} />
//           ) : (
//             <UserManagement onBack={() => setView('dashboard')} />
//           )}
//         </div>
        
//         <ThemeToggle darkMode={darkMode} setDarkMode={setDarkMode} />

//         {/* الـ Footer بالتصميم القديم اللي فضلتيه (نسخة طبق الأصل) */}
//         <footer className="p-8 text-center text-gray-500 text-xs font-medium uppercase tracking-widest transition-colors">
//           &copy; 2026 AiSentinel Modular AI System | Adaptive Data Protection
//         </footer>
//       </div>
//     </div>
//   );
//   return (
//     <div className={darkMode ? "dark" : ""}>
//       <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
//         {/* Navigation Logic for 3 Pages */}
//         {view === 'dashboard' ? (
//           <Dashboard 
//             onGoToArchive={() => setView('archive')} 
//             onGoToUsers={() => setView('users')} 
//             onLogout={handleLogout} 
//           />
//         ) : view === 'archive' ? (
//           <LogsHistory onBack={() => setView('dashboard')} />
//         ) : (
//           <UserManagement onBack={() => setView('dashboard')} />
//         )}
        
//         <ThemeToggle darkMode={darkMode} setDarkMode={setDarkMode} />
//       </div>
  
//       <footer className="w-full py-6 bg-gray-900/50 backdrop-blur-md border-t border-gray-800 text-center transition-colors duration-300">
//         <div className="flex flex-col items-center gap-2">
//           <p className="text-[10px] text-gray-500 dark:text-gray-500 font-black uppercase tracking-[0.4em]">
//             &copy; 2026 AiSentinel Modular AI System
//           </p>
//           <p className="text-[9px] text-blue-500/60 font-bold uppercase tracking-[0.2em]">
//             Adaptive Data Protection & Threat Intelligence
//           </p>
//         </div>
// </footer>
//     </div>
//   );