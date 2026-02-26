import React, { useState } from 'react';
import { AppProvider } from './store';
import { LayoutDashboard, ShoppingBag, BookOpen, CalendarHeart, Croissant } from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { Ingredients } from './components/Ingredients';
import { Recipes } from './components/Recipes';
import { Events } from './components/Events';

type Tab = 'dashboard' | 'ingredients' | 'recipes' | 'events';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'ingredients':
        return <Ingredients />;
      case 'recipes':
        return <Recipes />;
      case 'events':
        return <Events />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <AppProvider>
      <div className="min-h-screen bg-[var(--color-pastry-bg)] text-[var(--color-pastry-text)] flex flex-col md:flex-row font-sans">
        {/* Sidebar */}
        <aside className="w-full md:w-64 bg-white border-r border-[var(--color-pastry-cream)] flex flex-col shadow-sm z-10">
          <div className="p-8 border-b border-[var(--color-pastry-cream)] flex flex-col items-center">
            <div className="w-16 h-16 bg-[var(--color-pastry-cream)] rounded-full flex items-center justify-center mb-4 text-[var(--color-pastry-brown)]">
              <Croissant size={32} strokeWidth={1.5} />
            </div>
            <h1 className="text-4xl font-serif font-bold text-[var(--color-pastry-brown)] text-center tracking-tight">Sauco</h1>
            <p className="text-xs text-[var(--color-pastry-accent)] mt-1 font-semibold tracking-widest uppercase opacity-80">Pastelería Artesanal</p>
          </div>
          <nav className="flex-1 p-6 space-y-3">
            <NavItem
              icon={<LayoutDashboard size={20} />}
              label="Dashboard"
              active={activeTab === 'dashboard'}
              onClick={() => setActiveTab('dashboard')}
            />
            <NavItem
              icon={<ShoppingBag size={20} />}
              label="Insumos"
              active={activeTab === 'ingredients'}
              onClick={() => setActiveTab('ingredients')}
            />
            <NavItem
              icon={<BookOpen size={20} />}
              label="Recetas"
              active={activeTab === 'recipes'}
              onClick={() => setActiveTab('recipes')}
            />
            <NavItem
              icon={<CalendarHeart size={20} />}
              label="Eventos"
              active={activeTab === 'events'}
              onClick={() => setActiveTab('events')}
            />
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 md:p-12 overflow-auto">
          <div className="max-w-6xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </AppProvider>
  );
}

function NavItem({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center space-x-4 px-5 py-3.5 rounded-2xl transition-all duration-200 ${active
          ? 'bg-[var(--color-pastry-brown)] text-white shadow-md transform scale-[1.02]'
          : 'text-[var(--color-pastry-text)] hover:bg-[var(--color-pastry-cream)] hover:text-[var(--color-pastry-brown)]'
        }`}
    >
      {icon}
      <span className="font-medium text-[15px] tracking-wide">{label}</span>
    </button>
  );
}
