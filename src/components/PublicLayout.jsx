import { Outlet, NavLink, Link } from 'react-router-dom';
import useCartStore from '../store/cartStore';
import { ShoppingCartIcon } from '@heroicons/react/24/outline';

export default function PublicLayout() {
  const { items } = useCartStore();
  const itemCount = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <span className="text-2xl">🍊</span>
              <span className="font-bold text-xl text-gray-900">Aberus Juice & Fruit</span>
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <NavLink to="/" end className={({ isActive }) =>
                `text-sm font-medium ${isActive ? 'text-green-600' : 'text-gray-600 hover:text-gray-900'}`}>
                Home
              </NavLink>
              <NavLink to="/shop" className={({ isActive }) =>
                `text-sm font-medium ${isActive ? 'text-green-600' : 'text-gray-600 hover:text-gray-900'}`}>
                Shop
              </NavLink>
              <Link to="/admin" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                Admin
              </Link>
            </nav>
            <Link to="/cart" className="relative p-2 text-gray-600 hover:text-green-600">
              <ShoppingCartIcon className="w-6 h-6" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-green-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="bg-gray-800 text-gray-400 text-center py-6 text-sm">
        © 2026 Aberus Juice & Fruit. All rights reserved.
      </footer>
    </div>
  );
}
