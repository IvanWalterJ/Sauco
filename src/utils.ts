import { BaseUnit, Ingredient, Recipe } from './types';

export const convertToBaseUnit = (quantity: number, unit: BaseUnit): number => {
  if (unit === 'kg') return quantity * 1000;
  if (unit === 'l') return quantity * 1000;
  return quantity; // g, ml, u
};

export const convertFromBaseUnit = (baseQuantity: number, targetUnit: BaseUnit): number => {
  if (targetUnit === 'kg') return baseQuantity / 1000;
  if (targetUnit === 'l') return baseQuantity / 1000;
  return baseQuantity; // g, ml, u
};

export const getBaseUnitType = (unit: BaseUnit): 'mass' | 'volume' | 'unit' => {
  if (['g', 'kg'].includes(unit)) return 'mass';
  if (['ml', 'l'].includes(unit)) return 'volume';
  return 'unit';
};

export const getCompatibleUnits = (unit: BaseUnit): BaseUnit[] => {
  const type = getBaseUnitType(unit);
  if (type === 'mass') return ['g', 'kg'];
  if (type === 'volume') return ['ml', 'l'];
  return ['u'];
};

export const calculateIngredientCost = (
  purchasedQuantity: number,
  purchasedUnit: BaseUnit,
  purchasedPrice: number,
  usedQuantity: number,
  usedUnit: BaseUnit
) => {
  const purchasedBaseQty = convertToBaseUnit(purchasedQuantity, purchasedUnit);
  const usedBaseQty = convertToBaseUnit(usedQuantity, usedUnit);

  const costPerBaseUnit = purchasedPrice / purchasedBaseQty;
  return costPerBaseUnit * usedBaseQty;
};

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
  }).format(amount);
};

export const calculateRecipeCost = (recipe: Recipe, ingredients: Ingredient[]) => {
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

export const calculateEventTotalCost = (event: any, recipes: Recipe[], ingredients: Ingredient[]) => {
  const ingredientsCost = event.recipes.reduce((total: number, er: any) => {
    const recipe = recipes.find((r) => r.id === er.recipeId);
    if (!recipe) return total;
    return total + calculateRecipeCost(recipe, ingredients) * er.multiplier;
  }, 0);
  const laborCost = (event.partnerHours * (event.partnerHourlyRate || 0)) + (event.extraHelpCost || 0);
  return ingredientsCost + laborCost + (event.extraExpenses || 0);
};

export const calculateEventPrice = (event: any, recipes: Recipe[], ingredients: Ingredient[]) => {
  const totalCost = calculateEventTotalCost(event, recipes, ingredients);
  return totalCost * (1 + (event.profitMargin || 0) / 100);
};

export const calculateOrderTotalCost = (order: any, recipes: Recipe[], ingredients: Ingredient[]) => {
  return order.items.reduce((total: number, item: any) => {
    const recipe = recipes.find(r => r.id === item.recipeId);
    if (!recipe) return total;
    return total + calculateRecipeCost(recipe, ingredients) * item.quantity;
  }, 0);
};

export const adjustStock = (
  ingredients: Ingredient[],
  recipes: Recipe[],
  items: { recipeId: string; multiplier: number }[],
  isDeducting: boolean
): Ingredient[] => {
  const newIngredients = [...ingredients];

  items.forEach(item => {
    const recipe = recipes.find(r => r.id === item.recipeId);
    if (!recipe) return;

    recipe.ingredients.forEach(ri => {
      const index = newIngredients.findIndex(i => i.id === ri.ingredientId);
      if (index !== -1) {
        const ing = { ...newIngredients[index] };
        const usedBaseQty = convertToBaseUnit(ri.quantity, ri.unit) * item.multiplier;
        const usedInIngUnit = convertFromBaseUnit(usedBaseQty, ing.unit);

        if (isDeducting) {
          ing.quantity = Math.max(0, ing.quantity - usedInIngUnit);
        } else {
          ing.quantity += usedInIngUnit;
        }

        newIngredients[index] = ing;
      }
    });
  });

  return newIngredients;
};
