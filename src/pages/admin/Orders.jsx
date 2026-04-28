import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  pending: 'badge-yellow', confirmed: 'badge-blue',
  ready: 'badge-green', delivered: 'badge-green', cancelled: 'badge-red',
};

const STATUS_FLOW = ['pending', 'confirmed', 'ready', 'delivered'];

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('');
  const [selected, setSelected] = useState(null);

  const load = () => api.getOrders({ status: filter || undefined }).then((r) => setOrders(r.data.results || r.data));
  useEffect(() => { load(); }, [filter]);

  const updateStatus = async (id, status) => {
    try {
      await api.updateOrderStatus(id, status);
      toast.success('Status updated');
      load();
      if (selected?.id === id) setSelected({ ...selected, status });
    } catch { toast.error('Failed to update'); }
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Customer Orders</h1>
        <select className="input w-40" value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">All Status</option>
          {['pending', 'confirmed', 'ready', 'delivered', 'cancelled'].map((s) => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                {['#', 'Customer', 'Type', 'Total', 'Status', 'Date', 'Action'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 font-medium text-gray-600">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setSelected(o)}>
                  <td className="px-4 py-3 font-medium">#{o.id}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{o.customer_name}</p>
                    <p className="text-xs text-gray-500">{o.customer_phone}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={o.fulfillment_type === 'delivery' ? 'badge-blue' : 'badge-green'}>
                      {o.fulfillment_type}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium">${parseFloat(o.total_amount).toFixed(2)}</td>
                  <td className="px-4 py-3"><span className={STATUS_COLORS[o.status]}>{o.status}</span></td>
                  <td className="px-4 py-3 text-gray-500">{new Date(o.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    {o.status !== 'delivered' && o.status !== 'cancelled' && (
                      <select className="text-xs border rounded px-1 py-0.5" value={o.status}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => updateStatus(o.id, e.target.value)}>
                        {STATUS_FLOW.map((s) => <option key={s} value={s}>{s}</option>)}
                        <option value="cancelled">cancelled</option>
                      </select>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {orders.length === 0 && <p className="text-center py-8 text-gray-400">No orders found</p>}
        </div>

        {selected && (
          <div className="card">
            <h2 className="font-bold text-gray-900 mb-3">Order #{selected.id}</h2>
            <div className="space-y-2 text-sm">
              <div><span className="text-gray-500">Customer:</span> <span className="font-medium">{selected.customer_name}</span></div>
              <div><span className="text-gray-500">Phone:</span> {selected.customer_phone}</div>
              {selected.customer_email && <div><span className="text-gray-500">Email:</span> {selected.customer_email}</div>}
              <div><span className="text-gray-500">Type:</span> <span className="capitalize">{selected.fulfillment_type}</span></div>
              {selected.delivery_address && <div><span className="text-gray-500">Address:</span> {selected.delivery_address}</div>}
              {selected.notes && <div><span className="text-gray-500">Notes:</span> {selected.notes}</div>}
            </div>
            <div className="mt-4 border-t pt-3">
              <p className="font-semibold text-sm mb-2">Items</p>
              {selected.items?.map((item) => (
                <div key={item.id} className="flex justify-between text-sm py-1">
                  <span>{item.product_name} x{item.quantity}</span>
                  <span>${parseFloat(item.subtotal).toFixed(2)}</span>
                </div>
              ))}
              <div className="border-t mt-2 pt-2 flex justify-between font-bold">
                <span>Total</span><span>${parseFloat(selected.total_amount).toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
