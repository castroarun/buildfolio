# LinkedIn Posts - REPPIT Launch

**Reference:** `_claude-shared/linkedin-instructions.md`
**Project:** REPPIT - Strength Profile Tracker
**Platform:** Web (Vercel) + Android (Play Store)

---

## Project Differentiation

| Aspect | Common Workout Apps | REPPIT |
|--------|---------------------|--------|
| Tracking | Log sets/reps/weight | Log + see WHERE you stand (Beginner → Advanced) |
| Progress | Weight lifted over time | Strength SCORE + level progression |
| Targets | Generic goals | Exercise-specific standards based on body weight |
| Visualization | Charts | Muscle heatmap showing strong/weak areas |
| Guidance | None or paid coaches | AI coach tips based on your ratings |

**Core differentiator:** Most workout apps tell you WHAT you lifted. REPPIT tells you WHERE you stand and WHAT to go for.

---

## Stack

- **Frontend:** Next.js 16, TypeScript, Tailwind CSS
- **Mobile:** Capacitor for Android native
- **Database:** Supabase (auth + sync)
- **Deployment:** Vercel (web), Google Play (Android)
- **AI Assist:** Claude Code

---

## Post 1/4 - The Ship

```
𝗦𝗵𝗶𝗽𝗽𝗲𝗱 𝗥𝗘𝗣𝗣𝗜𝗧 - 𝘀𝘁𝗿𝗲𝗻𝗴𝘁𝗵 𝘁𝗿𝗮𝗰𝗸𝗲𝗿 𝗶𝗻 𝗫 𝗵𝗼𝘂𝗿𝘀 (1/4)

Most workout apps tell you WHAT you lifted. REPPIT tells you WHERE you stand and WHAT to go for.

𝗧𝗵𝗲 𝗽𝗿𝗼𝗯𝗹𝗲𝗺:
Lifters track sets, reps, and weight - but struggle to answer: "Am I intermediate or advanced at bench press? What should I be lifting at my body weight?"

𝗪𝗵𝗮𝘁 𝗺𝗮𝗸𝗲𝘀 𝗥𝗘𝗣𝗣𝗜𝗧 𝗱𝗶𝗳𝗳𝗲𝗿𝗲𝗻𝘁:
• Strength levels for 23 exercises (Beginner → Novice → Intermediate → Advanced)
• Target weights prompted based on YOUR body weight
• PR tracker with PR prompter
• Strength score tracking over time
• BMI & calorie advisor based on goals
• AI coach tips based on your ratings

𝗢𝘁𝗵𝗲𝗿 𝗰𝗿𝗶𝘁𝗶𝗰𝗮𝗹 𝗳𝗲𝗮𝘁𝘂𝗿𝗲𝘀:
• Visual muscle heatmap showing strong vs weak areas
• Body part strength chart
• Individual exercise progress charts
• Workout history with weight trends

𝗦𝘁𝗮𝗰𝗸:
Next.js 16 • TypeScript • Capacitor • Supabase • Tailwind

Built with Claude AI as pair programmer.

Try it → https://reppit-fitness.vercel.app
Play Store → [Coming Soon]
```

**Screenshot:** Profile detail page showing:
- User avatar with level badge (e.g., "Intermediate")
- Strength score circle (e.g., 64/100)
- Stats grid (age, height, weight, BMI)

---

## Post 2/4 - The Workflow

```
𝗠𝘆 𝟵-𝘀𝘁𝗲𝗽 𝘄𝗼𝗿𝗸𝗳𝗹𝗼𝘄 𝘄𝗶𝘁𝗵 𝗖𝗹𝗮𝘂𝗱𝗲 𝗔𝗜 (2/4)

"A bug found in requirements costs 100x less to fix than one found in production." — IBM Systems Sciences Institute

𝟭. 𝗧𝗶𝗺𝗲 𝘁𝗿𝗮𝗰𝗸𝗲𝗿
   → Log hours by phase from day 1

𝟮. 𝗣𝗥𝗗 𝗳𝗶𝗿𝘀𝘁
   → Tech stack, UI layout, data models
   → My inputs, AI drafts the formal doc

𝟯. 𝗧𝗲𝘀𝘁 𝗰𝗮𝘀𝗲𝘀
   → Validating understanding at the cheapest phase

𝟰. 𝗨𝗜 𝗺𝗼𝗰𝗸𝘂𝗽𝘀
   → Visual prototypes before code

𝟱. 𝗕𝘂𝗶𝗹𝗱
   → AI writes, I review

𝟲. 𝗠𝗮𝗻𝘂𝗮𝗹 𝘁𝗲𝘀𝘁𝗶𝗻𝗴
   → Catch what automated tests miss

𝟳. 𝗗𝗲𝗯𝘂𝗴 𝗹𝗼𝗼𝗽
   → I describe issue, AI proposes fix

𝟴. 𝗖𝗼𝗱𝗲 𝘄𝗮𝗹𝗸𝘁𝗵𝗿𝗼𝘂𝗴𝗵
   → So I'm code-familiar, not code-naive

𝟵. 𝗧𝗶𝗺𝗲 𝗿𝗲𝘁𝗿𝗼
   → Analyze where time actually went

𝗪𝗵𝗮𝘁 𝘄𝗲 𝗱𝗶𝗱 𝗱𝗶𝗳𝗳𝗲𝗿𝗲𝗻𝘁 𝘁𝗵𝗶𝘀 𝘁𝗶𝗺𝗲:
• More time in design & validation → eliminated firefighting → debugging near zero
• UI mockups in HTML before code - see it before building it
• 90% of work done on mobile via Claude cloud - true location independence
• Jira integration for human touchpoints, liberated todos, enforced reviews

𝗖𝗹𝗮𝘂𝗱𝗲 𝘀𝗲𝘁𝘂𝗽 (`.claude/instructions.md`):
• Project context: data models, validation rules, folder structure
• UI specs: color palette, typography, component guidelines
• Key constraints baked in (max 5 profiles, touch targets, etc.)

𝗚𝗹𝗼𝗯𝗮𝗹 𝘀𝗵𝗮𝗿𝗲𝗱 𝗳𝗶𝗹𝗲𝘀 (`_claude-shared/`):
• coding-standards.md - TypeScript/React patterns, Tailwind guidelines
• dev-workflow.md - The 9-step process referenced across projects

𝗖𝘂𝗿𝗮𝘁𝗲𝗱 𝗮𝗴𝗲𝗻𝘁𝘀:
• Explore - fast codebase search
• Plan - architecture decisions
• LinkedIn - post generation with template

𝗪𝗵𝘆 𝗖𝗮𝗽𝗮𝗰𝗶𝘁𝗼𝗿?
Wanted the app on Google Play. Capacitor wraps web app as native Android. Bonus: app loads from Vercel, so updates are instant - no store review needed.
```

**Screenshot:** None (text-focused) OR terminal showing `npx cap sync android`

---

## Post 3/4 - The Features

```
𝗪𝗵𝗮𝘁 𝗺𝗮𝗸𝗲𝘀 𝗥𝗘𝗣𝗣𝗜𝗧 𝗱𝗶𝗳𝗳𝗲𝗿𝗲𝗻𝘁 (3/4)

𝗦𝘁𝗿𝗲𝗻𝗴𝘁𝗵 𝗦𝘁𝗮𝗻𝗱𝗮𝗿𝗱𝘀
"You're lifting 80kg bench at 70kg body weight. That's Intermediate level."
→ Based on established strength standards, not arbitrary numbers

𝗣𝗥 𝗧𝗿𝗮𝗰𝗸𝗲𝗿
Log your working sets. App calculates estimated 1RM automatically.
→ "3 sets × 8 reps × 80kg = ~100kg 1RM"

𝗕𝗠𝗜 & 𝗖𝗮𝗹𝗼𝗿𝗶𝗲 𝗔𝗱𝘃𝗶𝘀𝗼𝗿
Based on your profile + activity level + goal (cut/maintain/bulk)
→ Not just tracking, but guidance

𝗠𝘂𝘀𝗰𝗹𝗲 𝗛𝗲𝗮𝘁𝗺𝗮𝗽
Visual body showing which muscle groups are strong (green) vs weak (red)
→ See imbalances at a glance

𝗣𝗿𝗼𝗴𝗿𝗲𝘀𝘀 𝗖𝗵𝗮𝗿𝘁𝘀
• Overall strength score over time
• Individual exercise progression
• Workout history with weight trends

𝗔𝗜 𝗖𝗼𝗮𝗰𝗵 𝗧𝗶𝗽𝘀
"Your legs are stronger than upper body. Consider adding more chest work."
→ Personalized based on YOUR ratings
```

**Screenshot:** Progress page showing:
- Strength score chart (line graph over time)
- Muscle heatmap (body silhouette with colored muscles)

---

## Post 4/4 - The Reflection

```
𝗪𝗵𝗮𝘁 𝘄𝗼𝗿𝗸𝗲𝗱 / 𝗪𝗵𝗮𝘁 𝗯𝗿𝗼𝗸𝗲 (4/4)

𝗪𝗵𝗮𝘁 𝘄𝗼𝗿𝗸𝗲𝗱:
• AI accelerated boilerplate - auth, CRUD, UI components
• Capacitor made web-to-native surprisingly smooth
• PRD → Test cases caught misunderstandings early

𝗪𝗵𝗮𝘁 𝗯𝗿𝗼𝗸𝗲:
• Mobile CSS quirks (z-index stacking, fixed backgrounds)
• Android Studio too heavy - switched to CLI builds
• Dark mode + SVG muscle maps = 2 hours of debugging
• Time logging discipline dropped mid-project
• Claude cloud UI slowed to unusable toward the end - mobile workflow hit a wall

𝗪𝗵𝗮𝘁 𝘀𝘁𝗶𝗹𝗹 𝗻𝗲𝗲𝗱𝗲𝗱 𝗺𝗲:
• Design decisions (what features, what UI)
• Testing on actual device
• Understanding WHY the code works

𝗟𝗶𝗻𝗸𝘀:
• Web app → https://reppit-fitness.vercel.app
• Play Store → [Coming Soon]
• GitHub → https://github.com/castroarun/strength_profile_tracker

What's your approach when a fitness app doesn't tell you if you're actually getting stronger?
```

**Screenshot:** Strength card showing:
- Exercise name with body part tag
- Current level badge
- Target weights for each level
- Quick-log button

---

## Screenshots to Capture

| Post | Screen | Key Elements |
|------|--------|--------------|
| 1/4 | Profile detail | Avatar, level badge, strength score, BMI |
| 2/4 | (optional) | Terminal with build command |
| 3/4 | Progress page | Score chart + muscle heatmap |
| 4/4 | Strength card | Exercise rating with level targets |

---

## Hashtags

```
#buildinpublic #nextjs #typescript #capacitor #mobiledev #fitness #strengthtraining #ai #claudecode
```
