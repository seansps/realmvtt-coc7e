// ============================================================
// Call of Cthulhu 7th Edition - Common Utilities
// ============================================================

function generateUuid() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = Math.floor(Math.random() * 16);
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function capitalize(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ============================================================
// Success Level System
// ============================================================

// Success level constants (higher = better)
const SUCCESS_LEVELS = {
  FUMBLE: 0,
  FAILURE: 1,
  REGULAR: 2,
  HARD: 3,
  EXTREME: 4,
  CRITICAL: 5,
};

const SUCCESS_LEVEL_NAMES = {
  [SUCCESS_LEVELS.FUMBLE]: "Fumble",
  [SUCCESS_LEVELS.FAILURE]: "Failure",
  [SUCCESS_LEVELS.REGULAR]: "Regular Success",
  [SUCCESS_LEVELS.HARD]: "Hard Success",
  [SUCCESS_LEVELS.EXTREME]: "Extreme Success",
  [SUCCESS_LEVELS.CRITICAL]: "Critical Success",
};

const SUCCESS_LEVEL_COLORS = {
  [SUCCESS_LEVELS.FUMBLE]: "#8B0000",
  [SUCCESS_LEVELS.FAILURE]: "red",
  [SUCCESS_LEVELS.REGULAR]: "green",
  [SUCCESS_LEVELS.HARD]: "#2E8B57",
  [SUCCESS_LEVELS.EXTREME]: "#1E90FF",
  [SUCCESS_LEVELS.CRITICAL]: "#FFD700",
};

// Bonus/penalty dice colors (green = good, red = bad)
const BONUS_DICE_COLORS = {
  bonus: { diceColor: "#0a6b2e", textColor: "#ffffff" },
};
const PENALTY_DICE_COLORS = {
  penalty: { diceColor: "#8B0000", textColor: "#ffffff" },
};

function getSuccessLevel(roll, skillValue) {
  const half = Math.floor(skillValue / 2);
  const fifth = Math.floor(skillValue / 5);

  if (roll === 1) return SUCCESS_LEVELS.CRITICAL;
  if (roll <= fifth) return SUCCESS_LEVELS.EXTREME;
  if (roll <= half) return SUCCESS_LEVELS.HARD;
  if (roll <= skillValue) return SUCCESS_LEVELS.REGULAR;

  // Fumble: 100 always; 96-100 if skill < 50
  if (roll === 100) return SUCCESS_LEVELS.FUMBLE;
  if (skillValue < 50 && roll >= 96) return SUCCESS_LEVELS.FUMBLE;

  return SUCCESS_LEVELS.FAILURE;
}

function getHalf(value) {
  return Math.floor(value / 2);
}

function getFifth(value) {
  return Math.floor(value / 5);
}

// ============================================================
// Derived Stat Calculations
// ============================================================

function getDamageBonusAndBuild(strSiz) {
  if (strSiz >= 2 && strSiz <= 64) return { db: "-2", build: -2 };
  if (strSiz <= 84) return { db: "-1", build: -1 };
  if (strSiz <= 124) return { db: "0", build: 0 };
  if (strSiz <= 164) return { db: "+1D4", build: 1 };
  if (strSiz <= 204) return { db: "+1D6", build: 2 };
  if (strSiz <= 284) return { db: "+2D6", build: 3 };
  if (strSiz <= 364) return { db: "+3D6", build: 4 };
  if (strSiz <= 444) return { db: "+4D6", build: 5 };
  return { db: "+5D6", build: 6 };
}

function getMoveRate(str, dex, siz, age) {
  let mov = 8;
  if (dex < siz && str < siz) mov = 7;
  else if (dex > siz && str > siz) mov = 9;

  // Age deductions (each decade past 30s)
  const ageNum = parseInt(age, 10) || 20;
  if (ageNum >= 40 && ageNum < 50) mov -= 1;
  else if (ageNum >= 50 && ageNum < 60) mov -= 2;
  else if (ageNum >= 60 && ageNum < 70) mov -= 3;
  else if (ageNum >= 70 && ageNum < 80) mov -= 4;
  else if (ageNum >= 80) mov -= 5;

  return Math.max(mov, 1);
}

function recalcDerivedStats(fieldsToSet, rec) {
  // Use effective stat values (base + modifier bonuses)
  const str = parseInt(rec?.data?.str, 10) || 0;
  const con = parseInt(rec?.data?.con, 10) || 0;
  const siz = parseInt(rec?.data?.siz, 10) || 0;
  const dex = parseInt(rec?.data?.dex, 10) || 0;
  const pow = parseInt(rec?.data?.pow, 10) || 0;
  const age = rec?.data?.age || "20";

  // HP = (CON + SIZ) / 10, rounded down
  const maxHp = Math.floor((con + siz) / 10);
  const oldMaxHp = parseInt(rec?.data?.maxHp, 10) || 0;
  fieldsToSet["data.maxHp"] = maxHp;
  // Initialize curHp to maxHp only when maxHp is first computed (was 0 or unset)
  if (!oldMaxHp && maxHp > 0) {
    fieldsToSet["data.curHp"] = maxHp;
  }

  // MP = POW / 5, rounded down
  const maxMp = Math.floor(pow / 5);
  const oldMaxMp = parseInt(rec?.data?.maxMp, 10) || 0;
  fieldsToSet["data.maxMp"] = maxMp;
  // Initialize curMp to maxMp only when maxMp is first computed (was 0 or unset)
  if (!oldMaxMp && maxMp > 0) {
    fieldsToSet["data.curMp"] = maxMp;
  }

  // SAN starts equal to POW, max SAN = 99 - Cthulhu Mythos
  const cthulhuMythos = parseInt(rec?.data?.cthulhuMythos, 10) || 0;
  fieldsToSet["data.maxSan"] = 99 - cthulhuMythos;
  // Initialize san to POW only when san hasn't been set yet (no existing san and POW > 0)
  const oldSan = parseInt(rec?.data?.san, 10) || 0;
  if (!oldSan && pow > 0) {
    fieldsToSet["data.san"] = pow;
  }

  // Damage Bonus & Build from STR+SIZ table
  const { db, build } = getDamageBonusAndBuild(str + siz);
  fieldsToSet["data.damageBonus"] = db;
  fieldsToSet["data.build"] = build;

  // Move Rate
  fieldsToSet["data.mov"] = getMoveRate(str, dex, siz, age);

  // Half and fifth for all characteristics
  const stats = ["str", "con", "siz", "dex", "app", "int", "pow", "edu"];
  stats.forEach((stat) => {
    const val = parseInt(rec?.data?.[stat], 10) || 0;
    fieldsToSet[`data.${stat}Half`] = Math.floor(val / 2);
    fieldsToSet[`data.${stat}Fifth`] = Math.floor(val / 5);
  });

  // Luck half/fifth
  const luck = parseInt(rec?.data?.luck, 10) || 0;
  fieldsToSet["data.luckHalf"] = Math.floor(luck / 2);
  fieldsToSet["data.luckFifth"] = Math.floor(luck / 5);
}

// ============================================================
// Modifier Collection
// ============================================================

/**
 * Collect modifiers from effects, features, and equipped items on a token/record.
 * @param {object} target - The record/token to scan
 * @param {string[]} types - Modifier types to include (e.g., ["skillBonus", "skillPenalty"])
 * @param {string} field - Field to match (e.g., "Dodge", "str", "all", or "" for any)
 * @param {string} itemId - If set, only include itemOnly modifiers from this item
 * @returns {object[]} Array of { name, value, active, modifierType, field, valueType, isPenalty, isEffect }
 */
function getEffectsAndModifiersForToken(
  target,
  types = [],
  field = "",
  itemId = undefined,
) {
  if (!target) return [];
  const results = [];

  // Helper: check if a modifier's field matches the requested field
  function fieldMatches(modField) {
    if (!field) return true;
    if (!modField || modField === "all") return true;
    return modField.toLowerCase() === field.toLowerCase();
  }

  // Helper: process a single modifier from a source
  function processMod(mod, sourceName, sourceId, isEffect) {
    if (!mod?.data?.type) return;
    if (types.length > 0 && !types.includes(mod.data.type)) return;
    if (!fieldMatches(mod.data.field)) return;

    // itemOnly filtering
    if (mod.data.itemOnly && itemId && sourceId !== itemId) return;
    if (mod.data.itemOnly && !itemId) return;

    const isPenalty = mod.data.type.toLowerCase().includes("penalty");

    let value = mod.data.value;
    const valueType = mod.data.valueType || "number";
    if (valueType === "number") {
      value = parseInt(value, 10) || 0;
      if (isPenalty && value > 0) value = -value;
    }

    results.push({
      _id: mod._id || sourceId,
      name: sourceName,
      value: value,
      active: mod.data.active !== false,
      modifierType: mod.data.type,
      field: mod.data.field || "",
      valueType: valueType,
      isPenalty: isPenalty,
      isEffect: isEffect || false,
      itemId: mod.data.itemOnly ? sourceId : undefined,
    });
  }

  // 1. Effects (conditions, applied effects from spells/artifacts)
  const effects = target.effects || [];
  for (const effect of effects) {
    const rules = effect.rules || [];
    for (const rule of rules) {
      processMod(
        { data: rule, _id: effect._id },
        effect.name || "Effect",
        effect._id,
        true,
      );
    }
  }

  // 2. Equipped items from inventory
  const inventory = target.data?.inventory || [];
  for (const item of inventory) {
    if (item.data?.carried !== "equipped") continue;
    const mods = item.data?.modifiers || [];
    for (const mod of mods) {
      processMod(mod, item.name || "Item", item._id, false);
    }
  }

  // 3. Spells (some spells grant passive modifiers)
  const spells = target.data?.spells || [];
  for (const spell of spells) {
    const mods = spell.data?.modifiers || [];
    for (const mod of mods) {
      processMod(mod, spell.name || "Spell", spell._id, false);
    }
  }

  return results;
}

function getEffectsAndModifiers(types, field, itemId) {
  return getEffectsAndModifiersForToken(record, types, field, itemId);
}

// ============================================================
// Stat Modifier Recalculation
// ============================================================

/**
 * Recalculate stat bonuses/penalties from equipped items and effects.
 * Uses base values (data.{stat}Base) + modifier sum = effective stat (data.{stat}).
 * If no base value is stored yet, the current stat value is used as the base.
 * After updating stats, recalculates derived stats (HP, DB, MOV, half/fifth).
 */
function recalcStatModifiers(fieldsToSet, rec) {
  const stats = ["str", "con", "siz", "dex", "app", "int", "pow", "edu"];

  for (const stat of stats) {
    // Get or initialize the base value
    let base = rec?.data?.[`${stat}Base`];
    if (base === undefined || base === null) {
      base = parseInt(rec?.data?.[stat], 10) || 0;
      fieldsToSet[`data.${stat}Base`] = base;
    } else {
      base = parseInt(base, 10) || 0;
    }

    // Sum all statBonus/statPenalty modifiers for this stat
    const mods = getEffectsAndModifiersForToken(
      rec,
      ["statBonus", "statPenalty"],
      stat,
    );
    let bonus = 0;
    for (const mod of mods) {
      if (mod.active) {
        bonus += parseInt(mod.value, 10) || 0;
      }
    }

    const effective = Math.max(0, base + bonus);
    fieldsToSet[`data.${stat}`] = effective;
    fieldsToSet[`data.${stat}Half`] = Math.floor(effective / 2);
    fieldsToSet[`data.${stat}Fifth`] = Math.floor(effective / 5);
  }

  // Recalculate derived stats with the new effective values
  // Build a temporary rec with the updated stats for recalcDerivedStats
  const tempRec = { data: { ...rec?.data } };
  for (const key of Object.keys(fieldsToSet)) {
    if (key.startsWith("data.")) {
      const field = key.substring(5);
      tempRec.data[field] = fieldsToSet[key];
    }
  }
  recalcDerivedStats(fieldsToSet, tempRec);
}

// ============================================================
// Skill Roll Helpers
// ============================================================

function performSkillCheck(
  rec,
  skillName,
  skillValue,
  additionalMetadata = {},
) {
  const half = Math.floor(skillValue / 2);
  const fifth = Math.floor(skillValue / 5);

  const metadata = {
    rollName: skillName,
    skillValue: skillValue,
    halfValue: half,
    fifthValue: fifth,
    recordType: rec?.recordType || "characters",
    recordId: rec?._id,
    tokenId: api.getToken()?._id,
    targetId: api.getTargets()?.[0]?.token?._id,
    ...additionalMetadata,
  };

  // Collect modifiers for this roll
  const modifiers = [];

  // Skill bonus/penalty modifiers (match by skill name)
  const skillMods = getEffectsAndModifiersForToken(
    rec,
    ["skillBonus", "skillPenalty"],
    skillName,
  );
  modifiers.push(...skillMods);

  // Bonus/penalty dice — collected and passed as metadata counts
  // Search by skill name, and also by characteristic abbreviation for stat rolls
  const bonusDice = getEffectsAndModifiersForToken(
    rec,
    ["bonusDie"],
    skillName,
  );
  const penaltyDice = getEffectsAndModifiersForToken(
    rec,
    ["penaltyDie"],
    skillName,
  );

  // For characteristic rolls, also check modifiers targeting the stat abbreviation
  if (additionalMetadata.characteristic) {
    const charBonusDice = getEffectsAndModifiersForToken(
      rec,
      ["bonusDie"],
      additionalMetadata.characteristic,
    );
    const charPenaltyDice = getEffectsAndModifiersForToken(
      rec,
      ["penaltyDie"],
      additionalMetadata.characteristic,
    );
    // Add only unique modifiers (avoid duplicates from "all" matching both)
    const existingIds = new Set(bonusDice.map((m) => m._id));
    for (const m of charBonusDice) {
      if (!existingIds.has(m._id)) bonusDice.push(m);
    }
    const existingPenIds = new Set(penaltyDice.map((m) => m._id));
    for (const m of charPenaltyDice) {
      if (!existingPenIds.has(m._id)) penaltyDice.push(m);
    }
  }

  let bonusDieCount =
    (additionalMetadata.bonusDice || 0) +
    bonusDice.filter((m) => m.active).length;
  let penaltyDieCount =
    (additionalMetadata.penaltyDice || 0) +
    penaltyDice.filter((m) => m.active).length;

  // Net bonus/penalty dice (they cancel each other out)
  const netDice = bonusDieCount - penaltyDieCount;
  if (netDice > 0) {
    metadata.bonusDice = netDice;
  } else if (netDice < 0) {
    metadata.penaltyDice = Math.abs(netDice);
  }

  // SAN-specific modifiers
  if (additionalMetadata.isSanity) {
    const sanMods = getEffectsAndModifiersForToken(
      rec,
      ["sanBonus", "sanPenalty"],
      "san",
    );
    modifiers.push(...sanMods);
  }

  // Attack-specific modifiers
  if (additionalMetadata.isAttack) {
    const attackField = additionalMetadata.isMelee ? "melee" : "ranged";
    const attackBonusDice = getEffectsAndModifiersForToken(
      rec,
      ["bonusDie"],
      attackField,
    );
    const attackPenaltyDice = getEffectsAndModifiersForToken(
      rec,
      ["penaltyDie"],
      attackField,
    );
    bonusDieCount =
      (metadata.bonusDice || 0) +
      attackBonusDice.filter((m) => m.active).length;
    penaltyDieCount =
      (metadata.penaltyDice || 0) +
      attackPenaltyDice.filter((m) => m.active).length;
    const netAttackDice = bonusDieCount - penaltyDieCount;
    if (netAttackDice > 0) {
      metadata.bonusDice = netAttackDice;
      metadata.penaltyDice = 0;
    } else if (netAttackDice < 0) {
      metadata.bonusDice = 0;
      metadata.penaltyDice = Math.abs(netAttackDice);
    }
  }

  // Build formula: 1d100 default + typed d% for bonus/penalty dice
  let formula = "1d100 default";
  if (metadata.bonusDice > 0) {
    formula += ` + ${metadata.bonusDice}d% bonus`;
    metadata.diceColors = BONUS_DICE_COLORS;
  }
  if (metadata.penaltyDice > 0) {
    formula += ` + ${metadata.penaltyDice}d% penalty`;
    metadata.diceColors = PENALTY_DICE_COLORS;
  }

  if (rec.linked === undefined) {
    api.promptRoll(`${skillName}`, formula, modifiers, metadata, "skill");
  } else {
    api.promptRollForToken(
      rec,
      `${skillName}`,
      formula,
      modifiers,
      metadata,
      "skill",
    );
  }
}

const STAT_FULL_NAMES = {
  str: "Strength",
  con: "Constitution",
  siz: "Size",
  dex: "Dexterity",
  app: "Appearance",
  int: "Intelligence",
  pow: "Willpower",
  edu: "Education",
};

function performCharacteristicRoll(
  rec,
  statName,
  statValue,
  additionalMetadata = {},
) {
  const fullName = STAT_FULL_NAMES[statName] || capitalize(statName);
  const abbrev = statName.toUpperCase();
  performSkillCheck(rec, `${abbrev} Roll`, statValue, {
    isCharacteristic: true,
    characteristic: statName,
    characteristicFullName: fullName,
    ...additionalMetadata,
  });
}

// ============================================================
// Opposed Roll Helpers
// ============================================================

function performOpposedAttack(
  rec,
  skillName,
  skillValue,
  weaponData,
  additionalMetadata = {},
) {
  performSkillCheck(rec, skillName, skillValue, {
    isAttack: true,
    isMelee: true,
    isOpposed: true,
    weapon: weaponData,
    ...additionalMetadata,
  });
}

function performFirearmAttack(
  rec,
  skillName,
  skillValue,
  weaponData,
  additionalMetadata = {},
) {
  performSkillCheck(rec, skillName, skillValue, {
    isAttack: true,
    isFirearm: true,
    isOpposed: false,
    weapon: weaponData,
    ...additionalMetadata,
  });
}

// ============================================================
// Sanity Check Helper
// ============================================================

function performSanityCheck(rec, sanLossSuccess, sanLossFailure) {
  const san = parseInt(rec?.data?.san, 10) || 0;

  const metadata = {
    rollName: "Sanity Check",
    skillValue: san,
    halfValue: Math.floor(san / 2),
    fifthValue: Math.floor(san / 5),
    isSanity: true,
    cannotPush: true,
    sanLossSuccess: sanLossSuccess,
    sanLossFailure: sanLossFailure,
    tokenId: api.getToken()?._id,
  };

  if (rec.linked === undefined) {
    api.promptRoll("Sanity Check", "1d100 default", [], metadata, "sanity");
  } else {
    api.promptRollForToken(
      rec,
      "Sanity Check",
      "1d100 default",
      [],
      metadata,
      "sanity",
    );
  }
}

// ============================================================
// Default Skill List
// ============================================================

function getDefaultSkills(rec) {
  const dex = parseInt(rec?.data?.dex, 10) || 0;
  const edu = parseInt(rec?.data?.edu, 10) || 0;

  return [
    { name: "Accounting", baseValue: 5 },
    { name: "Anthropology", baseValue: 1 },
    { name: "Appraise", baseValue: 5 },
    { name: "Archaeology", baseValue: 1 },
    {
      name: "Art and Craft",
      baseValue: 5,
      hasSpecializations: true,
      specializations: [
        { name: "Acting", baseValue: 5 },
        { name: "Fine Art", baseValue: 5 },
        { name: "Forgery", baseValue: 5 },
        { name: "Photography", baseValue: 5 },
      ],
    },
    { name: "Charm", baseValue: 15 },
    { name: "Climb", baseValue: 20 },
    { name: "Computer Use", baseValue: 5 },
    { name: "Credit Rating", baseValue: 0 },
    {
      name: "Cthulhu Mythos",
      baseValue: 0,
      cannotPush: true,
      noImprovement: true,
    },
    { name: "Disguise", baseValue: 5 },
    { name: "Dodge", baseValue: getHalf(dex), cannotPush: true },
    { name: "Drive Auto", baseValue: 20 },
    { name: "Electrical Repair", baseValue: 10 },
    { name: "Electronics", baseValue: 1 },
    { name: "Fast Talk", baseValue: 5 },
    {
      name: "Fighting",
      baseValue: 25,
      hasSpecializations: true,
      cannotPush: true,
      specializations: [
        { name: "Brawl", baseValue: 25 },
        { name: "Axe", baseValue: 15 },
        { name: "Chainsaw", baseValue: 10 },
        { name: "Flail", baseValue: 10 },
        { name: "Garrote", baseValue: 15 },
        { name: "Spear", baseValue: 20 },
        { name: "Sword", baseValue: 20 },
        { name: "Whip", baseValue: 5 },
      ],
    },
    {
      name: "Firearms",
      baseValue: 20,
      hasSpecializations: true,
      cannotPush: true,
      specializations: [
        { name: "Bow", baseValue: 15 },
        { name: "Handgun", baseValue: 20 },
        { name: "Heavy Weapons", baseValue: 10 },
        { name: "Flamethrower", baseValue: 10 },
        { name: "Machine Gun", baseValue: 10 },
        { name: "Rifle/Shotgun", baseValue: 25 },
        { name: "Submachine Gun", baseValue: 15 },
      ],
    },
    { name: "First Aid", baseValue: 30 },
    { name: "History", baseValue: 5 },
    { name: "Intimidate", baseValue: 15 },
    { name: "Jump", baseValue: 20 },
    {
      name: "Language (Other)",
      baseValue: 1,
      hasSpecializations: true,
      specializations: [{ name: "Latin", baseValue: 1 }],
    },
    { name: "Language (Own)", baseValue: edu },
    { name: "Law", baseValue: 5 },
    { name: "Library Use", baseValue: 20 },
    { name: "Listen", baseValue: 20 },
    { name: "Locksmith", baseValue: 1 },
    { name: "Mechanical Repair", baseValue: 10 },
    { name: "Medicine", baseValue: 1 },
    { name: "Natural World", baseValue: 10 },
    { name: "Navigate", baseValue: 10 },
    { name: "Occult", baseValue: 5 },
    { name: "Operate Heavy Machinery", baseValue: 1 },
    { name: "Persuade", baseValue: 10 },
    {
      name: "Pilot",
      baseValue: 1,
      hasSpecializations: true,
      specializations: [
        { name: "Aircraft", baseValue: 1 },
        { name: "Boat", baseValue: 1 },
      ],
    },
    { name: "Psychoanalysis", baseValue: 1 },
    { name: "Psychology", baseValue: 10 },
    { name: "Ride", baseValue: 5 },
    {
      name: "Science",
      baseValue: 1,
      hasSpecializations: true,
      specializations: [
        { name: "Astronomy", baseValue: 1 },
        { name: "Biology", baseValue: 1 },
        { name: "Botany", baseValue: 1 },
        { name: "Chemistry", baseValue: 1 },
        { name: "Cryptography", baseValue: 1 },
        { name: "Engineering", baseValue: 1 },
        { name: "Forensics", baseValue: 1 },
        { name: "Geology", baseValue: 1 },
        { name: "Mathematics", baseValue: 10 },
        { name: "Meteorology", baseValue: 1 },
        { name: "Pharmacy", baseValue: 1 },
        { name: "Physics", baseValue: 1 },
        { name: "Zoology", baseValue: 1 },
      ],
    },
    { name: "Sleight of Hand", baseValue: 10 },
    { name: "Spot Hidden", baseValue: 25 },
    { name: "Stealth", baseValue: 20 },
    {
      name: "Survival",
      baseValue: 10,
      hasSpecializations: true,
      specializations: [
        { name: "Arctic", baseValue: 10 },
        { name: "Desert", baseValue: 10 },
        { name: "Sea", baseValue: 10 },
      ],
    },
    { name: "Swim", baseValue: 20 },
    { name: "Throw", baseValue: 20 },
    { name: "Track", baseValue: 10 },
  ];
}

// Build the skill list data structure for populating on a character
function populateDefaultSkills(rec) {
  const defaultSkills = getDefaultSkills(rec);
  const skillData = [];

  defaultSkills.forEach((skill) => {
    const hasSpecs = skill.hasSpecializations || false;

    const skillEntry = {
      _id: generateUuid(),
      name: skill.name,
      unidentifiedName: skill.name,
      recordType: "skill",
      identified: true,
      icon: "IconDice",
      data: {
        baseValue: skill.baseValue,
        value: skill.baseValue,
        halfValue: getHalf(skill.baseValue),
        fifthValue: getFifth(skill.baseValue),
        checked: false,
        isOccupation: false,
        hasSpecializations: hasSpecs,
        cannotPush: skill.cannotPush || false,
        noImprovement: skill.noImprovement || false,
        specializations: [],
      },
      fields: {
        rollSkill: { hidden: hasSpecs },
        value: { hidden: hasSpecs },
        halfValue: { hidden: hasSpecs },
        fifthValue: { hidden: hasSpecs },
        checked: { hidden: hasSpecs },
        specializations: { hidden: !hasSpecs },
      },
    };

    // Add default specializations
    if (hasSpecs && skill.specializations) {
      skillEntry.data.specializations = skill.specializations.map((spec) => ({
        _id: generateUuid(),
        name: `${spec.name}`,
        unidentifiedName: `${spec.name}`,
        recordType: "specialization",
        identified: true,
        icon: "IconDice",
        data: {
          baseValue: spec.baseValue,
          value: spec.baseValue,
          halfValue: getHalf(spec.baseValue),
          fifthValue: getFifth(spec.baseValue),
          checked: false,
          isOccupation: false,
          cannotPush: skill.cannotPush || false,
          parentSkill: skill.name,
        },
      }));
    }

    skillData.push(skillEntry);
  });

  return skillData;
}

// Restore any default skills that are missing from the character's skill list
function restoreMissingSkills(rec, callback) {
  const existingSkills = rec?.data?.skills || [];
  const existingNames = new Set(existingSkills.map((s) => s.name));
  const defaultSkills = getDefaultSkills(rec);
  const missingSkills = [];

  defaultSkills.forEach((skill) => {
    if (!existingNames.has(skill.name)) {
      const hasSpecs = skill.hasSpecializations || false;

      const skillEntry = {
        _id: generateUuid(),
        name: skill.name,
        unidentifiedName: skill.name,
        recordType: "skill",
        identified: true,
        icon: "IconDice",
        data: {
          baseValue: skill.baseValue,
          value: skill.baseValue,
          halfValue: getHalf(skill.baseValue),
          fifthValue: getFifth(skill.baseValue),
          checked: false,
          isOccupation: false,
          hasSpecializations: hasSpecs,
          cannotPush: skill.cannotPush || false,
          noImprovement: skill.noImprovement || false,
          specializations: [],
        },
        fields: {
          rollSkill: { hidden: hasSpecs },
          value: { hidden: hasSpecs },
          halfValue: { hidden: hasSpecs },
          fifthValue: { hidden: hasSpecs },
          checked: { hidden: hasSpecs },
          specializations: { hidden: !hasSpecs },
        },
      };

      if (hasSpecs && skill.specializations) {
        skillEntry.data.specializations = skill.specializations.map((spec) => ({
          _id: generateUuid(),
          name: `${spec.name}`,
          unidentifiedName: `${spec.name}`,
          recordType: "specialization",
          identified: true,
          icon: "IconDice",
          data: {
            baseValue: spec.baseValue,
            value: spec.baseValue,
            halfValue: getHalf(spec.baseValue),
            fifthValue: getFifth(spec.baseValue),
            checked: false,
            isOccupation: false,
            cannotPush: skill.cannotPush || false,
            parentSkill: skill.name,
          },
        }));
      }

      missingSkills.push(skillEntry);
    }
  });

  if (missingSkills.length === 0) {
    api.showNotification("All default skills are present.", "green", "Skills");
    if (callback) callback(0);
    return;
  }

  // Merge missing skills into existing array and set all at once
  const merged = [...existingSkills, ...missingSkills];
  api.setValues({ "data.skills": merged }, () => {
    api.showNotification(
      `Restored ${missingSkills.length} missing skill(s).`,
      "green",
      "Skills",
    );
    if (callback) callback(missingSkills.length);
  });
}

// ============================================================
// Skill Lookup Helpers
// ============================================================

function findSkillByName(rec, skillName) {
  const skills = rec?.data?.skills || [];
  for (let i = 0; i < skills.length; i++) {
    if (skills[i].name === skillName) return skills[i];
    // Check specializations
    const specs = skills[i].data?.specializations || [];
    for (let j = 0; j < specs.length; j++) {
      if (specs[j].name === skillName) return specs[j];
    }
  }
  return null;
}

function getSkillValue(rec, skillName) {
  const skill = findSkillByName(rec, skillName);
  return skill?.data?.value || 0;
}

// ============================================================
// Damage Bonus Helpers
// ============================================================

function parseDamageBonus(dbString) {
  // Returns the DB as a roll formula component, or empty string
  if (!dbString || dbString === "0" || dbString === "None") return "";
  return dbString; // e.g., "+1D4", "-1", "+1D6"
}

function buildDamageFormula(weaponDamage, damageBonus, isMelee) {
  let formula = weaponDamage;
  if (isMelee) {
    const db = parseDamageBonus(damageBonus);
    if (db && db !== "0") {
      formula += ` ${db}`;
    }
  }
  return formula;
}

// ============================================================
// Effect Application Helpers
// ============================================================

/**
 * Build macro buttons for applying effects from a spell/item.
 * Effects are stored as JSON strings from the optionsquery dropdown.
 * @param {string[]} effects - Array of JSON-serialized effect objects
 * @returns {string} Macro button markup to embed in chat messages
 */
function getEffectMacrosFor(effects = []) {
  let macros = "";
  for (const effectJson of effects) {
    try {
      const effect = JSON.parse(effectJson);
      const effectID = effect?._id || "";
      const effectName = effect?.name || "Effect";
      const safeName = effectName.replace(/[^a-zA-Z0-9]/g, "_");

      macros += `\n\`\`\`Apply_${safeName}
  const selectedTokens = api.getSelectedOrDroppedToken();
  selectedTokens.forEach(token => {
    api.addEffectById('${effectID}', token);
  });
\`\`\``;
    } catch (e) {
      // Skip malformed effect JSON
    }
  }
  return macros;
}

// ============================================================
// Luck Spending
// ============================================================

function spendLuck(rec, amount) {
  const currentLuck = parseInt(rec?.data?.luck, 10) || 0;
  if (amount > currentLuck) {
    api.showNotification("Not enough Luck points!", "red", "Luck");
    return false;
  }
  const newLuck = currentLuck - amount;
  api.setValuesOnRecord(rec, {
    "data.luck": newLuck,
    "data.luckHalf": getHalf(newLuck),
    "data.luckFifth": getFifth(newLuck),
  });
  return true;
}
