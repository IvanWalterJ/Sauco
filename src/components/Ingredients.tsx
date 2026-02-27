import React, { useState } from 'react';
import { useAppContext } from '../store';
import { Plus, Edit2, Trash2, Search, Info } from 'lucide-react';
import { BaseUnit, Ingredient } from '../types';
import { formatCurrency } from '../utils';

export function Ingredients() {
  const { ingredients, addIngredient, updateIngredient, deleteIngredient } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState<Omit<Ingredient, 'id'>>({
    name: '',
    price: 0,
    quantity: 0,
    unit: 'g',
  });

  const filteredIngredients = ingredients.filter((i) =>
    i.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateIngredient(editingId, formData);
    } else {
      addIngredient(formData);
    }
    setIsFormOpen(false);
    setEditingId(null);
    setFormData({ name: '', price: 0, quantity: 0, unit: 'g' });
  };

  const handleEdit = (ingredient: Ingredient) => {
    setFormData({
      name: ingredient.name,
      price: ingredient.price,
      quantity: ingredient.quantity,
      unit: ingredient.unit,
    });
    setEditingId(ingredient.id);
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-4xl font-serif font-bold text-[var(--color-pastry-brown)]">Insumos</h2>
        <button
          onClick={() => setIsFormOpen(true)}
          className="bg-[var(--color-pastry-accent)] hover:bg-[var(--color-pastry-accent-hover)] text-white px-5 py-2.5 rounded-xl flex items-center space-x-2 transition-all shadow-sm hover:shadow-md"
        >
          <Plus size={20} />
          <span className="font-medium">Nuevo Insumo</span>
        </button>
      </div>

      {isFormOpen && (
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-[var(--color-pastry-cream)]">
          <h3 className="text-2xl font-serif font-bold text-[var(--color-pastry-brown)] mb-6">
            {editingId ? 'Editar Insumo' : 'Agregar Insumo'}
          </h3>

          <div className="bg-blue-50 text-blue-800 p-4 rounded-xl mb-6 flex items-start space-x-3 text-sm">
            <Info className="flex-shrink-0 mt-0.5" size={18} />
            <p>
              <strong>Tip:</strong> Ingresa la cantidad y unidad en la que compras el producto.
              Si compras una tableta de chocolate de 500g, ingresa "500" y selecciona "g".
              Si compras 1kg de harina, ingresa "1" y selecciona "kg".
            </p>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-[var(--color-pastry-text)] mb-2">Nombre del producto</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-3 bg-[var(--color-pastry-bg)] border border-[var(--color-pastry-cream)] rounded-xl focus:ring-2 focus:ring-[var(--color-pastry-accent)] focus:border-transparent outline-none transition-all"
                placeholder="Ej. Harina 0000, Chocolate Águila"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-[var(--color-pastry-text)] mb-2">Precio Total ($)</label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.price || ''}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                className="w-full p-3 bg-[var(--color-pastry-bg)] border border-[var(--color-pastry-cream)] rounded-xl focus:ring-2 focus:ring-[var(--color-pastry-accent)] focus:border-transparent outline-none transition-all"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-[var(--color-pastry-text)] mb-2">Cantidad que trae</label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.quantity || ''}
                onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) })}
                className="w-full p-3 bg-[var(--color-pastry-bg)] border border-[var(--color-pastry-cream)] rounded-xl focus:ring-2 focus:ring-[var(--color-pastry-accent)] focus:border-transparent outline-none transition-all"
                placeholder="Ej. 500, 1"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-[var(--color-pastry-text)] mb-2">Unidad de medida</label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value as BaseUnit })}
                className="w-full p-3 bg-[var(--color-pastry-bg)] border border-[var(--color-pastry-cream)] rounded-xl focus:ring-2 focus:ring-[var(--color-pastry-accent)] focus:border-transparent outline-none transition-all"
              >
                <option value="g">Gramos (g)</option>
                <option value="kg">Kilogramos (kg)</option>
                <option value="ml">Mililitros (ml)</option>
                <option value="l">Litros (l)</option>
                <option value="u">Unidades (u)</option>
              </select>
            </div>
            <div className="md:col-span-2 flex justify-end space-x-4 mt-4 pt-6 border-t border-[var(--color-pastry-cream)]">
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
                className="px-6 py-2.5 bg-[var(--color-pastry-brown)] text-white font-medium rounded-xl hover:bg-[var(--color-pastry-brown-hover)] transition-all shadow-sm hover:shadow-md"
              >
                Guardar Insumo
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
            placeholder="Buscar insumos por nombre..."
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
                <th className="p-5 font-bold">Precio</th>
                <th className="p-5 font-bold">Cantidad</th>
                <th className="p-5 font-bold">Costo Unitario</th>
                <th className="p-5 font-bold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-pastry-cream)]">
              {filteredIngredients.map((ingredient) => {
                const costPerUnit = ingredient.price / ingredient.quantity;
                return (
                  <tr key={ingredient.id} className="hover:bg-[var(--color-pastry-bg)] transition-colors group">
                    <td className="p-5 font-bold text-[var(--color-pastry-brown)]">{ingredient.name}</td>
                    <td className="p-5 text-gray-600">{formatCurrency(ingredient.price)}</td>
                    <td className="p-5 text-gray-600 font-medium">
                      {ingredient.quantity} {ingredient.unit}
                    </td>
                    <td className="p-5 text-gray-500">
                      {formatCurrency(costPerUnit)} / {ingredient.unit}
                    </td>
                    <td className="p-5 text-right space-x-2 transition-opacity">
                      <button
                        onClick={() => handleEdit(ingredient)}
                        className="p-2 text-gray-400 hover:text-[var(--color-pastry-accent)] hover:bg-[var(--color-pastry-cream)] rounded-xl transition-all"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => deleteIngredient(ingredient.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredIngredients.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-gray-400 font-medium">
                    No se encontraron insumos. ¡Agrega tu primer ingrediente!
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
