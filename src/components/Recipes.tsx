import React, { useState } from 'react';
import { useAppContext } from '../store';
import { Plus, Edit2, Trash2, Search, Calculator } from 'lucide-react';
import { BaseUnit, Recipe, RecipeIngredient } from '../types';
import { calculateIngredientCost, formatCurrency, getCompatibleUnits } from '../utils';

export function Recipes() {
  const { recipes, ingredients, addRecipe, updateRecipe, deleteRecipe } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState<Omit<Recipe, 'id'>>({
    name: '',
    yieldAmount: 1,
    yieldUnit: 'torta',
    preparationTime: 60,
    ingredients: [],
  });

  const [currentIngredient, setCurrentIngredient] = useState<RecipeIngredient>({
    ingredientId: '',
    quantity: 0,
    unit: 'g',
  });

  const filteredRecipes = recipes.filter((r) =>
    r.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const calculateRecipeCost = (recipe: Recipe | Omit<Recipe, 'id'>) => {
    return recipe.ingredients.reduce((total, ri) => {
      const ingredient = ingredients.find((i) => i.id === ri.ingredientId);
      if (!ingredient) return total;
      return total + calculateIngredientCost(
        ingredient.purchasedQuantity,
        ingredient.unit,
        ingredient.price,
        ri.quantity,
        ri.unit
      );
    }, 0);
  };

  const handleIngredientSelect = (id: string) => {
    const ingredient = ingredients.find((i) => i.id === id);
    if (ingredient) {
      const compatibleUnits = getCompatibleUnits(ingredient.unit);
      setCurrentIngredient({
        ...currentIngredient,
        ingredientId: id,
        unit: compatibleUnits[0] === 'kg' ? 'g' : (compatibleUnits[0] === 'l' ? 'ml' : compatibleUnits[0]),
      });
    } else {
      setCurrentIngredient({ ...currentIngredient, ingredientId: id });
    }
  };

  const handleAddIngredientToRecipe = () => {
    if (!currentIngredient.ingredientId || currentIngredient.quantity <= 0) return;
    setFormData({
      ...formData,
      ingredients: [...formData.ingredients, currentIngredient],
    });
    setCurrentIngredient({ ingredientId: '', quantity: 0, unit: 'g' });
  };

  const handleRemoveIngredientFromRecipe = (index: number) => {
    const newIngredients = [...formData.ingredients];
    newIngredients.splice(index, 1);
    setFormData({ ...formData, ingredients: newIngredients });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateRecipe(editingId, formData);
    } else {
      addRecipe(formData);
    }
    setIsFormOpen(false);
    setEditingId(null);
    setFormData({ name: '', yieldAmount: 1, yieldUnit: 'torta', preparationTime: 60, ingredients: [] });
  };

  const handleEdit = (recipe: Recipe) => {
    setFormData({
      name: recipe.name,
      yieldAmount: recipe.yieldAmount,
      yieldUnit: recipe.yieldUnit,
      preparationTime: recipe.preparationTime,
      ingredients: recipe.ingredients,
    });
    setEditingId(recipe.id);
    setIsFormOpen(true);
  };

  const selectedIngredientObj = ingredients.find(i => i.id === currentIngredient.ingredientId);
  const availableUnits = selectedIngredientObj ? getCompatibleUnits(selectedIngredientObj.unit) : [];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-4xl font-serif font-bold text-[var(--color-pastry-brown)]">Recetas</h2>
        <button
          onClick={() => setIsFormOpen(true)}
          className="bg-[var(--color-pastry-accent)] hover:bg-[var(--color-pastry-accent-hover)] text-white px-5 py-2.5 rounded-xl flex items-center space-x-2 transition-all shadow-sm hover:shadow-md"
        >
          <Plus size={20} />
          <span className="font-medium">Nueva Receta</span>
        </button>
      </div>

      {isFormOpen && (
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-[var(--color-pastry-cream)]">
          <h3 className="text-2xl font-serif font-bold text-[var(--color-pastry-brown)] mb-6">
            {editingId ? 'Editar Receta' : 'Agregar Receta'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-[var(--color-pastry-text)] mb-2">Nombre de la receta</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-3 bg-[var(--color-pastry-bg)] border border-[var(--color-pastry-cream)] rounded-xl focus:ring-2 focus:ring-[var(--color-pastry-accent)] focus:border-transparent outline-none transition-all"
                  placeholder="Ej. Torta de Chocolate"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-[var(--color-pastry-text)] mb-2">Rinde (Cant.)</label>
                  <input
                    type="number"
                    required
                    min="0.1"
                    step="0.1"
                    value={formData.yieldAmount || ''}
                    onChange={(e) => setFormData({ ...formData, yieldAmount: parseFloat(e.target.value) })}
                    className="w-full p-3 bg-[var(--color-pastry-bg)] border border-[var(--color-pastry-cream)] rounded-xl focus:ring-2 focus:ring-[var(--color-pastry-accent)] focus:border-transparent outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[var(--color-pastry-text)] mb-2">Unidad</label>
                  <input
                    type="text"
                    required
                    value={formData.yieldUnit}
                    onChange={(e) => setFormData({ ...formData, yieldUnit: e.target.value })}
                    className="w-full p-3 bg-[var(--color-pastry-bg)] border border-[var(--color-pastry-cream)] rounded-xl focus:ring-2 focus:ring-[var(--color-pastry-accent)] focus:border-transparent outline-none transition-all"
                    placeholder="Ej. torta, docenas"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-[var(--color-pastry-text)] mb-2">Tiempo preparación (min)</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.preparationTime || ''}
                  onChange={(e) => setFormData({ ...formData, preparationTime: parseInt(e.target.value) })}
                  className="w-full p-3 bg-[var(--color-pastry-bg)] border border-[var(--color-pastry-cream)] rounded-xl focus:ring-2 focus:ring-[var(--color-pastry-accent)] focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>

            <div className="border-t border-[var(--color-pastry-cream)] pt-6">
              <h4 className="text-xl font-serif font-bold text-[var(--color-pastry-brown)] mb-4">Ingredientes de la receta</h4>

              <div className="flex flex-col md:flex-row gap-4 mb-6 items-end bg-[var(--color-pastry-bg)] p-4 rounded-2xl border border-[var(--color-pastry-cream)]">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Insumo</label>
                  <select
                    value={currentIngredient.ingredientId}
                    onChange={(e) => handleIngredientSelect(e.target.value)}
                    className="w-full p-3 bg-white border border-[var(--color-pastry-cream)] rounded-xl focus:ring-2 focus:ring-[var(--color-pastry-accent)] focus:border-transparent outline-none transition-all"
                  >
                    <option value="">Seleccionar insumo...</option>
                    {ingredients.map((i) => (
                      <option key={i.id} value={i.id}>
                        {i.name} (Comprado por {i.unit})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="w-full md:w-32">
                  <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Cantidad</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={currentIngredient.quantity || ''}
                    onChange={(e) => setCurrentIngredient({ ...currentIngredient, quantity: parseFloat(e.target.value) })}
                    className="w-full p-3 bg-white border border-[var(--color-pastry-cream)] rounded-xl focus:ring-2 focus:ring-[var(--color-pastry-accent)] focus:border-transparent outline-none transition-all"
                    placeholder="0"
                  />
                </div>
                <div className="w-full md:w-32">
                  <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Unidad</label>
                  <select
                    value={currentIngredient.unit}
                    onChange={(e) => setCurrentIngredient({ ...currentIngredient, unit: e.target.value as BaseUnit })}
                    disabled={!currentIngredient.ingredientId}
                    className="w-full p-3 bg-white border border-[var(--color-pastry-cream)] rounded-xl focus:ring-2 focus:ring-[var(--color-pastry-accent)] focus:border-transparent outline-none transition-all disabled:opacity-50"
                  >
                    {availableUnits.map(u => (
                      <option key={u} value={u}>{u === 'g' ? 'gramos' : (u === 'kg' ? 'kilos' : (u === 'ml' ? 'ml' : (u === 'l' ? 'litros' : 'unidades')))}</option>
                    ))}
                    {availableUnits.length === 0 && <option value="g">g</option>}
                  </select>
                </div>
                <button
                  type="button"
                  onClick={handleAddIngredientToRecipe}
                  disabled={!currentIngredient.ingredientId || currentIngredient.quantity <= 0}
                  className="bg-[var(--color-pastry-brown)] text-white px-6 py-3 rounded-xl hover:bg-[var(--color-pastry-brown-hover)] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  Agregar
                </button>
              </div>

              {formData.ingredients.length > 0 && (
                <div className="bg-white rounded-2xl border border-[var(--color-pastry-cream)] overflow-hidden mb-4 shadow-sm">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-[var(--color-pastry-bg)] text-gray-500 uppercase tracking-wider text-xs border-b border-[var(--color-pastry-cream)]">
                      <tr>
                        <th className="p-4 font-bold">Insumo</th>
                        <th className="p-4 font-bold">Cantidad</th>
                        <th className="p-4 font-bold">Costo</th>
                        <th className="p-4 font-bold text-right">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--color-pastry-cream)]">
                      {formData.ingredients.map((ri, idx) => {
                        const ingredient = ingredients.find((i) => i.id === ri.ingredientId);
                        if (!ingredient) return null;
                        const cost = calculateIngredientCost(
                          ingredient.purchasedQuantity,
                          ingredient.unit,
                          ingredient.price,
                          ri.quantity,
                          ri.unit
                        );
                        return (
                          <tr key={idx} className="hover:bg-[var(--color-pastry-bg)] transition-colors">
                            <td className="p-4 font-bold text-[var(--color-pastry-brown)]">{ingredient.name}</td>
                            <td className="p-4 text-gray-600 font-medium">
                              {ri.quantity} {ri.unit}
                            </td>
                            <td className="p-4 text-gray-600">{formatCurrency(cost)}</td>
                            <td className="p-4 text-right">
                              <button
                                type="button"
                                onClick={() => handleRemoveIngredientFromRecipe(idx)}
                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                              >
                                <Trash2 size={18} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot className="bg-[var(--color-pastry-cream)]/30 border-t border-[var(--color-pastry-cream)]">
                      <tr>
                        <td colSpan={2} className="p-4 font-bold text-[var(--color-pastry-brown)] text-right">
                          Costo Total de Receta:
                        </td>
                        <td colSpan={2} className="p-4 font-bold text-[var(--color-pastry-accent)] text-lg">
                          {formatCurrency(calculateRecipeCost(formData))}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t border-[var(--color-pastry-cream)]">
              <button
                type="button"
                onClick={() => {
                  setIsFormOpen(false);
                  setEditingId(null);
                }}
                className="px-6 py-2.5 text-[var(--color-pastry-text)] font-medium hover:bg-[var(--color-pastry-cream)] rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={formData.ingredients.length === 0}
                className="px-6 py-2.5 bg-[var(--color-pastry-brown)] text-white font-medium rounded-xl hover:bg-[var(--color-pastry-brown-hover)] transition-all shadow-sm hover:shadow-md disabled:opacity-50"
              >
                Guardar Receta
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-3xl shadow-sm border border-[var(--color-pastry-cream)] overflow-hidden">
        <div className="p-6 border-b border-[var(--color-pastry-cream)] flex items-center space-x-4 bg-[var(--color-pastry-bg)]/50">
          <Search className="text-[var(--color-pastry-accent)]" size={22} />
          <input
            type="text"
            placeholder="Buscar recetas por nombre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 outline-none bg-transparent text-lg placeholder:text-gray-400"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b-2 border-[var(--color-pastry-cream)] text-sm uppercase tracking-wider text-gray-500">
                <th className="p-5 font-bold">Nombre</th>
                <th className="p-5 font-bold">Rendimiento</th>
                <th className="p-5 font-bold">Costo Total</th>
                <th className="p-5 font-bold">Costo por Unidad</th>
                <th className="p-5 font-bold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-pastry-cream)]">
              {filteredRecipes.map((recipe) => {
                const totalCost = calculateRecipeCost(recipe);
                const costPerYield = totalCost / recipe.yieldAmount;
                return (
                  <tr key={recipe.id} className="hover:bg-[var(--color-pastry-bg)] transition-colors group">
                    <td className="p-5 font-bold text-[var(--color-pastry-brown)]">{recipe.name}</td>
                    <td className="p-5 text-gray-600 font-medium">
                      {recipe.yieldAmount} {recipe.yieldUnit}
                    </td>
                    <td className="p-5 text-gray-600 font-bold">{formatCurrency(totalCost)}</td>
                    <td className="p-5 text-gray-500">
                      {formatCurrency(costPerYield)} / {recipe.yieldUnit}
                    </td>
                    <td className="p-5 text-right space-x-2 transition-opacity">
                      <button
                        onClick={() => handleEdit(recipe)}
                        className="p-2 text-gray-400 hover:text-[var(--color-pastry-accent)] hover:bg-[var(--color-pastry-cream)] rounded-xl transition-all"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => deleteRecipe(recipe.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredRecipes.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-gray-400 font-medium">
                    No se encontraron recetas. ¡Crea tu primera receta!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
