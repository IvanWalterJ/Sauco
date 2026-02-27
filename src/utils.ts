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
