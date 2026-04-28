import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import useAuthStore from '../../store/authStore';

export default function MySales() {
  const { user } = useAuthStore();
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getSales({ page_size: 200 }).then((r) => {
      setSales(r.data.results || r.data);
      setLoading(false);
    });
  }, []);

  const totalRevenue = sales.reduce((s, sale) => s + parseFloat(sale.total_amount), 0);

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Sales History</h1>
          {user?.branch && <p className="text-sm text-gray-500">📍 {user.branch}</p>}
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-2 text-right">
          <p className="text-xs text-gray-500">Total Revenue</p>
          <p className="text-xl font-bold text-green-700">${totalRevenue.toFixed(2)}</p>
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        {loading ? (
          <p className="text-center py-12 text-gray-400">Loading...</p>
        ) : sales.length === 0 ? (
          <p className="text-center py-12 text-gray-400">No sales recorded yet</p>
        ) : (
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b sticky top-0">
                <tr>
                  {['Sale #', 'Date & Time', 'Items Sold', 'Payment', 'Total'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 font-medium text-gray-600">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">#{sale.id}</td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                      {new Date(sale.created_at).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}{' '}
                      <span className="text-xs">{new Date(sale.created_at).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {sale.items?.map((item) => (
                          <span key={item.id}
                            className={`text-xs rounded px-1.5 py-0.5 ${item.product_name?.toLowerCase().includes('juice') || item.product_name?.toLowerCase().includes('smoothie') ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                            {item.product_name} ×{item.quantity}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 capitalize text-gray-600">{sale.payment_method}</td>
                    <td className="px-4 py-3 font-bold text-green-600">${parseFloat(sale.total_amount).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="px-4 py-3 border-t bg-green-50 flex justify-between">
          <span className="font-semibold text-gray-700">{sales.length} transactions</span>
          <span className="font-bold text-green-700">${totalRevenue.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
