import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Link } from 'react-router-dom';

function StatCard({ label, value, icon, color, sub }) {
  return (
    <div className="card flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${color}`}>{icon}</div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {sub && <p className="text-xs text-gray-400">{sub}</p>}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [dailyData, setDailyData] = useState([]);
  const [bestSelling, setBestSelling] = useState([]);
  const [lowStock, setLowStock] = useState([]);

  useEffect(() => {
    api.getDashboardSummary().then((r) => setSummary(r.data));
    api.getDailySales(14).then((r) => setDailyData(r.data.map((d) => ({
      day: new Date(d.day).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
      revenue: parseFloat(d.total),
      orders: d.count,
    }))));
    api.getBestSelling(5).then((r) => setBestSelling(r.data));
    api.getLowStock().then((r) => setLowStock(r.data));
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <span className="text-sm text-gray-500">{new Date().toLocaleDateString('en', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Today's Revenue" value={`$${parseFloat(summary?.today_revenue || 0).toFixed(2)}`} icon="💰" color="bg-green-100" />
        <StatCard label="Today's Sales" value={summary?.today_orders || 0} icon="🛒" color="bg-blue-100" />
        <StatCard label="Monthly Revenue" value={`$${parseFloat(summary?.month_revenue || 0).toFixed(2)}`} icon="📈" color="bg-purple-100" />
        <StatCard label="Pending Orders" value={summary?.pending_orders || 0} icon="📦" color="bg-orange-100" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales chart */}
        <div className="card lg:col-span-2">
          <h2 className="font-semibold text-gray-900 mb-4">Revenue (Last 14 Days)</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => [`$${v.toFixed(2)}`, 'Revenue']} />
              <Bar dataKey="revenue" fill="#22c55e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Best selling */}
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4">Best Selling</h2>
          <div className="space-y-3">
            {bestSelling.map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-400 w-4">#{i + 1}</span>
                  <span className="text-sm text-gray-700 truncate max-w-[120px]">{item.product_name}</span>
                </div>
                <span className="text-sm font-medium text-green-600">{parseFloat(item.total_qty).toFixed(1)} sold</span>
              </div>
            ))}
            {bestSelling.length === 0 && <p className="text-sm text-gray-400">No sales yet</p>}
          </div>
        </div>
      </div>

      {/* Low stock alerts */}
      {lowStock.length > 0 && (
        <div className="card border-l-4 border-red-400">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-900">⚠️ Low Stock Alerts ({lowStock.length})</h2>
            <Link to="/admin/inventory" className="text-sm text-green-600 hover:underline">Manage</Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {lowStock.map((p) => (
              <div key={p.id} className="bg-red-50 rounded-lg p-3">
                <p className="text-sm font-medium text-gray-800">{p.name}</p>
                <p className="text-xs text-red-600">{p.stock_quantity} {p.unit} left</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Transactions (for Verification) */}
      <RecentTransactions />
    </div>
  );
}

function RecentTransactions() {
  const [sales, setSales] = useState([]);
  const [selectedProof, setSelectedProof] = useState(null);

  const load = () => api.getSales({ page_size: 15 }).then(r => setSales(r.data.results || r.data));
  useEffect(() => { load(); }, []);

  const handleVerify = async (id) => {
    try {
      await api.verifyPayment(id);
      load();
    } catch {
      alert('Failed to verify payment');
    }
  };

  return (
    <div className="card mt-6">
      <h2 className="font-semibold text-gray-900 mb-4">Recent Transactions (Pending Verification)</h2>
      <div className="overflow-auto max-h-80">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th className="px-4 py-2 text-left font-medium text-gray-600">ID</th>
              <th className="px-4 py-2 text-left font-medium text-gray-600">Date/Time</th>
              <th className="px-4 py-2 text-left font-medium text-gray-600">Method</th>
              <th className="px-4 py-2 text-left font-medium text-gray-600">Amount</th>
              <th className="px-4 py-2 text-left font-medium text-gray-600">Verification</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sales.map(s => (
              <tr key={s.id} className="hover:bg-gray-50">
                <td className="px-4 py-2">#{s.id}</td>
                <td className="px-4 py-2">{new Date(s.created_at).toLocaleString()}</td>
                <td className="px-4 py-2 capitalize">{s.payment_method}</td>
                <td className="px-4 py-2 font-bold">${parseFloat(s.total_amount).toFixed(2)}</td>
                <td className="px-4 py-2">
                  {s.payment_method === 'mobile' ? (
                    <div className="flex items-center gap-2">
                       {s.is_verified ? (
                         <span className="badge-green">Verified</span>
                       ) : (
                         <>
                           <button onClick={() => setSelectedProof(s.payment_proof)} className="text-blue-500 hover:underline text-xs">View Proof</button>
                           <button onClick={() => handleVerify(s.id)} className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs font-bold">Verify</button>
                         </>
                       )}
                    </div>
                  ) : (
                     <span className="text-gray-400 text-xs">N/A</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedProof && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedProof(null)}>
          <div className="bg-white rounded-xl max-w-lg w-full p-2 relative overflow-hidden flex flex-col items-center">
             <button onClick={() => setSelectedProof(null)} className="absolute top-2 right-2 bg-gray-200 hover:bg-gray-300 rounded-full w-8 h-8 flex items-center justify-center">✕</button>
             <h3 className="font-bold py-2">Payment Proof</h3>
             {/* If the URL is relative, prepend API host loosely */}
             <img src={(selectedProof.startsWith('http') ? '' : import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8000') + selectedProof} alt="Proof" className="max-w-full max-h-[80vh] object-contain" />
          </div>
        </div>
      )}
    </div>
  );
}
