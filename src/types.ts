export type BaseUnit = 'g' | 'kg' | 'ml' | 'l' | 'u';

export interface Ingredient {
  id: string;
  name: string;
  price: number;
  quantity: number;
  unit: BaseUnit;
}

export interface RecipeIngredient {
  ingredientId: string;
  quantity: number;
  unit: BaseUnit;
}

export interface Recipe {
  id: string;
  name: string;
  yieldAmount: number;
  yieldUnit: string;
  ingredients: RecipeIngredient[];
  preparationTime: number; // minutes
}

export interface EventRecipe {
  recipeId: string;
  multiplier: number;
}

export interface Event {
  id: string;
  name: string;
  date: string;
  pax: number;
  recipes: EventRecipe[];
  partnerHours: number;
  partnerHourlyRate: number;
  extraHelpCost: number;
  profitMargin: number; // percentage
  extraExpenses: number;
}
