import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import useAuthStore from '../store/authStore';
import { api } from '../api/client';
import {
  ShoppingCartIcon, ClipboardDocumentListIcon,
  ArrowRightOnRectangleIcon, HomeIcon, TruckIcon
} from '@heroicons/react/24/outline';

const navItems = [
  { to: '/cashier', label: 'My Dashboard', icon: HomeIcon, end: true },
  { to: '/cashier/pos', label: 'New Sale', icon: ShoppingCartIcon },
  { to: '/cashier/deliveries', label: 'Deliveries', icon: TruckIcon },
  { to: '/cashier/my-sales', label: 'My Sales', icon: ClipboardDocumentListIcon },
];

export default function CashierLayout() {
  const { logout, user } = useAuthStore();
  const navigate = useNavigate();
  const [pendingDeliveries, setPendingDeliveries] = useState(0);

  useEffect(() => {
    const fetchPending = () => {
      api.getOrders({ fulfillment_type: 'delivery', status: 'pending' })
        .then((r) => setPendingDeliveries((r.data.results || r.data).length))
        .catch(() => {});
    };
    fetchPending();
    const interval = setInterval(fetchPending, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-56 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-5 border-b border-gray-200">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">🍊</span>
            <span className="font-bold text-gray-900">Aberus</span>
          </div>
          <div className="bg-orange-50 rounded-lg px-3 py-2 mt-2">
            <p className="text-xs text-orange-600 font-semibold uppercase tracking-wide">Cashier</p>
            <p className="text-sm font-bold text-gray-800">{user?.username || 'Cashier'}</p>
            {user?.branch && (
              <p className="text-xs text-gray-500 mt-0.5">📍 {user.branch}</p>
            )}
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-orange-50 text-orange-700' : 'text-gray-600 hover:bg-gray-100'
                }`
              }>
              <Icon className="w-5 h-5" />
              {label}
              {label === 'Deliveries' && pendingDeliveries > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {pendingDeliveries}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-gray-200">
          <p className="text-xs text-gray-400 text-center mb-2">
            {new Date().toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' })}
          </p>
          <button onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors">
            <ArrowRightOnRectangleIcon className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
