import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './store/authStore';

// Admin
import AdminLayout from './components/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import OwnerDashboard from './pages/admin/OwnerDashboard';
import Branches from './pages/admin/Branches';
import Products from './pages/admin/Products';
import Inventory from './pages/admin/Inventory';
import POS from './pages/admin/POS';
import Recipes from './pages/admin/Recipes';
import Orders from './pages/admin/Orders';
import Reports from './pages/admin/Reports';

// Cashier
import CashierLayout from './components/CashierLayout';
import CashierDashboard from './pages/cashier/CashierDashboard';
import MySales from './pages/cashier/MySales';
import DeliveryOrders from './pages/cashier/DeliveryOrders';

// Public
import PublicLayout from './components/PublicLayout';
import Home from './pages/public/Home';
import Shop from './pages/public/Shop';
import Cart from './pages/public/Cart';
import Checkout from './pages/public/Checkout';
import OrderConfirmation from './pages/public/OrderConfirmation';

// Auth
import Login from './pages/Login';

function PrivateRoute({ children, role }) {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (role && user?.role !== role) {
    return <Navigate to={user?.role === 'admin' ? '/admin' : '/cashier'} replace />;
  }
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        {/* Public */}
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<Home />} />
          <Route path="shop" element={<Shop />} />
          <Route path="cart" element={<Cart />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="order-confirmation/:id" element={<OrderConfirmation />} />
        </Route>

        {/* Auth */}
        <Route path="/login" element={<Login />} />

        {/* Admin */}
        <Route path="/admin" element={<PrivateRoute role="admin"><AdminLayout /></PrivateRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="owner" element={<OwnerDashboard />} />
          <Route path="branches" element={<Branches />} />
          <Route path="products" element={<Products />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="pos" element={<POS />} />
          <Route path="recipes" element={<Recipes />} />
          <Route path="orders" element={<Orders />} />
          <Route path="reports" element={<Reports />} />
        </Route>

        {/* Cashier */}
        <Route path="/cashier" element={<PrivateRoute role="cashier"><CashierLayout /></PrivateRoute>}>
          <Route index element={<CashierDashboard />} />
          <Route path="pos" element={<POS />} />
          <Route path="deliveries" element={<DeliveryOrders />} />
          <Route path="my-sales" element={<MySales />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
