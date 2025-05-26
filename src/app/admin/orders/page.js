'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, AuthProvider } from '../../context/AuthContext';
import { adminService } from '../../services/admin-api';

export default function OrdersPage() {
  return (
    <AuthProvider>
      <OrdersContent />
    </AuthProvider>
  );
}

function OrdersContent() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    // Redirect if not logged in
    if (!authLoading && !user) {
      router.push('/admin');
    }
  }, [user, authLoading, router]);

  // Fetch orders from API
  useEffect(() => {
    if (authLoading || !user) return;

    const fetchOrders = async () => {
      setLoading(true);
      try {
        const ordersData = await adminService.getOrders();
        
        // Fetch customer names for orders where profile data is missing
        const ordersWithCustomerNames = await Promise.all(ordersData.map(async (order) => {
          if (order.customer_id && (!order.profiles || (!order.profiles.full_name && !order.profiles.email))) {
            try {
              const customerProfile = await adminService.getUserById(order.customer_id);
              return { ...order, profiles: customerProfile?.user_metadata };
            } catch (profileErr) {
              console.error(`Error fetching profile for customer ${order.customer_id}:`, profileErr);
              return order; // Return original order if profile fetch fails
            }
          } else {
            return order; // Return original order if profile data is already present or no customer_id
          }
        }));
        
        setOrders(ordersWithCustomerNames);
        setError(null);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError(err.message || 'An unexpected error occurred while fetching orders.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();

    // Set up interval for auto-refresh every 30 seconds
    const intervalId = setInterval(fetchOrders, 30000);
    
    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, [user, authLoading]);

  // Filter orders based on status
  const filteredOrders = filter === 'all' 
    ? orders 
    : orders.filter(order => order.status === filter);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="relative">
          <div className="w-20 h-20 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full animate-spin opacity-20 blur-xl"></div>
          <div className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-t-transparent border-l-transparent border-r-transparent border-b-indigo-500 rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 min-h-screen transition-all duration-300">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10">
        <div className="animate-fadeIn">
          <h1 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 dark:from-amber-400 dark:via-orange-400 dark:to-red-300">
            Customer Orders
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-300 font-medium tracking-wide">
            Manage and view all customer orders
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center space-x-4">
          <div className="backdrop-blur-sm bg-white/30 dark:bg-black/20 p-2 px-4 rounded-full shadow-sm">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-transparent border-none text-gray-700 dark:text-gray-200 font-medium focus:outline-none focus:ring-0"
            >
              <option value="all">All Orders</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <button 
            onClick={() => router.push('/admin/dashboard')}
            className="inline-flex items-center px-5 py-2.5 text-sm font-medium rounded-full text-white bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Back to Dashboard
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-8 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/20 p-5 rounded-2xl shadow-xl backdrop-blur-sm animate-fadeIn border border-red-200 dark:border-red-800/50">
          <div className="flex">
            <div className="flex-shrink-0 bg-red-500 p-2 rounded-full">
              <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-4 my-auto">
              <p className="text-base font-medium text-red-700 dark:text-red-200">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-gray-100/50 dark:border-gray-700/50 transition-all duration-300 hover:shadow-2xl">
        <div className="px-6 py-5 border-b border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-gray-50/80 to-white/80 dark:from-gray-800/80 dark:to-gray-800/80">
          <h3 className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 dark:from-amber-400 dark:via-orange-400 dark:to-red-300">
            Orders
          </h3>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center">
              <div className="w-16 h-16 border-4 border-t-transparent border-l-transparent border-r-transparent border-b-indigo-500 rounded-full animate-spin"></div>
            </div>
          ) : filteredOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Order ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Items</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Order Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className={order.status === 'pending' ? 'bg-amber-50 dark:bg-amber-900/20' : ''}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{order.id.substring(0, 8)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {order.profiles?.full_name || order.profiles?.email || 'Anonymous'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                        <div className="max-h-32 overflow-y-auto">
                          {Array.isArray(order.items) && order.items.map((item, index) => (
                            <div key={index} className="mb-1">
                              {item.quantity}x {item.name}
                              {item.customizations && Object.keys(item.customizations).length > 0 && (
                                <div className="pl-4 text-xs text-gray-500 dark:text-gray-400">
                                  {Object.entries(item.customizations).map(([key, value]) => (
                                    <div key={key}>
                                      <span className="font-medium">{key}:</span> {Array.isArray(value) ? value.join(', ') : value}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        ${Number(order.total_amount).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' : 
                            order.status === 'processing' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                            order.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 
                            'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {new Date(order.created_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        <div className="flex items-center space-x-2">
                          <select 
                            value={order.status}
                            onChange={async (e) => {
                              try {
                                await adminService.updateOrderStatus(order.id, e.target.value);
                                
                                // Update local state to avoid refetching
                                setOrders(prevOrders => 
                                  prevOrders.map(o => 
                                    o.id === order.id 
                                      ? { ...o, status: e.target.value, updated_at: new Date().toISOString() } 
                                      : o
                                  )
                                );
                              } catch (err) {
                                console.error('Error updating order status:', err);
                                alert('Failed to update order status');
                              }
                            }}
                            className="border border-gray-300 dark:border-gray-600 rounded-md text-sm dark:bg-gray-700 dark:text-white"
                          >
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                          
                          <button
                            onClick={() => {
                              // Show order details modal or navigate to details page
                              alert('Order details: ' + JSON.stringify(order, null, 2));
                            }}
                            className="inline-flex items-center p-1.5 border border-transparent rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">No orders found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
