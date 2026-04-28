import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const client = axios.create({ baseURL: API_BASE });

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

client.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.response?.status === 401) {
      const refresh = localStorage.getItem('refresh_token');
      if (refresh) {
        try {
          const { data } = await axios.post(`${API_BASE}/token/refresh/`, { refresh });
          localStorage.setItem('access_token', data.access);
          err.config.headers.Authorization = `Bearer ${data.access}`;
          return client(err.config);
        } catch {
          localStorage.clear();
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(err);
  }
);

export default client;

export const api = {
  // Auth
  login: (data) => client.post('/token/', data),
  getMe: () => client.get('/me/'),

  // Products
  getProducts: (params) => client.get('/products/', { params }),
  getProduct: (id) => client.get(`/products/${id}/`),
  createProduct: (data) => client.post('/products/', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  updateProduct: (id, data) => client.patch(`/products/${id}/`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deleteProduct: (id) => client.delete(`/products/${id}/`),
  getLowStock: () => client.get('/products/low_stock/'),
  getFruits: () => client.get('/products/fruits/'),
  getJuices: () => client.get('/products/juices/'),

  // Categories
  getCategories: () => client.get('/products/categories/'),
  createCategory: (data) => client.post('/products/categories/', data),

  // Sales
  getSales: (params) => client.get('/sales/', { params }),
  createSale: (data) => {
    if (data instanceof FormData) {
      return client.post('/sales/create/', data, { headers: { 'Content-Type': 'multipart/form-data' } });
    }
    return client.post('/sales/create/', data);
  },
  verifyPayment: (id) => client.post(`/sales/${id}/verify/`),

  // Recipes
  getRecipes: () => client.get('/recipes/'),
  createRecipe: (data) => client.post('/recipes/', data),
  updateRecipe: (id, data) => client.patch(`/recipes/${id}/`, data),
  addIngredient: (data) => client.post('/recipes/ingredients/', data),
  deleteIngredient: (id) => client.delete(`/recipes/ingredients/${id}/`),

  // Orders
  getOrders: (params) => client.get('/orders/', { params }),
  placeOrder: (data) => client.post('/orders/place/', data),
  updateOrderStatus: (id, status) => client.patch(`/orders/${id}/update_status/`, { status }),

  // Inventory
  getAdjustments: () => client.get('/inventory/adjustments/'),
  createAdjustment: (data) => client.post('/inventory/adjustments/', data),

  // Branches
  getBranches: () => client.get('/branches/'),
  createBranch: (data) => client.post('/branches/', data),
  updateBranch: (id, data) => client.patch(`/branches/${id}/`, data),
  deleteBranch: (id) => client.delete(`/branches/${id}/`),
  getBranchSummary: (id) => client.get(`/branches/${id}/summary/`),
  getBranchSales: (id) => client.get(`/branches/${id}/sales/`),
  getCashierProfiles: () => client.get('/branches/cashier-profiles/'),
  createCashierProfile: (data) => client.post('/branches/cashier-profiles/', data),
  updateCashierProfile: (id, data) => client.patch(`/branches/cashier-profiles/${id}/`, data),
  getDailySales: (days) => client.get('/reports/daily/', { params: { days } }),
  getMonthlySales: (months) => client.get('/reports/monthly/', { params: { months } }),
  getBestSelling: (limit) => client.get('/reports/best-selling/', { params: { limit } }),
  getDashboardSummary: () => client.get('/reports/summary/'),
};
