# APP PRD: Strength Profile Tracker

**Version:** 2.0
**Date:** 2025-12-02
**Status:** Draft

---

## 1. Overview

### 1.1 Problem
Users lack a simple way to track strength standards for multiple people and understand where they stand relative to their body weight.

### 1.2 Solution
A mobile-first web app that stores up to 5 user profiles, calculates personalized strength standards, and tracks performance across difficulty levels.

### 1.3 Target Users
- Fitness enthusiasts
- Personal trainers managing clients
- Gym-goers tracking progression

---

## 2. Features

### 2.1 Profile Management

#### Requirements
- Create up to 5 profiles
- Each profile: name, age, height, weight
- Edit and delete profiles
- Profiles persist locally

#### Design

```typescript
interface Profile {
  id: string                    // crypto.randomUUID()
  name: string                  // max 50 characters
  age: number                   // 13-100
  height: number                // 100-250 cm
  weight: number                // 30-300 kg
  currentLevels: ExerciseLevels
  createdAt: string
  updatedAt: string
}

// Storage
const STORAGE_KEY = 'spt_profiles'
localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles))
```

#### Components
```
<ProfileList />
  └── <ProfileCard profile={} onEdit={} onDelete={} />
  └── <AddProfileButton disabled={profiles.length >= 5} />

<ProfileForm mode="create|edit" />
  └── <Input name="name" maxLength={50} required />
  └── <Input name="age" type="number" min={13} max={100} />
  └── <Input name="height" type="number" min={100} max={250} />
  └── <Input name="weight" type="number" min={30} max={300} />
  └── <Button type="submit">Save Profile</Button>
```

#### Test Cases
- [ ] Can create profile with valid data
- [ ] Cannot create 6th profile (button disabled)
- [ ] Name field rejects >50 characters
- [ ] Age field rejects <13 or >100
- [ ] Profile persists after page refresh
- [ ] Can edit existing profile
- [ ] Can delete profile with confirmation

---

### 2.2 Exercise System

#### Requirements
- 20+ exercises across 6 body parts
- Filter exercises by body part
- Each exercise has 4 difficulty levels
- Display calculated weight based on user's body weight

#### Design

```typescript
type BodyPart = 'chest' | 'back' | 'shoulders' | 'legs' | 'arms' | 'core'
type Level = 'beginner' | 'novice' | 'intermediate' | 'advanced'

interface Exercise {
  id: string
  name: string
  bodyPart: BodyPart
  multipliers: {
    beginner: number
    novice: number
    intermediate: number
    advanced: number
  }
  unit: 'barbell' | 'dumbbell' | 'machine' | 'bodyweight'
}

interface ExerciseLevels {
  [exerciseId: string]: Level | null
}
```

#### Exercise Data

**Chest**
| Exercise | BEG | NOV | INT | ADV |
|----------|-----|-----|-----|-----|
| Bench Press | 0.59 | 0.82 | 1.06 | 1.29 |
| Incline Bench | 0.50 | 0.70 | 0.90 | 1.10 |
| Dumbbell Press | 0.25 | 0.35 | 0.45 | 0.55 |
| Cable Fly | 0.15 | 0.22 | 0.30 | 0.40 |

**Back**
| Exercise | BEG | NOV | INT | ADV |
|----------|-----|-----|-----|-----|
| Deadlift | 0.94 | 1.29 | 1.71 | 2.18 |
| Barbell Row | 0.50 | 0.70 | 0.90 | 1.15 |
| Lat Pulldown | 0.50 | 0.70 | 0.90 | 1.10 |
| Pull-ups | 0.5x | 0.8x | 1.0x | 1.3x |
| Cable Row | 0.50 | 0.70 | 0.90 | 1.10 |

**Shoulders**
| Exercise | BEG | NOV | INT | ADV |
|----------|-----|-----|-----|-----|
| Shoulder Press (Barbell) | 0.41 | 0.59 | 0.76 | 1.00 |
| Shoulder Press (Machine) | 0.35 | 0.50 | 0.65 | 0.85 |
| Shoulder Press (Dumbbell) | 0.18 | 0.26 | 0.35 | 0.45 |
| Side Lateral (Dumbbell) | 0.08 | 0.12 | 0.16 | 0.22 |
| Side Lateral (Cable) | 0.06 | 0.10 | 0.14 | 0.20 |
| Front Raise | 0.10 | 0.15 | 0.20 | 0.28 |

**Legs**
| Exercise | BEG | NOV | INT | ADV |
|----------|-----|-----|-----|-----|
| Squat | 0.76 | 1.12 | 1.47 | 1.88 |
| Leg Press | 1.50 | 2.20 | 3.00 | 3.80 |
| Romanian Deadlift | 0.60 | 0.85 | 1.10 | 1.40 |
| Leg Curl | 0.30 | 0.45 | 0.60 | 0.80 |
| Leg Extension | 0.40 | 0.55 | 0.75 | 0.95 |

**Arms**
| Exercise | BEG | NOV | INT | ADV |
|----------|-----|-----|-----|-----|
| Bicep Curl (Barbell) | 0.25 | 0.38 | 0.50 | 0.65 |
| Bicep Curl (Dumbbell) | 0.12 | 0.18 | 0.25 | 0.32 |
| Tricep Pushdown | 0.25 | 0.38 | 0.50 | 0.65 |

> **Note:** Dumbbell exercises show per-hand multiplier. Pull-ups use bodyweight multiplier.

#### Components
```
<ExerciseList>
  └── <BodyPartFilter selected={} onChange={} />
  └── <ExerciseCard exercise={} userWeight={} selectedLevel={} onLevelSelect={} />

<ExerciseCard>
  └── <ExerciseName />
  └── <LevelSelector>
        └── <LevelBadge level="beginner" weight={calculated} selected={} />
        └── <LevelBadge level="novice" weight={calculated} selected={} />
        └── <LevelBadge level="intermediate" weight={calculated} selected={} />
        └── <LevelBadge level="advanced" weight={calculated} selected={} />
      </LevelSelector>
```

#### Test Cases
- [ ] All 20+ exercises render correctly
- [ ] Body part filter works (shows only filtered exercises)
- [ ] Weight calculation: userWeight × multiplier = displayed weight
- [ ] Level selection saves to profile
- [ ] Level selection persists after refresh
- [ ] "All" filter shows all exercises

---

### 2.3 Motivational Quotes

#### Requirements
- Display fitness quote at bottom of app
- New quote on each app open
- Works offline with cached quotes

#### Design

```typescript
interface Quote {
  id: string
  text: string
  author?: string
  category: 'motivation' | 'science' | 'benefit'
  source?: string
}

// Local quotes file: /lib/quotes.json (100+ quotes)
// Fallback: ZenQuotes API or API Ninjas
```

#### Components
```
<QuoteDisplay>
  └── <QuoteText />
  └── <QuoteAuthor />
  └── <RefreshButton onClick={getNewQuote} />
</QuoteDisplay>
```

#### Test Cases
- [ ] Quote displays on app load
- [ ] Different quote on refresh
- [ ] Works offline (uses cached quote)
- [ ] Author/source displays when available

---

## 3. UI Specifications

### 3.1 Color Palette

**Primary Colors**
| Name | Hex | Usage |
|------|-----|-------|
| Primary | `#2C3E50` | Headers, primary text |
| Secondary | `#3498DB` | Buttons, accents |
| Success | `#27AE60` | Save actions |

**Level Colors**
| Level | Hex | Color |
|-------|-----|-------|
| Beginner | `#2ECC71` | Green |
| Novice | `#3498DB` | Blue |
| Intermediate | `#F39C12` | Orange |
| Advanced | `#E74C3C` | Red |

### 3.2 Typography

| Element | Size | Weight |
|---------|------|--------|
| Screen Title | 13pt | 600 |
| Section Header | 10pt | 600 |
| Body Text | 9pt | 400 |
| Button Text | 11pt | 600 |

**Font:** System default (San Francisco / Roboto)

### 3.3 Components

**Buttons**
- Height: 44-48pt (touch-friendly)
- Border radius: 8pt
- Primary: `#3498DB` fill, white text

**Cards**
- Background: white
- Border: 1pt solid `#E0E0E0`
- Border radius: 8pt
- No shadow (flat design)

**Inputs**
- Height: 44pt
- Border: 1pt solid `#E0E0E0`
- Border radius: 4pt
- Focus: `#3498DB` border

---

## 4. Technical Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14+ (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v3 |
| Storage | localStorage (Phase 1) |
| Hosting | Vercel |

### 4.1 Folder Structure

```
src/
├── app/
│   ├── page.tsx              # Profile list
│   ├── layout.tsx
│   └── profile/
│       ├── new/page.tsx      # Create profile
│       └── [id]/page.tsx     # Profile detail + exercises
├── components/
│   ├── ui/                   # Button, Input, Card
│   ├── profile/              # ProfileCard, ProfileForm
│   └── exercise/             # ExerciseCard, LevelBadge
├── lib/
│   ├── storage.ts            # localStorage helpers
│   ├── calculations.ts       # Weight calculations
│   ├── exercises.ts          # Exercise data
│   └── quotes.ts             # Quotes data + logic
├── hooks/
│   └── useProfiles.ts
└── types/
    └── index.ts
```

---

## 5. Development Phases

### Phase 1: MVP
- [ ] Profile CRUD (create, read, update, delete)
- [ ] 4 core exercises (Bench, Squat, Deadlift, Shoulder Press)
- [ ] Level selection and persistence
- [ ] Basic UI

### Phase 2: Enhancement
- [ ] Expand to 20+ exercises
- [ ] Body part filtering
- [ ] Motivational quotes
- [ ] Units toggle (kg/lbs)

### Phase 3: Polish
- [ ] Dark mode
- [ ] Animations
- [ ] PWA support
- [ ] Performance optimization

---

## 6. Success Criteria

| Metric | Target |
|--------|--------|
| Profile creation | <2 minutes |
| Page load | <2 seconds |
| Works offline | Yes (localStorage) |
| Mobile responsive | Yes |

---

## Sources

- [Strength Level](https://strengthlevel.com/) - Strength standards data
- [Legion Athletics](https://legionathletics.com/strength-standards/) - Body weight multipliers

---

**Document Status:** Ready for Review
**Next:** Approval, then build
