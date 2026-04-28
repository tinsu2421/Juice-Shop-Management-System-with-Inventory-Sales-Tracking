import { create } from 'zustand';
import { api } from '../api/client';

const savedUser = (() => {
  try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null; }
})();

const useAuthStore = create((set) => ({
  user: savedUser,
  isAuthenticated: !!localStorage.getItem('access_token'),

  login: async (username, password) => {
    const { data } = await api.login({ username, password });
    localStorage.setItem('access_token', data.access);
    localStorage.setItem('refresh_token', data.refresh);
    // Fetch user profile to get role
    const meRes = await api.getMe();
    const user = meRes.data;
    localStorage.setItem('user', JSON.stringify(user));
    set({ isAuthenticated: true, user });
    return user;
  },

  logout: () => {
    localStorage.clear();
    set({ isAuthenticated: false, user: null });
  },
}));

export default useAuthStore;
