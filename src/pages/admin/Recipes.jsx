import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import toast from 'react-hot-toast';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

export default function Recipes() {
  const [recipes, setRecipes] = useState([]);
  const [juices, setJuices] = useState([]);
  const [fruits, setFruits] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showIngModal, setShowIngModal] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [form, setForm] = useState({ juice_product: '', description: '', yield_quantity: 1 });
  const [ingForm, setIngForm] = useState({ recipe: '', ingredient: '', quantity: '', unit: 'kg' });

  const load = () => {
    api.getRecipes().then((r) => setRecipes(r.data.results || r.data));
    api.getJuices().then((r) => setJuices(r.data));
    api.getFruits().then((r) => setFruits(r.data));
  };

  useEffect(() => { load(); }, []);

  const handleCreateRecipe = async (e) => {
    e.preventDefault();
    try {
      await api.createRecipe(form);
      toast.success('Recipe created');
      setShowModal(false);
      load();
    } catch { toast.error('Failed to create recipe'); }
  };

  const handleAddIngredient = async (e) => {
    e.preventDefault();
    try {
      await api.addIngredient({ ...ingForm, recipe: selectedRecipe.id });
      toast.success('Ingredient added');
      setShowIngModal(false);
      load();
    } catch { toast.error('Failed to add ingredient'); }
  };

  const handleDeleteIngredient = async (id) => {
    await api.deleteIngredient(id);
    toast.success('Removed');
    load();
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Juice Recipes</h1>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <PlusIcon className="w-4 h-4" /> New Recipe
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {recipes.map((recipe) => (
          <div key={recipe.id} className="card">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-bold text-gray-900">🧃 {recipe.juice_name}</h3>
                <p className="text-xs text-gray-500">Yield: {recipe.yield_quantity} cup(s)</p>
              </div>
              <button onClick={() => { setSelectedRecipe(recipe); setShowIngModal(true); }}
                className="btn-secondary text-xs py-1 px-2">+ Ingredient</button>
            </div>
            {recipe.description && <p className="text-sm text-gray-600 mb-3">{recipe.description}</p>}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Ingredients</p>
              {recipe.ingredients.map((ing) => (
                <div key={ing.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                  <div>
                    <span className="text-sm font-medium">{ing.ingredient_name}</span>
                    <span className="text-xs text-gray-500 ml-2">{ing.quantity} {ing.unit}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs ${parseFloat(ing.ingredient_stock) < 5 ? 'text-red-500' : 'text-gray-400'}`}>
                      Stock: {parseFloat(ing.ingredient_stock).toFixed(1)}
                    </span>
                    <button onClick={() => handleDeleteIngredient(ing.id)} className="text-red-400 hover:text-red-600">
                      <TrashIcon className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
              {recipe.ingredients.length === 0 && <p className="text-xs text-gray-400">No ingredients yet</p>}
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">Create Recipe</h2>
            <form onSubmit={handleCreateRecipe} className="space-y-3">
              <select className="input" value={form.juice_product} onChange={(e) => setForm({ ...form, juice_product: e.target.value })} required>
                <option value="">Select juice product</option>
                {juices.map((j) => <option key={j.id} value={j.id}>{j.name}</option>)}
              </select>
              <input className="input" type="number" step="0.01" placeholder="Yield quantity" value={form.yield_quantity}
                onChange={(e) => setForm({ ...form, yield_quantity: e.target.value })} />
              <textarea className="input" placeholder="Description (optional)" value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} />
              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn-primary flex-1">Create</button>
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showIngModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">Add Ingredient to {selectedRecipe?.juice_name}</h2>
            <form onSubmit={handleAddIngredient} className="space-y-3">
              <select className="input" value={ingForm.ingredient} onChange={(e) => setIngForm({ ...ingForm, ingredient: e.target.value })} required>
                <option value="">Select ingredient</option>
                {fruits.map((f) => <option key={f.id} value={f.id}>{f.name} (stock: {parseFloat(f.stock_quantity).toFixed(1)} {f.unit})</option>)}
              </select>
              <div className="grid grid-cols-2 gap-3">
                <input className="input" type="number" step="0.001" placeholder="Quantity" value={ingForm.quantity}
                  onChange={(e) => setIngForm({ ...ingForm, quantity: e.target.value })} required />
                <input className="input" placeholder="Unit" value={ingForm.unit}
                  onChange={(e) => setIngForm({ ...ingForm, unit: e.target.value })} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn-primary flex-1">Add</button>
                <button type="button" onClick={() => setShowIngModal(false)} className="btn-secondary flex-1">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
