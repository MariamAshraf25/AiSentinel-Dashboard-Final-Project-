import React, { useState, useEffect } from 'react';
import { Lock, User, Eye, EyeOff } from 'lucide-react';
import logo from '../logo.png';

import BackgroundPatterns from '../components/BackgroundPatterns';

const LoginPage = ({ onLoginSuccess, particlesInit }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);

    try {
      const response = await fetch('http://127.0.0.1:8000/login', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('role', data.role);
        localStorage.setItem('mustChange', data.must_change_password.toString()); // تحويل لـ String
        localStorage.setItem('username', data.username);
        // onLoginSuccess(data.access_token, data.role, data.must_change_password, data.username); 
        onLoginSuccess(
            { username: data.username },
            data.access_token,
            data.role,
            data.must_change_password
        );
      } else {
        setError("Invalid username or password!");
      }
    } catch (error) {
      console.error("API Connection Error!");
      setError("Server is unreachable. Please try again later.");
    }
  };

  return (
    // [#0a0f1a]
    <div className="relative min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0f172a] p-6 transition-colors duration-500 overflow-hidden">
     <BackgroundPatterns init={particlesInit} />

      <div className="relative z-10 max-w-md w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-2xl p-10 shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white dark:border-slate-800  animate-in fade-in zoom-in duration-500">

          {/* logo */}
        {/* <div className="relative mx-auto w-24 h-24 mb-10 text-center flex items-center justify-center">
            <div className="absolute inset-0 bg-blue-500/10 rounded-full animate-pulse blur-xl"></div>
            <img src={logo} alt="AiSentinel Logo" className="w-20 h-20 relative z-10 object-contain" />
        </div> */}

      <div className="relative mx-auto w-48 h-48 mb-6 flex items-center justify-center">
          
          <div className="absolute inset-2 bg-[#060a14]/60 rounded-full blur-[30px]"></div>

          <img 
              src={logo}
              alt="AiSentinel Logo" 
              className="relative w-48 h-48 object-contain"
              style={{ filter: 'drop-shadow(0 0 1px rgba(255, 255, 255, 1)) drop-shadow(0 0 3px rgba(255, 255, 255, 0.5))' }}
          />
      </div>


        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white transition-colors">AiSentinel Login</h2>
          <p className="text-gray-500 dark:text-slate-400 mt-2 transition-colors">Authorized Access Only</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <User className="absolute left-3 top-3 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Username" 
              className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg py-3 px-10 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 transition-all"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
            <input 
              type={showPassword ? "text" : "password"} 
              placeholder="Password" 
              className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg py-3 px-10 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-gray-400 hover:text-blue-500 transition-colors"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {error && <p className="text-red-500 text-sm text-center font-medium">{error}</p>}

          <button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition duration-300 transform hover:scale-[1.02]"
          >
            Access Dashboard
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-8 font-medium tracking-widest uppercase opacity-70">
          &copy; 2026 AiSentinel Modular Protection System
        </p>
      </div>
    </div>
  );
};

export default LoginPage;

      {/* 4. الشبكة العنكبوتية المتحركة والمنورة
      {init && (
        <Particles
          id="tsparticles"
          className="absolute inset-0 z-0"
          options={{
            fpsLimit: 60,
            interactivity: {
              events: {
                onHover: { enable: true, mode: "grab" }, // تجاذب مع الماوس
              },
              modes: {
                grab: { distance: 200, links: { opacity: 0.6 } },
              },
            },
            particles: {
              color: { value: "#3b82f6" }, // لون أزرق نيون زاهي
              links: {
                color: "#3b82f6",
                distance: 250, // التعديل الأهم: زودنا المسافة جداً عشان النقط تتوصل ببعض حتى لو بعيدة
                enable: true,
                opacity: 0.5,   // الشفافية عشان التنور
                width: 1,     // سُمك الخط
               
              },
              move: {
                enable: true,
                speed: 1.0,     // هدينا السرعة شوية عشان الاتصال يفضل باين
                direction: "none",
                outModes: { default: "bounce" }, // ارتداد عشان يفضلوا في المشهد
              },
              number: {
                density: { enable: true, area: 800 },
                value: 100,      // زودنا عدد النقط لشبكة أكثف ومتصلة أكتر
              },
              opacity: {
                value: 0.7,     // النقط منورة
              },
              shape: { type: "circle" },
              size: { value: { min: 1, max: 3 } },
            },
            detectRetina: true,
          }}
        />
      )} */}