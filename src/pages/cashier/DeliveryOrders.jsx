import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  pending: 'badge-yellow',
  confirmed: 'badge-blue',
  ready: 'badge-green',
  delivered: 'badge-green',
  cancelled: 'badge-red',
};

const STATUS_NEXT = {
  pending: 'confirmed',
  confirmed: 'ready',
  ready: 'delivered',
};

const STATUS_LABELS = {
  pending: 'Confirm Order',
  confirmed: 'Mark Ready',
  ready: 'Mark Delivered',
};

export default function DeliveryOrders() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('pending');
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.getOrders({ fulfillment_type: 'delivery', status: filter || undefined })
      .then((r) => {
        setOrders(r.data.results || r.data);
        setLoading(false);
      });
  };

  useEffect(() => { load(); }, [filter]);

  const handleStatusUpdate = async (order, newStatus) => {
    try {
      await api.updateOrderStatus(order.id, newStatus);
      toast.success(`Order #${order.id} marked as ${newStatus}`);
      load();
      if (selected?.id === order.id) setSelected({ ...selected, status: newStatus });
    } catch {
      toast.error('Failed to update status');
    }
  };

  const pendingCount = orders.filter((o) => o.status === 'pending').length;

  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Delivery Orders</h1>
          <p className="text-sm text-gray-500">Customer delivery requests</p>
        </div>
        <button onClick={load} className="btn-secondary text-sm">🔄 Refresh</button>
      </div>

      {/* Pending alert */}
      {pendingCount > 0 && filter !== 'pending' && (
        <div className="bg-yellow-50 border border-yellow-300 rounded-xl px-4 py-3 flex items-center gap-3">
          <span className="text-xl">🔔</span>
          <p className="text-sm font-medium text-yellow-800">
            {pendingCount} new delivery request{pendingCount > 1 ? 's' : ''} waiting for confirmation
          </p>
          <button onClick={() => setFilter('pending')} className="ml-auto text-xs text-yellow-700 underline">View</button>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {[['pending', '🕐 Pending'], ['confirmed', '✅ Confirmed'], ['ready', '📦 Ready'], ['delivered', '🚚 Delivered'], ['', '📋 All']].map(([val, label]) => (
          <button key={val} onClick={() => setFilter(val)}
            className={`px-4 py-2 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
              filter === val ? 'border-green-600 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}>
            {label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Orders list */}
        <div className="lg:col-span-2 space-y-3">
          {loading && <p className="text-center py-12 text-gray-400">Loading...</p>}

          {!loading && orders.length === 0 && (
            <div className="card text-center py-12">
              <p className="text-4xl mb-3">🚚</p>
              <p className="text-gray-500">No {filter} delivery orders</p>
            </div>
          )}

          {orders.map((order) => (
            <div key={order.id}
              onClick={() => setSelected(order)}
              className={`card cursor-pointer transition-all hover:shadow-md border-2 ${
                selected?.id === order.id ? 'border-green-400' : 'border-transparent'
              }`}>
              {/* Order header */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-gray-900">Order #{order.id}</span>
                    <span className={STATUS_COLORS[order.status]}>{order.status}</span>
                    <span className="badge-blue">🚚 Delivery</span>
                  </div>
                  <p className="text-xs text-gray-400">
                    {new Date(order.created_at).toLocaleString('en', {
                      month: 'short', day: 'numeric',
                      hour: '2-digit', minute: '2-digit'
                    })}
                  </p>
                </div>
                <span className="font-bold text-green-700 text-lg">${parseFloat(order.total_amount).toFixed(2)}</span>
              </div>

              {/* Customer info */}
              <div className="bg-gray-50 rounded-xl p-3 mb-3 space-y-1 text-sm">
                <div className="flex items-center gap-2">
                  <span>👤</span>
                  <span className="font-medium">{order.customer_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>📞</span>
                  <span className="text-gray-600">{order.customer_phone}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span>📍</span>
                  <span className="text-gray-600">{order.delivery_address || 'No address provided'}</span>
                </div>
                {order.notes && (
                  <div className="flex items-start gap-2">
                    <span>📝</span>
                    <span className="text-gray-500 italic">{order.notes}</span>
                  </div>
                )}
              </div>

              {/* Items */}
              <div className="flex flex-wrap gap-1 mb-3">
                {order.items?.map((item) => {
                  const isJuice = item.product_name?.toLowerCase().includes('juice') ||
                    item.product_name?.toLowerCase().includes('smoothie');
                  return (
                    <span key={item.id}
                      className={`text-xs rounded-full px-2.5 py-1 font-medium ${
                        isJuice ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'
                      }`}>
                      {isJuice ? '🧃' : '🍎'} {item.product_name} × {item.quantity}
                    </span>
                  );
                })}
              </div>

              {/* Action button */}
              {STATUS_NEXT[order.status] && (
                <div className="flex gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleStatusUpdate(order, STATUS_NEXT[order.status]); }}
                    className="btn-primary flex-1 py-2 text-sm">
                    {STATUS_LABELS[order.status]}
                  </button>
                  {order.status === 'pending' && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleStatusUpdate(order, 'cancelled'); }}
                      className="btn-danger py-2 px-4 text-sm">
                      Cancel
                    </button>
                  )}
                </div>
              )}

              {order.status === 'delivered' && (
                <div className="text-center text-sm text-green-600 font-medium py-1">✓ Delivered</div>
              )}
              {order.status === 'cancelled' && (
                <div className="text-center text-sm text-red-500 font-medium py-1">✗ Cancelled</div>
              )}
            </div>
          ))}
        </div>

        {/* Detail panel */}
        <div className="hidden lg:block">
          {selected ? (
            <div className="card sticky top-6">
              <h2 className="font-bold text-gray-900 mb-4">Order #{selected.id} Detail</h2>
              <div className="space-y-3 text-sm">
                <div className="bg-gray-50 rounded-xl p-3 space-y-2">
                  <p><span className="text-gray-500">Customer:</span> <span className="font-medium">{selected.customer_name}</span></p>
                  <p><span className="text-gray-500">Phone:</span> {selected.customer_phone}</p>
                  {selected.customer_email && <p><span className="text-gray-500">Email:</span> {selected.customer_email}</p>}
                  <p><span className="text-gray-500">Address:</span> {selected.delivery_address || '—'}</p>
                  {selected.notes && <p><span className="text-gray-500">Notes:</span> <span className="italic">{selected.notes}</span></p>}
                </div>

                <div>
                  <p className="font-semibold text-gray-700 mb-2">Items Ordered</p>
                  <div className="space-y-2">
                    {selected.items?.map((item) => (
                      <div key={item.id} className="flex justify-between items-center bg-gray-50 rounded-lg px-3 py-2">
                        <span>{item.product_name} × {item.quantity}</span>
                        <span className="font-medium text-green-700">${parseFloat(item.subtotal).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between font-bold mt-2 pt-2 border-t">
                    <span>Total</span>
                    <span className="text-green-700">${parseFloat(selected.total_amount).toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Status</span>
                  <span className={STATUS_COLORS[selected.status]}>{selected.status}</span>
                </div>

                {STATUS_NEXT[selected.status] && (
                  <button onClick={() => handleStatusUpdate(selected, STATUS_NEXT[selected.status])}
                    className="btn-primary w-full py-2.5">
                    {STATUS_LABELS[selected.status]}
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="card text-center py-12 text-gray-400">
              <p className="text-3xl mb-2">👆</p>
              <p className="text-sm">Click an order to see details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
