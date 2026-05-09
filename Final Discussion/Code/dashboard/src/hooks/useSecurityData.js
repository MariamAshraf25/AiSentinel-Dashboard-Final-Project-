import { useState, useEffect } from 'react';

const useSecurityData = (filterType = 'all', limit = 50) => {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({ total: 0, threats: 0, sources: 0 });

  const fetchData = async () => {
    try {
      // 1. نجيب التوكن من الذاكرة المحلية
      const token = localStorage.getItem('token');

      // 2. نطلب البيانات مع إرسال التوكن في الـ Headers
      const response = await fetch(`http://127.0.0.1:8000/logs?type=${filterType}&limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        if (Array.isArray(data)) {
          const processedLogs = data.map((item, index) => {
            // البحث عن مفتاح الـ IP (لأن الاسم قد يختلف في ملف الـ JSONL)
            const keys = Object.keys(item);
            const ipKey = keys.find(k => k.includes('.') || k.toLowerCase().includes('ip'));
            
            return {
              id: index,
              // تحويل الوقت لشكل مقروء
              time: item['@timestamp'] ? new Date(item['@timestamp']).toLocaleTimeString() : 'N/A',
              ip: item[ipKey] || 'Unknown IP',
              source: item['source_file'] ? item['source_file'].split('\\').pop() : 'Log File',
              // المنطق البرمجي: لو الـ label بـ 1 يبقى هجوم
              type: item.label === 1 ? 'Attack' : 'Normal',
            };
          });

          // ترتيب البيانات بحيث الأحدث يظهر فوق
          setLogs(processedLogs.reverse());
          
          // تحديث عدادات الإحصائيات (Stats)
          setStats({
            total: data.length, 
            threats: data.filter(l => l.label === 1).length,
            sources: new Set(processedLogs.map(l => l.ip)).size
          });
        }
      } else if (response.status === 401) {
        console.error("Session expired. Please login again.");
      }
    } catch (error) {
      console.error("Network Error:", error);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 1000); // تحديث كل ثانية
    return () => clearInterval(interval);
  }, [filterType, limit]); 

  return { logs, stats };
};

export default useSecurityData;
// import { useState, useEffect } from 'react';

// const useSecurityData = (filterType = 'all') => { // ضفنا الـ filterType هنا
//   const [logs, setLogs] = useState([]);
//   const [stats, setStats] = useState({ total: 0, threats: 0, sources: 0 });

//   const fetchData = async () => {
//     try {
//       // بنبعت نوع الفلتر للـ API كـ Query Parameter
//       // غيري سطر الـ fetch ليكون كدة:
// const response = await fetch(`http://127.0.0.1:8000/logs?type=${filterType}&limit=${limit || 50}`);
//       const rawData = await response.json();
      
//       if (Array.isArray(rawData)) {
//         const processedLogs = rawData.map((item, index) => {
//           const keys = Object.keys(item);
//           const destinationIpKey = keys.find(k => k !== '@timestamp' && k !== 'source_file' && k !== 'label');
          
//           return {
//             id: index,
//             time: new Date(item['@timestamp']).toLocaleTimeString(),
//             ip: item[destinationIpKey] || 'N/A',
//             source: item['source_file']?.split('\\').pop() || 'Unknown',
//             // لو الـ label موجود و بـ 1 يبقى هجوم، غير كدة مراقبة
//             type: item.label === 1 ? 'Attack' : 'Normal', 
//             status: item.label === 1 ? 'danger' : 'success'
//           };
//         });

//         setLogs(processedLogs.reverse());
//         // الإحصائيات دايماً بتيجي من الإجمالي
//         setStats(prev => ({ ...prev, total: rawData.length, sources: new Set(processedLogs.map(l => l.ip)).size }));
//       }
//     } catch (error) {
//       console.error("Error fetching data:", error);
//     }
//   };

//   useEffect(() => {
//     fetchData();
//     const interval = setInterval(fetchData, 1000);
//     return () => clearInterval(interval);
//   }, [filterType]); // لما الفلتر يتغير، الـ useEffect يشتغل فوراً

//   return { logs, stats };
// };

// export default useSecurityData;
// // import { useState, useEffect } from 'react';

// // const useSecurityData = () => {
// //   const [logs, setLogs] = useState([]);
// //   const [stats, setStats] = useState({ total: 0, threats: 0, sources: 0 });

// //   const fetchData = async () => {
// //     try {
// //       const response = await fetch('http://127.0.0.1:8000/logs');
// //       const rawData = await response.json();
      
// //       if (Array.isArray(rawData)) {
// //         const processedLogs = rawData.map((item, index) => {
// //           // استخراج الـ IP الديناميكي من الـ Keys
// //           const keys = Object.keys(item);
// //           const destinationIpKey = keys.find(k => k !== '@timestamp' && k !== 'source_file');
          
// //           return {
// //             id: index,
// //             time: new Date(item['@timestamp']).toLocaleTimeString(),
// //             ip: item[destinationIpKey] || 'N/A',
// //             source: item['source_file']?.split('\\').pop() || 'Unknown',
// //             type: 'Monitoring', // حالياً "مراقبة" لحد ما نربط الـ AI
// //             status: 'success'
// //           };
// //         });

// //         setLogs(processedLogs.reverse());
// //         setStats({
// //           total: processedLogs.length,
// //           threats: 0, // هنسيبها 0 لحد ما موديول الـ AI يدينا نتيجة التحليل
// //           sources: new Set(processedLogs.map(l => l.ip)).size
// //         });
// //       }
// //     } catch (error) {
// //       console.error("Error fetching data:", error);
// //     }
// //   };

// //   useEffect(() => {
// //     fetchData(); 
// //     const interval = setInterval(fetchData, 1000); // عدلتها لثانية واحدة بناءً على طلبك
// //     return () => clearInterval(interval);
// //   }, []);

// //   return { logs, stats };
// // };

// // export default useSecurityData;