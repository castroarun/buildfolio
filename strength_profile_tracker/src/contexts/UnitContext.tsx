'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { WeightUnit } from '@/types'
import { getUnitPreference, setUnitPreference } from '@/lib/utils/units'

interface UnitContextType {
  unit: WeightUnit
  toggleUnit: () => void
  setUnit: (unit: WeightUnit) => void
}

const UnitContext = createContext<UnitContextType | undefined>(undefined)

export function UnitProvider({ children }: { children: ReactNode }) {
  const [unit, setUnitState] = useState<WeightUnit>('kg')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setUnitState(getUnitPreference())
    setMounted(true)
  }, [])

  const toggleUnit = () => {
    const newUnit = unit === 'kg' ? 'lbs' : 'kg'
    setUnitState(newUnit)
    setUnitPreference(newUnit)
  }

  const setUnit = (newUnit: WeightUnit) => {
    setUnitState(newUnit)
    setUnitPreference(newUnit)
  }

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return <>{children}</>
  }

  return (
    <UnitContext.Provider value={{ unit, toggleUnit, setUnit }}>
      {children}
    </UnitContext.Provider>
  )
}

export function useUnit() {
  const context = useContext(UnitContext)
  if (context === undefined) {
    throw new Error('useUnit must be used within a UnitProvider')
  }
  return context
}
