import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../api/client';

export default function OrderConfirmation() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    api.getOrders().then((r) => {
      const orders = r.data.results || r.data;
      setOrder(orders.find((o) => o.id === parseInt(id)));
    });
  }, [id]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <div className="text-6xl mb-4">✅</div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
      <p className="text-gray-500 mb-8">Thank you for your order. We'll prepare it right away.</p>

      {order && (
        <div className="bg-white rounded-xl p-6 shadow-sm text-left mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-gray-900">Order #{order.id}</h2>
            <span className="badge-yellow capitalize">{order.status}</span>
          </div>
          <div className="space-y-1 text-sm text-gray-600 mb-4">
            <p><span className="font-medium">Name:</span> {order.customer_name}</p>
            <p><span className="font-medium">Phone:</span> {order.customer_phone}</p>
            <p><span className="font-medium">Type:</span> <span className="capitalize">{order.fulfillment_type}</span></p>
            {order.delivery_address && <p><span className="font-medium">Address:</span> {order.delivery_address}</p>}
          </div>
          <div className="border-t pt-3 space-y-1">
            {order.items?.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span>{item.product_name} x{item.quantity}</span>
                <span>${parseFloat(item.subtotal).toFixed(2)}</span>
              </div>
            ))}
            <div className="flex justify-between font-bold pt-2 border-t">
              <span>Total</span>
              <span className="text-green-600">${parseFloat(order.total_amount).toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-4 justify-center">
        <Link to="/shop" className="btn-primary">Continue Shopping</Link>
        <Link to="/" className="btn-secondary">Back to Home</Link>
      </div>
    </div>
  );
}
