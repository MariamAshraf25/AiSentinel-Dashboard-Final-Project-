import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, Search, ArrowLeft, X, Shield, RefreshCw, Download } from 'lucide-react';

const LogsHistory = ({ onBack }) => {
  const [data, setData] = useState({ logs: [], total_pages: 1 });
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLog, setSelectedLog] = useState(null);

  const fetchHistory = async () => {
    const token = localStorage.getItem('token');
    // توحيد الـ URL لـ localhost
    const url = `http://localhost:8000/history?page=${page}&size=15${searchTerm ? `&q=${searchTerm}` : ''}`;
    try {
      const response = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
      const result = await response.json();
      setData(result);
    } catch (error) { console.error(error); }
  };

  // useEffect(() => { fetchHistory(); }, [page, searchTerm]);

  const handleRefresh = () => {
    setSearchTerm(''); // مسح البحث عند الـ Refresh
    setPage(1);
    fetchHistory();
  };

  const handleExportCSV = () => {
    if (!data.logs || data.logs.length === 0) return alert("No logs to export!");
    const headers = Object.keys(data.logs[0]).join(",");
    const rows = data.logs.map(log => Object.values(log).map(val => `"${val}"`).join(","));
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `AiSentinel_Logs_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#060a14] text-gray-900 dark:text-white p-8 relative transition-colors duration-300">
      <div className="max-w-6xl mx-auto pb-10">
        
        {/* --- Header --- */}
        <header className="mb-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-6">
              <button onClick={onBack} className="p-3 bg-white dark:bg-[#0f172a] border border-gray-200 dark:border-white/5 hover:border-blue-500/50 rounded-2xl transition-all shadow-xl group">
                <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform text-blue-500" />
              </button>
              <div>
                <h1 className="text-4xl font-black uppercase tracking-tighter flex items-center gap-3">
                  <span className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">Logs</span> Archive
                </h1>
                <div className="h-1 w-20 bg-blue-600 mt-2 rounded-full shadow-[0_0_10px_#2563eb]"></div>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <button onClick={handleExportCSV} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-green-500/20 active:scale-95">
                <Download size={18} /> Export CSV
              </button>
            </div>
          </div>
        </header>

        {/* --- Search & Refresh Integrated --- */}
        <div className="relative flex gap-3 w-full mb-8">
          <div className="relative flex-grow group">
            <Search className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={20} />
            <input 
              type="text" 
              value={searchTerm}
              placeholder="Search by IP, Status, or Attack type..." 
              className="w-full bg-white dark:bg-[#0f172a] border border-gray-200 dark:border-blue-900/20 rounded-2xl py-3.5 pl-12 pr-12 focus:border-blue-500 outline-none transition-all shadow-lg"
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
            />
            {searchTerm && (
              <button onClick={() => {setSearchTerm(''); setPage(1);}} className="absolute right-4 top-3.5 text-gray-400 hover:text-red-500 transition-colors">
                <X size={20} />
              </button>
            )}
          </div>
          <button onClick={handleRefresh} title="Reset & Refresh" className="p-3 bg-white dark:bg-[#0f172a] border border-gray-200 dark:border-blue-900/20 rounded-2xl text-white hover:bg-blue-500/10 transition-all shadow-lg group">
            <RefreshCw size={24} className="group-active:rotate-180 transition-transform duration-500" />
          </button>
        </div>

        {/* --- Table --- */}
        <div className="bg-white dark:bg-[#0f172a] rounded-[2rem] border border-gray-200 dark:border-blue-900/20 overflow-hidden shadow-2xl">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-[#060a14]/50 text-gray-400 text-[10px] uppercase font-black tracking-[0.2em] border-b border-gray-100 dark:border-white/5">
              <tr>
                <th className="px-7 py-5">IP Address</th>
                <th className="px-7 py-5">Timestamp</th>
                <th className="px-7 py-5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
              {data.logs?.map((log, i) => {
                const ipValue = log.ip || log.source_ip || log.IP || "N/A";
                const requestPath = log.request || log.request_url || "/";
                const isAttack = log.Final_Status === 'blocked' || log.label === 1;
                return (
                  <tr key={i} onClick={() => setSelectedLog(log)} className="hover:bg-blue-500/[0.03] cursor-pointer transition duration-150 group">
                    <td className="px-6 py-5 font-bold group-hover:text-blue-500 transition-colors">{ipValue}</td>
                    <td className="px-6 py-5 text-sm font-mono text-gray-400">{log.Timestamp || log.timestamp}</td>
                    <td className="px-6 py-5 text-center">
                      <span className={`px-4 py-1.5 rounded-lg text-[10px] font-black tracking-widest border ${
                        isAttack ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-green-500/10 text-green-500 border-green-500/20'
                      }`}>
                        {isAttack ? 'ATTACK' : 'NORMAL'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* --- Pagination --- */}
        <div className="flex justify-center items-center gap-4 mt-12">
          <button onClick={() => setPage(1)} disabled={page === 1} className="p-3 bg-white dark:bg-[#0f172a] border border-gray-200 dark:border-blue-900/20 rounded-xl text-blue-500 disabled:opacity-20 shadow-lg">
            <ChevronsLeft size={20} />
          </button>
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="p-3 bg-white dark:bg-[#0f172a] border border-gray-200 dark:border-blue-900/20 rounded-xl disabled:opacity-20 text-blue-500 shadow-lg">
            <ChevronLeft size={24} />
          </button>
          <span className="text-xs font-black bg-white dark:bg-[#0f172a] px-8 py-3 rounded-full border border-gray-200 dark:border-blue-900/20 tracking-[0.2em] shadow-lg">
            PAGE {data.logs?.length > 0 ? page : 0} OF {data.total_pages || 0}
          </span>
          <button disabled={page >= data.total_pages || data.logs?.length === 0} onClick={() => setPage(p => p + 1)} className="p-3 bg-white dark:bg-[#0f172a] border border-gray-200 dark:border-blue-900/20 rounded-xl disabled:opacity-20 text-blue-500 shadow-lg">
            <ChevronRight size={24} />
          </button>
        </div>
      </div>

      {/* Modal Details  */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[1000] p-4" onClick={() => setSelectedLog(null)}>
          <div className="bg-white dark:bg-[#0f172a] border border-white/5 w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-8 border-b border-white/5 flex justify-between items-center bg-[#060a14]/50 text-white">
              <h2 className="text-xl font-black uppercase tracking-tight">Log Intelligence</h2>
              <button onClick={() => setSelectedLog(null)}><X size={28} /></button>
            </div>
            <div className="p-8 max-h-[60vh] overflow-y-auto custom-scrollbar font-mono text-sm">
               {Object.entries(selectedLog).map(([k, v]) => (
                 <div key={k} className="flex flex-col border-b border-white/5 pb-3 mb-3">
                   <span className="text-blue-500 text-[10px] font-black uppercase mb-1">{k}</span>
                   <span className="break-all dark:text-slate-300">{String(v)}</span>
                 </div>
               ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LogsHistory;
// import React, { useState, useEffect } from 'react';
// import { ChevronLeft, ChevronRight, Search, ArrowLeft, X, Shield, RefreshCw, FileClock, Download } from 'lucide-react';

// const LogsHistory = ({ onBack }) => {
//   const [data, setData] = useState({ logs: [], total_pages: 1 });
//   const [page, setPage] = useState(1);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [selectedLog, setSelectedLog] = useState(null);

//   const fetchHistory = async () => {
//     const token = localStorage.getItem('token');
//     const url = `http://localhost:8000/history?page=${page}&size=15${searchTerm ? `&q=${searchTerm}` : ''}`;
//     try {
//       const response = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
//       const result = await response.json();
//       setData(result);
//     } catch (error) { console.error(error); }
//   };

//   useEffect(() => { fetchHistory(); }, [page, searchTerm]);

//   const handleRefresh = () => {
//     setPage(1);
//     fetchHistory();
//   };

//   // دالة تصدير البيانات لملف CSV
//   const handleExportCSV = () => {
//     if (!data.logs || data.logs.length === 0) return alert("No logs to export!");
    
//     const headers = Object.keys(data.logs[0]).join(",");
//     const rows = data.logs.map(log => 
//       Object.values(log).map(val => `"${val}"`).join(",")
//     );
    
//     const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
//     const encodedUri = encodeURI(csvContent);
//     const link = document.createElement("a");
//     link.setAttribute("href", encodedUri);
//     link.setAttribute("download", `AiSentinel_Logs_${new Date().toLocaleDateString()}.csv`);
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 dark:bg-[#060a14] text-gray-900 dark:text-white p-8 relative transition-colors duration-300">
//       <div className="max-w-6xl mx-auto pb-10">
        
//         {/* --- Header المطور --- */}
//         <header className="mb-12">
//           <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
//             <div className="flex items-center gap-6">
//               <button 
//                 onClick={onBack} 
//                 className="p-3 bg-white dark:bg-[#0f172a] border border-gray-200 dark:border-white/5 hover:border-blue-500/50 rounded-2xl transition-all duration-300 text-blue-500 shadow-xl group"
//               >
//                 <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
//               </button>
//               <div>
//                 <h1 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tighter flex items-center gap-3">
//                   <span className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
//                     Logs
//                   </span> 
//                   Archive
//                 </h1>
//                 <div className="h-1 w-20 bg-blue-600 mt-2 rounded-full shadow-[0_0_10px_#2563eb]"></div>
//               </div>
//             </div>

//             <div className="flex items-center gap-3 w-full md:w-auto">
//               <button 
//                 onClick={handleExportCSV}
//                 className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-green-500/20 active:scale-95"
//               >
//                 <Download size={18} /> Export CSV
//               </button>
              
//               <button 
//                 onClick={handleRefresh} 
//                 className="p-3 bg-white dark:bg-[#0f172a] border border-gray-200 dark:border-white/5 hover:bg-blue-600 hover:text-white rounded-xl transition-all group shadow-lg"
//               >
//                 <RefreshCw size={20} className="group-hover:rotate-180 transition-transform duration-700" />
//               </button>
//             </div>
//           </div>
//         </header>

//         {/* --- Search Bar --- */}
//         <div className="relative w-full mb-8 group">
//           <Search className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={20} />
//           <input 
//             type="text" 
//             placeholder="Search by IP, Status, or Attack type..." 
//             className="w-full bg-white dark:bg-[#0f172a] border border-gray-200 dark:border-blue-900/20 rounded-2xl py-3.5 pl-12 pr-4 focus:border-blue-500 outline-none transition-all shadow-lg"
//             onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
//           />
//         </div>

//         {/* --- Table --- */}
//         <div className="bg-white dark:bg-[#0f172a] rounded-[2rem] border border-gray-200 dark:border-blue-900/20 overflow-hidden shadow-2xl transition-all">
//           <table className="w-full text-left">
//             <thead className="bg-gray-50 dark:bg-[#060a14]/50 text-gray-400 text-[10px] uppercase font-black tracking-[0.2em] border-b border-gray-100 dark:border-white/5">
//               <tr>
//                 <th className="px-6 py-5">IP Address</th>
//                 <th className="px-6 py-5">Timestamp</th>
//                 <th className="px-6 py-5">Status</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-100 dark:divide-white/5">
//               {data.logs && data.logs.map((log, i) => {
//                 const keys = Object.keys(log);
//                 const ipKey = keys.find(k => k.includes('.') || k.toLowerCase().includes('ip'));
//                 const ipValue = log[ipKey] || "N/A";
//                 return (
//                   <tr key={i} onClick={() => setSelectedLog(log)} className="hover:bg-blue-500/[0.03] cursor-pointer transition duration-150 group">
//                     <td className="px-6 py-5 font-bold group-hover:text-blue-500 transition-colors">{ipValue}</td>
//                     <td className="px-6 py-5 text-sm font-mono text-gray-400">{log['@timestamp'] || log['timestamp']}</td>
//                     <td className="px-6 py-5">
//                       <span className={`px-4 py-1.5 rounded-lg text-[10px] font-black tracking-widest border ${
//                         log.label === 1 || String(log.label).toLowerCase() === 'attack'
//                         ? 'bg-red-500/10 text-red-500 border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.1)]' 
//                         : 'bg-green-500/10 text-green-500 border-green-500/20 shadow-[0_0_10px_rgba(34,197,94,0.1)]'
//                       }`}>
//                         {log.label === 1 || String(log.label).toLowerCase() === 'attack' ? 'ATTACK' : 'NORMAL'}
//                       </span>
//                     </td>
//                   </tr>
//                 );
//               })}
//             </tbody>
//           </table>
//           {data.logs?.length === 0 && (
//               <div className="p-20 text-center text-gray-500 uppercase tracking-widest font-bold opacity-50">
//                   No records found in archive
//               </div>
//           )}
//         </div>

//         {/* --- Pagination --- */}
//         <div className="flex justify-center items-center gap-6 mt-12">
//           <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="p-3 bg-white dark:bg-[#0f172a] border border-gray-200 dark:border-blue-900/20 rounded-xl disabled:opacity-20 hover:border-blue-500 transition-all shadow-lg text-blue-500">
//             <ChevronLeft size={24} />
//           </button>

//           <span className="text-xs font-black bg-white dark:bg-[#0f172a] px-8 py-3 rounded-full border border-gray-200 dark:border-blue-900/20 tracking-[0.2em] shadow-lg uppercase">
//             PAGE {data.logs?.length > 0 ? page : 0} OF {data.total_pages || 0}
//           </span>

//           <button disabled={page >= data.total_pages || data.logs?.length === 0} onClick={() => setPage(p => p + 1)} className="p-3 bg-white dark:bg-[#0f172a] border border-gray-200 dark:border-blue-900/20 rounded-xl disabled:opacity-20 hover:border-blue-500 transition-all shadow-lg text-blue-500">
//             <ChevronRight size={24} />
//           </button>
//         </div>
//       </div>

//       {/* --- Modal التفاصيل --- */}
//       {selectedLog && (
//         <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[1000] p-4">
//           <div className="bg-white dark:bg-[#0f172a] border border-gray-200 dark:border-blue-900/30 w-full max-w-2xl rounded-[2.5rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden animate-in fade-in zoom-in duration-300">
//             <div className="p-8 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-gray-50/50 dark:bg-[#060a14]/50">
//               <div className="flex items-center gap-3">
//                 <div className="p-2 bg-blue-500/10 rounded-lg">
//                     <Shield size={24} className="text-blue-500"/>
//                 </div>
//                 <h2 className="text-xl font-black uppercase tracking-tight">Log Intelligence Data</h2>
//               </div>
//               <button onClick={() => setSelectedLog(null)} className="p-2 hover:bg-red-500/10 text-gray-400 hover:text-red-500 rounded-full transition-all"><X size={28} /></button>
//             </div>
//             <div className="p-8 max-h-[60vh] overflow-y-auto custom-scrollbar font-mono text-sm">
//               <div className="space-y-4">
//                 {Object.entries(selectedLog).map(([key, value]) => (
//                     <div key={key} className="flex flex-col border-b border-gray-100 dark:border-white/5 pb-3">
//                       <span className="text-blue-500 text-[10px] font-black uppercase tracking-widest mb-1">{key}</span>
//                       <span className="break-all dark:text-slate-300 text-slate-700">
//                           {typeof value === 'object' ? JSON.stringify(value) : String(value)}
//                       </span>
//                     </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default LogsHistory;
// import React, { useState, useEffect } from 'react';
// import { ChevronLeft, ChevronRight, Search, ArrowLeft, X, Shield, RefreshCw, FileClock } from 'lucide-react';

// const LogsHistory = ({ onBack }) => {
//   const [data, setData] = useState({ logs: [], total_pages: 1 });
//   const [page, setPage] = useState(1);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [selectedLog, setSelectedLog] = useState(null);

//   const fetchHistory = async () => {
//     const token = localStorage.getItem('token');
//     const url = `http://127.0.0.1:8000/history?page=${page}&size=15${searchTerm ? `&q=${searchTerm}` : ''}`;
//     try {
//       const response = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
//       const result = await response.json();
//       setData(result);
//     } catch (error) { console.error(error); }
//   };

//   useEffect(() => { fetchHistory(); }, [page, searchTerm]);

//   const handleRefresh = () => {
//     setPage(1);
//     fetchHistory();
//   };

//   return (
//     /* التعديل الجوهري: نستخدم ألوان متغيرة حسب المود dark:bg-gray-900 */
//     <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white p-8 relative transition-colors duration-300">
//       <div className="max-w-6xl mx-auto pb-10">
//         {/* Header */}
//         <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
//           <div className="flex items-center gap-4">
//             <button onClick={onBack} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition">
//               <ArrowLeft size={24} />
//             </button>
//             <h1 className="text-3xl font-bold flex items-center gap-3 font-mono text-blue-500 uppercase tracking-tighter">
//               <FileClock size={32} /> LOGS ARCHIVE
//             </h1>
//             <button 
//               onClick={handleRefresh} 
//               className="p-2 bg-white dark:bg-gray-800 hover:bg-blue-600 hover:text-white rounded-lg transition-all border border-gray-200 dark:border-gray-700 group shadow-sm"
//             >
//               <RefreshCw size={18} className="group-hover:rotate-180 transition-transform duration-500" />
//             </button>
//           </div>
          
//           <div className="relative w-full md:w-96">
//             <Search className="absolute left-3 top-3 text-gray-500" size={18} />
//             <input 
//               type="text" 
//               placeholder="Search IP, 'attack' or 'normal'..." 
//               className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg py-2 pl-10 pr-4 focus:border-blue-500 outline-none transition-colors"
//               onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
//             />
//           </div>
//         </div>

//         {/* Table - متجاوب مع المود */}
//         <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-xl">
//           <table className="w-full text-left">
//             <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-400 text-xs uppercase font-mono tracking-widest border-b border-gray-100 dark:border-gray-700">
//               <tr>
//                 <th className="px-6 py-4">IP Address</th>
//                 <th className="px-6 py-4">Timestamp</th>
//                 <th className="px-6 py-4">Status</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
//               {data.logs && data.logs.map((log, i) => {
//                 const keys = Object.keys(log);
//                 const ipKey = keys.find(k => k.includes('.') || k.toLowerCase().includes('ip'));
//                 const ipValue = log[ipKey] || "N/A";
//                 return (
//                   <tr key={i} onClick={() => setSelectedLog(log)} className="hover:bg-blue-500/5 cursor-pointer transition duration-150 group">
//                     <td className="px-6 py-4 font-bold group-hover:text-blue-500 transition-colors">{ipValue}</td>
//                     <td className="px-6 py-4 text-sm font-mono text-gray-400">{log['@timestamp']}</td>
//                     <td className="px-6 py-4">
//                       <span className={`px-3 py-1 rounded text-[10px] font-black tracking-widest border ${
//                         log.label === 1 
//                         ? 'bg-red-500/10 text-red-500 border-red-500/20' 
//                         : 'bg-green-500/10 text-green-500 border-green-500/20'
//                       }`}>
//                         {log.label === 1 ? 'ATTACK' : 'NORMAL'}
//                       </span>
//                     </td>
//                   </tr>
//                 );
//               })}
//             </tbody>
//           </table>
//         </div>

//         {/* Pagination - متجاوب مع المود */}
//         {/* <div className="flex justify-center items-center gap-6 mt-8">
//           <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg disabled:opacity-20 transition-colors"><ChevronLeft /></button>
//           <span className="text-xs font-black bg-white dark:bg-gray-800 px-6 py-2 rounded-full border border-gray-200 dark:border-gray-700 tracking-widest transition-colors">PAGE {page} OF {data.total_pages || 1}</span>
//           <button disabled={page >= data.total_pages} onClick={() => setPage(p => p + 1)} className="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg disabled:opacity-20 transition-colors"><ChevronRight /></button>
//         </div> */}
//         {/* Pagination - التعديل هنا لضمان عدم التقليب لو مفيش داتا */}
// <div className="flex justify-center items-center gap-6 mt-8">
//   <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg disabled:opacity-20 transition-colors" > <ChevronLeft /> </button>

//   <span className="text-xs font-black bg-white dark:bg-gray-800 px-6 py-2 rounded-full border border-gray-200 dark:border-gray-700 tracking-widest transition-colors uppercase">
//     PAGE {data.logs?.length > 0 ? page : 0} OF {data.total_pages || 0}
//   </span>

//   <button disabled={page >= data.total_pages || data.logs?.length === 0} onClick={() => setPage(p => p + 1)} className="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg disabled:opacity-20 transition-colors" > <ChevronRight /> </button>
// </div>
//       </div>

//       {/* Modal - متجاوب مع المود */}
//       {selectedLog && (
//         <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[1000] p-4">
//           <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
//             <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-700/30">
//               <h2 className="text-xl font-bold flex items-center gap-2 text-blue-500"><Shield size={20}/> Log Details</h2>
//               <button onClick={() => setSelectedLog(null)} className="p-2 hover:bg-red-500/20 hover:text-red-500 rounded-full transition"><X size={24} /></button>
//             </div>
//             <div className="p-8 max-h-[70vh] overflow-y-auto font-mono text-sm text-gray-900 dark:text-gray-100">
//               <div className="grid grid-cols-1 gap-4">
//                 {Object.entries(selectedLog).map(([key, value]) => {
//                   const isIpKey = key.includes('.') && !isNaN(parseInt(key[0]));
//                   const displayKey = isIpKey ? "Source IP" : key;
//                   return (
//                     <div key={key} className="flex flex-col border-b border-gray-100 dark:border-gray-700/50 pb-2">
//                       <span className="text-blue-500 text-xs font-bold uppercase">{displayKey}</span>
//                       <span className="break-all">{typeof value === 'object' ? JSON.stringify(value) : String(value)}</span>
//                     </div>
//                   );
//                 })}
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default LogsHistory;
