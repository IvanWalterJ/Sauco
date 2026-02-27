import React, { createContext, useContext, useEffect, useState } from 'react';
import { Event, Ingredient, Order, Recipe } from './types';
import { adjustStock } from './utils';

interface AppState {
  ingredients: Ingredient[];
  recipes: Recipe[];
  events: Event[];
  orders: Order[];
}

interface AppContextType extends AppState {
  addIngredient: (ingredient: Omit<Ingredient, 'id'>) => void;
  updateIngredient: (id: string, ingredient: Omit<Ingredient, 'id'>) => void;
  deleteIngredient: (id: string) => void;
  addRecipe: (recipe: Omit<Recipe, 'id'>) => void;
  updateRecipe: (id: string, recipe: Omit<Recipe, 'id'>) => void;
  deleteRecipe: (id: string) => void;
  addEvent: (event: Omit<Event, 'id'>) => void;
  updateEvent: (id: string, event: Omit<Event, 'id'>) => void;
  deleteEvent: (id: string) => void;
  addOrder: (order: Omit<Order, 'id'>) => void;
  updateOrder: (id: string, order: Omit<Order, 'id'>) => void;
  deleteOrder: (id: string) => void;
}

const defaultState: AppState = {
  ingredients: [],
  recipes: [],
  events: [],
  orders: [],
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('pasteleria-pro-data');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.ingredients) {
          parsed.ingredients = parsed.ingredients.map((i: any) => ({
            ...i,
            purchasedQuantity: i.purchasedQuantity ?? i.quantity,
            quantity: i.quantity ?? 0
          }));
        }
        return { ...defaultState, ...parsed };
      } catch (e) {
        console.error('Failed to parse saved data', e);
      }
    }
    return defaultState;
  });

  useEffect(() => {
    localStorage.setItem('pasteleria-pro-data', JSON.stringify(state));
  }, [state]);

  const generateId = () => crypto.randomUUID();

  const addIngredient = (ingredient: Omit<Ingredient, 'id'>) => {
    setState((prev) => ({
      ...prev,
      ingredients: [...prev.ingredients, { ...ingredient, id: generateId() }],
    }));
  };

  const updateIngredient = (id: string, ingredient: Omit<Ingredient, 'id'>) => {
    setState((prev) => ({
      ...prev,
      ingredients: prev.ingredients.map((i) => (i.id === id ? { ...ingredient, id } : i)),
    }));
  };

  const deleteIngredient = (id: string) => {
    setState((prev) => ({
      ...prev,
      ingredients: prev.ingredients.filter((i) => i.id !== id),
    }));
  };

  const addRecipe = (recipe: Omit<Recipe, 'id'>) => {
    setState((prev) => ({
      ...prev,
      recipes: [...prev.recipes, { ...recipe, id: generateId() }],
    }));
  };

  const updateRecipe = (id: string, recipe: Omit<Recipe, 'id'>) => {
    setState((prev) => ({
      ...prev,
      recipes: prev.recipes.map((r) => (r.id === id ? { ...recipe, id } : r)),
    }));
  };

  const deleteRecipe = (id: string) => {
    setState((prev) => ({
      ...prev,
      recipes: prev.recipes.filter((r) => r.id !== id),
    }));
  };

  const addEvent = (event: Omit<Event, 'id'>) => {
    setState((prev) => ({
      ...prev,
      ingredients: adjustStock(prev.ingredients, prev.recipes, event.recipes, true),
      events: [...prev.events, { ...event, id: generateId() }],
    }));
  };

  const updateEvent = (id: string, event: Omit<Event, 'id'>) => {
    setState((prev) => {
      const oldEvent = prev.events.find(e => e.id === id);
      let newIngredients = prev.ingredients;
      if (oldEvent) {
        newIngredients = adjustStock(newIngredients, prev.recipes, oldEvent.recipes, false);
      }
      newIngredients = adjustStock(newIngredients, prev.recipes, event.recipes, true);

      return {
        ...prev,
        ingredients: newIngredients,
        events: prev.events.map((e) => (e.id === id ? { ...event, id } : e)),
      };
    });
  };

  const deleteEvent = (id: string) => {
    setState((prev) => {
      const oldEvent = prev.events.find(e => e.id === id);
      const newIngredients = oldEvent ? adjustStock(prev.ingredients, prev.recipes, oldEvent.recipes, false) : prev.ingredients;
      return {
        ...prev,
        ingredients: newIngredients,
        events: prev.events.filter((e) => e.id !== id),
      };
    });
  };

  const addOrder = (order: Omit<Order, 'id'>) => {
    setState((prev) => {
      const orderItems = order.items.map(i => ({ recipeId: i.recipeId, multiplier: i.quantity }));
      return {
        ...prev,
        ingredients: adjustStock(prev.ingredients, prev.recipes, orderItems, true),
        orders: [...prev.orders, { ...order, id: generateId() }],
      };
    });
  };

  const updateOrder = (id: string, order: Omit<Order, 'id'>) => {
    setState((prev) => {
      const oldOrder = prev.orders.find(o => o.id === id);
      let newIngredients = prev.ingredients;
      if (oldOrder) {
        const oldOrderItems = oldOrder.items.map(i => ({ recipeId: i.recipeId, multiplier: i.quantity }));
        newIngredients = adjustStock(newIngredients, prev.recipes, oldOrderItems, false);
      }
      const newOrderItems = order.items.map(i => ({ recipeId: i.recipeId, multiplier: i.quantity }));
      newIngredients = adjustStock(newIngredients, prev.recipes, newOrderItems, true);

      return {
        ...prev,
        ingredients: newIngredients,
        orders: prev.orders.map((o) => (o.id === id ? { ...order, id } : o)),
      };
    });
  };

  const deleteOrder = (id: string) => {
    setState((prev) => {
      const oldOrder = prev.orders.find(o => o.id === id);
      let newIngredients = prev.ingredients;
      if (oldOrder) {
        const oldOrderItems = oldOrder.items.map(i => ({ recipeId: i.recipeId, multiplier: i.quantity }));
        newIngredients = adjustStock(newIngredients, prev.recipes, oldOrderItems, false);
      }
      return {
        ...prev,
        ingredients: newIngredients,
        orders: prev.orders.filter((o) => o.id !== id),
      };
    });
  };

  return (
    <AppContext.Provider
      value={{
        ...state,
        addIngredient,
        updateIngredient,
        deleteIngredient,
        addRecipe,
        updateRecipe,
        deleteRecipe,
        addEvent,
        updateEvent,
        deleteEvent,
        addOrder,
        updateOrder,
        deleteOrder,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
