import React from 'react';
import { ShieldCheck, Activity, Zap, ArrowRight, ArrowLeft } from 'lucide-react';

const DetectionHub = ({ onNavigate, onBack, isConnected }) => {
  const modules = [
    {
      id: 'static',
      title: 'Static Rules Engine',
      desc: 'Traditional signature-based detection and deterministic firewall rules.',
      icon: <ShieldCheck size={36} />,
      color: 'blue',
      shadow: 'shadow-blue-500/15', //500/20
      glow: 'bg-blue-500/15' //500/10
    },
    {
      id: 'threat',
      title: 'Threat Detection',
      desc: 'Advanced classification models for known attack vectors like DDoS and TCP-RST.',
      icon: <Zap size={36} />,
      color: 'blue',
      shadow: 'shadow-blue-500/15',
      glow: 'bg-blue-500/15'
    },
    {
      id: 'anomaly',
      title: 'Anomaly Detection',
      desc: 'AI-powered behavioral analysis using Unsupervised Learning to detect zero-day patterns.',
      icon: <Activity size={36} />,
      color: 'blue',
      shadow: 'shadow-blue-500/15',
      glow: 'bg-blue-500/15'
    }
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto animate-fadeIn">
      {/* 1. Header */}
      <header className="mb-16">
        <div className="flex items-center gap-6 mb-4">
          <button 
            onClick={onBack} 
            className="p-3 bg-[#0f172a] border border-white/5 hover:border-blue-500/50 rounded-2xl transition-all duration-300 text-blue-400 shadow-xl group"
          >
            <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
          </button>
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter flex items-center gap-4">
              <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                Detection
              </span> 
              Hub
            </h1>
            <div className="h-1 w-20 bg-blue-600 mt-2 rounded-full shadow-[0_0_10px_#2563eb]"></div>
          </div>
        </div>
        <p className="text-slate-400 font-medium ml-20 max-w-2xl leading-relaxed italic text-sm">
          The core intelligence of AiSentinel. Each module utilizes advanced processing layers to ensure maximum data protection.
        </p>
      </header>

      {/* 2. Grid الخاص بالكروت */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {modules.map((mod) => (
          <div 
            key={mod.id}
            onClick={() => onNavigate(mod.id)}
            className={`group relative bg-[#0f172a] border border-white/5 rounded-[2rem] p-10 shadow-2xl transition-all duration-500 cursor-pointer hover:-translate-y-3 overflow-hidden ${mod.shadow}`}
          >
            {/* تأثير النيون الخلفي */}
            <div className={`absolute -right-12 -top-12 w-40 h-40 ${mod.glow} rounded-full blur-[80px] group-hover:blur-[60px] transition-all duration-700`} />
            
            <div className="relative z-10">
              {/* أيقونة الموديول */}
              <div className={`inline-block p-5 rounded-2xl bg-[#0f172a] border border-white/5 mb-8 group-hover:scale-110 transition-transform duration-500 text-${mod.color}-500`}>
                {mod.icon}
              </div>

              <h3 className="text-2xl font-black text-white mb-4 tracking-tight group-hover:text-blue-400 transition-colors">
                {mod.title}
              </h3>
              
              <p className="text-slate-400 text-sm leading-relaxed mb-8 font-medium">
                {mod.desc}
              </p>

              <div className={`flex items-center text-${mod.color}-400 font-black text-[10px] uppercase tracking-[0.2em] group-hover:gap-4 transition-all`}>
                Initialize Module 
                <ArrowRight size={16} className="ml-2 group-hover:translate-x-2 transition-transform" />
              </div>
            </div>

            <div className={`absolute bottom-0 left-0 h-1 bg-${mod.color}-500 w-0 group-hover:w-full transition-all duration-700 shadow-[0_0_15px] shadow-${mod.color}-500`} />
          </div>
        ))}
      </div>

      {/* 3. Footer */}
        <div className="mt-20 flex justify-center border-t border-white/5 pt-8">
            <div className="flex items-center gap-3 bg-[#060a14] px-5 py-2.5 rounded-full border border-white/5 shadow-inner shadow-blue-500/5">
              <div className={`w-2 h-2 rounded-full transition-all duration-500 ${
                isConnected 
                ? 'bg-green-500 shadow-[0_0_10px_#22c55e] animate-pulse' 
                : 'bg-red-500 shadow-[0_0_10px_#ef4444]'
              }`}></div>     
      <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${
        isConnected ? 'text-slate-400' : 'text-red-500'
      }`}>
        {isConnected ? 'All Engines Operational' : 'Engines Offline - Check Server'}
      </span>
    </div>
</div>
    </div>
  );
};

export default DetectionHub;
// import React from 'react';
// import { ShieldCheck, Activity, Zap, ArrowRight, ArrowLeft } from 'lucide-react';

// const DetectionHub = ({ onNavigate, onBack }) => {
//   const modules = [
//     {
//       id: 'static',
//       title: 'Static Rules Engine',
//       desc: 'Traditional signature-based detection and firewall rules.',
//       icon: <ShieldCheck size={32} className="text-blue-500" />,
//       color: 'blue'
//     },
//     {
//       id: 'anomaly',
//       title: 'Anomaly Detection',
//       desc: 'AI-powered behavioral analysis to find unusual patterns.',
//       icon: <Activity size={32} className="text-purple-500" />,
//       color: 'purple'
//     },
//     {
//       id: 'threat',
//       title: 'Threat Detection',
//       desc: 'Real-time identification of known attack vectors (DDoS, Starvation).',
//       icon: <Zap size={32} className="text-red-500" />,
//       color: 'red'
//     }
//   ];

// return (
//     <div className="p-8 max-w-7xl mx-auto">
//       {/* الـ Header مع زرار الرجوع */}
//       <header className="mb-12">
//         <div className="flex items-center gap-4 mb-2">
//           <button 
//             onClick={onBack} 
//             className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-600 dark:text-gray-400"
//             title="Back to Dashboard"
//           >
//             <ArrowLeft size={28} />
//           </button>
//             {/* <h1 className="text-3xl font-bold flex items-center gap-3 font-mono text-blue-500 uppercase tracking-tighter"> */}
//             <h1 className="text-4xl font-bold flex text-gray-900 gap-3 dark:text-white uppercase tracking-tighter">
//               <Activity size={32} /> Detection Hub
//             </h1>
            
//           {/* <h1 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">
//             Detection Hub
//           </h1> */}
//         </div>
//         {/* <p className="text-gray-500 dark:text-gray-400 font-medium ml-12">
//           Select a detection module to view detailed analytics and logs.
//         </p> */}
//       </header>

//       {/* الـ Grid الخاصة بالكروت */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
//         {modules.map((mod) => (
//           <div 
//             key={mod.id}
//             onClick={() => onNavigate(mod.id)}
//             className="group relative bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 cursor-pointer hover:-translate-y-2 overflow-hidden"
//           >
//             {/* تأثير ضوئي خلفي عند الحركة */}
//             <div className={`absolute -right-10 -top-10 w-32 h-32 bg-${mod.color}-500/10 rounded-full blur-3xl group-hover:bg-${mod.color}-500/20 transition-all`} />
            
//             <div className="relative z-10">
//               <div className={`inline-block p-4 rounded-2xl bg-${mod.color}-500/10 mb-6 group-hover:scale-110 transition-transform`}>
//                 {mod.icon}
//               </div>
//               <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{mod.title}</h3>
//               <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-6">
//                 {mod.desc}
//               </p>
//               <div className="flex items-center text-blue-500 font-bold text-sm uppercase tracking-widest">
//                 Explore Module <ArrowRight size={16} className="ml-2 group-hover:translate-x-2 transition-transform" />
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default DetectionHub; 
