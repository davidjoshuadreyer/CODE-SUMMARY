# Paper flight: design research and iteration brief

Research date: 22 October 2026. Scope: calm flight, readable exploration, short repeatable runs, engineering choices. The findings below are design evidence, not proof that any one mechanic caused a game's commercial success. Sources are developer-authored articles, developer interviews, official game descriptions, and a developer conference abstract. No artwork, music, writing, or game assets are copied.

## Six primary sources

### 1. A Short Hike — curiosity and a coherent world

[Adam Robinson-Yu, PlayStation Blog, 5 August 2021](https://blog.playstation.com/2021/08/05/crafting-a-tiny-open-world-a-look-behind-the-scenes-at-the-creation-of-a-short-hike/)

**Evidence:** The creator designed for players taking the opposite of the obvious route while preserving pacing. Optional activities vary exploration. Flat cohesive shading and outlines support readability. Music changes with location and action.

**Application, an inference:** Our five destinations should offer distinct reasons to visit and remain remembered between flights. Make a destination visible before requiring players to interpret its compass bearing. A paper postcard collection is more appropriate than adding another weapon system. Terrain, symbols and particles should share a narrow palette, with stronger contrast reserved for interactive objects.

### 2. Alto's Odyssey — preserve the core feeling and control vocabulary

[Team Alto interview, The Sweet Setup, 14 March 2018](https://thesweetsetup.com/quick-qa-team-alto-makers-altos-odyssey/)

**Evidence:** Named developers explain that increasing content created chaos they had to tame. They rejected mechanics that felt overly complex, especially extra touch inputs. Calm, comfort and minimalism were explicit design goals. Zen Mode emerged from players using the game to relax. Musical sound effects make simple actions feel expressive.

**Application, an inference:** Polish the existing flight verbs before adding more controls. Give one useful contextual prompt at a time. Keep optional tagging optional. Use a gentle collection response and restrained weather transitions instead of persistent screen shake or loud alarms. Reduced motion must continue to work.

### 3. Superflight — optional risk and short-session mastery

[GrizzlyGames' developer description on Steam](https://store.steampowered.com/app/732430/Superflight/)

**Evidence:** The developer explicitly describes proximity maneuvers, intuitive flight, procedural scenery, shareable seeds, and short sessions spent improving a personal best. Its scope is intentionally small. The Steam page showed overwhelmingly positive English reviews when checked; that is reception evidence, not a causal explanation.

**Application, an inference:** Reward skill that uses existing terrain and lift. A short ridge-soaring streak could make flying close to slopes rewarding without requiring it for basic progression. Display its threshold and a recovery margin. Keep safer routes useful, and compare the current flight with the player's own previous performance rather than a competitive leaderboard.

### 4. Flower — actions leave a visible trace

[thatgamecompany's official Flower page](https://thatgamecompany.com/flower/)

**Evidence:** The studio describes accumulated petals changing the environment and contrasts natural serenity with urban bustle. Simple motion-controlled direction is central to its presentation.

**Application, an inference:** A collected ribbon should visibly unfurl or dissolve into a trailing paper flourish; a discovered place can gain a persistent stamp. Feedback should show what changed in the world, not merely increment a number. Keep temporary animation separate from collision state so a collected ribbon cannot reward repeatedly.

### 5. Celeste — generous execution without removing skill

[Maddy Thorson, Celeste & Forgiveness](https://www.mattmakesgames.com/articles/celeste_and_forgiveness/index.html)

**Evidence:** The creator documents input buffering, timing grace, corner correction and other small allowances that favor the player's intended action. These are intentional parts of the moment-to-moment feel.

**Application, an inference:** Preserve swept collection detection and generous visible collection volumes. Do not require frame-perfect release timing. Teach recovery before adding difficulty: low airspeed calls for lowering the nose; low ground clearance calls for a short thrust burst. Never secretly re-level the wings: the user explicitly requested held bank. Generosity should clarify intent, not override it.

### 6. Journey — design around the emotional arc, then test

[Jenova Chen, Designing Journey, GDC 2013](https://www.gdcvault.com/play/1017700/Designing)

**Evidence limitation:** The accessible conference abstract describes extensive testing of failed ideas and polishing toward an emotional arc. The complete talk was not reviewed, so no detailed mechanics or timings are attributed to it.

**Application, an inference:** A flight can have an arc of invitation, discovery, modest risk, recovery and reflection. Avoid making every second equally busy. Alternate rain or storm intensity with a clear pocket and visible destination. Evaluate the actual run, not just an attractive paused screenshot.

## Current-code observations before this iteration

- `exploration.js` already has five hand-placed destinations, ribbons, tagging, swept ribbon collection and a selected waypoint. Discoveries reset with the expedition.
- `progression.js` saves flight history, upgrades and contracts, but no lifetime landmark collection.
- `flight.js` already gives post-flight advice and live status. The flight hint still presents several controls simultaneously, and the launch announcement says to steer the opposite way to level despite A/D now being independent yaw.
- Physics, rain, crumpling and bank persistence already exist. Further new mechanics risk hiding the useful ones.

These are code observations, not results from human-player research.

## Prioritized changes

1. **Make the first flight understandable.** Present one context-sensitive instruction; distinguish roll from A/D steering, explain that releasing roll holds bank, and teach stall/terrain recovery using the existing inverted pitch. Acceptance: controls and visual motion agree; prompts avoid contradictory advice and do not churn each frame.
2. **Turn destinations into an enduring collection.** Save first visits, show distinct place notes or postcard stamps, and point toward the next interesting place. Acceptance: old saves migrate safely; revisits cannot duplicate first-discovery rewards; reload retains collection.
3. **Improve guidance and event feedback.** Selected destinations, lift and ribbons need readable on-screen cues, including when offscreen. Use restrained easing and short paper flourishes. Acceptance: no cue overlap on a narrow phone; no hidden flight-path marker; quiet motion suppresses decorative movement.
4. **Reward existing flight skill.** Add a legible optional soaring objective or progress indicator using real lift/clearance state. Acceptance: hovering or sitting on the ground cannot farm it; frame rate cannot change reward; ordinary safe flight remains viable.
5. **Reduce retry friction and make experiments comparable.** Provide a clear quick retry and useful flight comparison. Acceptance: no accidental repeated launch from a held key; paused/blurred input clears; the previous flight is not lost when tuning the next design.

## Playtest protocol

Run a fresh-save desktop flight, a returning-save flight and a narrow-screen touch flight. Check launch, pitch inversion, held roll, A/D yaw, thrust depletion/recovery, destination approach, ribbon collection, stall recovery, crash, retry, save/reload, pause/blur and reduced motion. Record visible failures and fix them; do not equate passing numerical tests with a fun game. Physical phone tilt still requires a real-device check. Future human sessions should track time to first intentional turn, time to first discovery, whether players can explain a crash, and whether they voluntarily retry; no fabricated retention or engagement metrics.

## Implemented and checked in this pass

Added contextual bank/stall/terrain cues, corrected yaw-versus-roll language, accessible touch rudder buttons, route difficulty guidance, a next-undiscovered destination button, a persistent five-place pocket atlas, three optional exploration/ribbon goals, immediate retry preserving launch strength, and previous-flight distance/design comparison. Grain and the original footer remain unchanged.

All nine numerical/rendering suites pass, including the new simulated route playtests. Browser check: fresh POV flight landed at 601 m, credited Sunfield and a ribbon, saved one journal entry, and restarted with one click. Reload retained the discovery. At 390 px viewport, no horizontal overflow; steering activation changed heading to 094° while bank stayed 0°, and pause worked. No browser console errors observed. Physical device tilt and human retention testing were not performed. Optional audio, soaring streaks and further visual effects remain future ideas, not shipped features.
