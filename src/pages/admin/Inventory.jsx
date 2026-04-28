import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import toast from 'react-hot-toast';
import { PlusIcon } from '@heroicons/react/24/outline';

export default function Inventory() {
  const [products, setProducts] = useState([]);
  const [adjustments, setAdjustments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ product: '', adjustment_type: 'add', quantity: '', reason: '' });

  const load = () => {
    api.getProducts().then((r) => setProducts(r.data.results || r.data));
    api.getAdjustments().then((r) => setAdjustments(r.data.results || r.data));
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.createAdjustment(form);
      toast.success('Stock adjusted');
      setShowModal(false);
      setForm({ product: '', adjustment_type: 'add', quantity: '', reason: '' });
      load();
    } catch (err) {
      toast.error('Failed to adjust stock');
    }
  };

  const lowStock = products.filter((p) => p.is_low_stock);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <PlusIcon className="w-4 h-4" /> Adjust Stock
        </button>
      </div>

      {lowStock.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <h2 className="font-semibold text-red-800 mb-2">⚠️ Low Stock Items ({lowStock.length})</h2>
          <div className="flex flex-wrap gap-2">
            {lowStock.map((p) => (
              <span key={p.id} className="badge-red">{p.name}: {parseFloat(p.stock_quantity).toFixed(1)} {p.unit}</span>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stock levels */}
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4">Current Stock Levels</h2>
          <div className="space-y-3">
            {products.map((p) => {
              const pct = Math.min(100, (p.stock_quantity / (p.low_stock_threshold * 4)) * 100);
              return (
                <div key={p.id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">{p.name}</span>
                    <span className={p.is_low_stock ? 'text-red-600 font-medium' : 'text-gray-600'}>
                      {parseFloat(p.stock_quantity).toFixed(1)} {p.unit}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${p.is_low_stock ? 'bg-red-400' : 'bg-green-500'}`}
                      style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent adjustments */}
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4">Recent Adjustments</h2>
          <div className="space-y-2">
            {adjustments.slice(0, 10).map((a) => (
              <div key={a.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div>
                  <p className="text-sm font-medium">{a.product_name}</p>
                  <p className="text-xs text-gray-500">{a.reason || 'Manual adjustment'}</p>
                </div>
                <div className="text-right">
                  <span className={`font-medium text-sm ${a.adjustment_type === 'add' ? 'text-green-600' : 'text-red-600'}`}>
                    {a.adjustment_type === 'add' ? '+' : '-'}{parseFloat(a.quantity).toFixed(1)}
                  </span>
                  <p className="text-xs text-gray-400">{new Date(a.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
            {adjustments.length === 0 && <p className="text-sm text-gray-400">No adjustments yet</p>}
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">Adjust Stock</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <select className="input" value={form.product} onChange={(e) => setForm({ ...form, product: e.target.value })} required>
                <option value="">Select product</option>
                {products.map((p) => <option key={p.id} value={p.id}>{p.name} (current: {parseFloat(p.stock_quantity).toFixed(1)} {p.unit})</option>)}
              </select>
              <select className="input" value={form.adjustment_type} onChange={(e) => setForm({ ...form, adjustment_type: e.target.value })}>
                <option value="add">Add Stock</option>
                <option value="remove">Remove Stock</option>
              </select>
              <input className="input" type="number" step="0.01" placeholder="Quantity" value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })} required />
              <input className="input" placeholder="Reason (optional)" value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })} />
              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn-primary flex-1">Save</button>
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
