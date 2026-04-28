import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import toast from 'react-hot-toast';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

const EMPTY = { name: '', category: '', price: '', stock_quantity: '', unit: 'kg', low_stock_threshold: '5', image: null };

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');

  const load = () => {
    api.getProducts({ search, category__type: filter || undefined }).then((r) => setProducts(r.data.results || r.data));
    api.getCategories().then((r) => setCategories(r.data.results || r.data));
  };

  useEffect(() => { load(); }, [search, filter]);

  const openCreate = () => { setEditing(null); setForm(EMPTY); setShowModal(true); };
  const openEdit = (p) => {
    setEditing(p);
    setForm({ name: p.name, category: p.category, price: p.price, stock_quantity: p.stock_quantity, unit: p.unit, low_stock_threshold: p.low_stock_threshold, image: null });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => { if (v !== null && v !== '') fd.append(k, v); });
    try {
      if (editing) { await api.updateProduct(editing.id, fd); toast.success('Product updated'); }
      else { await api.createProduct(fd); toast.success('Product created'); }
      setShowModal(false); load();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Error saving product');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    await api.deleteProduct(id);
    toast.success('Deleted'); load();
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <PlusIcon className="w-4 h-4" /> Add Product
        </button>
      </div>

      <div className="flex gap-3 flex-wrap">
        <input className="input max-w-xs" placeholder="Search products..." value={search}
          onChange={(e) => setSearch(e.target.value)} />
        <select className="input max-w-xs" value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">All Types</option>
          <option value="fruit">Fruits</option>
          <option value="juice">Juices</option>
        </select>
      </div>

      <div className="card p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {['Product', 'Category', 'Price', 'Stock', 'Status', 'Actions'].map((h) => (
                <th key={h} className="text-left px-4 py-3 font-medium text-gray-600">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {p.image_url
                      ? <img src={p.image_url} alt={p.name} className="w-10 h-10 rounded-lg object-cover" />
                      : <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center text-lg">
                          {p.category_type === 'juice' ? '🧃' : '🍎'}
                        </div>
                    }
                    <span className="font-medium text-gray-900">{p.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-600">{p.category_name}</td>
                <td className="px-4 py-3 font-medium">${parseFloat(p.price).toFixed(2)}</td>
                <td className="px-4 py-3">
                  <span className={p.is_low_stock ? 'text-red-600 font-medium' : 'text-gray-700'}>
                    {parseFloat(p.stock_quantity).toFixed(1)} {p.unit}
                  </span>
                  {p.is_low_stock && <span className="ml-2 badge-red">Low</span>}
                </td>
                <td className="px-4 py-3">
                  <span className={p.is_active ? 'badge-green' : 'badge-red'}>
                    {p.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(p)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded">
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(p.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded">
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 && <p className="text-center py-8 text-gray-400">No products found</p>}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">{editing ? 'Edit Product' : 'Add Product'}</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input className="input" placeholder="Product name" value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              <select className="input" value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })} required>
                <option value="">Select category</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.type})</option>)}
              </select>
              <div className="grid grid-cols-2 gap-3">
                <input className="input" type="number" step="0.01" placeholder="Price" value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })} required />
                <input className="input" type="number" step="0.01" placeholder="Stock qty" value={form.stock_quantity}
                  onChange={(e) => setForm({ ...form, stock_quantity: e.target.value })} required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input className="input" placeholder="Unit (kg, cup...)" value={form.unit}
                  onChange={(e) => setForm({ ...form, unit: e.target.value })} />
                <input className="input" type="number" step="0.01" placeholder="Low stock threshold" value={form.low_stock_threshold}
                  onChange={(e) => setForm({ ...form, low_stock_threshold: e.target.value })} />
              </div>
              <input className="input" type="file" accept="image/*"
                onChange={(e) => setForm({ ...form, image: e.target.files[0] })} />
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
