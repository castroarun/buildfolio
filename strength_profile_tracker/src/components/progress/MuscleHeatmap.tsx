'use client'

import { useState } from 'react'
import { BodyPart } from '@/types'

interface MuscleIntensity {
  bodyPart: BodyPart
  intensity: number // 0-100
  workoutCount: number
}

interface MuscleHeatmapProps {
  data: MuscleIntensity[]
}

// Map body parts to detailed muscle groups for display
const MUSCLE_DETAILS: Record<BodyPart, { name: string; muscles: string[] }> = {
  chest: { name: 'Chest', muscles: ['Pectoralis Major', 'Pectoralis Minor'] },
  back: { name: 'Back', muscles: ['Lats', 'Rhomboids', 'Traps', 'Erector Spinae'] },
  shoulders: { name: 'Shoulders', muscles: ['Anterior Delt', 'Lateral Delt', 'Posterior Delt'] },
  legs: { name: 'Legs', muscles: ['Quadriceps', 'Hamstrings', 'Glutes', 'Calves'] },
  arms: { name: 'Arms', muscles: ['Biceps', 'Triceps', 'Forearms'] },
  core: { name: 'Core', muscles: ['Rectus Abdominis', 'Obliques'] }
}

export default function MuscleHeatmap({ data }: MuscleHeatmapProps) {
  const [view, setView] = useState<'front' | 'back'>('front')
  const [selectedMuscle, setSelectedMuscle] = useState<BodyPart | null>(null)

  // Get intensity for a body part (0-100)
  const getIntensity = (bodyPart: BodyPart): number => {
    const muscle = data.find(d => d.bodyPart === bodyPart)
    return muscle?.intensity || 0
  }

  const getWorkoutCount = (bodyPart: BodyPart): number => {
    const muscle = data.find(d => d.bodyPart === bodyPart)
    return muscle?.workoutCount || 0
  }

  // Generate color based on intensity (0 = gray, 100 = bright red/orange)
  const getColor = (intensity: number): string => {
    if (intensity === 0) return '#374151' // gray-700
    if (intensity < 25) return '#065F46' // emerald-800
    if (intensity < 50) return '#059669' // emerald-600
    if (intensity < 75) return '#F59E0B' // amber-500
    return '#DC2626' // red-600
  }

  const getGlowColor = (intensity: number): string => {
    if (intensity === 0) return 'transparent'
    if (intensity < 25) return 'rgba(6, 95, 70, 0.3)'
    if (intensity < 50) return 'rgba(5, 150, 105, 0.4)'
    if (intensity < 75) return 'rgba(245, 158, 11, 0.5)'
    return 'rgba(220, 38, 38, 0.6)'
  }

  const handleMuscleClick = (bodyPart: BodyPart) => {
    setSelectedMuscle(selectedMuscle === bodyPart ? null : bodyPart)
  }

  const selectedData = selectedMuscle ? {
    ...MUSCLE_DETAILS[selectedMuscle],
    intensity: getIntensity(selectedMuscle),
    workoutCount: getWorkoutCount(selectedMuscle)
  } : null

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
          Muscle Heatmap
        </h3>
        <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-0.5">
          <button
            onClick={() => setView('front')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              view === 'front'
                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            Front
          </button>
          <button
            onClick={() => setView('back')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              view === 'back'
                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            Back
          </button>
        </div>
      </div>

      <div className="flex justify-center">
        <svg
          viewBox="0 0 200 400"
          className="w-48 h-auto"
          style={{ filter: 'drop-shadow(0 0 10px rgba(0,0,0,0.2))' }}
        >
          <defs>
            {/* Glow filters for each intensity level */}
            <filter id="glow-low" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="glow-high" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Body outline - clean silhouette */}
          <path
            d="M100,15
               C115,15 125,25 125,40 C125,55 115,65 100,65 C85,65 75,55 75,40 C75,25 85,15 100,15
               M100,65 L100,75
               M60,85 L100,75 L140,85
               M60,85 C50,95 45,130 50,170 L55,170
               M140,85 C150,95 155,130 150,170 L145,170
               M55,170 L45,230 L50,230
               M145,170 L155,230 L150,230
               M70,180 L70,200 L130,200 L130,180
               M75,200 L65,380 L85,385 L95,260
               M125,200 L135,380 L115,385 L105,260"
            fill="none"
            stroke="#4B5563"
            strokeWidth="1.5"
            opacity="0.3"
          />

          {view === 'front' ? (
            <>
              {/* FRONT VIEW */}

              {/* Head (no muscle) */}
              <ellipse cx="100" cy="40" rx="22" ry="25" fill="#1F2937" opacity="0.4" />

              {/* Neck */}
              <rect x="90" y="62" width="20" height="15" fill="#1F2937" opacity="0.3" rx="3" />

              {/* Shoulders (Deltoids) */}
              <ellipse
                cx="55" cy="95"
                rx="18" ry="14"
                fill={getColor(getIntensity('shoulders'))}
                opacity="0.85"
                className="cursor-pointer transition-all hover:opacity-100"
                onClick={() => handleMuscleClick('shoulders')}
                filter={getIntensity('shoulders') > 50 ? 'url(#glow-high)' : 'url(#glow-low)'}
              />
              <ellipse
                cx="145" cy="95"
                rx="18" ry="14"
                fill={getColor(getIntensity('shoulders'))}
                opacity="0.85"
                className="cursor-pointer transition-all hover:opacity-100"
                onClick={() => handleMuscleClick('shoulders')}
                filter={getIntensity('shoulders') > 50 ? 'url(#glow-high)' : 'url(#glow-low)'}
              />

              {/* Chest (Pectorals) */}
              <path
                d="M65,100 Q100,95 135,100 Q140,120 100,135 Q60,120 65,100"
                fill={getColor(getIntensity('chest'))}
                opacity="0.85"
                className="cursor-pointer transition-all hover:opacity-100"
                onClick={() => handleMuscleClick('chest')}
                filter={getIntensity('chest') > 50 ? 'url(#glow-high)' : 'url(#glow-low)'}
              />

              {/* Arms - Biceps */}
              <ellipse
                cx="45" cy="135"
                rx="10" ry="25"
                fill={getColor(getIntensity('arms'))}
                opacity="0.85"
                className="cursor-pointer transition-all hover:opacity-100"
                onClick={() => handleMuscleClick('arms')}
                filter={getIntensity('arms') > 50 ? 'url(#glow-high)' : 'url(#glow-low)'}
              />
              <ellipse
                cx="155" cy="135"
                rx="10" ry="25"
                fill={getColor(getIntensity('arms'))}
                opacity="0.85"
                className="cursor-pointer transition-all hover:opacity-100"
                onClick={() => handleMuscleClick('arms')}
                filter={getIntensity('arms') > 50 ? 'url(#glow-high)' : 'url(#glow-low)'}
              />

              {/* Forearms */}
              <ellipse cx="40" cy="185" rx="8" ry="25" fill="#1F2937" opacity="0.4" />
              <ellipse cx="160" cy="185" rx="8" ry="25" fill="#1F2937" opacity="0.4" />

              {/* Core (Abs) */}
              <rect
                x="80" y="138"
                width="40" height="60"
                rx="5"
                fill={getColor(getIntensity('core'))}
                opacity="0.85"
                className="cursor-pointer transition-all hover:opacity-100"
                onClick={() => handleMuscleClick('core')}
                filter={getIntensity('core') > 50 ? 'url(#glow-high)' : 'url(#glow-low)'}
              />
              {/* Ab lines */}
              <line x1="100" y1="145" x2="100" y2="192" stroke="#111827" strokeWidth="1" opacity="0.3" />
              <line x1="83" y1="155" x2="117" y2="155" stroke="#111827" strokeWidth="0.5" opacity="0.3" />
              <line x1="83" y1="170" x2="117" y2="170" stroke="#111827" strokeWidth="0.5" opacity="0.3" />
              <line x1="83" y1="185" x2="117" y2="185" stroke="#111827" strokeWidth="0.5" opacity="0.3" />

              {/* Legs - Quads */}
              <ellipse
                cx="80" cy="260"
                rx="20" ry="50"
                fill={getColor(getIntensity('legs'))}
                opacity="0.85"
                className="cursor-pointer transition-all hover:opacity-100"
                onClick={() => handleMuscleClick('legs')}
                filter={getIntensity('legs') > 50 ? 'url(#glow-high)' : 'url(#glow-low)'}
              />
              <ellipse
                cx="120" cy="260"
                rx="20" ry="50"
                fill={getColor(getIntensity('legs'))}
                opacity="0.85"
                className="cursor-pointer transition-all hover:opacity-100"
                onClick={() => handleMuscleClick('legs')}
                filter={getIntensity('legs') > 50 ? 'url(#glow-high)' : 'url(#glow-low)'}
              />

              {/* Lower Legs / Calves */}
              <ellipse cx="75" cy="345" rx="12" ry="30" fill="#1F2937" opacity="0.4" />
              <ellipse cx="125" cy="345" rx="12" ry="30" fill="#1F2937" opacity="0.4" />
            </>
          ) : (
            <>
              {/* BACK VIEW */}

              {/* Head */}
              <ellipse cx="100" cy="40" rx="22" ry="25" fill="#1F2937" opacity="0.4" />

              {/* Neck */}
              <rect x="90" y="62" width="20" height="15" fill="#1F2937" opacity="0.3" rx="3" />

              {/* Shoulders (Rear Delts) */}
              <ellipse
                cx="55" cy="95"
                rx="18" ry="14"
                fill={getColor(getIntensity('shoulders'))}
                opacity="0.85"
                className="cursor-pointer transition-all hover:opacity-100"
                onClick={() => handleMuscleClick('shoulders')}
                filter={getIntensity('shoulders') > 50 ? 'url(#glow-high)' : 'url(#glow-low)'}
              />
              <ellipse
                cx="145" cy="95"
                rx="18" ry="14"
                fill={getColor(getIntensity('shoulders'))}
                opacity="0.85"
                className="cursor-pointer transition-all hover:opacity-100"
                onClick={() => handleMuscleClick('shoulders')}
                filter={getIntensity('shoulders') > 50 ? 'url(#glow-high)' : 'url(#glow-low)'}
              />

              {/* Upper Back - Traps */}
              <path
                d="M75,75 L100,70 L125,75 L130,100 L100,95 L70,100 Z"
                fill={getColor(getIntensity('back'))}
                opacity="0.85"
                className="cursor-pointer transition-all hover:opacity-100"
                onClick={() => handleMuscleClick('back')}
                filter={getIntensity('back') > 50 ? 'url(#glow-high)' : 'url(#glow-low)'}
              />

              {/* Lats */}
              <path
                d="M65,100 L70,180 L100,185 L130,180 L135,100 L100,95 Z"
                fill={getColor(getIntensity('back'))}
                opacity="0.85"
                className="cursor-pointer transition-all hover:opacity-100"
                onClick={() => handleMuscleClick('back')}
                filter={getIntensity('back') > 50 ? 'url(#glow-high)' : 'url(#glow-low)'}
              />
              {/* Spine hint */}
              <line x1="100" y1="70" x2="100" y2="185" stroke="#111827" strokeWidth="1.5" opacity="0.3" />

              {/* Arms - Triceps */}
              <ellipse
                cx="45" cy="135"
                rx="10" ry="25"
                fill={getColor(getIntensity('arms'))}
                opacity="0.85"
                className="cursor-pointer transition-all hover:opacity-100"
                onClick={() => handleMuscleClick('arms')}
                filter={getIntensity('arms') > 50 ? 'url(#glow-high)' : 'url(#glow-low)'}
              />
              <ellipse
                cx="155" cy="135"
                rx="10" ry="25"
                fill={getColor(getIntensity('arms'))}
                opacity="0.85"
                className="cursor-pointer transition-all hover:opacity-100"
                onClick={() => handleMuscleClick('arms')}
                filter={getIntensity('arms') > 50 ? 'url(#glow-high)' : 'url(#glow-low)'}
              />

              {/* Forearms */}
              <ellipse cx="40" cy="185" rx="8" ry="25" fill="#1F2937" opacity="0.4" />
              <ellipse cx="160" cy="185" rx="8" ry="25" fill="#1F2937" opacity="0.4" />

              {/* Lower Back / Core */}
              <rect
                x="80" y="185"
                width="40" height="25"
                rx="3"
                fill={getColor(getIntensity('core'))}
                opacity="0.6"
                className="cursor-pointer transition-all hover:opacity-100"
                onClick={() => handleMuscleClick('core')}
              />

              {/* Glutes */}
              <ellipse
                cx="85" cy="220"
                rx="18" ry="15"
                fill={getColor(getIntensity('legs'))}
                opacity="0.85"
                className="cursor-pointer transition-all hover:opacity-100"
                onClick={() => handleMuscleClick('legs')}
                filter={getIntensity('legs') > 50 ? 'url(#glow-high)' : 'url(#glow-low)'}
              />
              <ellipse
                cx="115" cy="220"
                rx="18" ry="15"
                fill={getColor(getIntensity('legs'))}
                opacity="0.85"
                className="cursor-pointer transition-all hover:opacity-100"
                onClick={() => handleMuscleClick('legs')}
                filter={getIntensity('legs') > 50 ? 'url(#glow-high)' : 'url(#glow-low)'}
              />

              {/* Hamstrings */}
              <ellipse
                cx="80" cy="275"
                rx="18" ry="40"
                fill={getColor(getIntensity('legs'))}
                opacity="0.85"
                className="cursor-pointer transition-all hover:opacity-100"
                onClick={() => handleMuscleClick('legs')}
                filter={getIntensity('legs') > 50 ? 'url(#glow-high)' : 'url(#glow-low)'}
              />
              <ellipse
                cx="120" cy="275"
                rx="18" ry="40"
                fill={getColor(getIntensity('legs'))}
                opacity="0.85"
                className="cursor-pointer transition-all hover:opacity-100"
                onClick={() => handleMuscleClick('legs')}
                filter={getIntensity('legs') > 50 ? 'url(#glow-high)' : 'url(#glow-low)'}
              />

              {/* Calves */}
              <ellipse
                cx="75" cy="345"
                rx="12" ry="30"
                fill={getColor(getIntensity('legs'))}
                opacity="0.7"
                className="cursor-pointer transition-all hover:opacity-100"
                onClick={() => handleMuscleClick('legs')}
              />
              <ellipse
                cx="125" cy="345"
                rx="12" ry="30"
                fill={getColor(getIntensity('legs'))}
                opacity="0.7"
                className="cursor-pointer transition-all hover:opacity-100"
                onClick={() => handleMuscleClick('legs')}
              />
            </>
          )}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-1 mt-4">
        <span className="text-[10px] text-gray-400">None</span>
        <div className="w-4 h-3 rounded-sm bg-gray-700" />
        <div className="w-4 h-3 rounded-sm bg-emerald-800" />
        <div className="w-4 h-3 rounded-sm bg-emerald-600" />
        <div className="w-4 h-3 rounded-sm bg-amber-500" />
        <div className="w-4 h-3 rounded-sm bg-red-600" />
        <span className="text-[10px] text-gray-400">High</span>
      </div>

      {/* Selected muscle info */}
      {selectedData && (
        <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-sm text-gray-800 dark:text-gray-200">
              {selectedData.name}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full" style={{
              backgroundColor: getColor(selectedData.intensity) + '30',
              color: getColor(selectedData.intensity)
            }}>
              {selectedData.intensity}% trained
            </span>
          </div>
          <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-2">
            {selectedData.muscles.join(' • ')}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-300">
            <span className="font-medium">{selectedData.workoutCount}</span> workouts logged
          </p>
        </div>
      )}

      {/* Summary stats */}
      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 grid grid-cols-3 gap-2 text-center">
        <div>
          <p className="text-lg font-bold text-red-500">
            {data.filter(d => d.intensity >= 75).length}
          </p>
          <p className="text-[10px] text-gray-400">Overworked</p>
        </div>
        <div>
          <p className="text-lg font-bold text-emerald-500">
            {data.filter(d => d.intensity > 0 && d.intensity < 75).length}
          </p>
          <p className="text-[10px] text-gray-400">Balanced</p>
        </div>
        <div>
          <p className="text-lg font-bold text-gray-400">
            {data.filter(d => d.intensity === 0).length}
          </p>
          <p className="text-[10px] text-gray-400">Neglected</p>
        </div>
      </div>
    </div>
  )
}
