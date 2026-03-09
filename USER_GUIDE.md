# Call of Cthulhu 7th Edition Ruleset User Guide

## Table of Contents

1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [Creating a Character](#creating-a-character)
4. [The Character Sheet](#the-character-sheet)
5. [Skills & Improvement](#skills--improvement)
6. [Sanity](#sanity)
7. [Combat](#combat)
8. [Spells & Magic Points](#spells--magic-points)
9. [Inventory & Items](#inventory--items)
10. [Creating and Managing NPCs](#creating-and-managing-npcs)
11. [Creating Content for Your Campaign](#creating-content-for-your-campaign)
12. [Effects & Modifiers](#effects--modifiers)
13. [Tips & Tricks](#tips--tricks)
14. [Quick Reference](#quick-reference)

---

## Introduction

Welcome to the **Call of Cthulhu 7th Edition** ruleset for Realm VTT! This ruleset implements the full CoC 7e rules with:

- Full character creation wizard covering characteristics, occupation, skills, and backstory
- Automated d100 roll-under system with Regular / Hard / Extreme / Critical success levels
- Bonus and penalty dice support
- Opposed melee combat with Fight Back and Dodge mechanics
- Firearm combat with ammo tracking and malfunction
- Sanity checks with SAN loss and insanity tracking
- Skill improvement rolls at end of session
- Luck spending and improvement
- Magic Points and spell casting
- NPC stat blocks with attack lists and auto-animation
- Modifier system for effects from items and conditions

---

## Getting Started

### Key Concepts

- **Characteristics**: The eight core stats (STR, CON, SIZ, DEX, APP, INT, POW, EDU) plus Luck. Each is rated 1–99 (or higher for non-humans).
- **Roll-Under**: To succeed at a skill or characteristic check, roll **equal to or under** the value on d100.
- **Success Levels**: Regular (≤ value), Hard (≤ half), Extreme (≤ fifth), Critical (roll of 1). Failure on anything higher. Fumble on 100 (or 96–100 if skill < 50).
- **Pushed Rolls**: On a failure (not fumble), some checks can be pushed — a re-attempt with consequences if it fails again.
- **Luck**: A secondary resource that can be spent to turn failures into successes.

---

## Creating a Character

### Using the Character Creation Wizard

A multi-step wizard guides you through character creation.

#### Step 1: Concept

Enter your investigator's name and basic personal information. This sets the foundation for the rest of the wizard.

#### Step 2: Characteristics

Roll or enter your eight core characteristics:

- **STR** (Strength), **CON** (Constitution), **SIZ** (Size), **DEX** (Dexterity), **APP** (Appearance)
- **INT** (Intelligence), **POW** (Power), **EDU** (Education)

Luck is rolled separately (3D6 × 5). Half and fifth values are calculated automatically.

> **Tip**: Derived stats (HP, MP, Damage Bonus, Build, Move Rate, Max SAN) are calculated automatically once you set your characteristics.

#### Step 3: Derived Stats & Resources

The wizard displays your auto-calculated derived stats:

| Stat             | Formula                            |
| ---------------- | ---------------------------------- |
| **Hit Points**   | (CON + SIZ) / 10 (round down)      |
| **Magic Points** | POW / 5 (round down)               |
| **Sanity**       | POW (starting SAN)                 |
| **Max SAN**      | 99 − Cthulhu Mythos                |
| **Damage Bonus** | From STR+SIZ table                 |
| **Build**        | From STR+SIZ table                 |
| **Move Rate**    | Based on STR/DEX vs SIZ comparison |

#### Step 4: Occupation

Drop an **Occupation** record from the compendium onto the wizard, or type your occupation manually. Occupations define your skill point pool and which skills count as occupational.

#### Step 5: Skills

Allocate your Occupational skill points and Personal Interest points to skills. Each skill starts at its base value and you add points on top.

> **Note**: Dodge base = DEX / 2. Language (Own) base = EDU. These update automatically if you change those characteristics later.

#### Step 6: Background

Enter your investigator's personal details: backstory, description, traits, important people, places, and possessions.

#### Step 7: Equipment

Add starting items to your inventory by dragging from the Items compendium or adding manually.

#### Step 8: Review

Confirm all your choices before finalizing the character.

---

## The Character Sheet

The character sheet has five tabs:

### Main Tab

[SCREENSHOT PLACEHOLDER: Character sheet Main tab overview]

The Main tab displays your core statistics:

- **Portrait**: Click to upload an investigator image. Drop an **Occupation** record to set your occupation.
- **Characteristics**: STR, CON, SIZ, DEX, APP, INT, POW, EDU — each shown with full value, half, and fifth. Click the label button to roll a characteristic check.
- **Luck**: Shown below characteristics with half and fifth values. Click to roll a Luck check. Use the trending-up button to roll a Luck improvement at end of session.
- **Hit Points**: Current / Max with a health bar. Toggle **Major Wound**, **Dying**, and **Unconscious** checkboxes as needed. Use the bed button to rest (8 hours).
- **Sanity**: Current / Max SAN with a progress bar. See the [Sanity](#sanity) section for details.
- **Magic Points**: Current / Max MP with a progress bar.
- **Damage Bonus**: Auto-calculated from STR+SIZ (e.g., +1D4, −1). Applied automatically to melee damage rolls.
- **Build**: Auto-calculated from STR+SIZ. Used for grapple and combat maneuvers.
- **Move Rate**: Auto-calculated from the STR/DEX/SIZ comparison.

#### Rolling Characteristic Checks

Click the label button (STR, CON, SIZ, etc.) to roll that characteristic as a check. The system uses the same roll-under mechanics as skills.

#### Rest (8 Hours)

Click the bed button to rest. This:

- Restores Magic Points to maximum
- Heals 1D3 Hit Points naturally
- Does **not** restore Sanity, clear Major Wound, Dying, or mental conditions — those require in-game treatment

### Skills Tab

[SCREENSHOT PLACEHOLDER: Skills tab]

The Skills tab shows all your investigator's skills with:

- **Skill Name**: Click the button to roll the skill check
- **Value**: Current skill percentage (editable)
- **Half**: Auto-calculated (Half value for Hard successes)
- **Fifth**: Auto-calculated (Fifth value for Extreme successes)
- **Checked mark**: Tick this after successfully using a skill for an improvement roll at session end
- **Improvement**: Use the Improve button at the top to roll improvement for all checked skills at once

See the [Skills & Improvement](#skills--improvement) section for full details.

### Combat Tab

[SCREENSHOT PLACEHOLDER: Combat tab with weapon list]

The Combat tab shows your weapons and quick combat stats:

- **Roll Initiative button**: Roll your initiative for combat order
- **Weapons list**: All weapons from your inventory that can be attacked with
- **Quick stats**: Dodge, Damage Bonus, Build, Move Rate, Armor

See the [Combat](#combat) section for full details.

### Inventory Tab

[SCREENSHOT PLACEHOLDER: Inventory tab]

Manage your gear, weapons, and finances:

- **Gear & Possessions**: Drag items from the compendium or add manually. Items can be carried, dropped, or stored. Click a weapon's equipment toggle to arm it.
- **Cash**: Your current cash on hand
- **Credit Rating**: Your credit rating characteristic value
- **Investments**: Rich text area for property, investments, and other assets

### Backstory Tab

Notes, appearance, personality, background, and session notes using a rich text editor.

---

## Skills & Improvement

### Rolling Skills

Click any skill name button on the Skills tab to roll that skill. The chat message shows:

- The rolled value vs your skill percentage
- Success level (Regular / Hard / Extreme / Critical / Failure / Fumble)
- Threshold reference: `Regular: ≤XX | Hard: ≤XX | Extreme: ≤XX`

### Pushed Rolls

On a **Failure** (not Fumble), most skills show a **Push** button in chat. Clicking it re-rolls the check — but if it fails again, the Keeper determines the consequences.

> Attacks, Luck checks, and SAN checks cannot be pushed.

### Luck Spending

On a **Failure**, a **Spend Luck** button appears showing exactly how many points are needed to convert the failure to a Regular Success. Click it to spend that Luck automatically.

### Bonus and Penalty Dice

Bonus and penalty dice can be applied before rolling (via effects or Keeper instruction). The system automatically picks the best (bonus) or worst (penalty) result from the extra d10 tens digit candidates.

### Skill Improvement

At the end of a session:

1. Tick the checkbox next to each skill you successfully used during the session
2. Go to the Skills tab and click the **Improve** button (trending-up arrow at the top)
3. The system rolls 1D100 for each checked skill — if the roll **exceeds** the current value, the skill increases by 1D10

Skills with specializations (like Fighting, Firearms, Language) track improvement per specialization.

> **No Improvement** skills (like Cthulhu Mythos) are marked and skip the improvement roll.

### Cthulhu Mythos

Cthulhu Mythos is a special skill:

- It can only be gained, never improved by normal use
- As it increases, **Max SAN decreases**: Max SAN = 99 − Cthulhu Mythos
- Investigators can never recover SAN above their Max SAN

---

## Sanity

### Sanity Checks

The Keeper calls for a SAN check when investigators encounter the unnatural. To run a SAN check:

1. Click the **SAN Check** button on the Main tab
2. A prompt appears — select the SAN loss formula for success/failure (e.g., **1/1D6** means lose 1 on success, 1D6 on failure)
3. Roll the check — the system automatically deducts SAN on failure and shows the result

### Sanity Loss

After a failed SAN check, the system deducts the rolled loss from current SAN. If SAN drops to 0, the character goes indefinitely insane.

### Insanity States

Track these manually using the checkboxes on the Main tab:

- **Temp. Insanity**: Short-term bout of madness (1D10 rounds)
- **Indef. Insanity**: Long-term condition requiring treatment

### Max SAN

Max SAN = **99 − Cthulhu Mythos**. Investigators can never restore SAN above this value. It decreases as Cthulhu Mythos grows.

---

## Combat

### Initiative

Click **Roll/Set Initiative** on the Combat tab. The system supports two modes (configured in settings):

- **DEX Order**: Sets initiative directly to DEX value (no randomness)
- **1D6 + DEX**: Rolls 1D6 and adds DEX, placing the result on the initiative tracker

### Melee Combat (Opposed)

Melee attacks use an **opposed roll** system:

1. Attacker clicks their weapon's roll button
2. An **Attack Hits** or **success level** message appears in chat with two response buttons:
   - **Fight Back** — the defending character clicks this and rolls their highest Fighting skill
   - **Dodge** — the defending character clicks this and rolls their Dodge skill

**Resolution:**

- Defender wins with a higher success level → attack misses
- Attacker wins or ties → **Attack Hits** message appears with a **Roll Damage** button
- Tie on Dodge → defender wins; tie on Fight Back → attacker wins

Clicking **Roll Damage** rolls the weapon damage plus Damage Bonus (automatically included as a modifier) and any active effect-based damage modifiers.

### Firearm Combat (Non-Opposed)

Firearms roll directly against the skill:

1. Click the weapon's roll button
2. On a success, a **Roll Damage** button appears immediately (no opposed defense)
3. On an Extreme success with an impaling weapon → **Impale** damage (max weapon damage + max DB + one extra die)
4. Ammo is automatically deducted on each shot

### Extreme Success (Impale)

When an impaling weapon achieves an **Extreme Success**:

- Melee: maximum possible damage + maximum Damage Bonus + one additional weapon die roll
- Firearm: maximum possible damage + one additional weapon die roll (no DB on firearms)

### Damage

The damage roll:

- Uses the weapon's damage formula (e.g., 1D6+2)
- Adds **Damage Bonus** automatically as a rolled modifier (melee only)
- Adds any active damage modifiers from equipped items or effects
- Shows tags for each contributor

After rolling, an **Apply Damage** button appears. Drop or select a target token and click it to:

- Subtract damage from the target's HP (reduced by their armor)
- Flag a **Major Wound** if damage ≥ half max HP in a single hit
- Flag **Dying** if HP reaches 0
- Float the damage number on the token
- Provide an **Undo** button (GM only)

### Major Wound

A Major Wound is flagged automatically when a single hit deals damage equal to or exceeding half the target's maximum HP. The target must make a CON roll or fall unconscious.

### Malfunction

Firearms have a **Malfunction** threshold. If the d100 roll equals or exceeds that number, a malfunction is flagged in chat.

### Dodge

Dodge skill value is shown in the Combat tab quick stats. Dodge base = DEX / 2, and updates automatically when DEX changes.

---

## Spells & Magic Points

### Magic Points

Magic Points (MP) = POW / 5. They are used to cast spells and in opposed POW contests.

MP restore fully after 8 hours of rest (use the Rest button on the Main tab).

### Spells

Spells are records that can be dragged onto the NPC sheet's Spells tab or tracked on a character. Each spell shows:

- Magic Point cost
- Casting time
- Range and area
- Effect description
- Sanity cost (if any)

### Casting

Click the cast button on a spell to roll the associated skill check and resolve the effect.

---

## Inventory & Items

### Adding Items

1. Open the **Items** compendium
2. Find the item you want
3. **Drag and drop** it onto the Inventory tab

Dragging the same item multiple times increases quantity rather than creating duplicates.

### Item Packs

Drop an **Item Pack** onto the Inventory tab to unpack all its contents at once. Cash in the pack is added to your cash total automatically.

### Item Types

| Type           | Use For                                                                    |
| -------------- | -------------------------------------------------------------------------- |
| **Weapon**     | Any weapon — shows damage, range, uses/round, magazine, malfunction, skill |
| **Armor**      | Worn protection — shows armor value                                        |
| **Gear**       | General equipment                                                          |
| **Tome**       | Mythos books — shows Mythos gain, SAN cost, study time, language           |
| **Artifact**   | Mythos artifacts — shows SAN cost                                          |
| **Ammunition** | Ammo for firearms — links to weapons via the ammo selector                 |
| **Pack**       | Container of items + cash that unpacks on drop                             |

### Weapons in Combat

Weapons in your inventory appear automatically on the **Combat tab**. From there you can:

- Roll attacks
- Track loaded ammo vs magazine size
- Reload using the reload button
- Select which ammo type is loaded (links quantity to inventory)

### Equipping Items

Items have a **carried status**: Carried, Dropped, or Stored. Equipping a weapon arms it for use in the Combat tab.

---

## Creating and Managing NPCs

### NPC Types

The NPC sheet supports three types:

| Type         | Use For                            |
| ------------ | ---------------------------------- |
| **NPC**      | Human non-player characters        |
| **Creature** | Monsters, animals, mythos entities |
| **Vehicle**  | Ships, cars, trains                |

Switching type hides/shows the relevant fields automatically (e.g., vehicles hide characteristics and Magic Points; creatures hide APP and EDU).

### Creating an NPC

1. Create a new NPC record
2. Set the **Type** (NPC / Creature / Vehicle)
3. Enter characteristics — derived stats (HP, MP, DB, Build, MOV) calculate automatically
4. Add skills to the NPC skills list
5. Add attacks to the NPC attacks list

> **Note**: NPC derived stats auto-recalculate when any characteristic changes. SAN fields are not set for NPCs.

### NPC Attacks

Each NPC attack is its own record with:

- **Portrait**: Click to open the attack record detail
- **Skill %**: The attack's skill percentage (rolled directly)
- **Damage**: Damage formula (e.g., 1D6+DB)
- **Range**: Effective range
- **Uses/Round**: How many times per round
- **Melee / Impaling / Magical** toggles
- **Animation Override**: `fxcontrol` field — leave blank to auto-detect from attack name, or select a specific animation

Click the d100 button on an attack to roll it. Melee attacks use the opposed system; ranged attacks resolve directly.

### NPC Attack Animation

The system auto-detects animations based on attack/weapon name (e.g., "Bite" → bite animation, "Pistol" → firearm animation). Override this per-attack using the animation picker on the attack record.

### Creatures

Creature NPCs have additional fields:

- **SAN Loss**: The SAN loss formula for seeing this creature (used when the Keeper triggers a SAN check)
- **Special Abilities**: Rich text for creature traits and special rules

### Vehicles

Vehicle NPCs show vehicle-specific stats (speed, hull, etc.) instead of characteristics.

---

## Creating Content for Your Campaign

### Creating Items

1. Create a new Item record
2. Select the **Type** — fields shown automatically match the type

**Weapon fields:**

- Skill (links to the skill rolled for attacks)
- Damage (e.g., 1D6+2)
- Base Range
- Uses/Round (free text — e.g., "1 (3)" or "1 or burst 3" or "Full auto")
- Mag (magazine capacity)
- Malfunction threshold
- Melee and Impaling checkboxes
- Era (e.g., "1920s, Modern")
- Cost

**Armor fields:**

- Armor Value (points subtracted from incoming damage)

**Tome fields:**

- Mythos Gain (Cthulhu Mythos skill increase from reading)
- SAN Cost (SAN loss from reading)
- Study Time
- Language

### Creating Skills

Create Skill records to populate the compendium. Each skill has:

- Base value (e.g., 25 for most skills, or a formula like "DEX / 2" for Dodge)
- Whether it has specializations
- Whether it is excluded from improvement rolls (e.g., Cthulhu Mythos)

### Creating Occupations

Occupation records define:

- Occupational skill list
- Skill point formula (e.g., EDU × 4 + DEX × 2)
- Credit Rating range
- Suggested contacts

Drop an Occupation onto a character's Main tab to assign it.

---

## Effects & Modifiers

### What Modifiers Do

Modifiers on items or effects automatically adjust rolls when that item is equipped or the effect is active. They are collected at the moment the attack roll is made and baked into the resulting damage macros — so the correct attacker's stats are always used.

### Modifier Types

| Type                       | Effect                                                  |
| -------------------------- | ------------------------------------------------------- |
| **Skill Bonus / Penalty**  | Adds/subtracts from a skill percentage before rolling   |
| **Damage Bonus / Penalty** | Adds/subtracts from damage rolls (as a rolled modifier) |
| **Armor Bonus**            | Increases armor value                                   |
| **SAN Bonus / Penalty**    | Modifies SAN checks                                     |
| **Stat Bonus / Penalty**   | Modifies a characteristic                               |
| **Bonus Die**              | Adds a bonus die to rolls                               |
| **Penalty Die**            | Adds a penalty die to rolls                             |
| **Immune: Major Wound**    | Prevents Major Wound flag                               |
| **Immune: Impale**         | Prevents impale on Extreme success                      |

### Modifier Fields

- **Type**: What kind of modifier (see table above)
- **Applies To** (damage types): All Attacks, Melee Only, or Ranged Only
- **Field** (skill/stat modifiers): The specific skill name or stat, or `all` for all rolls
- **Value**: The modifier amount (number or dice formula)
- **Value Type**: Number or String (use String for dice like +1D4)
- **Active**: Whether the modifier is currently active
- **Item Only**: If checked, the modifier only applies when this specific item is the attacking weapon

### Adding Modifiers to Items

Open an item record, go to the Modifiers section, and add modifier entries. A damage bonus of `+1` to all melee attacks would be:

- Type: Damage Bonus
- Applies To: Melee Only
- Value: 1
- Active: checked
- Item Only: checked (so it only applies when attacking with this weapon)

---

## Tips & Tricks

### For Players

- **Check skills after use**: Tick the checkbox on any skill you successfully used so you can improve it at session end
- **Spend Luck sparingly**: You can only improve Luck at end of session if you roll over your current value — it may drop permanently if spent heavily
- **Pushed rolls have consequences**: Only push a roll if the Keeper agrees and you accept the potential cost of a second failure
- **Fight Back vs Dodge**: Fight Back lets you deal damage on success; Dodge doesn't. But a Fighting skill lower than your Dodge means you're better off dodging

### For Keepers

- **SAN checks**: Click the SAN Check button on a character's Main tab and select the loss formula. The system handles the roll and deduction automatically.
- **NPC attacks**: Use NPC attack records for all combat-capable creatures. The attack list rolls and animation detection are all wired up.
- **Creature SAN loss**: Set the SAN loss field on Creature NPCs so you can trigger it from the creature record when investigators encounter them
- **Improvised weapons**: Use the character's DB (shown on Combat tab) as a reference — unarmed is 1D3+DB for most humans
- **Initiative**: Use DEX Order for strict RAW; use 1D6+DEX for more variation (configure in campaign settings)

### Common Issues

**Q: Derived stats (HP, MP, DB) are wrong**
A: Click any characteristic field to re-enter the value — the `onchange` handler will recalculate everything automatically.

**Q: Dodge value isn't updating**
A: The Dodge skill base = DEX/2 and updates when DEX changes. If the skill was manually edited above base, the allocated points are preserved on top of the new base.

**Q: Language (Own) base is wrong**
A: Language (Own) base = EDU and updates when EDU changes.

**Q: Damage Bonus isn't applying to attacks**
A: DB is automatically added as a modifier to melee attack damage rolls. Check that the weapon is set as **Melee** on its item record. DB never applies to firearms.

**Q: Skill improvement didn't increase**
A: The improvement roll must **exceed** (not equal) the current skill value to improve. High skills improve rarely. Confirm the skill was checked (ticked) before rolling.

**Q: My attack animation isn't playing**
A: The auto-detection uses the weapon/attack name. If it can't match, use the animation override field on the attack record to select one manually.

---

## Quick Reference

### Success Levels

| Roll Result                   | Success Level    |
| ----------------------------- | ---------------- |
| Roll of 1                     | Critical Success |
| ≤ Skill ÷ 5                   | Extreme Success  |
| ≤ Skill ÷ 2                   | Hard Success     |
| ≤ Skill                       | Regular Success  |
| > Skill                       | Failure          |
| 100 (or 96–100 if skill < 50) | Fumble           |

### Damage Bonus Table

| STR + SIZ | Damage Bonus | Build |
| --------- | ------------ | ----- |
| 2–64      | −2           | −2    |
| 65–84     | −1           | −1    |
| 85–124    | None         | 0     |
| 125–164   | +1D4         | +1    |
| 165–204   | +1D6         | +2    |
| 205–284   | +2D6         | +3    |
| 285–364   | +3D6         | +4    |
| 365–444   | +4D6         | +5    |
| 445+      | +5D6         | +6    |

### Move Rate

| Condition              | MOV |
| ---------------------- | --- |
| STR and DEX both < SIZ | 7   |
| STR or DEX ≥ SIZ       | 8   |
| Both STR and DEX > SIZ | 9   |
| Age 40–49              | −1  |
| Age 50–59              | −2  |
| Age 60–69              | −3  |
| Age 70–79              | −4  |
| Age 80+                | −5  |

### Drag-and-Drop Summary

| Source                       | Target        | Result                      |
| ---------------------------- | ------------- | --------------------------- |
| Item (from Compendium)       | Inventory Tab | Adds item to inventory      |
| Item Pack (from Compendium)  | Inventory Tab | Unpacks all contents + cash |
| Occupation (from Compendium) | Main Tab      | Sets occupation             |

---

_This guide was created for the Call of Cthulhu 7th Edition ruleset in Realm VTT._
