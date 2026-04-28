import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import useAuthStore from '../../store/authStore';

export default function CashierDashboard() {
  const { user } = useAuthStore();
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [pendingDeliveries, setPendingDeliveries] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getSales({ page_size: 100 }),
      api.getProducts(),
      api.getOrders({ fulfillment_type: 'delivery', status: 'pending' }),
    ]).then(([salesRes, prodRes, ordersRes]) => {
      setSales(salesRes.data.results || salesRes.data);
      setProducts(prodRes.data.results || prodRes.data);
      setPendingDeliveries((ordersRes.data.results || ordersRes.data).length);
      setLoading(false);
    });
  }, []);

  const today = new Date().toDateString();
  const todaySales = sales.filter((s) => new Date(s.created_at).toDateString() === today);
  const todayRevenue = todaySales.reduce((sum, s) => sum + parseFloat(s.total_amount), 0);
  const lowStock = products.filter((p) => p.is_low_stock);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full py-32">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-bounce">🍊</div>
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Greeting */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-6 text-white">
        <p className="text-orange-100 text-sm">Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'},</p>
        <h1 className="text-2xl font-bold">{user?.username || 'Cashier'} 👋</h1>
        <p className="text-orange-100 text-sm mt-1">
          {new Date().toLocaleDateString('en', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
        {user?.branch && (
          <div className="mt-3 inline-flex items-center gap-1.5 bg-white/20 rounded-full px-3 py-1 text-sm font-medium">
            📍 {user.branch}
          </div>
        )}
      </div>

      {/* Today's stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card text-center">
          <p className="text-3xl font-bold text-green-600">${todayRevenue.toFixed(2)}</p>
          <p className="text-sm text-gray-500 mt-1">Today's Revenue</p>
        </div>
        <div className="card text-center">
          <p className="text-3xl font-bold text-blue-600">{todaySales.length}</p>
          <p className="text-sm text-gray-500 mt-1">Sales Today</p>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Link to="/cashier/pos"
          className="block bg-green-600 hover:bg-green-700 text-white rounded-2xl p-5 text-center transition-colors shadow-md">
          <div className="text-4xl mb-2">🛒</div>
          <p className="text-xl font-bold">New Sale</p>
          <p className="text-green-100 text-sm mt-1">Open the POS</p>
        </Link>

        <Link to="/cashier/deliveries"
          className={`block rounded-2xl p-5 text-center transition-colors shadow-md text-white ${
            pendingDeliveries > 0 ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'
          }`}>
          <div className="text-4xl mb-2">🚚</div>
          <p className="text-xl font-bold">Deliveries</p>
          <p className="text-sm mt-1 opacity-80">
            {pendingDeliveries > 0 ? `${pendingDeliveries} pending request${pendingDeliveries > 1 ? 's' : ''}` : 'No pending requests'}
          </p>
        </Link>
      </div>

      {/* Low stock warning */}
      {lowStock.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <h3 className="font-semibold text-red-800 mb-2">⚠️ Low Stock — Notify Manager</h3>
          <div className="flex flex-wrap gap-2">
            {lowStock.map((p) => (
              <span key={p.id} className="badge-red">
                {p.name}: {parseFloat(p.stock_quantity).toFixed(1)} {p.unit}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Today's sales list */}
      <div className="card p-0 overflow-hidden">
        <div className="px-4 py-3 border-b bg-gray-50 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Today's Sales</h2>
          <Link to="/cashier/my-sales" className="text-sm text-orange-600 hover:underline">View all →</Link>
        </div>
        {todaySales.length === 0 ? (
          <p className="text-center py-8 text-gray-400">No sales yet today</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                {['#', 'Time', 'Items', 'Total'].map((h) => (
                  <th key={h} className="text-left px-4 py-2 font-medium text-gray-600">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {todaySales.map((sale) => (
                <tr key={sale.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 font-medium">#{sale.id}</td>
                  <td className="px-4 py-2 text-gray-500">
                    {new Date(sale.created_at).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex flex-wrap gap-1">
                      {sale.items?.map((item) => (
                        <span key={item.id} className="text-xs bg-gray-100 rounded px-1.5 py-0.5">
                          {item.product_name} ×{item.quantity}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-2 font-bold text-green-600">${parseFloat(sale.total_amount).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
