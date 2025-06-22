// import React, { useState, useEffect } from 'react';
// import { Navigate } from 'react-router-dom';
// import { useAuth } from '../contexts/AuthContext';
// import { 
//   BarChart, 
//   Bar, 
//   XAxis, 
//   YAxis, 
//   CartesianGrid, 
//   Tooltip, 
//   ResponsiveContainer,
//   PieChart,
//   Pie,
//   Cell,
//   LineChart,
//   Line
// } from 'recharts';

// const AdminStatistics = () => {
//   const { user } = useAuth();
//   const [statistics, setStatistics] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');

  
//   if (!user || user.role !== 'admin') {
//     return <Navigate to="/" replace />;
//   }

//   useEffect(() => {
//     fetchAdminStatistics();
//   }, []);

//   const fetchAdminStatistics = async () => {
//     try {
//       const token = localStorage.getItem('token');
//       const response = await fetch('/api/statistics/admin', {
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         }
//       });

//       if (response.ok) {
//         const data = await response.json();
//         setStatistics(data.data);
//       } else {
//         setError('Erreur lors du chargement des statistiques');
//       }
//     } catch (err) {
//       setError('Erreur de connexion');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

//   const formatCurrency = (amount) => {
//     return new Intl.NumberFormat('fr-FR', {
//       style: 'currency',
//       currency: 'EUR'
//     }).format(amount);
//   };

//   const formatDate = (dateString) => {
//     return new Date(dateString).toLocaleDateString('fr-FR');
//   };

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-64">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
//         {error}
//       </div>
//     );
//   }

//   const requestStatusData = [
//     { name: 'En attente', value: statistics?.requestsStatus?.pending || 0, color: '#FFBB28' },
//     { name: 'Acceptées', value: statistics?.requestsStatus?.accepted || 0, color: '#00C49F' },
//     { name: 'Terminées', value: statistics?.requestsStatus?.completed || 0, color: '#0088FE' },
//     { name: 'Rejetées', value: statistics?.requestsStatus?.rejected || 0, color: '#FF8042' },
//     { name: 'Annulées', value: statistics?.requestsStatus?.cancelled || 0, color: '#8884D8' }
//   ];

//   return (
//     <div className="container mx-auto px-4 py-8">
//       <h1 className="text-3xl font-bold text-gray-800 mb-8">Tableau de Bord Administrateur</h1>
      
    
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//         <div className="bg-white rounded-lg shadow-md p-6">
//           <div className="flex items-center">
//             <div className="flex-shrink-0">
//               <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
//                 <span className="text-white font-semibold">U</span>
//               </div>
//             </div>
//             <div className="ml-4">
//               <p className="text-sm font-medium text-gray-500">Total Utilisateurs</p>
//               <p className="text-2xl font-semibold text-gray-900">
//                 {statistics?.overview?.totalUsers || 0}
//               </p>
//             </div>
//           </div>
//         </div>

//         <div className="bg-white rounded-lg shadow-md p-6">
//           <div className="flex items-center">
//             <div className="flex-shrink-0">
//               <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
//                 <span className="text-white font-semibold">A</span>
//               </div>
//             </div>
//             <div className="ml-4">
//               <p className="text-sm font-medium text-gray-500">Annonces Actives</p>
//               <p className="text-2xl font-semibold text-gray-900">
//                 {statistics?.overview?.activeAnnouncements || 0}
//               </p>
//             </div>
//           </div>
//         </div>

//         <div className="bg-white rounded-lg shadow-md p-6">
//           <div className="flex items-center">
//             <div className="flex-shrink-0">
//               <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
//                 <span className="text-white font-semibold">R</span>
//               </div>
//             </div>
//             <div className="ml-4">
//               <p className="text-sm font-medium text-gray-500">Total Demandes</p>
//               <p className="text-2xl font-semibold text-gray-900">
//                 {statistics?.overview?.totalRequests || 0}
//               </p>
//             </div>
//           </div>
//         </div>

//         <div className="bg-white rounded-lg shadow-md p-6">
//           <div className="flex items-center">
//             <div className="flex-shrink-0">
//               <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
//                 <span className="text-white font-semibold">€</span>
//               </div>
//             </div>
//             <div className="ml-4">
//               <p className="text-sm font-medium text-gray-500">Chiffre d'Affaires</p>
//               <p className="text-2xl font-semibold text-gray-900">
//                 {formatCurrency(statistics?.overview?.totalRevenue || 0)}
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>

     
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      
//         <div className="bg-white rounded-lg shadow-md p-6">
//           <h3 className="text-lg font-semibold text-gray-800 mb-4">
//             Répartition des Demandes par Statut
//           </h3>
//           <ResponsiveContainer width="100%" height={300}>
//             <PieChart>
//               <Pie
//                 data={requestStatusData}
//                 cx="50%"
//                 cy="50%"
//                 labelLine={false}
//                 label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
//                 outerRadius={80}
//                 fill="#8884d8"
//                 dataKey="value"
//               >
//                 {requestStatusData.map((entry, index) => (
//                   <Cell key={`cell-${index}`} fill={entry.color} />
//                 ))}
//               </Pie>
//               <Tooltip />
//             </PieChart>
//           </ResponsiveContainer>
//         </div>

     
//         <div className="bg-white rounded-lg shadow-md p-6">
//           <h3 className="text-lg font-semibold text-gray-800 mb-4">
//             Évolution Mensuelle des Demandes
//           </h3>
//           <ResponsiveContainer width="100%" height={300}>
//             <LineChart data={statistics?.monthlyStats || []}>
//               <CartesianGrid strokeDasharray="3 3" />
//               <XAxis 
//                 dataKey="_id.month" 
//                 tickFormatter={(month) => `${month}/${new Date().getFullYear()}`}
//               />
//               <YAxis />
//               <Tooltip />
//               <Line type="monotone" dataKey="count" stroke="#8884d8" name="Total" />
//               <Line type="monotone" dataKey="completed" stroke="#82ca9d" name="Terminées" />
//             </LineChart>
//           </ResponsiveContainer>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//         <div className="bg-white rounded-lg shadow-md p-6">
//           <h3 className="text-lg font-semibold text-gray-800 mb-4">
//             Top Chauffeurs
//           </h3>
//           <div className="space-y-3">
//             {statistics?.topDrivers?.slice(0, 5).map((driver, index) => (
//               <div key={driver._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
//                 <div className="flex items-center">
//                   <div className="flex-shrink-0">
//                     <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
//                       <span className="text-white font-semibold">{index + 1}</span>
//                     </div>
//                   </div>
//                   <div className="ml-3">
//                     <p className="text-sm font-medium text-gray-900">{driver.name}</p>
//                     <p className="text-sm text-gray-500">{driver.email}</p>
//                   </div>
//                 </div>
//                 <div className="text-right">
//                   <p className="text-sm font-semibold text-gray-900">
//                     {driver.completedDeliveries} livraisons
//                   </p>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>

//         <div className="bg-white rounded-lg shadow-md p-6">
//           <h3 className="text-lg font-semibold text-gray-800 mb-4">
//             Activités Récentes
//           </h3>
//           <div className="space-y-3">
//             {statistics?.recentActivities?.slice(0, 5).map((activity, index) => (
//               <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
//                 <div className="flex items-center">
//                   <div className="flex-shrink-0">
//                     <div className={`w-3 h-3 rounded-full ${
//                       activity.status === 'completed' ? 'bg-green-500' :
//                       activity.status === 'accepted' ? 'bg-blue-500' :
//                       activity.status === 'rejected' ? 'bg-red-500' :
//                       'bg-yellow-500'
//                     }`}></div>
//                   </div>
//                   <div className="ml-3">
//                     <p className="text-sm font-medium text-gray-900">
//                       {activity.user?.firstName} {activity.user?.lastName}
//                     </p>
//                     <p className="text-sm text-gray-500">
//                       Demande {activity.status === 'completed' ? 'terminée' : 
//                                activity.status === 'accepted' ? 'acceptée' :
//                                activity.status === 'rejected' ? 'rejetée' : 'en attente'}
//                     </p>
//                   </div>
//                 </div>
//                 <div className="text-right">
//                   <p className="text-xs text-gray-500">
//                     {formatDate(activity.createdAt)}
//                   </p>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AdminStatistics;