import { Link } from 'react-router-dom';
import useCartStore from '../../store/cartStore';
import { PlusIcon, MinusIcon, TrashIcon } from '@heroicons/react/24/outline';

export default function Cart() {
  const { items, updateQuantity, removeItem, total: getTotal } = useCartStore();
  const total = getTotal();

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-6xl mb-4">🛒</p>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-6">Add some fresh fruits or juices to get started</p>
        <Link to="/shop" className="btn-primary inline-block">Browse Products</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Your Cart</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          {items.map((item) => (
            <div key={item.product.id} className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-4">
              <div className="w-16 h-16 bg-green-50 rounded-lg flex items-center justify-center text-3xl flex-shrink-0">
                {item.product.image_url
                  ? <img src={item.product.image_url} alt={item.product.name} className="w-full h-full object-cover rounded-lg" />
                  : (item.product.category_type === 'juice' ? '🧃' : '🍎')
                }
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{item.product.name}</p>
                <p className="text-green-600 font-bold">${parseFloat(item.product.price).toFixed(2)}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200">
                  <MinusIcon className="w-4 h-4" />
                </button>
                <span className="w-8 text-center font-medium">{item.quantity}</span>
                <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200">
                  <PlusIcon className="w-4 h-4" />
                </button>
              </div>
              <p className="font-bold w-16 text-right">${(item.product.price * item.quantity).toFixed(2)}</p>
              <button onClick={() => removeItem(item.product.id)} className="text-red-400 hover:text-red-600">
                <TrashIcon className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm h-fit">
          <h2 className="font-bold text-gray-900 mb-4">Order Summary</h2>
          <div className="space-y-2 text-sm mb-4">
            {items.map((item) => (
              <div key={item.product.id} className="flex justify-between text-gray-600">
                <span>{item.product.name} x{item.quantity}</span>
                <span>${(item.product.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="border-t pt-3 flex justify-between font-bold text-lg">
            <span>Total</span>
            <span className="text-green-600">${parseFloat(total).toFixed(2)}</span>
          </div>
          <Link to="/checkout" className="btn-primary w-full text-center block mt-4 py-3">
            Proceed to Checkout
          </Link>
          <Link to="/shop" className="btn-secondary w-full text-center block mt-2 py-2 text-sm">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
