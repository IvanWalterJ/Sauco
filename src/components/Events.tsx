import React, { useState } from 'react';
import { useAppContext } from '../store';
import { Plus, Edit2, Trash2, Search, FileText, Download, Users, Clock, DollarSign } from 'lucide-react';
import { Event, EventRecipe } from '../types';
import { calculateIngredientCost, formatCurrency, calculateRecipeCost, calculateEventTotalCost, calculateEventPrice } from '../utils';

export function Events() {
  const { events, recipes, ingredients, addEvent, updateEvent, deleteEvent } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewingEvent, setViewingEvent] = useState<Event | null>(null);

  const [formData, setFormData] = useState<Omit<Event, 'id'>>({
    name: '',
    date: new Date().toISOString().split('T')[0],
    pax: 0,
    partnerHours: 0,
    partnerHourlyRate: 0,
    extraHelpCost: 0,
    profitMargin: 30,
    extraExpenses: 0,
    recipes: [],
  });

  const [currentRecipe, setCurrentRecipe] = useState<EventRecipe>({
    recipeId: '',
    multiplier: 1,
  });

  const filteredEvents = events.filter((e) =>
    e.name.toLowerCase().includes(searchTerm.toLowerCase())
  );



  const handleAddRecipeToEvent = () => {
    if (!currentRecipe.recipeId || currentRecipe.multiplier <= 0) return;
    setFormData({
      ...formData,
      recipes: [...formData.recipes, currentRecipe],
    });
    setCurrentRecipe({ recipeId: '', multiplier: 1 });
  };

  const handleRemoveRecipeFromEvent = (index: number) => {
    const newRecipes = [...formData.recipes];
    newRecipes.splice(index, 1);
    setFormData({ ...formData, recipes: newRecipes });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateEvent(editingId, formData);
    } else {
      addEvent(formData);
    }
    setIsFormOpen(false);
    setEditingId(null);
    setFormData({
      name: '',
      date: new Date().toISOString().split('T')[0],
      pax: 0,
      partnerHours: 0,
      partnerHourlyRate: 0,
      extraHelpCost: 0,
      profitMargin: 30,
      extraExpenses: 0,
      recipes: [],
    });
  };

  const handleEdit = (event: Event) => {
    setFormData({
      name: event.name,
      date: event.date,
      pax: event.pax,
      partnerHours: event.partnerHours || 0,
      partnerHourlyRate: event.partnerHourlyRate || 0,
      extraHelpCost: event.extraHelpCost || 0,
      profitMargin: event.profitMargin,
      extraExpenses: event.extraExpenses,
      recipes: event.recipes,
    });
    setEditingId(event.id);
    setIsFormOpen(true);
  };

  const generateShoppingList = (event: Event) => {
    const shoppingList: Record<string, { name: string; quantity: number; unit: string; cost: number }> = {};

    event.recipes.forEach((er) => {
      const recipe = recipes.find((r) => r.id === er.recipeId);
      if (!recipe) return;

      recipe.ingredients.forEach((ri) => {
        const ingredient = ingredients.find((i) => i.id === ri.ingredientId);
        if (!ingredient) return;

        const totalQuantity = ri.quantity * er.multiplier;
        const totalCost = calculateIngredientCost(
          ingredient.purchasedQuantity,
          ingredient.unit,
          ingredient.price,
          totalQuantity,
          ri.unit
        );

        if (shoppingList[ingredient.id]) {
          shoppingList[ingredient.id].quantity += totalQuantity;
          shoppingList[ingredient.id].cost += totalCost;
        } else {
          shoppingList[ingredient.id] = {
            name: ingredient.name,
            quantity: totalQuantity,
            unit: ri.unit,
            cost: totalCost,
          };
        }
      });
    });

    return Object.values(shoppingList);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-4xl font-serif font-bold text-[var(--color-pastry-brown)]">Eventos</h2>
        <button
          onClick={() => setIsFormOpen(true)}
          className="bg-[var(--color-pastry-accent)] hover:bg-[var(--color-pastry-accent-hover)] text-white px-5 py-2.5 rounded-xl flex items-center space-x-2 transition-all shadow-sm hover:shadow-md"
        >
          <Plus size={20} />
          <span className="font-medium">Nuevo Evento</span>
        </button>
      </div>

      {isFormOpen && (
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-[var(--color-pastry-cream)]">
          <h3 className="text-2xl font-serif font-bold text-[var(--color-pastry-brown)] mb-6">
            {editingId ? 'Editar Evento' : 'Agregar Evento'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-bold text-[var(--color-pastry-text)] mb-2">Nombre del Evento</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-3 bg-[var(--color-pastry-bg)] border border-[var(--color-pastry-cream)] rounded-xl focus:ring-2 focus:ring-[var(--color-pastry-accent)] focus:border-transparent outline-none transition-all"
                  placeholder="Ej. Boda de Ana y Juan"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-[var(--color-pastry-text)] mb-2">Fecha</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full p-3 bg-[var(--color-pastry-bg)] border border-[var(--color-pastry-cream)] rounded-xl focus:ring-2 focus:ring-[var(--color-pastry-accent)] focus:border-transparent outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-[var(--color-pastry-text)] mb-2">Cantidad de Personas</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.pax || ''}
                  onChange={(e) => setFormData({ ...formData, pax: parseInt(e.target.value) })}
                  className="w-full p-3 bg-[var(--color-pastry-bg)] border border-[var(--color-pastry-cream)] rounded-xl focus:ring-2 focus:ring-[var(--color-pastry-accent)] focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>

            <div className="bg-[var(--color-pastry-bg)] p-6 rounded-2xl border border-[var(--color-pastry-cream)]">
              <h4 className="text-lg font-serif font-bold text-[var(--color-pastry-brown)] mb-4 flex items-center space-x-2">
                <Users size={20} className="text-[var(--color-pastry-accent)]" />
                <span>Mano de Obra y Extras</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide flex items-center space-x-1">
                    <Clock size={14} /> <span>Horas (Socias)</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={formData.partnerHours || ''}
                    onChange={(e) => setFormData({ ...formData, partnerHours: parseFloat(e.target.value) })}
                    className="w-full p-3 bg-white border border-[var(--color-pastry-cream)] rounded-xl focus:ring-2 focus:ring-[var(--color-pastry-accent)] focus:border-transparent outline-none transition-all"
                    placeholder="Ej. 10"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide flex items-center space-x-1">
                    <DollarSign size={14} /> <span>Valor Hora ($)</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.partnerHourlyRate || ''}
                    onChange={(e) => setFormData({ ...formData, partnerHourlyRate: parseFloat(e.target.value) })}
                    className="w-full p-3 bg-white border border-[var(--color-pastry-cream)] rounded-xl focus:ring-2 focus:ring-[var(--color-pastry-accent)] focus:border-transparent outline-none transition-all"
                    placeholder="Ej. 5000"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Ayudantes Extra ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.extraHelpCost || ''}
                    onChange={(e) => setFormData({ ...formData, extraHelpCost: parseFloat(e.target.value) })}
                    className="w-full p-3 bg-white border border-[var(--color-pastry-cream)] rounded-xl focus:ring-2 focus:ring-[var(--color-pastry-accent)] focus:border-transparent outline-none transition-all"
                    placeholder="Ej. 15000"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Otros Gastos ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.extraExpenses || ''}
                    onChange={(e) => setFormData({ ...formData, extraExpenses: parseFloat(e.target.value) })}
                    className="w-full p-3 bg-white border border-[var(--color-pastry-cream)] rounded-xl focus:ring-2 focus:ring-[var(--color-pastry-accent)] focus:border-transparent outline-none transition-all"
                    placeholder="Flete, cajas..."
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-[var(--color-pastry-cream)] pt-6">
              <h4 className="text-xl font-serif font-bold text-[var(--color-pastry-brown)] mb-4">Recetas del Evento</h4>

              <div className="flex flex-col md:flex-row gap-4 mb-6 items-end bg-[var(--color-pastry-bg)] p-4 rounded-2xl border border-[var(--color-pastry-cream)]">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Receta</label>
                  <select
                    value={currentRecipe.recipeId}
                    onChange={(e) => setCurrentRecipe({ ...currentRecipe, recipeId: e.target.value })}
                    className="w-full p-3 bg-white border border-[var(--color-pastry-cream)] rounded-xl focus:ring-2 focus:ring-[var(--color-pastry-accent)] focus:border-transparent outline-none transition-all"
                  >
                    <option value="">Seleccionar receta...</option>
                    {recipes.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name} (Rinde {r.yieldAmount} {r.yieldUnit})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="w-full md:w-32">
                  <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Multiplicador</label>
                  <input
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={currentRecipe.multiplier || ''}
                    onChange={(e) => setCurrentRecipe({ ...currentRecipe, multiplier: parseFloat(e.target.value) })}
                    className="w-full p-3 bg-white border border-[var(--color-pastry-cream)] rounded-xl focus:ring-2 focus:ring-[var(--color-pastry-accent)] focus:border-transparent outline-none transition-all"
                    placeholder="1"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddRecipeToEvent}
                  disabled={!currentRecipe.recipeId || currentRecipe.multiplier <= 0}
                  className="bg-[var(--color-pastry-brown)] text-white px-6 py-3 rounded-xl hover:bg-[var(--color-pastry-brown-hover)] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  Agregar
                </button>
              </div>

              {formData.recipes.length > 0 && (
                <div className="bg-white rounded-2xl border border-[var(--color-pastry-cream)] overflow-hidden mb-6 shadow-sm">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-[var(--color-pastry-bg)] text-gray-500 uppercase tracking-wider text-xs border-b border-[var(--color-pastry-cream)]">
                      <tr>
                        <th className="p-4 font-bold">Receta</th>
                        <th className="p-4 font-bold">Cantidad Total</th>
                        <th className="p-4 font-bold">Costo de Insumos</th>
                        <th className="p-4 font-bold text-right">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--color-pastry-cream)]">
                      {formData.recipes.map((er, idx) => {
                        const recipe = recipes.find((r) => r.id === er.recipeId);
                        if (!recipe) return null;
                        const cost = calculateRecipeCost(recipe, ingredients) * er.multiplier;
                        const totalYield = recipe.yieldAmount * er.multiplier;
                        return (
                          <tr key={idx} className="hover:bg-[var(--color-pastry-bg)] transition-colors">
                            <td className="p-4 font-bold text-[var(--color-pastry-brown)]">{recipe.name}</td>
                            <td className="p-4 text-gray-600 font-medium">
                              {totalYield} {recipe.yieldUnit} <span className="text-xs text-gray-400 font-normal">(x{er.multiplier})</span>
                            </td>
                            <td className="p-4 text-gray-600">{formatCurrency(cost)}</td>
                            <td className="p-4 text-right">
                              <button
                                type="button"
                                onClick={() => handleRemoveRecipeFromEvent(idx)}
                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                              >
                                <Trash2 size={18} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Resumen de Costos */}
              <div className="bg-[var(--color-pastry-cream)]/30 p-6 rounded-2xl border border-[var(--color-pastry-cream)]">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-serif font-bold text-2xl text-[var(--color-pastry-brown)]">Resumen de Cotización</h4>
                  <div className="flex items-center space-x-2">
                    <label className="text-sm font-bold text-[var(--color-pastry-text)]">Margen (%)</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="1"
                      value={formData.profitMargin || ''}
                      onChange={(e) => setFormData({ ...formData, profitMargin: parseFloat(e.target.value) })}
                      className="w-20 p-2 bg-white border border-[var(--color-pastry-cream)] rounded-lg focus:ring-2 focus:ring-[var(--color-pastry-accent)] focus:border-transparent outline-none transition-all text-center"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
                  <div className="bg-white p-4 rounded-xl shadow-sm">
                    <p className="text-gray-500 font-medium mb-1 uppercase tracking-wide text-xs">Costo Insumos</p>
                    <p className="font-bold text-lg text-[var(--color-pastry-brown)]">
                      {formatCurrency(formData.recipes.reduce((t, er) => {
                        const r = recipes.find(r => r.id === er.recipeId);
                        return t + (r ? calculateRecipeCost(r, ingredients) : 0) * er.multiplier;
                      }, 0))}
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-xl shadow-sm">
                    <p className="text-gray-500 font-medium mb-1 uppercase tracking-wide text-xs">Mano de Obra + Extras</p>
                    <p className="font-bold text-lg text-[var(--color-pastry-brown)]">
                      {formatCurrency((formData.partnerHours * formData.partnerHourlyRate) + formData.extraHelpCost + formData.extraExpenses)}
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-xl shadow-sm border-2 border-[var(--color-pastry-cream)]">
                    <p className="text-gray-500 font-medium mb-1 uppercase tracking-wide text-xs">Costo Total</p>
                    <p className="font-bold text-xl text-[var(--color-pastry-brown)]">
                      {formatCurrency(calculateEventTotalCost(formData, recipes, ingredients))}
                    </p>
                  </div>
                  <div className="bg-[var(--color-pastry-brown)] p-4 rounded-xl shadow-sm text-white">
                    <p className="text-white/80 font-medium mb-1 uppercase tracking-wide text-xs">Precio Sugerido</p>
                    <p className="font-bold text-2xl text-[var(--color-pastry-cream)]">
                      {formatCurrency(calculateEventPrice(formData, recipes, ingredients))}
                    </p>
                  </div>
                </div>
              </div>
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
                disabled={formData.recipes.length === 0}
                className="px-6 py-2.5 bg-[var(--color-pastry-brown)] text-white font-medium rounded-xl hover:bg-[var(--color-pastry-brown-hover)] transition-all shadow-sm hover:shadow-md disabled:opacity-50"
              >
                Guardar Evento
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Vista de Lista de Compras */}
      {viewingEvent && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="p-8 border-b border-[var(--color-pastry-cream)] flex justify-between items-center bg-[var(--color-pastry-bg)]">
              <div>
                <h3 className="text-3xl font-serif font-bold text-[var(--color-pastry-brown)]">Lista de Compras</h3>
                <p className="text-[var(--color-pastry-accent)] font-medium mt-1">{viewingEvent.name} • {viewingEvent.pax} personas</p>
              </div>
              <button
                onClick={() => setViewingEvent(null)}
                className="text-gray-400 hover:text-gray-600 bg-white p-2 rounded-full shadow-sm"
              >
                ✕
              </button>
            </div>
            <div className="p-8 overflow-auto flex-1">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b-2 border-[var(--color-pastry-cream)] text-sm uppercase tracking-wider text-gray-500">
                    <th className="pb-4 font-bold">Insumo</th>
                    <th className="pb-4 font-bold">Cantidad Necesaria</th>
                    <th className="pb-4 font-bold text-right">Costo Estimado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-pastry-cream)]">
                  {generateShoppingList(viewingEvent).map((item, idx) => (
                    <tr key={idx} className="hover:bg-[var(--color-pastry-bg)] transition-colors">
                      <td className="py-4 font-bold text-[var(--color-pastry-brown)]">{item.name}</td>
                      <td className="py-4 text-gray-600 font-medium">
                        {item.quantity.toFixed(2)} {item.unit}
                      </td>
                      <td className="py-4 text-right text-gray-600">
                        {formatCurrency(item.cost)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="border-t-2 border-[var(--color-pastry-cream)]">
                  <tr>
                    <td colSpan={2} className="pt-6 font-bold text-right text-gray-500 uppercase tracking-wide text-sm">
                      Total Insumos:
                    </td>
                    <td className="pt-6 font-bold text-right text-[var(--color-pastry-accent)] text-xl">
                      {formatCurrency(generateShoppingList(viewingEvent).reduce((t, i) => t + i.cost, 0))}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
            <div className="p-6 border-t border-[var(--color-pastry-cream)] flex justify-end bg-[var(--color-pastry-bg)]">
              <button
                onClick={() => window.print()}
                className="bg-[var(--color-pastry-brown)] text-white px-6 py-3 rounded-xl hover:bg-[var(--color-pastry-brown-hover)] transition-all flex items-center space-x-2 shadow-sm"
              >
                <Download size={18} />
                <span className="font-medium">Imprimir / PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-3xl shadow-sm border border-[var(--color-pastry-cream)] overflow-hidden">
        <div className="p-6 border-b border-[var(--color-pastry-cream)] flex items-center space-x-4 bg-[var(--color-pastry-bg)]/50">
          <Search className="text-[var(--color-pastry-accent)]" size={22} />
          <input
            type="text"
            placeholder="Buscar eventos por nombre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 outline-none bg-transparent text-lg placeholder:text-gray-400"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b-2 border-[var(--color-pastry-cream)] text-sm uppercase tracking-wider text-gray-500">
                <th className="p-5 font-bold">Evento</th>
                <th className="p-5 font-bold">Fecha</th>
                <th className="p-5 font-bold">Personas</th>
                <th className="p-5 font-bold">Costo Total</th>
                <th className="p-5 font-bold">Precio Sugerido</th>
                <th className="p-5 font-bold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-pastry-cream)]">
              {filteredEvents.map((event) => {
                const totalCost = calculateEventTotalCost(event, recipes, ingredients);
                const finalPrice = calculateEventPrice(event, recipes, ingredients);
                return (
                  <tr key={event.id} className="hover:bg-[var(--color-pastry-bg)] transition-colors group">
                    <td className="p-5 font-bold text-[var(--color-pastry-brown)]">{event.name}</td>
                    <td className="p-5 text-gray-600">{new Date(event.date).toLocaleDateString()}</td>
                    <td className="p-5 text-gray-600 font-medium">{event.pax}</td>
                    <td className="p-5 text-gray-600 font-bold">{formatCurrency(totalCost)}</td>
                    <td className="p-5 text-[var(--color-pastry-accent)] font-bold text-lg">{formatCurrency(finalPrice)}</td>
                    <td className="p-5 text-right space-x-2 transition-opacity">
                      <button
                        onClick={() => setViewingEvent(event)}
                        className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                        title="Ver Lista de Compras"
                      >
                        <FileText size={18} />
                      </button>
                      <button
                        onClick={() => handleEdit(event)}
                        className="p-2 text-gray-400 hover:text-[var(--color-pastry-accent)] hover:bg-[var(--color-pastry-cream)] rounded-xl transition-all"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => deleteEvent(event.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredEvents.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-gray-400 font-medium">
                    No se encontraron eventos. ¡Registra tu primer evento!
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
