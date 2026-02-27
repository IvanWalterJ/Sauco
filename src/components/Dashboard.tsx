import React from 'react';
import { useAppContext } from '../store';
import { ShoppingBag, BookOpen, CalendarHeart, TrendingUp, Package } from 'lucide-react';
import { motion } from 'motion/react';

export function Dashboard() {
  const { ingredients, recipes, events, orders } = useAppContext();

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

      const laborCost = (event.partnerHours * event.partnerHourlyRate) + event.extraHelpCost;
      return total + recipeCost * er.multiplier;
    }, 0);
    const laborCost = (event.partnerHours * event.partnerHourlyRate) + event.extraHelpCost;
    return ingredientsCost + laborCost + (event.extraExpenses || 0);
  };

  const calculateEventPrice = (event: any) => {
    const totalCost = calculateEventTotalCost(event);
    return totalCost * (1 + event.profitMargin / 100);
  };

  const totalOrdersRevenue = orders.reduce((total, order) => total + order.totalPrice, 0);

  const totalRevenue = events.reduce((total, event) => total + calculateEventPrice(event), 0) + totalOrdersRevenue;
  const totalCost = events.reduce((total, event) => total + calculateEventTotalCost(event), 0);
  const totalProfit = totalRevenue - totalCost;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h2 className="text-4xl font-serif font-bold text-[var(--color-pastry-brown)] mb-2">Resumen General</h2>
          <p className="text-stone-500 font-medium tracking-wide">Panel de control de tu pastelería</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard
          icon={<ShoppingBag className="text-amber-600" size={24} />}
          label="Insumos"
          value={ingredients.length.toString()}
          bgColor="bg-amber-50"
          index={0}
        />
        <StatCard
          icon={<BookOpen className="text-emerald-600" size={24} />}
          label="Recetas"
          value={recipes.length.toString()}
          bgColor="bg-emerald-50"
          index={1}
        />
        <StatCard
          icon={<CalendarHeart className="text-rose-600" size={24} />}
          label="Eventos"
          value={events.length.toString()}
          bgColor="bg-rose-50"
          index={2}
        />
        <StatCard
          icon={<Package className="text-indigo-600" size={24} />}
          label="Pedidos"
          value={orders.length.toString()}
          bgColor="bg-indigo-50"
          index={3}
        />
        <StatCard
          icon={<TrendingUp className="text-blue-600" size={24} />}
          label="Ganancia Total"
          value={`$${totalProfit.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          bgColor="bg-blue-50"
          index={4}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-white p-8 rounded-[2rem] premium-shadow border border-[var(--color-pastry-cream)]"
        >
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-serif font-bold text-[var(--color-pastry-brown)]">Próximos Eventos</h3>
            <span className="px-3 py-1 bg-[var(--color-pastry-cream)] text-[var(--color-pastry-brown)] text-xs font-bold rounded-full uppercase tracking-tighter">Agenda</span>
          </div>
          {upcomingEvents.length > 0 ? (
            <div className="space-y-4">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="flex justify-between items-center p-5 bg-[var(--color-pastry-bg)] rounded-2xl border border-[var(--color-pastry-cream)] hover:bg-white hover:premium-shadow transition-all duration-300">
                  <div>
                    <p className="font-bold text-[var(--color-pastry-brown)] text-lg leading-none mb-1">{event.name}</p>
                    <p className="text-sm text-stone-500 font-medium">
                      {new Date(event.date).toLocaleDateString('es-AR', { day: '2-digit', month: 'long' })} • {event.pax} pax
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[var(--color-pastry-accent)] text-lg">${calculateEventPrice(event).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    <p className="text-xs text-stone-500 font-medium">Margen: {event.profitMargin}%</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-[var(--color-pastry-bg)] rounded-2xl border border-dashed border-[var(--color-pastry-cream)]">
              <CalendarHeart className="mx-auto text-stone-300 mb-3" size={48} strokeWidth={1} />
              <p className="text-stone-500 font-medium">No hay eventos próximos agendados.</p>
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="bg-white p-8 rounded-[2rem] premium-shadow border border-[var(--color-pastry-cream)]"
        >
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-serif font-bold text-[var(--color-pastry-brown)]">Resumen Financiero</h3>
            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full uppercase tracking-tighter">Salud Financiera</span>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-5 bg-[var(--color-pastry-bg)] rounded-2xl border border-[var(--color-pastry-cream)]">
              <span className="text-stone-600 font-medium">Ingresos Totales Estimados</span>
              <span className="font-bold text-[var(--color-pastry-brown)] text-lg">${totalRevenue.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between items-center p-5 bg-[var(--color-pastry-bg)] rounded-2xl border border-[var(--color-pastry-cream)]">
              <span className="text-stone-600 font-medium">Inversión en Costos</span>
              <span className="font-bold text-[var(--color-pastry-brown)] text-lg">${totalCost.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between items-center p-6 bg-amber-50 rounded-2xl border border-amber-100 mt-6 overflow-hidden relative">
              <div className="absolute right-0 top-0 w-24 h-full bg-gradient-to-l from-amber-100 to-transparent pointer-events-none opacity-50"></div>
              <div className="z-10">
                <p className="text-amber-800 text-sm font-bold uppercase tracking-widest mb-1">Ganancia Neta</p>
                <p className="font-serif font-bold text-amber-700 text-3xl tracking-tight">${totalProfit.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>
              <div className="p-3 bg-white/60 backdrop-blur-sm rounded-xl text-amber-600">
                <TrendingUp size={28} />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

function StatCard({ icon, label, value, bgColor, index }: { icon: React.ReactNode; label: string; value: string; bgColor: string; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 * index }}
      whileHover={{ y: -5 }}
      className="bg-white p-7 rounded-[2rem] premium-shadow border border-[var(--color-pastry-cream)] flex items-center space-x-5 transition-all duration-300"
    >
      <div className={`p-5 rounded-2xl ${bgColor} flex-shrink-0`}>
        {icon}
      </div>
      <div>
        <p className="text-xs text-stone-500 font-bold uppercase tracking-widest mb-1">{label}</p>
        <p className="text-2xl font-serif font-bold text-[var(--color-pastry-brown)] tracking-tight">{value}</p>
      </div>
    </motion.div>
  );
}
