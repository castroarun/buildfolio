import { WeightUnit, KG_TO_LBS, LBS_TO_KG } from '@/types'

const STORAGE_KEY = 'strength-tracker-unit-preference'

/**
 * Convert kg to lbs
 */
export function kgToLbs(kg: number): number {
  return Math.round(kg * KG_TO_LBS * 10) / 10
}

/**
 * Convert lbs to kg
 */
export function lbsToKg(lbs: number): number {
  return Math.round(lbs * LBS_TO_KG * 10) / 10
}

/**
 * Format weight with unit
 */
export function formatWeight(weightKg: number, unit: WeightUnit): string {
  if (unit === 'lbs') {
    return `${kgToLbs(weightKg)} lbs`
  }
  return `${weightKg} kg`
}

/**
 * Format weight number only (no unit suffix)
 */
export function formatWeightValue(weightKg: number, unit: WeightUnit): number {
  if (unit === 'lbs') {
    return kgToLbs(weightKg)
  }
  return weightKg
}

/**
 * Get unit preference from localStorage
 */
export function getUnitPreference(): WeightUnit {
  if (typeof window === 'undefined') return 'kg'
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'lbs') return 'lbs'
  return 'kg'
}

/**
 * Save unit preference to localStorage
 */
export function setUnitPreference(unit: WeightUnit): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, unit)
}
