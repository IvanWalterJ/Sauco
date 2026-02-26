import React, { createContext, useContext, useEffect, useState } from 'react';
import { Event, Ingredient, Recipe } from './types';

interface AppState {
  ingredients: Ingredient[];
  recipes: Recipe[];
  events: Event[];
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
}

const defaultState: AppState = {
  ingredients: [],
  recipes: [],
  events: [],
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('pasteleria-pro-data');
    if (saved) {
      try {
        return JSON.parse(saved);
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
      events: [...prev.events, { ...event, id: generateId() }],
    }));
  };

  const updateEvent = (id: string, event: Omit<Event, 'id'>) => {
    setState((prev) => ({
      ...prev,
      events: prev.events.map((e) => (e.id === id ? { ...event, id } : e)),
    }));
  };

  const deleteEvent = (id: string) => {
    setState((prev) => ({
      ...prev,
      events: prev.events.filter((e) => e.id !== id),
    }));
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
