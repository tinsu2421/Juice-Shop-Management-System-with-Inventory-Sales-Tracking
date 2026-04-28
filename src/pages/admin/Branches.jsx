import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import toast from 'react-hot-toast';
import { PlusIcon, PencilIcon } from '@heroicons/react/24/outline';

export default function Branches() {
  const [branches, setBranches] = useState([]);
  const [summaries, setSummaries] = useState({});
  const [branchSales, setBranchSales] = useState({});
  const [profiles, setProfiles] = useState([]);
  const [showBranchModal, setShowBranchModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);
  const [branchForm, setBranchForm] = useState({ name: '', location: '', phone: '' });
  const [profileForm, setProfileForm] = useState({ user: '', branch: '' });
  const [expandedBranch, setExpandedBranch] = useState(null);

  const load = async () => {
    const [bRes, pRes] = await Promise.all([api.getBranches(), api.getCashierProfiles()]);
    const branchList = bRes.data.results || bRes.data;
    setBranches(branchList);
    setProfiles(pRes.data.results || pRes.data);
    // Load summaries for each branch
    branchList.forEach((b) => {
      api.getBranchSummary(b.id).then((r) => setSummaries((prev) => ({ ...prev, [b.id]: r.data })));
    });
  };

  useEffect(() => { load(); }, []);

  const toggleBranchSales = async (branchId) => {
    if (expandedBranch === branchId) { setExpandedBranch(null); return; }
    setExpandedBranch(branchId);
    if (!branchSales[branchId]) {
      const r = await api.getBranchSales(branchId);
      setBranchSales((prev) => ({ ...prev, [branchId]: r.data }));
    }
  };

  const handleSaveBranch = async (e) => {
    e.preventDefault();
    try {
      if (editingBranch) {
        await api.updateBranch(editingBranch.id, branchForm);
        toast.success('Branch updated');
      } else {
        await api.createBranch(branchForm);
        toast.success('Branch created');
      }
      setShowBranchModal(false);
      load();
    } catch { toast.error('Failed to save branch'); }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      await api.createCashierProfile(profileForm);
      toast.success('Cashier assigned to branch');
      setShowProfileModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.user?.[0] || 'Failed to assign cashier');
    }
  };

  const openEdit = (b) => {
    setEditingBranch(b);
    setBranchForm({ name: b.name, location: b.location, phone: b.phone });
    setShowBranchModal(true);
  };

  const openCreate = () => {
    setEditingBranch(null);
    setBranchForm({ name: '', location: '', phone: '' });
    setShowBranchModal(true);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Branches</h1>
          <p className="text-sm text-gray-500">Manage your Aberus Juice & Fruit locations</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowProfileModal(true)} className="btn-secondary flex items-center gap-2 text-sm">
            🧾 Assign Cashier
          </button>
          <button onClick={openCreate} className="btn-primary flex items-center gap-2">
            <PlusIcon className="w-4 h-4" /> Add Branch
          </button>
        </div>
      </div>

      {/* Branch cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {branches.map((branch) => {
          const s = summaries[branch.id];
          const cashiers = profiles.filter((p) => p.branch === branch.id);
          const sales = branchSales[branch.id] || [];
          return (
            <div key={branch.id} className="card p-0 overflow-hidden">
              {/* Branch header */}
              <div className="p-5 border-b border-gray-100">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-2xl">🏪</div>
                    <div>
                      <h2 className="font-bold text-gray-900 text-lg">{branch.name}</h2>
                      {branch.location && <p className="text-sm text-gray-500">📍 {branch.location}</p>}
                      {branch.phone && <p className="text-sm text-gray-500">📞 {branch.phone}</p>}
                    </div>
                  </div>
                  <button onClick={() => openEdit(branch)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                    <PencilIcon className="w-4 h-4" />
                  </button>
                </div>

                {/* Stats */}
                {s ? (
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-green-50 rounded-xl p-3 text-center">
                      <p className="text-lg font-bold text-green-700">${parseFloat(s.today_revenue).toFixed(2)}</p>
                      <p className="text-xs text-gray-500">Today</p>
                    </div>
                    <div className="bg-blue-50 rounded-xl p-3 text-center">
                      <p className="text-lg font-bold text-blue-700">${parseFloat(s.month_revenue).toFixed(2)}</p>
                      <p className="text-xs text-gray-500">This Month</p>
                    </div>
                    <div className="bg-purple-50 rounded-xl p-3 text-center">
                      <p className="text-lg font-bold text-purple-700">${parseFloat(s.total_revenue).toFixed(2)}</p>
                      <p className="text-xs text-gray-500">All Time</p>
                    </div>
                  </div>
                ) : (
                  <div className="h-16 bg-gray-50 rounded-xl animate-pulse" />
                )}
              </div>

              {/* Cashiers */}
              <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Cashiers</p>
                {cashiers.length === 0 ? (
                  <p className="text-xs text-gray-400">No cashiers assigned yet</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {cashiers.map((p) => (
                      <span key={p.id} className="inline-flex items-center gap-1 bg-orange-100 text-orange-800 text-xs font-medium px-2.5 py-1 rounded-full">
                        🧾 {p.username}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Sales toggle */}
              <button onClick={() => toggleBranchSales(branch.id)}
                className="w-full px-5 py-3 text-sm text-left text-green-700 font-medium hover:bg-green-50 transition-colors flex items-center justify-between">
                <span>View Sales ({s?.total_sales || 0} total)</span>
                <span>{expandedBranch === branch.id ? '▲' : '▼'}</span>
              </button>

              {/* Sales list */}
              {expandedBranch === branch.id && (
                <div className="border-t border-gray-100 max-h-72 overflow-auto">
                  {sales.length === 0 ? (
                    <p className="text-center py-6 text-gray-400 text-sm">No sales yet</p>
                  ) : (
                    <table className="w-full text-xs">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          {['#', 'Date', 'Cashier', 'Items', 'Total'].map((h) => (
                            <th key={h} className="text-left px-3 py-2 font-medium text-gray-500">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {sales.map((sale) => (
                          <tr key={sale.id} className="hover:bg-gray-50">
                            <td className="px-3 py-2 font-medium">#{sale.id}</td>
                            <td className="px-3 py-2 text-gray-500">
                              {new Date(sale.created_at).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                            </td>
                            <td className="px-3 py-2">
                              <span className="bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-full">
                                {sale.cashier_name || '—'}
                              </span>
                            </td>
                            <td className="px-3 py-2">
                              {sale.items?.map((i) => (
                                <span key={i.id} className="mr-1">{i.product_name} ×{i.quantity}</span>
                              ))}
                            </td>
                            <td className="px-3 py-2 font-bold text-green-700">${parseFloat(sale.total_amount).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Branch modal */}
      {showBranchModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">{editingBranch ? 'Edit Branch' : 'Add Branch'}</h2>
            <form onSubmit={handleSaveBranch} className="space-y-3">
              <input className="input" placeholder="Branch name *" value={branchForm.name}
                onChange={(e) => setBranchForm({ ...branchForm, name: e.target.value })} required />
              <input className="input" placeholder="Location / Address" value={branchForm.location}
                onChange={(e) => setBranchForm({ ...branchForm, location: e.target.value })} />
              <input className="input" placeholder="Phone number" value={branchForm.phone}
                onChange={(e) => setBranchForm({ ...branchForm, phone: e.target.value })} />
              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn-primary flex-1">Save</button>
                <button type="button" onClick={() => setShowBranchModal(false)} className="btn-secondary flex-1">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign cashier modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-lg font-bold mb-1">Assign Cashier to Branch</h2>
            <p className="text-sm text-gray-500 mb-4">Enter the cashier's user ID (find it in Django admin → Users)</p>
            <form onSubmit={handleSaveProfile} className="space-y-3">
              <input className="input" type="number" placeholder="User ID" value={profileForm.user}
                onChange={(e) => setProfileForm({ ...profileForm, user: e.target.value })} required />
              <select className="input" value={profileForm.branch}
                onChange={(e) => setProfileForm({ ...profileForm, branch: e.target.value })} required>
                <option value="">Select branch</option>
                {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn-primary flex-1">Assign</button>
                <button type="button" onClick={() => setShowProfileModal(false)} className="btn-secondary flex-1">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
