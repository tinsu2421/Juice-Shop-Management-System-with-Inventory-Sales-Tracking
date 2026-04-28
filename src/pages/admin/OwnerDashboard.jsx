import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line
} from 'recharts';

function StatCard({ label, value, icon, bg, sub }) {
  return (
    <div className={`rounded-2xl p-5 text-white ${bg} shadow-md`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-3xl">{icon}</span>
        <span className="text-xs opacity-70 uppercase tracking-wide">{label}</span>
      </div>
      <p className="text-3xl font-bold">{value}</p>
      {sub && <p className="text-xs opacity-70 mt-1">{sub}</p>}
    </div>
  );
}

// Group sales by cashier name
function groupByCashier(sales) {
  const map = {};
  sales.forEach((s) => {
    const name = s.cashier_name || 'Unknown';
    if (!map[name]) map[name] = { name, count: 0, revenue: 0, sales: [] };
    map[name].count += 1;
    map[name].revenue += parseFloat(s.total_amount);
    map[name].sales.push(s);
  });
  return Object.values(map).sort((a, b) => b.revenue - a.revenue);
}

export default function OwnerDashboard() {
  const [summary, setSummary] = useState(null);
  const [daily, setDaily] = useState([]);
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [bestSelling, setBestSelling] = useState([]);
  const [tab, setTab] = useState('today');
  const [expandedCashier, setExpandedCashier] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const [sumRes, dailyRes, salesRes, prodRes, bestRes] = await Promise.all([
      api.getDashboardSummary(),
      api.getDailySales(30),
      api.getSales({ page_size: 200 }),
      api.getProducts(),
      api.getBestSelling(8),
    ]);
    setSummary(sumRes.data);
    setDaily(dailyRes.data.map((d) => ({
      day: new Date(d.day).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
      revenue: parseFloat(d.total),
      orders: d.count,
    })));
    setSales(salesRes.data.results || salesRes.data);
    setProducts(prodRes.data.results || prodRes.data);
    setBestSelling(bestRes.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const today = new Date().toDateString();
  const todaySales = sales.filter((s) => new Date(s.created_at).toDateString() === today);
  const todayRevenue = todaySales.reduce((sum, s) => sum + parseFloat(s.total_amount), 0);
  const totalRevenue = sales.reduce((sum, s) => sum + parseFloat(s.total_amount), 0);
  const lowStock = products.filter((p) => p.is_low_stock);

  const cashierGroups = groupByCashier(sales);
  const todayCashierGroups = groupByCashier(todaySales);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full py-32">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-bounce">🍊</div>
          <p className="text-gray-500">Loading your shop data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Owner Overview</h1>
          <p className="text-sm text-gray-500">
            {new Date().toLocaleDateString('en', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <button onClick={load} className="btn-secondary flex items-center gap-2 text-sm">
          🔄 Refresh
        </button>
      </div>

      {/* Key stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Today's Revenue" value={`$${todayRevenue.toFixed(2)}`} icon="💰"
          bg="bg-gradient-to-br from-green-500 to-green-700"
          sub={`${todaySales.length} sales today`} />
        <StatCard label="Monthly Revenue" value={`$${parseFloat(summary?.month_revenue || 0).toFixed(2)}`} icon="📅"
          bg="bg-gradient-to-br from-blue-500 to-blue-700"
          sub={`${summary?.month_orders || 0} orders`} />
        <StatCard label="Total Balance" value={`$${totalRevenue.toFixed(2)}`} icon="🏦"
          bg="bg-gradient-to-br from-purple-500 to-purple-700"
          sub="All recorded sales" />
        <StatCard label="Low Stock" value={lowStock.length} icon="⚠️"
          bg={lowStock.length > 0 ? 'bg-gradient-to-br from-red-500 to-red-700' : 'bg-gradient-to-br from-gray-400 to-gray-600'}
          sub={lowStock.length > 0 ? 'Needs restocking' : 'All good'} />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 overflow-x-auto">
        {[
          ['today', "Today's Sales"],
          ['cashiers', 'By Cashier'],
          ['all', 'All Sales'],
          ['products', 'Stock'],
          ['chart', 'Charts'],
        ].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
              tab === id ? 'border-green-600 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}>
            {label}
          </button>
        ))}
      </div>

      {/* TODAY'S SALES */}
      {tab === 'today' && (
        <div className="space-y-4">
          {/* Summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="card text-center">
              <p className="text-3xl font-bold text-green-600">${todayRevenue.toFixed(2)}</p>
              <p className="text-sm text-gray-500 mt-1">Today's Revenue</p>
            </div>
            <div className="card text-center">
              <p className="text-3xl font-bold text-blue-600">{todaySales.length}</p>
              <p className="text-sm text-gray-500 mt-1">Transactions</p>
            </div>
            <div className="card text-center">
              <p className="text-3xl font-bold text-purple-600">
                ${todaySales.length ? (todayRevenue / todaySales.length).toFixed(2) : '0.00'}
              </p>
              <p className="text-sm text-gray-500 mt-1">Avg Sale</p>
            </div>
          </div>

          {/* Cashier summary cards */}
          {todayCashierGroups.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {todayCashierGroups.map((c) => (
                <div key={c.name} className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">🧾</span>
                    <p className="font-bold text-gray-900">{c.name}</p>
                  </div>
                  <p className="text-xs text-gray-500 mb-2">{c.count} sale{c.count !== 1 ? 's' : ''} today</p>
                  <p className="text-2xl font-bold text-green-700">${c.revenue.toFixed(2)}</p>
                </div>
              ))}
            </div>
          )}

          {/* No sales message */}
          {todaySales.length === 0 && (
            <div className="card text-center py-12">
              <p className="text-4xl mb-3">🛒</p>
              <p className="text-gray-500">No sales recorded today yet</p>
            </div>
          )}

          {/* Each sale as a card with full product breakdown */}
          {todaySales.map((sale) => (
            <div key={sale.id} className="card p-0 overflow-hidden">
              {/* Sale header */}
              <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-bold text-gray-700">Sale #{sale.id}</span>
                  <span className="text-xs text-gray-400">
                    {new Date(sale.created_at).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className="inline-flex items-center gap-1 bg-orange-100 text-orange-800 text-xs font-semibold px-2 py-0.5 rounded-full">
                    🧾 {sale.cashier_name || 'Unknown'}
                  </span>
                  <span className="text-xs text-gray-400 capitalize">{sale.payment_method}</span>
                </div>
                <span className="font-bold text-green-700 text-lg">${parseFloat(sale.total_amount).toFixed(2)}</span>
              </div>

              {/* Products in this sale */}
              <div className="divide-y divide-gray-50">
                {sale.items && sale.items.length > 0 ? sale.items.map((item) => {
                  const isJuice = item.product_name?.toLowerCase().includes('juice') ||
                    item.product_name?.toLowerCase().includes('smoothie');
                  return (
                    <div key={item.id} className="flex items-center justify-between px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{isJuice ? '🧃' : '🍎'}</span>
                        <div>
                          <p className="font-medium text-gray-900">{item.product_name}</p>
                          <p className="text-xs text-gray-500">
                            {parseFloat(item.quantity).toFixed(2)} × ${parseFloat(item.unit_price).toFixed(2)}
                          </p>
                        </div>
                      </div>
                      <span className="font-bold text-gray-800">${parseFloat(item.subtotal).toFixed(2)}</span>
                    </div>
                  );
                }) : (
                  <p className="px-4 py-3 text-sm text-gray-400">No item details</p>
                )}
              </div>

              {parseFloat(sale.discount) > 0 && (
                <div className="px-4 py-2 bg-gray-50 border-t text-sm text-gray-500">
                  Discount: -${parseFloat(sale.discount).toFixed(2)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* BY CASHIER */}
      {tab === 'cashiers' && (
        <div className="space-y-4">
          <p className="text-sm text-gray-500">All-time sales grouped by cashier</p>
          {cashierGroups.length === 0 && (
            <p className="text-center py-12 text-gray-400">No sales recorded yet</p>
          )}
          {cashierGroups.map((c) => (
            <div key={c.name} className="card p-0 overflow-hidden">
              {/* Cashier header — clickable to expand */}
              <button
                onClick={() => setExpandedCashier(expandedCashier === c.name ? null : c.name)}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-xl">🧾</div>
                  <div className="text-left">
                    <p className="font-bold text-gray-900">{c.name}</p>
                    <p className="text-xs text-gray-500">{c.count} total transactions</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-green-700">${c.revenue.toFixed(2)}</p>
                  <p className="text-xs text-gray-400">{expandedCashier === c.name ? '▲ hide' : '▼ show sales'}</p>
                </div>
              </button>

              {/* Expanded sales for this cashier */}
              {expandedCashier === c.name && (
                <div className="border-t border-gray-100">
                  <SalesTable sales={c.sales} showDate={true} compact />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ALL SALES */}
      {tab === 'all' && (
        <div className="card p-0 overflow-hidden">
          <div className="px-4 py-3 border-b bg-gray-50 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">All Sales History</h2>
            <span className="text-sm text-gray-500">{sales.length} transactions</span>
          </div>
          <SalesTable sales={sales} showDate={true} />
          <div className="px-4 py-3 border-t bg-green-50 flex justify-between">
            <span className="font-semibold text-gray-700">Total Revenue</span>
            <span className="text-xl font-bold text-green-700">${totalRevenue.toFixed(2)}</span>
          </div>
        </div>
      )}

      {/* STOCK */}
      {tab === 'products' && (
        <div className="space-y-4">
          {lowStock.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <h3 className="font-semibold text-red-800 mb-2">⚠️ Needs Restocking ({lowStock.length})</h3>
              <div className="flex flex-wrap gap-2">
                {lowStock.map((p) => (
                  <span key={p.id} className="badge-red">
                    {p.name}: {parseFloat(p.stock_quantity).toFixed(1)} {p.unit}
                  </span>
                ))}
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <StockPanel title="🍎 Fruits" items={products.filter((p) => p.category_type === 'fruit')} />
            <StockPanel title="🧃 Juices" items={products.filter((p) => p.category_type === 'juice')} barColor="bg-orange-400" />
          </div>
        </div>
      )}

      {/* CHARTS */}
      {tab === 'chart' && (
        <div className="space-y-6">
          <div className="card">
            <h2 className="font-semibold text-gray-900 mb-4">Daily Revenue — Last 30 Days</h2>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={daily}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} interval={2} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => [`$${v.toFixed(2)}`, 'Revenue']} />
                <Bar dataKey="revenue" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="card">
            <h2 className="font-semibold text-gray-900 mb-4">Best Selling Products</h2>
            <div className="space-y-3">
              {bestSelling.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-sm font-bold text-gray-300 w-5">#{i + 1}</span>
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">{item.product_name}</span>
                      <span className="text-gray-500">
                        {parseFloat(item.total_qty).toFixed(1)} sold ·{' '}
                        <span className="text-green-600 font-medium">${parseFloat(item.total_revenue).toFixed(2)}</span>
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-orange-400 rounded-full"
                        style={{ width: `${(parseFloat(item.total_qty) / parseFloat(bestSelling[0]?.total_qty || 1)) * 100}%` }} />
                    </div>
                  </div>
                </div>
              ))}
              {bestSelling.length === 0 && <p className="text-gray-400 text-sm">No sales data yet</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Reusable sales table
function SalesTable({ sales, showDate, compact }) {
  return (
    <div className={`overflow-auto ${compact ? 'max-h-72' : 'max-h-[500px]'}`}>
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b sticky top-0">
          <tr>
            {['#', showDate && 'Date & Time', 'Cashier', 'Items Sold', 'Payment', 'Total']
              .filter(Boolean).map((h) => (
                <th key={h} className="text-left px-4 py-2 font-medium text-gray-600 whitespace-nowrap">{h}</th>
              ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {sales.map((sale) => (
            <tr key={sale.id} className="hover:bg-gray-50">
              <td className="px-4 py-2.5 font-medium text-gray-700">#{sale.id}</td>
              {showDate && (
                <td className="px-4 py-2.5 text-gray-500 whitespace-nowrap text-xs">
                  {new Date(sale.created_at).toLocaleDateString('en', { month: 'short', day: 'numeric' })}{' '}
                  {new Date(sale.created_at).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}
                </td>
              )}
              {/* Cashier badge */}
              <td className="px-4 py-2.5">
                <span className="inline-flex items-center gap-1 bg-orange-100 text-orange-800 text-xs font-semibold px-2 py-1 rounded-full">
                  🧾 {sale.cashier_name || 'Unknown'}
                </span>
              </td>
              {/* Items — color coded fruit vs juice */}
              <td className="px-4 py-2.5">
                <div className="flex flex-wrap gap-1">
                  {sale.items?.map((item) => {
                    const isJuice = item.product_name?.toLowerCase().includes('juice') ||
                      item.product_name?.toLowerCase().includes('smoothie');
                    return (
                      <span key={item.id}
                        className={`text-xs rounded-full px-2 py-0.5 font-medium ${
                          isJuice ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'
                        }`}>
                        {isJuice ? '🧃' : '🍎'} {item.product_name} × {item.quantity}
                      </span>
                    );
                  })}
                </div>
              </td>
              <td className="px-4 py-2.5 capitalize text-gray-500 text-xs">{sale.payment_method}</td>
              <td className="px-4 py-2.5 font-bold text-green-700 whitespace-nowrap">
                ${parseFloat(sale.total_amount).toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {sales.length === 0 && <p className="text-center py-10 text-gray-400">No sales found</p>}
    </div>
  );
}

function StockPanel({ title, items, barColor = 'bg-green-500' }) {
  return (
    <div className="card">
      <h3 className="font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="space-y-3">
        {items.map((p) => {
          const pct = Math.min(100, (parseFloat(p.stock_quantity) / (parseFloat(p.low_stock_threshold) * 4)) * 100);
          return (
            <div key={p.id}>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium">{p.name}</span>
                <span className={p.is_low_stock ? 'text-red-600 font-bold' : 'text-gray-600'}>
                  {parseFloat(p.stock_quantity).toFixed(1)} {p.unit}{p.is_low_stock ? ' ⚠️' : ''}
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${p.is_low_stock ? 'bg-red-400' : barColor}`}
                  style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
