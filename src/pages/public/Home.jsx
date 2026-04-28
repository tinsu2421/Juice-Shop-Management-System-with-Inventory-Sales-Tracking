import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import useCartStore from '../../store/cartStore';
import toast from 'react-hot-toast';

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const { addItem } = useCartStore();

  useEffect(() => {
    api.getProducts().then((r) => setFeatured((r.data.results || r.data).slice(0, 6)));
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-green-600 to-green-700 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">Aberus Juice & Fruit 🍊</h1>
          <p className="text-xl text-green-100 mb-8">Fresh fruits and handcrafted juices — delivered to your door</p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/shop" className="bg-white text-green-700 font-bold px-8 py-3 rounded-full hover:bg-green-50 transition-colors">
              Shop Now
            </Link>
            <Link to="/shop?type=juice" className="border-2 border-white text-white font-bold px-8 py-3 rounded-full hover:bg-white/10 transition-colors">
              View Juices
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          {[
            { icon: '🌿', title: 'Fresh & Organic', desc: 'Sourced directly from local farms' },
            { icon: '🧃', title: 'Handcrafted Juices', desc: 'Made fresh to order, no preservatives' },
            { icon: '🚚', title: 'Fast Delivery', desc: 'Same-day delivery available' },
          ].map((f) => (
            <div key={f.title} className="p-6">
              <div className="text-5xl mb-3">{f.icon}</div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">{f.title}</h3>
              <p className="text-gray-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured products */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Featured Products</h2>
            <Link to="/shop" className="text-green-600 hover:underline font-medium">View all →</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {featured.map((p) => (
              <div key={p.id} className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow">
                <div className="text-4xl text-center mb-3">
                  {p.image_url
                    ? <img src={p.image_url} alt={p.name} className="w-full h-20 object-cover rounded-lg" />
                    : <span>{p.category_type === 'juice' ? '🧃' : '🍎'}</span>
                  }
                </div>
                <p className="font-medium text-sm text-gray-900 truncate">{p.name}</p>
                <p className="text-green-600 font-bold">${parseFloat(p.price).toFixed(2)}</p>
                <button onClick={() => { addItem(p); toast.success(`${p.name} added to cart`); }}
                  className="mt-2 w-full text-xs btn-primary py-1.5">Add to Cart</button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
