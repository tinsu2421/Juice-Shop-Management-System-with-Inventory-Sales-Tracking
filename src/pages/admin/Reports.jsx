import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';

const COLORS = ['#22c55e', '#f97316', '#3b82f6', '#a855f7', '#ec4899', '#14b8a6'];

export default function Reports() {
  const [daily, setDaily] = useState([]);
  const [monthly, setMonthly] = useState([]);
  const [bestSelling, setBestSelling] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [tab, setTab] = useState('daily');

  useEffect(() => {
    api.getDailySales(30).then((r) => setDaily(r.data.map((d) => ({
      day: new Date(d.day).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
      revenue: parseFloat(d.total), orders: d.count,
    }))));
    api.getMonthlySales(12).then((r) => setMonthly(r.data.map((d) => ({
      month: new Date(d.month).toLocaleDateString('en', { month: 'short', year: '2-digit' }),
      revenue: parseFloat(d.total), orders: d.count,
    }))));
    api.getBestSelling(8).then((r) => setBestSelling(r.data.map((d) => ({
      name: d.product_name, qty: parseFloat(d.total_qty), revenue: parseFloat(d.total_revenue),
    }))));
    api.getLowStock().then((r) => setLowStock(r.data));
  }, []);

  const tabs = [
    { id: 'daily', label: 'Daily Sales' },
    { id: 'monthly', label: 'Monthly Sales' },
    { id: 'products', label: 'Best Sellers' },
    { id: 'stock', label: 'Low Stock' },
  ];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>

      <div className="flex gap-2 border-b border-gray-200">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              tab === t.id ? 'border-green-600 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'daily' && (
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4">Daily Revenue (Last 30 Days)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={daily}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} interval={2} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => [`$${v.toFixed(2)}`, 'Revenue']} />
              <Bar dataKey="revenue" fill="#22c55e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-3 gap-4 text-center">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-2xl font-bold text-green-600">${daily.reduce((s, d) => s + d.revenue, 0).toFixed(2)}</p>
              <p className="text-xs text-gray-500">Total Revenue</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-2xl font-bold text-blue-600">{daily.reduce((s, d) => s + d.orders, 0)}</p>
              <p className="text-xs text-gray-500">Total Orders</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-2xl font-bold text-purple-600">
                ${daily.length ? (daily.reduce((s, d) => s + d.revenue, 0) / daily.length).toFixed(2) : '0.00'}
              </p>
              <p className="text-xs text-gray-500">Avg Daily Revenue</p>
            </div>
          </div>
        </div>
      )}

      {tab === 'monthly' && (
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4">Monthly Revenue (Last 12 Months)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthly}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => [`$${v.toFixed(2)}`, 'Revenue']} />
              <Line type="monotone" dataKey="revenue" stroke="#22c55e" strokeWidth={2} dot={{ fill: '#22c55e' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {tab === 'products' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h2 className="font-semibold text-gray-900 mb-4">Best Selling by Quantity</h2>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={bestSelling} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={100} />
                <Tooltip />
                <Bar dataKey="qty" fill="#f97316" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="card">
            <h2 className="font-semibold text-gray-900 mb-4">Revenue by Product</h2>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={bestSelling} dataKey="revenue" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {bestSelling.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v) => [`$${v.toFixed(2)}`, 'Revenue']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {tab === 'stock' && (
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4">Low Stock Items ({lowStock.length})</h2>
          {lowStock.length === 0
            ? <p className="text-gray-400 text-center py-8">All stock levels are healthy 🎉</p>
            : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    {['Product', 'Current Stock', 'Threshold', 'Status'].map((h) => (
                      <th key={h} className="text-left px-4 py-2 font-medium text-gray-600">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {lowStock.map((p) => (
                    <tr key={p.id}>
                      <td className="px-4 py-3 font-medium">{p.name}</td>
                      <td className="px-4 py-3 text-red-600 font-medium">{p.stock_quantity} {p.unit}</td>
                      <td className="px-4 py-3 text-gray-500">{p.low_stock_threshold} {p.unit}</td>
                      <td className="px-4 py-3"><span className="badge-red">Low Stock</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          }
        </div>
      )}
    </div>
  );
}
