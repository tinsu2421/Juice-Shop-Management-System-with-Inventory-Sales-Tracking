import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useCartStore from '../../store/cartStore';
import { api } from '../../api/client';
import toast from 'react-hot-toast';

export default function Checkout() {
  const { items, total: getTotal, clearCart } = useCartStore();
  const total = getTotal();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    customer_name: '', customer_phone: '', customer_email: '',
    fulfillment_type: 'pickup', delivery_address: '', notes: '',
  });

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500 mb-4">Your cart is empty</p>
        <Link to="/shop" className="btn-primary inline-block">Shop Now</Link>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.placeOrder({
        ...form,
        items: items.map((i) => ({ product_id: i.product.id, quantity: i.quantity })),
      });
      clearCart();
      navigate(`/order-confirmation/${data.id}`);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Checkout</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl p-6 shadow-sm space-y-4">
            <h2 className="font-bold text-gray-900">Contact Information</h2>
            <input className="input" placeholder="Full name *" value={form.customer_name}
              onChange={(e) => setForm({ ...form, customer_name: e.target.value })} required />
            <input className="input" placeholder="Phone number *" value={form.customer_phone}
              onChange={(e) => setForm({ ...form, customer_phone: e.target.value })} required />
            <input className="input" type="email" placeholder="Email (optional)" value={form.customer_email}
              onChange={(e) => setForm({ ...form, customer_email: e.target.value })} />
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm space-y-4">
            <h2 className="font-bold text-gray-900">Fulfillment</h2>
            <div className="grid grid-cols-2 gap-3">
              {[['pickup', '🏪 Pickup', 'Pick up at our store'], ['delivery', '🚚 Delivery', 'Delivered to your door']].map(([val, label, desc]) => (
                <label key={val} className={`border-2 rounded-xl p-4 cursor-pointer transition-colors ${
                  form.fulfillment_type === val ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <input type="radio" name="fulfillment" value={val} className="sr-only"
                    checked={form.fulfillment_type === val}
                    onChange={() => setForm({ ...form, fulfillment_type: val })} />
                  <p className="font-medium">{label}</p>
                  <p className="text-xs text-gray-500">{desc}</p>
                </label>
              ))}
            </div>
            {form.fulfillment_type === 'delivery' && (
              <textarea className="input" placeholder="Delivery address *" rows={3}
                value={form.delivery_address}
                onChange={(e) => setForm({ ...form, delivery_address: e.target.value })} required />
            )}
            <textarea className="input" placeholder="Special notes (optional)" rows={2}
              value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>

          <button type="submit" disabled={loading}
            className="btn-primary w-full py-4 text-base disabled:opacity-50">
            {loading ? 'Placing Order...' : `Place Order — $${parseFloat(total).toFixed(2)}`}
          </button>
        </form>

        <div className="bg-white rounded-xl p-6 shadow-sm h-fit">
          <h2 className="font-bold text-gray-900 mb-4">Order Summary</h2>
          <div className="space-y-2 text-sm">
            {items.map((item) => (
              <div key={item.product.id} className="flex justify-between">
                <span className="text-gray-600">{item.product.name} x{item.quantity}</span>
                <span className="font-medium">${(item.product.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="border-t mt-3 pt-3 flex justify-between font-bold">
            <span>Total</span>
            <span className="text-green-600">${parseFloat(total).toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
