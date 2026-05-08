import React, { useState } from 'react';
import BackgroundPatterns from './BackgroundPatterns';
import { Shield, LayoutDashboard, Activity, FileClock, Users, LogOut, Menu, X, Settings, Bell } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

const MainLayout = ({ user, children, userRole, onNavigate, onLogout, currentView, darkMode, setDarkMode, particlesInit, isLoggedIn, recentAlerts }) => {
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const menuItems = [
        { id: 'dashboard', label: 'Overview', icon: <LayoutDashboard size={20} />, roles: ['super_admin', 'analyst'] },
        { id: 'hub', label: 'Detection Hub', icon: <Activity size={20} />, roles: ['super_admin', 'analyst'] },
        { id: 'archive', label: 'Logs Archive', icon: <FileClock size={20} />, roles: ['super_admin', 'analyst'] },
        { id: 'users', label: 'User Management', icon: <Users size={20} />, roles: ['super_admin'] },
        { id: 'settings', label: 'System Control', icon: <Settings size={20} />, roles: ['super_admin'] },
    ];

    const username = user?.username || localStorage.getItem('username') || "Active User";
    const userInitials = username
        .split(' ')
        .filter(Boolean)
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
console.log("ROLE =", userRole);
console.log("LOCAL ROLE =", localStorage.getItem("role"));
    return (
        <div className={`${darkMode ? 'dark' : ''} min-h-screen overflow-hidden`}>
            <div className="relative min-h-screen bg-gray-50 dark:bg-[#060a14] transition-colors duration-300">
                <BackgroundPatterns init={particlesInit} />

                <div className="relative z-10 flex flex-col h-screen">

                    {/* 1. Header */}
                    {isLoggedIn && (
                        <header className="h-20 border-b border-gray-200 dark:border-white/5 flex items-center justify-between px-8 bg-white/80 dark:bg-[#0a0f1d]/50 backdrop-blur-xl z-50">
                            <div className="flex items-center gap-4">
                                <Shield className="text-blue-600 dark:text-white" size={24} />
                                <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                                    AiSentinel
                                </h1>
                            </div>

                            <div className="flex items-center gap-6 relative">
                                {/* Notifications Bell */}
                                <div className="relative group">
                                    <button className="relative p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-all duration-300">
                                        <Bell size={22} className="text-slate-600 dark:text-blue-400 group-hover:text-blue-500 transition-colors" />
                                        {recentAlerts?.length > 0 && (
                                            <span className="absolute top-1.5 right-1.5 flex h-3 w-3">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500 shadow-[0_0_8px_#ef4444]"></span>
                                            </span>
                                        )}
                                    </button>

                                    {/* Notifications Dropdown */}
                                    <div className="absolute top-full mt-2 right-0 w-80 bg-[#0a0f1d] border border-blue-500/20 rounded-2xl shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all duration-300 z-[70] overflow-hidden">
                                        <div className="p-4 border-b border-white/5 bg-white/5 flex justify-between items-center">
                                            <span className="text-[11px] font-black text-white tracking-widest">Live Security Feed</span>
                                            <span className="text-[9px] bg-red-500 text-white px-2 py-0.5 rounded-full font-bold animate-pulse">New Alerts</span>
                                        </div>
                                        <div className="max-h-64 overflow-y-auto custom-scrollbar">
                                            {recentAlerts?.length > 0 ? (
                                                recentAlerts.map((alert, i) => (
                                                    <div key={i} className="p-4 border-b border-white/5 hover:bg-white/[0.02] transition-colors text-left">
                                                        <div className="flex justify-between items-start mb-1">
                                                            <span className="text-[10px] text-red-400 font-bold uppercase">{alert.type}</span>
                                                            <span className="text-[9px] text-slate-500 font-medium">{alert.time}</span>
                                                        </div>
                                                        <p className="text-[11px] text-slate-300 font-mono">Source IP: {alert.ip}</p>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="p-8 text-center text-[10px] text-slate-500 uppercase font-bold tracking-widest">
                                                    System Secure - No Alerts
                                                </div>
                                            )}
                                        </div>
                                        <button onClick={() => onNavigate('hub')} className="w-full p-3 text-center text-[10px] text-blue-400 font-black uppercase tracking-widest hover:bg-blue-500/10 transition-colors border-t border-white/5">
                                            Explore All Threats
                                        </button>
                                    </div>
                                </div>

                                <div className="h-8 w-[1px] bg-gray-200 dark:bg-white/10 hidden md:block"></div>

                                {/* Profile Section */}
                                <div className="relative group">
                                    <button 
                                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                                        className="relative flex items-center justify-center transition-all duration-300 active:scale-90"
                                    >
                                        <div className="absolute -inset-1 bg-blue-500 rounded-full blur-md opacity-0 group-hover:opacity-40 transition-opacity duration-500"></div>
                                        <div className={`relative w-11 h-11 rounded-full flex items-center justify-center bg-white dark:bg-[#0f172a] border-2 border-blue-600 dark:border-blue-500/50 ${isProfileOpen ? 'shadow-[0_0_20px_rgba(37,99,235,0.4)]' : ''}`}>
                                            <span className="font-bold text-lg text-slate-900 dark:text-white uppercase">
                                                {userInitials[0]}
                                            </span>
                                        </div>
                                    </button>

                                    {isProfileOpen && (
                                        <>
                                            <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setIsProfileOpen(false)}></div>
                                            <div className="absolute right-0 mt-4 w-64 bg-[#0a0f1d] border border-blue-500/20 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in duration-200">
                                                <div className="p-5 flex items-center gap-4 bg-blue-500/5 border-b border-white/5">
                                                    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                                                        {userInitials}
                                                    </div>
                                                    <div className="flex flex-col overflow-hidden text-left">
                                                        <span className="text-lg font-bold text-white tracking-tight truncate">
                                                            {username}
                                                        </span>
                                                        <span className="text-[12px] text-blue-400 font-black">{userRole}</span>
                                                    </div>
                                                </div>
                                                <div className="p-2">
                                                    <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-blue-400 hover:bg-blue-500/10 transition-all group font-bold tracking-widest">
                                                        <LogOut size={16} /> Logout
                                                    </button>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </header>
                    )}

                    {/* 2. Main Layout Body (Sidebar + Content) */}
                    <div className="flex flex-row overflow-hidden">
                        {isLoggedIn && (
                            // <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-white dark:bg-[#0a0f1d] border-r border-gray-200 dark:border-blue-500/10 transition-all duration-500 flex flex-col z-40 relative`}>
                            <aside 
                                        className={`
                                                ${isSidebarOpen ? 'w-64' : 'w-20'} 
                                                bg-white dark:bg-[#0a0f1d] 
                                                border-r border-gray-200 dark:border-blue-500/10 
                                                transition-all duration-500 ease-in-out 
                                                flex flex-col z-[60] relative 
                                                h-screen sticky top-0  /* تم تصحيح السبيلينج هنا */
                                            `}
                                        >
                                <div className={`h-16 flex items-center border-b border-gray-100 dark:border-white/5 px-4 ${isSidebarOpen ? 'justify-end' : 'justify-center'}`}>
                                    <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-3 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-colors text-slate-600 dark:text-gray-400">
                                        {isSidebarOpen ? <X size={20} /> : <Menu size={24} />}
                                    </button>
                                </div> 
                                
                                <nav className="flex-grow px-3 space-y-2 py-4 overflow-y-auto custom-scrollbar">
                                    {menuItems.map((item) => {
                                        const currentRole = userRole || localStorage.getItem('role');
                                        const isAllowed =
                                              item.roles.includes(currentRole) || currentRole === 'super_admin';
                                        if (!isAllowed) return null;

                                        return (
                                            <button
                                                key={item.id}
                                                onClick={() => onNavigate(item.id)}
                                                className={`w-full flex items-center rounded-xl transition-all duration-300 group relative ${isSidebarOpen ? 'px-4 py-3 gap-4' : 'p-3 justify-center'} ${currentView === item.id ? 'bg-blue-600/10 text-blue-600 dark:text-blue-400 border border-blue-500/20' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5'}`}
                                            >
                                                {currentView === item.id && (
                                                    <div className="absolute left-0 w-1 h-6 bg-blue-600 rounded-r-full shadow-[0_0_12px_rgba(37,99,235,0.8)]"></div>
                                                )}
                                                <span className={`${currentView === item.id ? 'text-blue-600 dark:text-blue-400' : 'group-hover:text-blue-600 dark:group-hover:text-blue-400'}`}>{item.icon}</span>
                                                {isSidebarOpen && <span className="font-bold text-[11px] uppercase tracking-widest whitespace-nowrap">{item.label}</span>}
                                                {!isSidebarOpen && (
                                                        <div className="absolute left-full ml-4 px-3 py-2 bg-[#0a0f1d] border border-blue-500/20 text-white text-[10px] font-black uppercase tracking-widest rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible group-hover:translate-x-0 -translate-x-3 transition-all duration-300 shadow-[0_0_15px_rgba(37,99,235,0.15)] z-50 whitespace-nowrap">
                                                            <div className="absolute -left-[4px] top-1/2 -translate-y-1/2 w-2 h-2 bg-[#0a0f1d] border-l border-b border-blue-500/20 rotate-45"></div>
                                                            {item.label}
                                                        </div>
                                                    )}
                                            
                                            </button>
                                     );   
                                    })}
                                </nav>
                            </aside>
                        )}

                        {/* 3. Main Content Area */}
                        <main className="flex-1 min-w-0 overflow-hidden relative flex flex-col">
                            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                            <div className="flex-grow overflow-y-auto custom-scrollbar">
                                <div className="max-w-7xl mx-auto p-8 w-full flex flex-col min-h-full">
                                    <div className="flex-grow">
                                        {children}
                                    </div>
                                    <footer className="mt-auto pt-20 pb-10 flex justify-center w-full">
                                        <p className="text-center text-xs text-gray-400 font-medium tracking-widest uppercase opacity-70">
                                            &copy; 2026 AiSentinel | Adaptive AI-Powered Data Protection
                                        </p>
                                    </footer>
                                </div>
                            </div>
                        </main>
                    </div>
                </div>
                <ThemeToggle darkMode={darkMode} setDarkMode={setDarkMode} />
            </div>
        </div>
    );
};

export default MainLayout;
// =========================================================
// import React, { useState } from 'react';
// import BackgroundPatterns from './BackgroundPatterns';
// import {Shield, LayoutDashboard, Activity, FileClock, Users, LogOut, Menu, X, Settings, Bell } from 'lucide-react';
// import ThemeToggle from './ThemeToggle';


// const MainLayout = ({ user,children, userRole, onNavigate, onLogout, currentView, darkMode, setDarkMode, particlesInit, isLoggedIn, recentAlerts }) => {
//     const [isSidebarOpen, setSidebarOpen] = useState(false);
//     const [isProfileOpen, setIsProfileOpen] = useState(false);
//     const menuItems = [
//         { id: 'dashboard', label: 'Overview', icon: <LayoutDashboard size={20} />, roles: ['super_admin', 'analyst'] },
//         { id: 'hub', label: 'Detection Hub', icon: <Activity size={20} />, roles: ['super_admin', 'analyst'] },
//         { id: 'archive', label: 'Logs Archive', icon: <FileClock size={20} />, roles: ['super_admin', 'analyst'] },
//         { id: 'users', label: 'User Management', icon: <Users size={20} />, roles: ['super_admin'] },
//         { id: 'settings', label: 'System Control', icon: <Settings size={20} />, roles: ['super_admin'] },
//     ];

//     const fullName = user?.fullName || "Active User";
//     const userInitials = fullName
//             .split(' ')
//             .filter(Boolean)
//             .map(n => n[0])
//             .join('')
//             .toUpperCase()
//             .slice(0, 2);
   
//     return (
//         <div className={`${darkMode ? 'dark' : ''} min-h-screen overflow-hidden`}>  
//             <div className="relative min-h-screen bg-gray-50 dark:bg-[#060a14] transition-colors duration-300">
//                 <BackgroundPatterns init={particlesInit} />
                
//                 <div className="relative z-10 flex flex-col h-screen">
                    
//                     {/* Header */}
//                     {isLoggedIn && (
//                         <header className="h-20 border-b border-gray-200 dark:border-white/5 flex items-center justify-between px-8 bg-white/80 dark:bg-[#0a0f1d]/50 backdrop-blur-xl z-50">
                            
//                             <div className="flex items-center gap-4">
//                                 <Shield className="text-blue-600 dark:text-white" size={24} />
//                                 <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight transition-colors">
//                                     AiSentinel {/* Ai<span className="text-blue-600 dark:text-blue-500">Sentinel</span> */}
//                                 </h1>
//                             </div>
//                                  {/*  Profile & Logout Dropdown */}
//                             <div className="flex items-center gap-6 relative">
//                                 <div className="relative group cursor-pointer">
                            
//                             <div className="absolute -inset-2 bg-blue-500 rounded-full blur opacity-0 group-hover:opacity-10 transition duration-500"></div>
                            
//                             <div className="relative group">
//                     {/* زر الجرس مع "نقطة إشعار" تظهر فقط لو فيه alerts */}
//                     <button className="relative p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-all duration-300">
//                         <Bell size={22} className="text-slate-600 dark:text-blue-400 group-hover:text-blue-500 transition-colors" />
                        
//                         {recentAlerts.length > 0 && (
//                             <span className="absolute top-1.5 right-1.5 flex h-3 w-3">
//                                 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
//                                 <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500 shadow-[0_0_8px_#ef4444]"></span>
//                             </span>
//                         )}
//                     </button>

//                     {/* قائمة التنبيهات المنسدلة عند الـ Hover */}
//                     <div className="absolute top-full mt-2 right-0 w-80 bg-[#0a0f1d] border border-blue-500/20 rounded-2xl shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all duration-300 z-[70] overflow-hidden">
//                         <div className="p-4 border-b border-white/5 bg-white/5 flex justify-between items-center">
//                             <span className="text-[10px] font-black text-white uppercase tracking-widest">Live Security Feed</span>
//                             <span className="text-[9px] bg-red-500 text-white px-2 py-0.5 rounded-full font-bold animate-pulse">New Alerts</span>
//                         </div>
                        
//                         <div className="max-h-64 overflow-y-auto custom-scrollbar">
//                             {recentAlerts.length > 0 ? (
//                                 recentAlerts.map((alert, i) => (
//                                     <div key={i} className="p-4 border-b border-white/5 hover:bg-white/[0.02] transition-colors">
//                                         <div className="flex justify-between items-start mb-1">
//                                             <span className="text-[10px] text-red-400 font-bold uppercase">{alert.type}</span>
//                                             <span className="text-[9px] text-slate-500 font-medium">{alert.time}</span>
//                                         </div>
//                                         <p className="text-[11px] text-slate-300 font-mono">Source IP: {alert.ip}</p>
//                                     </div>
//                                 ))
//                             ) : (
//                                 <div className="p-8 text-center text-[10px] text-slate-500 uppercase font-bold tracking-widest">
//                                     System Secure - No Alerts
//                                 </div>
//                             )}
//                         </div>
                        
//                         <button 
//                             onClick={() => onNavigate('hub')} // افتحي صفحة الـ Detection Hub
//                             className="w-full p-3 text-center text-[10px] text-blue-400 font-black uppercase tracking-widest hover:bg-blue-500/10 transition-colors"
//                         >
//                             Explore All Threats
//                         </button>
//                     </div>
//                 </div>

//                             <div className="absolute left-16 bg-gray-900 text-white text-[11px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
//                                 Alerts
//                             </div>
//                         </div>
//                         <div className="h-8 w-[2px] bg-gray-200 dark:bg-white/10 hidden md:block"></div>
       
//                         {/* Profile Section  */}
//                     <div className="relative group">
                       
//                         <button 
//                             onClick={() => setIsProfileOpen(!isProfileOpen)}
//                             className="relative flex items-center justify-center transition-all duration-300 active:scale-90"
//                         >
//                             <div className="absolute -inset-1 bg-blue-500 rounded-full blur-md opacity-0 group-hover:opacity-40 transition-opacity duration-500"></div>
                            
//                             <div className={`
//                                 relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 z-10
//                                 bg-white dark:bg-[#0f172a] 
//                                 border-2 border-blue-600 dark:border-blue-500/50 
//                                 ${isProfileOpen ? 'shadow-[0_0_20px_rgba(37,99,235,0.4)]' : ''}
//                             `}>
//                                 <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white transition-colors">
//                                     {userRole ? userRole[0].toUpperCase() : 'U'}
//                                 </span>
//                             </div>

//                             {!isProfileOpen && (
//                                 <div className="absolute top-full mt-4 right-0 bg-slate-900 text-white text-[10px] font-bold px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-xl translate-y-[-10px] group-hover:translate-y-0 whitespace-nowrap z-50 border border-white/5">
//                                     {user?.fullName || 'User Profile'}
//                                     <div className="absolute top-[-4px] right-5 w-2 h-2 bg-slate-900 rotate-45 border-l border-t border-white/5"></div>
//                                 </div>
//                             )}
//                         </button>

//                 {/* Profile Dropdown */}
//                 {isProfileOpen && (
//                     <>
//                         <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setIsProfileOpen(false)}></div>
                        
//                         <div className="absolute right-0 mt-4 w-64 bg-[#0a0f1d] border border-blue-500/20 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50 overflow-hidden animate-in fade-in zoom-in duration-200">
                            
//                             <div className="p-5 flex items-center gap-4 bg-blue-500/5 border-b border-white/5">
//                                 <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-[0_0_15px_rgba(37,99,235,0.3)]">
//                                    {userInitials[0]}
//                                 </div>
//                                 <div className="flex flex-col overflow-hidden">
//                                     <span className="text-lg font-bold text-slate-900 dark:text-white tracking-tight transition-colors">
//                                         {user?.fullName || 'User Profile'}
//                                     </span>
//                                 </div>
//                             </div>

//                             <div className="p-2">
//                                 <button
//                                     onClick={() => {
//                                         onLogout();
//                                         setIsProfileOpen(false);
//                                     }}
//                                     className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-blue-400 hover:bg-blue-500/10 transition-all group"
//                                 >
//                                     <div className="p-1.5 rounded-lg bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors">
//                                         <LogOut size={16} />
//                                     </div>
//                                     <span className="font-bold  tracking-widest">Logout</span>
//                                 </button>
//                             </div>
//                         </div>
//                     </>
//                 )}
//             </div>
//                                 </div>
//                         </header>
//                     )}


//                     {/* Row (Sidebar + Main) */}
//                     <div className="flex flex-grow overflow-hidden">
//                         {isLoggedIn && (
//                             <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-white dark:bg-[#0a0f1d] border-r border-gray-200 dark:border-blue-500/10 transition-all duration-500 ease-in-out flex flex-col z-50 relative`}>
//                                 <div className={`h-16 flex items-center border-b border-gray-100 dark:border-white/5 px-4 ${isSidebarOpen ? 'justify-end' : 'justify-center'}`}>
//                                     <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-3 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-colors text-slate-600 dark:text-gray-400">
//                                         {isSidebarOpen ? <X size={20} /> : <Menu size={24} />}
//                                     </button>
//                                 </div> 
                                
//                                 <nav className="flex-grow px-3 space-y-2 py-4">
//                                     {menuItems.map((item) => (
//                                         item.roles.includes(userRole) && (
//                                             <button
//                                                 key={item.id}
//                                                 onClick={() => onNavigate(item.id)}
//                                                 className={`w-full flex items-center rounded-xl transition-all duration-300 group relative ${isSidebarOpen ? 'px-4 py-3 gap-4' : 'p-3 justify-center'} ${currentView === item.id ? 'bg-blue-600/10 text-blue-600 dark:text-blue-400 border border-blue-500/20' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5'}`}
//                                             >
//                                                 {currentView === item.id && (
//                                                     <div className="absolute left-0 w-1 h-6 bg-blue-600 rounded-r-full shadow-[0_0_12px_rgba(37,99,235,0.8)]"></div>
//                                                 )}
//                                                 <span className={`${currentView === item.id ? 'text-blue-600 dark:text-blue-400' : 'group-hover:text-blue-600 dark:group-hover:text-blue-400'}`}>{item.icon}</span>
//                                                 {isSidebarOpen && <span className="font-bold text-[11px] uppercase tracking-widest whitespace-nowrap animate-fadeIn">{item.label}</span>}
//                                                 {!isSidebarOpen && (
//                                                     <div className="absolute left-16 bg-gray-900 text-white text-[11px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
//                                                         {item.label}
//                                                     </div>
//                                                 )}
//                                             </button>
//                                         )
//                                     ))}
//                                 </nav>

//                             </aside>
//                         )}

//                         {/* Main Content Area */}
//                         <main className="flex-grow flex flex-col overflow-hidden relative">
//                             <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
//                             <div className="flex-grow overflow-y-auto custom-scrollbar">
//                                 <div className="max-w-7xl mx-auto p-8 w-full flex flex-col min-h-full">
//                                     <div className="flex-grow">
//                                         {children}
//                                     </div>
//                                     <footer className="mt-auto pt-20 pb-10 flex justify-center w-full">
//                                         <p className="text-center text-xs text-gray-400 font-medium tracking-widest uppercase opacity-70">
//                                             &copy; 2026 AiSentinel | Adaptive AI-Powered Data Protection
//                                         </p>
//                                     </footer>
//                                 </div>
//                             </div>
//                         </main>
//                     </div>
//                 </div>
//                 <ThemeToggle darkMode={darkMode} setDarkMode={setDarkMode} />
//             </div>
//         </div>
//     );
// };

// export default MainLayout;

                                        // {!isSidebarOpen && (
                                        //         <div className="absolute left-16 bg-gray-900 text-white text-[11px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                                        //             {item.label}
                                        //         </div>
                                        //     )}