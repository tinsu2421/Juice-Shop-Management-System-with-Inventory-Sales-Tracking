import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import {
  HomeIcon, CubeIcon, ClipboardDocumentListIcon,
  ShoppingCartIcon, BeakerIcon, TruckIcon, ChartBarIcon,
  ArrowRightOnRectangleIcon, EyeIcon, BuildingStorefrontIcon
} from '@heroicons/react/24/outline';

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: HomeIcon, end: true },
  { to: '/admin/owner', label: 'Owner View', icon: EyeIcon },
  { to: '/admin/branches', label: 'Branches', icon: BuildingStorefrontIcon },
  { to: '/admin/products', label: 'Products', icon: CubeIcon },
  { to: '/admin/inventory', label: 'Inventory', icon: ClipboardDocumentListIcon },
  { to: '/admin/pos', label: 'POS / Sales', icon: ShoppingCartIcon },
  { to: '/admin/recipes', label: 'Recipes', icon: BeakerIcon },
  { to: '/admin/orders', label: 'Orders', icon: TruckIcon },
  { to: '/admin/reports', label: 'Reports', icon: ChartBarIcon },
];

export default function AdminLayout() {
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🍊</span>
            <div>
              <h1 className="font-bold text-gray-900 text-lg leading-tight">Aberus</h1>
              <p className="text-xs text-gray-500">Juice & Fruit</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to} to={to} end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-green-50 text-green-700' : 'text-gray-600 hover:bg-gray-100'
                } ${label === 'Owner View' ? 'border border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100 mb-2' : ''}`
              }
            >
              <Icon className="w-5 h-5" />
              {label}
              {label === 'Owner View' && <span className="ml-auto text-xs bg-orange-200 text-orange-700 px-1.5 py-0.5 rounded-full">You</span>}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-200">
          <button onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors">
            <ArrowRightOnRectangleIcon className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
