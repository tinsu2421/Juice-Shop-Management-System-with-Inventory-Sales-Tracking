import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import useCartStore from '../../store/cartStore';
import toast from 'react-hot-toast';
import { ShoppingCartIcon } from '@heroicons/react/24/outline';

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const { addItem } = useCartStore();

  useEffect(() => {
    api.getProducts({ search, category__type: type || undefined }).then((r) => setProducts(r.data.results || r.data));
  }, [search, type]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Our Products</h1>

      <div className="flex gap-3 mb-6 flex-wrap">
        <input className="input max-w-xs" placeholder="Search..." value={search}
          onChange={(e) => setSearch(e.target.value)} />
        <div className="flex gap-2">
          {[['', 'All'], ['fruit', '🍎 Fruits'], ['juice', '🧃 Juices']].map(([val, label]) => (
            <button key={val} onClick={() => setType(val)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                type === val ? 'bg-green-600 text-white' : 'bg-white text-gray-600 border hover:bg-gray-50'
              }`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {products.map((p) => (
          <div key={p.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
            <div className="h-32 bg-gradient-to-br from-green-50 to-orange-50 flex items-center justify-center">
              {p.image_url
                ? <img src={p.image_url} alt={p.name} className="h-full w-full object-cover" />
                : <span className="text-5xl">{p.category_type === 'juice' ? '🧃' : '🍎'}</span>
              }
            </div>
            <div className="p-3">
              <p className="font-medium text-sm text-gray-900 truncate">{p.name}</p>
              <p className="text-xs text-gray-500 mb-2">{p.category_name}</p>
              <div className="flex items-center justify-between">
                <span className="font-bold text-green-600">${parseFloat(p.price).toFixed(2)}</span>
                <button onClick={() => { addItem(p); toast.success(`Added!`); }}
                  className="p-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  <ShoppingCartIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {products.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-5xl mb-4">🔍</p>
          <p>No products found</p>
        </div>
      )}
    </div>
  );
}
