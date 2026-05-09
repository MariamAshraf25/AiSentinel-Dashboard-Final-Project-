import React, { useState, useEffect } from 'react';
import { Users, Trash2, ArrowLeft, UserPlus, X, ShieldCheck, Loader2, Lock } from 'lucide-react';

const UserManagement = ({ onBack }) => {
  const [users, setUsers] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState({ username: '', role: 'analyst' });
  const [addLoading, setAddLoading] = useState(false);
  const token = localStorage.getItem('token');

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:8000/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) { console.error("Error fetching users"); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleAddUser = async (e) => {
    e.preventDefault();
    setAddLoading(true);
    try {
      const response = await fetch('http://localhost:8000/users', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newUser)
      });

      if (response.ok) {
        alert(`User ${newUser.username} added successfully! Password: temp123`);
        setShowAddModal(false);
        setNewUser({ username: '', role: 'analyst' });
        fetchUsers();
      } else {
        const err = await response.json();
        alert(err.detail || "Failed to add user");
      }
    } catch (error) { alert("API Connection Error"); }
    setAddLoading(false);
  };

  const handleDelete = async (username) => {
  if (!window.confirm(`Delete ${username}?`)) return;

  try {
    const response = await fetch(`http://127.0.0.1:8000/users/${username}`, {
      method: 'DELETE', 
      headers: { 
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      fetchUsers(); 
    } else {
      const err = await response.json();
      alert(err.detail || "Failed to delete user");
    }
  } catch (error) {
    alert("Connection Error");
  }
};
  // const handleDelete = async (username) => {
  //   if (!window.confirm(`Delete ${username}?`)) return;
  //   try {
  //     await fetch(`http://127.0.0.1:8000/users/${username}`, {
  //       method: 'DELETE',
  //       headers: { 'Authorization': `Bearer ${token}` }
  //     });
  //     fetchUsers();
  //   } catch (error) { alert("Delete failed"); }
  // };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white p-8 relative transition-colors duration-300 font-sans">
      <div className="max-w-6xl mx-auto pb-20">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition"><ArrowLeft size={24} /></button>
            <h1 className="text-3xl font-bold flex items-center gap-3 font-mono text-purple-500 uppercase tracking-tighter">
              <Users size={32} /> USER MANAGEMENT
            </h1>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-purple-500/30"
          >
            <UserPlus size={18} /> Add New User
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-xl">
          <table className="w-full text-left text-gray-900 dark:text-white">
            <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-400 text-xs uppercase font-mono tracking-widest border-b border-gray-100 dark:border-gray-700">
              <tr>
                <th className="px-6 py-4">Username</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {users.map((user) => (
                <tr key={user.username} className="hover:bg-purple-500/5 transition duration-150 group">
                  <td className="px-6 py-4 font-bold group-hover:text-purple-500 transition-colors">{user.username}</td>
                  <td className="px-6 py-4 uppercase font-mono text-gray-400 text-sm">{user.role}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded text-[10px] font-black tracking-widest border ${user.must_change ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' : 'bg-green-500/10 text-green-500 border-green-500/20'}`}>
                      {user.must_change ? 'PENDING UPDATE' : 'ACTIVE'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button onClick={() => handleDelete(user.username)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition"><Trash2 size={18} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[1000] p-4">
          <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-3xl shadow-2xl p-8 border border-gray-100 dark:border-gray-700 animate-in zoom-in duration-200 text-gray-900 dark:text-white">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black flex items-center gap-2 text-purple-600"><UserPlus size={22}/> New Account</h2>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-red-500"><X size={24}/></button>
            </div>
            
            <form onSubmit={handleAddUser} className="space-y-5">
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 text-gray-400" size={18}/>
                <input 
                  type="text" placeholder="Username" required
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-purple-500 dark:text-white"
                  onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                />
              </div>

              <select 
                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-3 outline-none focus:ring-2 focus:ring-purple-500 dark:text-white"
                onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                value={newUser.role}
              >
                <option value="analyst">Analyst</option>
                <option value="super_admin">Super Admin</option>
              </select>

              <button 
                type="submit" disabled={addLoading}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3.5 rounded-xl shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                {addLoading ? <Loader2 className="animate-spin" size={20}/> : <ShieldCheck size={20}/>}
                {addLoading ? "Processing..." : "Create Account"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
// import React, { useState, useEffect } from 'react';
// import { Users, Trash2, ShieldAlert, ArrowLeft, UserPlus, X, ShieldCheck, Loader2 } from 'lucide-react';

// const UserManagement = ({ onBack }) => {
//   const [users, setUsers] = useState([]);
//   const [showAddModal, setShowAddModal] = useState(false);
//   const [newUser, setNewUser] = useState({ username: '', role: 'analyst' });
//   const [addLoading, setAddLoading] = useState(false);
//   const token = localStorage.getItem('token');

//   const fetchUsers = async () => {
//     try {
//       const response = await fetch('http://127.0.0.1:8000/users', {
//         headers: { 'Authorization': `Bearer ${token}` }
//       });
//       const data = await response.json();
//       setUsers(data);
//     } catch (error) { console.error("Error fetching users"); }
//   };

//   useEffect(() => { fetchUsers(); }, []);

//   const handleAddUser = async (e) => {
//     e.preventDefault();
//     setAddLoading(true);
//     try {
//       const response = await fetch('http://127.0.0.1:8000/users', {
//         method: 'POST',
//         headers: { 
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${token}`
//         },
//         body: JSON.stringify(newUser)
//       });

//       if (response.ok) {
//         alert(`User ${newUser.username} added successfully with temporary password: temp123`);
//         setShowAddModal(false);
//         setNewUser({ username: '', role: 'analyst' });
//         fetchUsers(); // Refresh the list
//       } else {
//         const errorData = await response.json();
//         alert(`Failed to add user: ${errorData.detail}`);
//       }
//     } catch (error) {
//       alert("API Connection Error");
//     }
//     setAddLoading(false);
//   };

//   const handleDelete = async (username) => {
//     if (!window.confirm(`Are you sure you want to delete ${username}?`)) return;
//     try {
//       await fetch(`http://127.0.0.1:8000/users/${username}`, {
//         method: 'DELETE',
//         headers: { 'Authorization': `Bearer ${token}` }
//       });
//       fetchUsers();
//     } catch (error) { alert("Delete failed"); }
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8 text-gray-900 dark:text-white transition-colors duration-300 font-sans">
//       <div className="max-w-6xl mx-auto">
//         {/* Header - Styled like Archive */}
//         <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
//           <div className="flex items-center gap-4">
//             <button onClick={onBack} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition"><ArrowLeft size={24} /></button>
//             <h1 className="text-3xl font-bold flex items-center gap-3 font-mono text-purple-500 uppercase tracking-tighter">
//               <Users size={32} /> USER MANAGEMENT
//             </h1>
//           </div>
//           <button 
//             onClick={() => setShowAddModal(true)}
//             className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-purple-500/30"
//           >
//             <UserPlus size={18} /> Add New User
//           </button>
//         </div>

//         {/* Table - Styled exactly like Archive */}
//         <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-2xl">
//           <table className="w-full text-left">
//             <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-400 text-xs uppercase font-mono tracking-widest">
//               <tr>
//                 <th className="px-6 py-4">Username</th>
//                 <th className="px-6 py-4">Role</th>
//                 <th className="px-6 py-4">Password Status</th>
//                 <th className="px-6 py-4 text-center">Actions</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-100 dark:divide-gray-700 text-gray-900 dark:text-white">
//               {users.map((user) => (
//                 <tr key={user.username} className="hover:bg-purple-500/5 cursor-pointer transition duration-150 group">
//                   <td className="px-6 py-4 font-bold group-hover:text-purple-500 transition-colors">{user.username}</td>
//                   <td className="px-6 py-4 uppercase font-mono text-gray-400 text-sm">{user.role}</td>
//                   <td className="px-6 py-4">
//                     <span className={`px-3 py-1 rounded text-[10px] font-black ${user.must_change ? 'bg-orange-500/20 text-orange-500' : 'bg-green-500/20 text-green-500'}`}>
//                       {user.must_change ? 'PENDING UPDATE' : 'ACTIVE'}
//                     </span>
//                   </td>
//                   <td className="px-6 py-4 text-center">
//                     <button 
//                       onClick={() => handleDelete(user.username)}
//                       className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition"
//                     >
//                       <Trash2 size={18} />
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {/* Add User Modal */}
//       {showAddModal && (
//         <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[10000] p-4">
//           <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-3xl shadow-2xl p-8 border border-gray-100 dark:border-gray-700 animate-in zoom-in duration-200">
//             <div className="flex justify-between items-center mb-6 border-b border-gray-100 dark:border-gray-700 pb-4">
//               <h2 className="text-xl font-black flex items-center gap-2"><UserPlus className="text-purple-500"/> Create New Account</h2>
//               <button onClick={() => setShowAddModal(false)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-full transition"><X size={20}/></button>
//             </div>
            
//             <form onSubmit={handleAddUser} className="space-y-5">
//               <div className="relative">
//                  <Lock className="absolute left-3.5 top-3.5 text-gray-400" size={18}/>
//                  <input 
//                     type="text" placeholder="Username (e.g. jdoe_sentinel)" required
//                     className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-3.5 pl-11 outline-none focus:ring-2 focus:ring-purple-500 transition dark:text-white"
//                     onChange={(e) => setNewUser({...newUser, username: e.target.value})}
//                   />
//               </div>

//               <div className="space-y-1.5">
//                   <label className="text-xs text-gray-400 font-bold tracking-widest uppercase">Assign Role</label>
//                   <select 
//                     className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-3.5 outline-none focus:ring-2 focus:ring-purple-500 transition dark:text-white font-black"
//                     onChange={(e) => setNewUser({...newUser, role: e.target.value})}
//                     value={newUser.role}
//                   >
//                     <option value="analyst">Analyst</option>
//                     <option value="super_admin">Super Admin</option>
//                   </select>
//               </div>

//               <div className="p-4 bg-purple-500/10 rounded-xl text-center border border-purple-500/20">
//                   <p className="text-xs font-bold text-purple-600 dark:text-purple-400">Default password will be set to: <span className="font-mono bg-purple-200 dark:bg-purple-900 px-1.5 py-0.5 rounded text-sm">temp123</span></p>
//                   <p className="text-[10px] text-gray-500 mt-1">User will be prompted to change it upon first login.</p>
//               </div>
              
//               <button 
//                 type="submit" 
//                 disabled={addLoading}
//                 className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-purple-500/30 flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
//               >
//                  {addLoading ? <Loader2 className="animate-spin" size={20}/> : <ShieldCheck size={18}/>}
//                  {addLoading ? "Creating User..." : "Create Account"}
//               </button>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default UserManagement;


// import React, { useState, useEffect } from 'react';
// import { Users, Trash2, ShieldAlert, ArrowLeft, UserPlus, X, ShieldCheck } from 'lucide-react';

// const UserManagement = ({ onBack }) => {
//   const [users, setUsers] = useState([]);
//   const [showAddModal, setShowAddModal] = useState(false);
//   const [newUser, setNewUser] = useState({ username: '', role: 'analyst' });
//   const token = localStorage.getItem('token');

//   const fetchUsers = async () => {
//     try {
//       const response = await fetch('http://127.0.0.1:8000/users', {
//         headers: { 'Authorization': `Bearer ${token}` }
//       });
//       const data = await response.json();
//       setUsers(data);
//     } catch (error) { console.error(error); }
//   };

//   useEffect(() => { fetchUsers(); }, []);

//   const handleAddUser = async (e) => {
//     e.preventDefault();
//     // هنا المفروض نبعت للباك إند (محتاجة إضافة Route في FastAPI)
//     alert(`User ${newUser.username} added with temp password: temp123`);
//     setShowAddModal(false);
//   };

//   const handleDelete = async (username) => {
//     if (!window.confirm(`Delete ${username}?`)) return;
//     await fetch(`http://127.0.0.1:8000/users/${username}`, {
//       method: 'DELETE',
//       headers: { 'Authorization': `Bearer ${token}` }
//     });
//     fetchUsers();
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8 text-gray-900 dark:text-white transition-colors">
//       <div className="max-w-6xl mx-auto">
//         {/* Header - Styled like Archive */}
//         <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
//           <div className="flex items-center gap-4">
//             <button onClick={onBack} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition"><ArrowLeft size={24} /></button>
//             <h1 className="text-3xl font-bold flex items-center gap-3 font-mono text-purple-500 uppercase tracking-tighter">
//               <Users size={32} /> USER MANAGEMENT
//             </h1>
//           </div>
//           <button 
//             onClick={() => setShowAddModal(true)}
//             className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-xl font-bold transition-all shadow-lg shadow-purple-500/30"
//           >
//             <UserPlus size={18} /> Add New User
//           </button>
//         </div>

//         {/* Table */}
//         <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-2xl">
//           <table className="w-full text-left">
//             <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-400 text-xs uppercase font-mono tracking-widest">
//               <tr>
//                 <th className="px-6 py-4">User</th>
//                 <th className="px-6 py-4">Role</th>
//                 <th className="px-6 py-4">Status</th>
//                 <th className="px-6 py-4 text-center">Actions</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
//               {users.map((user) => (
//                 <tr key={user.username} className="hover:bg-purple-500/5 transition duration-150 group">
//                   <td className="px-6 py-4 font-bold group-hover:text-purple-500 transition-colors">{user.username}</td>
//                   <td className="px-6 py-4 text-sm uppercase font-mono text-gray-400">{user.role}</td>
//                   <td className="px-6 py-4">
//                     <span className={`px-3 py-1 rounded text-[10px] font-black ${user.must_change ? 'bg-orange-500/20 text-orange-500' : 'bg-green-500/20 text-green-500'}`}>
//                       {user.must_change ? 'PENDING UPDATE' : 'ACTIVE'}
//                     </span>
//                   </td>
//                   <td className="px-6 py-4 text-center">
//                     <button onClick={() => handleDelete(user.username)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition"><Trash2 size={18} /></button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {/* Add User Modal */}
//       {showAddModal && (
//         <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[10000] p-4">
//           <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-3xl shadow-2xl p-8 border border-gray-200 dark:border-gray-700 animate-in zoom-in duration-200">
//             <div className="flex justify-between items-center mb-6">
//               <h2 className="text-xl font-black flex items-center gap-2"><UserPlus className="text-purple-500"/> New Account</h2>
//               <button onClick={() => setShowAddModal(false)}><X /></button>
//             </div>
//             <form onSubmit={handleAddUser} className="space-y-4">
//               <input 
//                 type="text" placeholder="Username" required
//                 className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-3 outline-none focus:ring-2 focus:ring-purple-500"
//                 onChange={(e) => setNewUser({...newUser, username: e.target.value})}
//               />
//               <select 
//                 className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-3 outline-none"
//                 onChange={(e) => setNewUser({...newUser, role: e.target.value})}
//               >
//                 <option value="analyst">Analyst</option>
//                 <option value="super_admin">Super Admin</option>
//               </select>
//               <button className="w-full bg-purple-600 text-white font-bold py-3 rounded-xl shadow-lg">Create Account</button>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default UserManagement;
// import React, { useState, useEffect } from 'react';
// import { Users, Trash2, ShieldAlert, ArrowLeft } from 'lucide-react';

// const UserManagement = ({ onBack }) => {
//   const [users, setUsers] = useState([]);
//   const token = localStorage.getItem('token');

//   const fetchUsers = async () => {
//     try {
//       const response = await fetch('http://127.0.0.1:8000/users', {
//         headers: { 'Authorization': `Bearer ${token}` }
//       });
//       const data = await response.json();
//       setUsers(data);
//     } catch (error) { console.error("Error fetching users"); }
//   };

//   useEffect(() => { fetchUsers(); }, []);

//   const handleDelete = async (username) => {
//     if (!window.confirm(`Are you sure you want to delete ${username}?`)) return;
//     try {
//       await fetch(`http://127.0.0.1:8000/users/${username}`, {
//         method: 'DELETE',
//         headers: { 'Authorization': `Bearer ${token}` }
//       });
//       fetchUsers(); // تحديث الجدول
//     } catch (error) { alert("Delete failed"); }
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8 text-gray-900 dark:text-white transition-colors">
//       <div className="max-w-4xl mx-auto">
//         <div className="flex items-center justify-between mb-8">
//           <div className="flex items-center gap-4">
//             <button onClick={onBack} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full"><ArrowLeft /></button>
//             <h1 className="text-3xl font-black flex items-center gap-3"><Users className="text-blue-500" /> USER MANAGEMENT</h1>
//           </div>
//         </div>

//         <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">
//           <table className="w-full text-left">
//             <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 text-xs uppercase font-bold">
//               <tr>
//                 <th className="px-6 py-4">Username</th>
//                 <th className="px-6 py-4">Role</th>
//                 <th className="px-6 py-4">Password Status</th>
//                 <th className="px-6 py-4 text-center">Actions</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
//               {users.map((user) => (
//                 <tr key={user.username} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
//                   <td className="px-6 py-4 font-bold">{user.username}</td>
//                   <td className="px-6 py-4">
//                     <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${user.role === 'super_admin' ? 'bg-purple-500/10 text-purple-500' : 'bg-blue-500/10 text-blue-500'}`}>
//                       {user.role.toUpperCase()}
//                     </span>
//                   </td>
//                   <td className="px-6 py-4 text-xs">
//                     {user.must_change ? 
//                       <span className="text-orange-500 flex items-center gap-1"><ShieldAlert size={14}/> Must Change</span> : 
//                       <span className="text-green-500">Verified</span>}
//                   </td>
//                   <td className="px-6 py-4 text-center">
//                     <button 
//                       onClick={() => handleDelete(user.username)}
//                       className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition"
//                     >
//                       <Trash2 size={18} />
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default UserManagement;