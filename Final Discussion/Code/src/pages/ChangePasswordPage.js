import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, Check, X, Eye, EyeOff } from 'lucide-react';

import BackgroundPatterns from '../components/BackgroundPatterns';

const ChangePasswordPage = ({ onPasswordChanged, particlesInit }) => {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [strength, setStrength] = useState(0);
  const [checks, setChecks] = useState({
    length: false, upper: false, number: false, symbol: false
  });

  useEffect(() => {
    const p = newPassword;
    const c = {
      length: p.length >= 8,
      upper: /[A-Z]/.test(p),
      number: /[0-9]/.test(p),
      symbol: /[^A-Za-z0-9]/.test(p)
    };
    setChecks(c);
    setStrength(Object.values(c).filter(Boolean).length);
  }, [newPassword]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (strength < 4) {
        setError("Password is too weak!");
        return;
    }
    setLoading(true);
    setError('');
    setSuccess('');
    const token = localStorage.getItem('token');
    
    try {
      const response = await fetch('http://127.0.0.1:8000/change-password', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ new_password: newPassword })
      });

      const data = await response.json();

      if (!response.ok) {
            setError(data.detail || "This password cannot be used.");
            setLoading(false);
            return; 
        }

      // if (response.ok) {
      //   localStorage.setItem('mustChange', 'false');
      //   setSuccess("Security updated successfully!"); 
      //   setTimeout(() => onPasswordChanged(), 1500);
      // } 
      localStorage.setItem('mustChange', 'false');
      setSuccess("Password updated successfully!");
        
      setTimeout(() =>  onPasswordChanged(), 1500);
    } catch (error) {
      setError("Error updating password.");
    } finally {
         setLoading(false);
    }
  };

  return (
      
    <div className="relative min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0f172a] p-6 font-sans transition-colors duration-500" overflow-hidden>
     <BackgroundPatterns init={particlesInit} />
      <div className="relative z-10 max-w-md w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-2xl p-10 shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white dark:border-slate-800 animate-in fade-in zoom-in duration-500">

        <div className="relative mx-auto w-24 h-24 mb-8">
            <div className="absolute inset-0 bg-blue-500/10 rounded-3xl rotate-6 animate-pulse"></div>
            <div className="relative bg-gradient-to-br from-blue-600 to-indigo-700 w-full h-full rounded-3xl flex items-center justify-center transition-transform duration-300">
                <ShieldCheck className="text-white" size={48} />
            </div>
        </div>

          <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white transition-colors "> Security Update </h2>
          <p className="text-gray-500 dark:text-slate-400 mt-5 transition-colors">
            Your account is currently using a temporary password. Please set a new secure one to continue.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="group relative">
            <div className="absolute left-3 top-3 text-gray-400 group-focus-within:text-blue-500 transition-colors">
                <Lock size={20} />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="New Secure Password"
              className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg py-3 px-10 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 transition-all"
              
              onChange={(e) => setNewPassword(e.target.value)}
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

          <div className="space-y-4 px-1">
            <div className="h-1.5 w-full bg-gray-200 dark:bg-slate-800 rounded-full overflow-hidden flex">
              <div 
                className={`h-full transition-all duration-700 ease-in-out ${
                  strength === 1 ? 'w-1/4 bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]' :
                  strength === 2 ? 'w-2/4 bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]' :
                  strength === 3 ? 'w-3/4 bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]' :
                  strength === 4 ? 'w-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'w-0'
                }`}
              />
            </div>

            <div className="grid grid-cols-2 gap-y-2 gap-x-4 pt-1">
              <RequirementItem label="8+ Characters" met={checks.length} />
              <RequirementItem label="Uppercase" met={checks.upper} />
              <RequirementItem label="Numbers" met={checks.number} />
              <RequirementItem label="Special Char" met={checks.symbol} />
            </div>
          </div>
          
          {error && ( <div className="mt-4 p-3 bg-red-500/10 border border-red-500/50 rounded-xl text-red-500 text-sm font-bold text-center tracking-wider"> {error} </div> )}
          {success && ( <div className="mt-4 p-3 bg-green-500/10 border border-green-500/50 rounded-xl text-green-500 text-sm font-bold text-center"> {success} </div> )}    

          <button
            type="submit"
            disabled={loading || strength < 4}
            className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition duration-300 transform hover:scale-[1.02] ${
              strength === 4 
              // ? 'bg-blue-600 hover:bg-blue-500 text-white ' 
              // // ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_5px_15px_rgba(37,99,235,0.2)]' 
              // : 'bg-blue-600/30 text-white/40 cursor-not-allowed border border-white/5'
            }`}
          >
             {loading ? (
             <> Updating Security & Access</>
             ) : (
               "Update Password & Access"
             )}
          </button>
        </form>

            <p className="text-center text-xs text-gray-400 mt-8 font-medium tracking-widest uppercase opacity-70">
               AiSentinel Security Policy
            </p>
        
      </div>
    </div>
  );
};

const RequirementItem = ({ label, met }) => (
  <div className={`flex items-center gap-2 transition-all duration-300 ${met ? 'text-emerald-500 translate-x-1' : 'text-gray-400 dark:text-slate-600'}`}>
    {met ? <Check size={12} strokeWidth={4} /> : <X size={12} strokeWidth={4} />}
    <span className="text-[10px] font-black uppercase tracking-tighter">{label}</span>
  </div>
);

export default ChangePasswordPage;

// import React, { useState, useEffect } from 'react';
// import { ShieldCheck, Lock, Loader2, Check, X, Eye, EyeOff } from 'lucide-react';


// const ChangePasswordPage = ({ onPasswordChanged }) => {
//   const [newPassword, setNewPassword] = useState('');
//   const [showPassword, setShowPassword] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [strength, setStrength] = useState(0);
//   const [checks, setChecks] = useState({
//     length: false, upper: false, number: false, symbol: false
//   });

//   useEffect(() => {
//     const p = newPassword;
//     const c = {
//       length: p.length >= 8,
//       upper: /[A-Z]/.test(p),
//       number: /[0-9]/.test(p),
//       symbol: /[^A-Za-z0-9]/.test(p)
//     };
//     setChecks(c);
//     setStrength(Object.values(c).filter(Boolean).length);
//   }, [newPassword]);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (strength < 4) return;
//     setLoading(true);
//     const token = localStorage.getItem('token');
    
//     try {
//       const response = await fetch('http://127.0.0.1:8000/change-password', {
//         method: 'POST',
//         headers: { 
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${token}`
//         },
//         body: JSON.stringify({ new_password: newPassword })
//       });
//       if (response.ok) {
//         localStorage.setItem('mustChange', 'false');
//         onPasswordChanged();
//       }
//     } catch (error) {
//       alert("Error updating password.");
//     }
//     setLoading(false);
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0f172a] p-6 font-sans transition-colors duration-500">
//       {/* <div className="max-w-md w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-[2.5rem] p-10 shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white dark:border-slate-800 animate-in fade-in zoom-in duration-500"> */}
//       <div className="max-w-md w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-2xl p-10 shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white dark:border-slate-800 animate-in fade-in zoom-in duration-500">

//                       {/* old ShieldCheck */}
//         {/* <div className="relative mx-auto w-24 h-24 mb-8">
//             <div className="absolute inset-0 bg-blue-500/30 rounded-3xl rotate-6 animate-pulse"></div>
//             <div className="relative bg-gradient-to-br from-blue-600 to-indigo-700 w-full h-full rounded-3xl flex items-center justify-center shadow-lg shadow-blue-500/40 -rotate-3 transition-transform hover:rotate-0 duration-300">
//                 <ShieldCheck className="text-white" size={48} />
//             </div>
//         </div> */}
//         <div className="relative mx-auto w-24 h-24 mb-8">
//             <div className="absolute inset-0 bg-blue-500/10 rounded-3xl rotate-6 animate-pulse"></div>
//             <div className="relative bg-gradient-to-br from-blue-600 to-indigo-700 w-full h-full rounded-3xl flex items-center justify-center shadow-lg shadow-blue-500/20 -rotate-3 transition-transform hover:rotate-0 duration-300">
//                 <ShieldCheck className="text-white" size={48} />
//             </div>
//         </div>
//           <div className="text-center mb-10">
//           <h2 className="text-3xl font-bold text-slate-900 dark:text-white transition-colors "> Security Update </h2>
//           <p className="text-gray-500 dark:text-slate-400 mt-2 transition-colors">
//             Your account is currently using a temporary password. Please set a new secure one to continue.
//           </p>
//         </div>
//         {/* <div className="text-center mb-10">
//           <h2 className="text-2xl font-bold dark:text-white tracking-tight mb-2 "> Security Update </h2>
//           <p className="text-gray-500 dark:text-slate-400 text-sm leading-relaxed">
//             Your account is currently using a temporary password. Please set a new secure one to continue.
//           </p>
//         </div> */}
//                         {/* محتاجة أعدل هنا*****  */}
//         <form onSubmit={handleSubmit} className="space-y-6">
//           <div className="group relative">
//             <div className="absolute left-4 top-4 text-gray-400 group-focus-within:text-blue-500 transition-colors">
//                 <Lock size={20} />
//             </div>
//             <input
//               type={showPassword ? "text" : "password"}
//               placeholder="New Secure Password"
//               className="w-full bg-gray-100 dark:bg-slate-800 border-2 border-transparent focus:border-blue-500 rounded-2xl py-4 pl-12 pr-12 outline-none transition-all dark:text-white font-mono"
//               value={newPassword}
//               onChange={(e) => setNewPassword(e.target.value)}
//               required
//             />
//             <button 
//               type="button"
//               onClick={() => setShowPassword(!showPassword)}
//               className="absolute right-4 top-4 text-gray-400 hover:text-blue-500 transition-colors"
//             >
//               {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
//             </button>
//           </div>

//           <div className="space-y-4 px-1">
//             <div className="h-1.5 w-full bg-gray-200 dark:bg-slate-800 rounded-full overflow-hidden flex">
//               <div 
//                 className={`h-full transition-all duration-700 ease-in-out ${
//                   strength === 1 ? 'w-1/4 bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]' :
//                   strength === 2 ? 'w-2/4 bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]' :
//                   strength === 3 ? 'w-3/4 bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]' :
//                   strength === 4 ? 'w-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'w-0'
//                 }`}
//               />
//             </div>

//             <div className="grid grid-cols-2 gap-y-2 gap-x-4 pt-1">
//               <RequirementItem label="8+ Characters" met={checks.length} />
//               <RequirementItem label="Uppercase" met={checks.upper} />
//               <RequirementItem label="Numbers" met={checks.number} />
//               <RequirementItem label="Special Char" met={checks.symbol} />
//             </div>
//           </div>

//           <button
//             type="submit"
//             disabled={loading || strength < 4}
//             className={`w-full font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-3 active:scale-[0.98] ${
//               strength === 4 
//               ? 'bg-blue-600 hover:bg-blue-500 text-white ' 
//               // ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_5px_15px_rgba(37,99,235,0.2)]' 
//               : 'bg-blue-600/30 text-white/40 cursor-not-allowed border border-white/5'
//             }`}
//           >
//              {loading ? (
//              <>
//                  <Loader2 className="animate-spin" size={20} />
//                  Updating Security...
//                </>
//              ) : (
//                "Update Password & Access"
//              )}
//           </button>
//         </form>
//                       {/* هنا محتاجة أعدل****** */}
//         <div className="mt-10 pt-6 border-t border-gray-100 dark:border-slate-800 text-center">
//                                   {/* original */}
//             {/* <p className="text-[9px] text-gray-400 dark:text-slate-500 uppercase font-black tracking-[0.4em]"> */}
//                                     {/* Now */}
//             <p className="text-[9px] text-gray-600 dark:text-slate-300 uppercase font-black tracking-[0.4em]">

//             {/* <p className="text-[10px] text-gray-600 dark:text-slate-300 font-extrabold uppercase tracking-[0.4em]"> */}
//                 AiSentinel Security Policy
//             </p>
//         </div>
//       </div>
//     </div>
//   );
// };

// const RequirementItem = ({ label, met }) => (
//   <div className={`flex items-center gap-2 transition-all duration-300 ${met ? 'text-emerald-500 translate-x-1' : 'text-gray-400 dark:text-slate-600'}`}>
//     {met ? <Check size={12} strokeWidth={4} /> : <X size={12} strokeWidth={4} />}
//     <span className="text-[10px] font-black uppercase tracking-tighter">{label}</span>
//   </div>
// );

// export default ChangePasswordPage;

