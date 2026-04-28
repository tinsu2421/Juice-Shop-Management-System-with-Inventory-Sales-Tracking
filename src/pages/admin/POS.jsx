import { useEffect, useState, useRef } from 'react';
import { api } from '../../api/client';
import toast from 'react-hot-toast';
import { TrashIcon, PrinterIcon } from '@heroicons/react/24/outline';

export default function POS() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [paymentProof, setPaymentProof] = useState(null);
  const [discount, setDiscount] = useState('');
  const [lastReceipt, setLastReceipt] = useState(null);
  const [loading, setLoading] = useState(false);
  const receiptRef = useRef();

  useEffect(() => {
    api.getProducts({ search, category__type: filter || undefined })
      .then((r) => setProducts(r.data.results || r.data));
  }, [search, filter]);

  const addToCart = (product) => {
    if (!cart.find((i) => i.product.id === product.id)) {
      setCart((prev) => [...prev, { product, qty: '' }]);
    }
  };

  const updateQty = (id, value) => {
    setCart((prev) =>
      prev.map((i) => i.product.id === id ? { ...i, qty: value } : i)
    );
  };

  const removeItem = (id) => setCart((prev) => prev.filter((i) => i.product.id !== id));

  // Auto-calculate totals from quantity × price
  const subtotal = cart.reduce((s, i) => s + parseFloat(i.product.price) * (parseFloat(i.qty) || 0), 0);
  const discountVal = parseFloat(discount) || 0;
  const grandTotal = Math.max(0, subtotal - discountVal);

  const handleCheckout = async () => {
    const validCart = cart.filter((i) => parseFloat(i.qty) > 0);
    if (validCart.length === 0) return toast.error('Add at least one product with a quantity');
    if (paymentMethod === 'mobile' && !paymentProof) {
      return toast.error('Please upload a payment proof screenshot for mobile banking');
    }

    setLoading(true);
    try {
      let data;
      const itemsData = validCart.map((i) => ({ product_id: i.product.id, quantity: parseFloat(i.qty) }));

      if (paymentMethod === 'mobile') {
        data = new FormData();
        data.append('items', JSON.stringify(itemsData));
        data.append('discount', discountVal);
        data.append('payment_method', paymentMethod);
        data.append('payment_proof', paymentProof);
      } else {
        data = {
          items: itemsData,
          discount: discountVal,
          payment_method: paymentMethod,
        };
      }

      const res = await api.createSale(data);
      setLastReceipt(res.data);
      setCart([]);
      setDiscount('');
      setPaymentProof(null);
      toast.success('Sale completed!');
    } catch (err) {
      const errData = err.response?.data;
      toast.error(typeof errData === 'string' ? errData : errData?.detail || JSON.stringify(errData) || 'Sale failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    const content = receiptRef.current?.innerHTML;
    const win = window.open('', '_blank', 'width=380,height=600');
    win.document.write(`<html><head><title>Receipt</title><style>
      body{font-family:monospace;padding:20px;font-size:13px;max-width:320px}
      h2{text-align:center;margin:0 0 4px}p{margin:2px 0}
      hr{border:none;border-top:1px dashed #000;margin:8px 0}
      .row{display:flex;justify-content:space-between}
      .bold{font-weight:bold}.center{text-align:center}
    </style></head><body>${content}</body></html>`);
    win.document.close(); win.print();
  };

  return (
    <div className="p-4 h-full flex gap-4 overflow-hidden">

      {/* Left: product grid */}
      <div className="flex-1 flex flex-col gap-3 min-w-0">
        <h1 className="text-xl font-bold text-gray-900">Point of Sale</h1>
        <div className="flex gap-2">
          <input className="input flex-1" placeholder="Search products..." value={search}
            onChange={(e) => setSearch(e.target.value)} />
          <select className="input w-32" value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="">All</option>
            <option value="fruit">🍎 Fruits</option>
            <option value="juice">🧃 Juices</option>
          </select>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 overflow-auto pb-2">
          {products.map((p) => {
            const inCart = cart.find((i) => i.product.id === p.id);
            return (
              <button key={p.id} onClick={() => addToCart(p)}
                className={`card p-3 text-left transition-all cursor-pointer border-2 ${
                  inCart ? 'border-green-400 bg-green-50' : 'border-transparent hover:border-green-200 hover:shadow-md'
                }`}>
                <div className="text-3xl mb-1">{p.category_type === 'juice' ? '🧃' : '🍎'}</div>
                <p className="font-semibold text-sm text-gray-900 truncate">{p.name}</p>
                <p className="text-green-600 font-bold text-sm">
                  ${parseFloat(p.price).toFixed(2)} <span className="text-gray-400 font-normal">/ {p.unit}</span>
                </p>
                <p className="text-xs text-gray-400">Stock: {parseFloat(p.stock_quantity).toFixed(1)} {p.unit}</p>
                {p.is_low_stock && <span className="badge-red text-xs mt-1">Low stock</span>}
                {inCart && <span className="badge-green text-xs mt-1">Added ✓</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Right: order panel */}
      <div className="w-80 flex flex-col gap-3 flex-shrink-0">
        <div className="card flex-1 flex flex-col overflow-hidden">
          <h2 className="font-bold text-gray-900 mb-3">Current Order</h2>

          {/* Cart items */}
          <div className="flex-1 overflow-auto space-y-2 mb-3">
            {cart.length === 0 && (
              <p className="text-gray-400 text-sm text-center py-10">Tap a product to add it</p>
            )}
            {cart.map((item) => {
              const lineTotal = parseFloat(item.product.price) * (parseFloat(item.qty) || 0);
              return (
                <div key={item.product.id} className="bg-gray-50 rounded-xl p-3 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{item.product.name}</p>
                      <p className="text-xs text-gray-500">
                        ${parseFloat(item.product.price).toFixed(2)} per {item.product.unit}
                      </p>
                    </div>
                    <button onClick={() => removeItem(item.product.id)}
                      className="text-red-400 hover:text-red-600 p-1 flex-shrink-0">
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Quantity input only */}
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-gray-500 flex-shrink-0">
                      Amount ({item.product.unit})
                    </label>
                    <input
                      type="number"
                      min="0"
                      step={item.product.unit === 'kg' ? '0.1' : '1'}
                      placeholder={item.product.unit === 'kg' ? '0.0' : '0'}
                      value={item.qty}
                      onChange={(e) => updateQty(item.product.id, e.target.value)}
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-right text-sm font-bold focus:outline-none focus:ring-2 focus:ring-green-500"
                      autoFocus
                    />
                  </div>

                  {/* Auto-calculated price */}
                  {parseFloat(item.qty) > 0 && (
                    <div className="flex justify-between items-center bg-green-50 rounded-lg px-3 py-1.5 text-sm">
                      <span className="text-gray-500">
                        {parseFloat(item.qty)} {item.product.unit} × ${parseFloat(item.product.price).toFixed(2)}
                      </span>
                      <span className="font-bold text-green-700">${lineTotal.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <div className="border-t border-gray-200 pt-3 space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal</span>
              <span className="font-medium">${subtotal.toFixed(2)}</span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Discount ($)</span>
              <input type="number" min="0" step="0.01" value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                placeholder="0.00"
                className="w-20 border rounded-lg px-2 py-1 text-right text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>

            {/* Grand total — big and clear */}
            <div className="flex justify-between items-center bg-green-600 text-white rounded-xl px-4 py-3">
              <span className="font-bold text-lg">Total</span>
              <span className="font-bold text-2xl">${grandTotal.toFixed(2)}</span>
            </div>

            <select className="input text-sm" value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}>
              <option value="cash">💵 Cash</option>
              <option value="card">💳 Card</option>
              <option value="mobile">📱 Mobile Banking (Telebirr/CBE)</option>
            </select>

            {paymentMethod === 'mobile' && (
              <div className="flex flex-col gap-1 mt-2">
                <label className="text-xs font-semibold text-gray-700">Upload Screenshot *</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => setPaymentProof(e.target.files[0])}
                  className="text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                />
              </div>
            )}

            <button onClick={handleCheckout}
              disabled={loading || cart.filter((i) => parseFloat(i.qty) > 0).length === 0}
              className="btn-primary w-full py-3 text-base disabled:opacity-50">
              {loading ? 'Processing...' : '✓ Complete Sale'}
            </button>
          </div>
        </div>

        {/* Receipt */}
        {lastReceipt && (
          <div className="card text-sm">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold">Receipt #{lastReceipt.id}</h3>
              <button onClick={handlePrint}
                className="text-gray-500 hover:text-gray-700 flex items-center gap-1 text-xs border rounded px-2 py-1">
                <PrinterIcon className="w-3.5 h-3.5" /> Print
              </button>
            </div>
            <div ref={receiptRef}>
              <h2>🍊 Aberus Juice & Fruit</h2>
              <p className="center">Receipt #{lastReceipt.id}</p>
              <p className="center">{new Date(lastReceipt.created_at).toLocaleString()}</p>
              <hr />
              {lastReceipt.items?.map((item) => (
                <div key={item.id} className="row py-0.5 text-xs">
                  <span>{item.product_name} × {item.quantity} {item.unit}</span>
                  <span>${parseFloat(item.subtotal).toFixed(2)}</span>
                </div>
              ))}
              <hr />
              <div className="row bold">
                <span>TOTAL</span>
                <span>${parseFloat(lastReceipt.total_amount).toFixed(2)}</span>
              </div>
              <p className="center" style={{marginTop:'8px',fontSize:'11px'}}>Thank you!</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
