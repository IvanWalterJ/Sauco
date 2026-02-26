import { BaseUnit } from './types';

export const convertToBaseUnit = (quantity: number, unit: BaseUnit): number => {
  if (unit === 'kg') return quantity * 1000;
  if (unit === 'l') return quantity * 1000;
  return quantity; // g, ml, u
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
