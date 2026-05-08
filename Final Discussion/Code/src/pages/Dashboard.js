import React, { useState, useEffect } from 'react';
// import io from 'socket.io-client';
import { Activity, ShieldCheck, ShieldAlert, GlobeLock } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const StatCard = ({ title, value, icon, colorClass }) => (
  <div className="bg-[#0f172a] border border-blue-900/20 p-6 rounded-2xl shadow-2xl relative group overflow-hidden transition-all duration-300 hover:border-blue-500/30">
    <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full blur-3xl opacity-5 ${colorClass.replace('text-', 'bg-')}`}></div>
    
    <div className="flex items-center justify-between relative z-10">
      <div>
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">
          {title}
        </p>
        <h3 className={`text-3xl font-bold tracking-tighter ${colorClass}`}>
          {value}
        </h3>
      </div>
      <div className={`p-3 rounded-xl bg-[#060a14]/50 border border-white/5 ${colorClass}`}>
        {icon}
      </div>
    </div>
  </div>
);


const Dashboard = ({ 
  stats = { totalLogs: "0", normalTraffic: "0%", activeThreats: 0, blockedIPs: 0 }, 
  recentAlerts = [] 
}) => {

  const [timelineData, setTimelineData] = useState([]);
  useEffect(() => {
        if (stats && typeof stats.activeThreats !== 'undefined') {
            setTimelineData(current => [...current.slice(-19), {
                time: new Date().toLocaleTimeString(),
                threats: stats.activeThreats
            }]);
        }
    }, [stats.activeThreats]);

  return (
    <div className="space-y-10 animate-fadeIn">
      {/* 1. Stats Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard title="Total Logs" value={stats.totalLogs} icon={<Activity size={24} />} colorClass="text-blue-500" />
      <StatCard title="Normal Traffic" value={stats.normalTraffic} icon={<ShieldCheck size={24} />} colorClass="text-emerald-500" />
      <StatCard title="Active Threats" value={stats.activeThreats} icon={<ShieldAlert size={24} />} colorClass="text-red-500" />
      <StatCard title="Blocked IPs" value={stats.blockedIPs} icon={<GlobeLock size={24} />} colorClass="text-purple-500" />
    </div>

      {/* 2. Charts & Alerts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* الـ Threat Detection Chart (2/3 من المساحة) */}
        <div className="lg:col-span-2 bg-[#0f172a] border border-blue-900/20 p-8 rounded-3xl shadow-2xl">
          <div className="flex items-center justify-between mb-8">
            <h4 className="text-sm font-bold text-white uppercase tracking-widest">Threat Detection Timeline</h4>
            <span className="flex items-center gap-2 text-[10px] text-emerald-500 font-black uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full">
               <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Live Sync
            </span>
          </div>
          {/* Line Chart  */}
          {/*[ AI Analysis Graph Area ] */}
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
              <XAxis 
                dataKey="time" 
                stroke="#475569" 
                fontSize={11} 
                fontWeight="bold"
                tickLine={false} 
                axisLine={false}
              />
              <YAxis 
                stroke="#475569" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0a0f1d', border: '1px solid #1e293b', borderRadius: '8px' }}
                itemStyle={{ color: '#ef4444', fontSize: '12px', fontWeight: 'bold' }}
              />
              <Line 
                type="monotone" 
                dataKey="threats" 
                stroke="#ef4444" 
                strokeWidth={3} 
                dot={false}
                animationDuration={300}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* 3. AI Decision Status (Pie Chart) */}
        <div className="bg-[#0f172a] border border-blue-900/20 p-8 rounded-3xl shadow-2xl">
           <h4 className="text-sm font-bold text-white uppercase tracking-widest mb-8">Decision Status</h4>
           <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Normal', value: parseFloat(stats.normalTraffic) || 100 },
                    { name: 'Suspicious', value: stats.activeThreats || 0 },
                  ]}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  <Cell fill="#10b981" /> 
                  <Cell fill="#ef4444" /> 
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0a0f1d', border: '1px solid #1e293b', borderRadius: '8px' }}
                />
              </PieChart>
            </ResponsiveContainer>
        </div>

      </div>

      {/* 4. Recent Security Alerts (Full Width) */}
      <div className="bg-[#0f172a] border border-blue-900/20 rounded-3xl shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-white/5 bg-white/5">
           <h4 className="text-sm font-bold text-white uppercase tracking-widest">Recent Security Alerts</h4>
        </div>
        <div className="p-0">
           {/* هنا جدول التنبيهات - 5 صفوف فقط */}
           <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-white/5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                <tr>
                  <th className="px-6 py-4">Timestamp</th>
                  <th className="px-6 py-4">Source IP</th>
                  <th className="px-6 py-4">Attack Type</th>
                  <th className="px-6 py-4">Severity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentAlerts.map((alert, index) => (
                  <tr key={index} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 text-xs text-slate-400 font-medium">{alert.time}</td>
                    <td className="px-6 py-4 text-xs text-blue-400 font-bold font-mono">{alert.ip}</td>
                    <td className="px-6 py-4 text-xs text-white font-bold">{alert.type}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                        alert.severity === 'High' ? 'bg-red-500/10 text-red-500' : 
                        alert.severity === 'Medium' ? 'bg-amber-500/10 text-amber-500' : 'bg-blue-500/10 text-blue-500'
                      }`}>
                        {alert.severity}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {recentAlerts.length === 0 && (
              <div className="py-12 text-center text-slate-600 font-bold tracking-widest uppercase italic text-xs">
                No recent threats detected by AiSentinel
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

// import React, { useState, useEffect } from 'react';
// // import io from 'socket.io-client';
// import { Activity, ShieldCheck, ShieldAlert, GlobeLock } from 'lucide-react';
// import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// const StatCard = ({ title, value, icon, colorClass }) => (
//   <div className="bg-[#0a0f1d] border border-blue-500/10 p-6 rounded-2xl shadow-2xl relative group overflow-hidden transition-all duration-300 hover:border-blue-500/30">
//     <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full blur-3xl opacity-5 ${colorClass.replace('text-', 'bg-')}`}></div>
    
//     <div className="flex items-center justify-between relative z-10">
//       <div>
//         <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">
//           {title}
//         </p>
//         <h3 className={`text-3xl font-bold tracking-tighter ${colorClass}`}>
//           {value}
//         </h3>
//       </div>
//       <div className={`p-3 rounded-xl bg-slate-900/50 border border-white/5 ${colorClass}`}>
//         {icon}
//       </div>
//     </div>
//   </div>
// );


// const Dashboard = ({ 
//   stats = { totalLogs: "0", normalTraffic: "0%", activeThreats: 0, blockedIPs: 0 }, 
//   recentAlerts = [] 
// }) => {

//   const [timelineData, setTimelineData] = useState([]);
//   useEffect(() => {
//         if (stats && typeof stats.activeThreats !== 'undefined') {
//             setTimelineData(current => [...current.slice(-19), {
//                 time: new Date().toLocaleTimeString(),
//                 threats: stats.activeThreats
//             }]);
//         }
//     }, [stats.activeThreats]);

//   return (
//     <div className="space-y-10 animate-fadeIn">
//       {/* 1. Stats Grid */}
//     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//       <StatCard title="Total Logs" value={stats.totalLogs} icon={<Activity size={24} />} colorClass="text-blue-500" />
//       <StatCard title="Normal Traffic" value={stats.normalTraffic} icon={<ShieldCheck size={24} />} colorClass="text-emerald-500" />
//       <StatCard title="Active Threats" value={stats.activeThreats} icon={<ShieldAlert size={24} />} colorClass="text-red-500" />
//       <StatCard title="Blocked IPs" value={stats.blockedIPs} icon={<GlobeLock size={24} />} colorClass="text-purple-500" />
//     </div>

//       {/* 2. Charts & Alerts Section */}
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
//         {/* الـ Threat Detection Chart (2/3 من المساحة) */}
//         <div className="lg:col-span-2 bg-[#0a0f1d] border border-blue-500/10 p-8 rounded-3xl shadow-2xl">
//           <div className="flex items-center justify-between mb-8">
//             <h4 className="text-sm font-bold text-white uppercase tracking-widest">Threat Detection Timeline</h4>
//             <span className="flex items-center gap-2 text-[10px] text-emerald-500 font-black uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full">
//                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Live Sync
//             </span>
//           </div>
//           {/* Line Chart  */}
//           {/*[ AI Analysis Graph Area ] */}
//           <ResponsiveContainer width="100%" height={250}>
//             <LineChart data={timelineData}>
//               <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
//               <XAxis 
//                 dataKey="time" 
//                 stroke="#475569" 
//                 fontSize={11} 
//                 fontWeight="bold"
//                 tickLine={false} 
//                 axisLine={false}
//               />
//               <YAxis 
//                 stroke="#475569" 
//                 fontSize={10} 
//                 tickLine={false} 
//                 axisLine={false}
//               />
//               <Tooltip 
//                 contentStyle={{ backgroundColor: '#0a0f1d', border: '1px solid #1e293b', borderRadius: '8px' }}
//                 itemStyle={{ color: '#ef4444', fontSize: '12px', fontWeight: 'bold' }}
//               />
//               <Line 
//                 type="monotone" 
//                 dataKey="threats" 
//                 stroke="#ef4444" 
//                 strokeWidth={3} 
//                 dot={false}
//                 animationDuration={300}
//               />
//             </LineChart>
//           </ResponsiveContainer>
//         </div>

//         {/* 3. AI Decision Status (Pie Chart) */}
//         <div className="bg-[#0a0f1d] border border-blue-500/10 p-8 rounded-3xl shadow-2xl">
//            <h4 className="text-sm font-bold text-white uppercase tracking-widest mb-8">Decision Status</h4>
//            <ResponsiveContainer width="100%" height={250}>
//               <PieChart>
//                 <Pie
//                   data={[
//                     { name: 'Normal', value: parseFloat(stats.normalTraffic) || 100 },
//                     { name: 'Suspicious', value: stats.activeThreats || 0 },
//                   ]}
//                   innerRadius={60}
//                   outerRadius={80}
//                   paddingAngle={5}
//                   dataKey="value"
//                 >
//                   <Cell fill="#10b981" /> 
//                   <Cell fill="#ef4444" /> 
//                 </Pie>
//                 <Tooltip 
//                   contentStyle={{ backgroundColor: '#0a0f1d', border: '1px solid #1e293b', borderRadius: '8px' }}
//                 />
//               </PieChart>
//             </ResponsiveContainer>
//         </div>

//       </div>

//       {/* 4. Recent Security Alerts (Full Width) */}
//       <div className="bg-[#0a0f1d] border border-blue-500/10 rounded-3xl shadow-2xl overflow-hidden">
//         <div className="p-6 border-b border-white/5 bg-white/5">
//            <h4 className="text-sm font-bold text-white uppercase tracking-widest">Recent Security Alerts</h4>
//         </div>
//         <div className="p-0">
//            {/* هنا جدول التنبيهات - 5 صفوف فقط */}
//            <div className="overflow-x-auto">
//             <table className="w-full text-left border-collapse">
//               <thead className="bg-white/5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
//                 <tr>
//                   <th className="px-6 py-4">Timestamp</th>
//                   <th className="px-6 py-4">Source IP</th>
//                   <th className="px-6 py-4">Attack Type</th>
//                   <th className="px-6 py-4">Severity</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-white/5">
//                 {recentAlerts.map((alert, index) => (
//                   <tr key={index} className="hover:bg-white/[0.02] transition-colors">
//                     <td className="px-6 py-4 text-xs text-slate-400 font-medium">{alert.time}</td>
//                     <td className="px-6 py-4 text-xs text-blue-400 font-bold font-mono">{alert.ip}</td>
//                     <td className="px-6 py-4 text-xs text-white font-bold">{alert.type}</td>
//                     <td className="px-6 py-4">
//                       <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
//                         alert.severity === 'High' ? 'bg-red-500/10 text-red-500' : 
//                         alert.severity === 'Medium' ? 'bg-amber-500/10 text-amber-500' : 'bg-blue-500/10 text-blue-500'
//                       }`}>
//                         {alert.severity}
//                       </span>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//             {recentAlerts.length === 0 && (
//               <div className="py-12 text-center text-slate-600 font-bold tracking-widest uppercase italic text-xs">
//                 No recent threats detected by AiSentinel
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Dashboard;
