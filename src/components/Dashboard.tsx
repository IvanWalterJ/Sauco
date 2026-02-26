import React from 'react';
import { useAppContext } from '../store';
import { ShoppingBag, BookOpen, CalendarHeart, TrendingUp } from 'lucide-react';

export function Dashboard() {
  const { ingredients, recipes, events } = useAppContext();

  const upcomingEvents = events
    .filter((e) => new Date(e.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  const calculateEventTotalCost = (event: any) => {
    const ingredientsCost = event.recipes.reduce((total: number, er: any) => {
      const recipe = recipes.find((r) => r.id === er.recipeId);
      if (!recipe) return total;
      
      const recipeCost = recipe.ingredients.reduce((rTotal, ri) => {
        const ingredient = ingredients.find((i) => i.id === ri.ingredientId);
        if (!ingredient) return rTotal;
        const costPerUnit = ingredient.price / ingredient.quantity;
        return rTotal + costPerUnit * ri.quantity;
      }, 0);

      return total + recipeCost * er.multiplier;
    }, 0);
    return ingredientsCost + event.laborCost + event.extraExpenses;
  };

  const calculateEventPrice = (event: any) => {
    const totalCost = calculateEventTotalCost(event);
    return totalCost * (1 + event.profitMargin / 100);
  };

  const totalRevenue = events.reduce((total, event) => total + calculateEventPrice(event), 0);
  const totalCost = events.reduce((total, event) => total + calculateEventTotalCost(event), 0);
  const totalProfit = totalRevenue - totalCost;

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-serif font-bold text-stone-800">Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<ShoppingBag className="text-amber-600" size={24} />}
          label="Insumos Registrados"
          value={ingredients.length.toString()}
          bgColor="bg-amber-50"
        />
        <StatCard
          icon={<BookOpen className="text-emerald-600" size={24} />}
          label="Recetas Creadas"
          value={recipes.length.toString()}
          bgColor="bg-emerald-50"
        />
        <StatCard
          icon={<CalendarHeart className="text-rose-600" size={24} />}
          label="Eventos Totales"
          value={events.length.toString()}
          bgColor="bg-rose-50"
        />
        <StatCard
          icon={<TrendingUp className="text-blue-600" size={24} />}
          label="Ganancia Estimada"
          value={`$${totalProfit.toFixed(2)}`}
          bgColor="bg-blue-50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200">
          <h3 className="text-xl font-serif font-bold text-stone-800 mb-4">Próximos Eventos</h3>
          {upcomingEvents.length > 0 ? (
            <div className="space-y-4">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="flex justify-between items-center p-4 bg-stone-50 rounded-xl border border-stone-100">
                  <div>
                    <p className="font-medium text-stone-800">{event.name}</p>
                    <p className="text-sm text-stone-500">{new Date(event.date).toLocaleDateString()} • {event.pax} pax</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-amber-600">${calculateEventPrice(event).toFixed(2)}</p>
                    <p className="text-xs text-stone-500">Costo: ${calculateEventTotalCost(event).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-stone-500 text-center py-8">No hay eventos próximos.</p>
          )}
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200">
          <h3 className="text-xl font-serif font-bold text-stone-800 mb-4">Resumen Financiero</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-stone-50 rounded-xl border border-stone-100">
              <span className="text-stone-600">Ingresos Totales Estimados</span>
              <span className="font-bold text-stone-800">${totalRevenue.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-stone-50 rounded-xl border border-stone-100">
              <span className="text-stone-600">Costos Totales</span>
              <span className="font-bold text-stone-800">${totalCost.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-amber-50 rounded-xl border border-amber-100">
              <span className="font-medium text-amber-900">Ganancia Neta</span>
              <span className="font-bold text-amber-600">${totalProfit.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, bgColor }: { icon: React.ReactNode; label: string; value: string; bgColor: string }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200 flex items-center space-x-4">
      <div className={`p-4 rounded-xl ${bgColor}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-stone-500 font-medium">{label}</p>
        <p className="text-2xl font-bold text-stone-800">{value}</p>
      </div>
    </div>
  );
}
