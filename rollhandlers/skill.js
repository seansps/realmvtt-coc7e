// ============================================================
// Call of Cthulhu 7e - Skill Roll Handler
// Evaluates d100 roll-under with Regular/Hard/Extreme/Critical
// Handles: push mechanic, opposed rolls, bonus/penalty dice
// ============================================================

const roll = {
  ...data.roll,
  dice: [...(data?.roll?.dice || [])],
  total: data?.roll?.total !== undefined ? data?.roll?.total : 0,
};

const metadata = data?.roll?.metadata || {};
const skillName = metadata.rollName || "Skill Check";
const skillValue = metadata.skillValue || 0;
const halfValue = metadata.halfValue || Math.floor(skillValue / 2);
const fifthValue = metadata.fifthValue || Math.floor(skillValue / 5);
const isPushed = metadata.isPushed || false;
const cannotPush = metadata.cannotPush || false;
const isCharacteristic = metadata.isCharacteristic || false;
const isAttack = metadata.isAttack || false;
const isMelee = metadata.isMelee || false;
const isFirearm = metadata.isFirearm || false;
const isOpposed = metadata.isOpposed || false;
const isLuck = metadata.isLuck || false;
const weapon = metadata.weapon || null;
const tokenId = metadata.tokenId;
const targetId = metadata.targetId;
const animation = metadata.animation || null;

// ============================================================
// Resolve Bonus/Penalty Dice
// ============================================================
// d100 in roll.dice splits into two d10s:
//   { type: 10, isD100Tens: true, value: N }  — tens digit (0-9)
//   { type: 10, isD100Ones: true, value: N }  — ones digit
// Extra d0s (typed "bonus" or "penalty") are alternative tens digits (0-9).
// Bonus: take lowest result. Penalty: take highest result.

const bonusDiceCount = metadata.bonusDice || 0;
const penaltyDiceCount = metadata.penaltyDice || 0;
const hasExtraDice = bonusDiceCount > 0 || penaltyDiceCount > 0;

let rollTotal;
let rollExplanation = "";

if (hasExtraDice) {
  // Use the types array for raw values — roll.dice is pre-munged by the system
  const types = roll.types || [];

  // types structure for "1d100 default + 1d% bonus":
  //   die:100 (not percentile) → value is the tens portion (already ×10, e.g., 60)
  //   die:10, isSpecialD10:true → value is the ones digit (e.g., 9)
  //   die:100, isPercentileDie:true → value is the d% tens (already ×10, e.g., 40)
  const d100Type = types.find((t) => t.die === 100 && !t.isPercentileDie);
  const onesType = types.find((t) => t.isSpecialD10);
  const percentileTypes = types.filter((t) => t.isPercentileDie);

  const ones = onesType ? onesType.value : 0;
  const baseTens = d100Type ? d100Type.value : 0; // already ×10

  // All tens candidates
  const candidates = [{ tens: baseTens }];
  for (const t of percentileTypes) {
    candidates.push({ tens: t.value }); // already ×10
  }

  // Calculate full result for each (00 + 0 = 100)
  for (const c of candidates) {
    c.result = c.tens + ones;
    if (c.result === 0) c.result = 100;
  }

  // Pick best (bonus) or worst (penalty)
  let chosen;
  if (bonusDiceCount > 0) {
    chosen = candidates.reduce((best, c) =>
      c.result < best.result ? c : best,
    );
    rollExplanation = `Bonus die: ${candidates.map((c) => c.result).join(", ")} → took ${chosen.result}`;
  } else {
    chosen = candidates.reduce((worst, c) =>
      c.result > worst.result ? c : worst,
    );
    rollExplanation = `Penalty die: ${candidates.map((c) => c.result).join(", ")} → took ${chosen.result}`;
  }

  rollTotal = chosen.result;
  roll.total = rollTotal;

  // Rebuild roll.dice with only the winning d100 pair — omit d% dice entirely
  roll.dice = [
    {
      type: 10,
      value: Math.floor(chosen.tens / 10),
      reason: "natural",
      isD100Tens: true,
      d100PairId: 0,
    },
    {
      type: 10,
      value: ones,
      reason: "natural",
      isD100Ones: true,
      d100PairId: 0,
    },
  ];
} else {
  rollTotal = roll.total;
}

// Evaluate success level
const successLevel = getSuccessLevel(rollTotal, skillValue);
const successName = SUCCESS_LEVEL_NAMES[successLevel];
const successColor = SUCCESS_LEVEL_COLORS[successLevel];

// Build tags
const tags = [];
tags.push({
  name: skillName,
  tooltip: `${skillName}: ${skillValue}% (Hard: ${halfValue}%, Extreme: ${fifthValue}%)`,
});

if (hasExtraDice) {
  const diceType = bonusDiceCount > 0 ? "Bonus" : "Penalty";
  const diceCount = bonusDiceCount > 0 ? bonusDiceCount : penaltyDiceCount;
  tags.push({
    name: `${diceType} ×${diceCount}`,
    tooltip: rollExplanation,
  });
}

if (isPushed) {
  tags.push({
    name: "Pushed",
    tooltip:
      "This roll was pushed — a re-attempt with consequences on failure.",
  });
}

if (isCharacteristic) {
  const charFullName = metadata.characteristicFullName || skillName;
  tags.push({
    name: "Characteristic",
    tooltip: `${charFullName} (${skillName}) characteristic roll.`,
  });
}

if (isAttack) {
  const attackType = isMelee ? "Melee" : "Ranged";
  const weaponSkillName = weapon?.skillName || skillName;
  tags.push({
    name: `${attackType} Attack`,
    tooltip: `${weaponSkillName} — ${attackType.toLowerCase()} attack`,
  });
  if (weaponSkillName && weaponSkillName !== skillName) {
    tags.push({
      name: weaponSkillName,
      tooltip: `Skill: ${weaponSkillName} (${skillValue}%)`,
    });
  }
}

// Add success level tag
tags.push({
  name: successName,
  tooltip: `Rolled ${rollTotal} vs ${skillValue}% — ${successName}`,
});

// Build message
let message = "";

// Success/Failure display
if (successLevel >= SUCCESS_LEVELS.REGULAR) {
  message += `\n**[center][color=${successColor}]${successName}[/color] (${rollTotal} vs ${skillValue}%)[/center]**`;
} else if (successLevel === SUCCESS_LEVELS.FUMBLE) {
  message += `\n**[center][color=${successColor}]FUMBLE![/color] (${rollTotal} vs ${skillValue}%)[/center]**`;
} else {
  message += `\n**[center][color=${successColor}]${successName}[/color] (${rollTotal} vs ${skillValue}%)[/center]**`;
}

// Show thresholds for context
message += `\n[center][color=gray]Regular: ≤${skillValue} | Hard: ≤${halfValue} | Extreme: ≤${fifthValue}[/color][/center]`;

// ============================================================
// Push Mechanic
// ============================================================

// On failure (not fumble), offer push if allowed
if (
  successLevel === SUCCESS_LEVELS.FAILURE &&
  !isPushed &&
  !cannotPush &&
  !isAttack &&
  !isLuck
) {
  const recType = metadata.recordType || "characters";
  const recId = metadata.recordId || "";
  const pushMacro = `\`\`\`Push_${skillName.replace(/[^a-zA-Z0-9]/g, "_")}
  api.getRecord("${recType}", "${recId}", (rec) => {
    if (!rec) return;
    performSkillCheck(rec, "${skillName}", ${skillValue}, {
      isPushed: true,
      cannotPush: ${cannotPush},
      isCharacteristic: ${isCharacteristic},
    });
  });
\`\`\``;
  message += `\n${pushMacro}`;
}

// Luck spending — offer on failure (not fumble, not Luck rolls, not SAN checks)
if (successLevel === SUCCESS_LEVELS.FAILURE && !isLuck && !metadata.isSanity) {
  const recType = metadata.recordType || "characters";
  const recId = metadata.recordId || "";
  const luckNeeded = rollTotal - skillValue;
  if (luckNeeded > 0) {
    const luckMacro = `\`\`\`Spend_${luckNeeded}_Luck
  api.getRecord("${recType}", "${recId}", (rec) => {
    if (!rec) return;
    if (spendLuck(rec, ${luckNeeded})) {
      api.sendMessage("[center]Spent **${luckNeeded} Luck** to turn ${rollTotal} into a Regular Success (${skillValue}%).[/center]");
    }
  });
\`\`\``;
    message += `\n${luckMacro}`;
  }
}

// On pushed failure, warn about consequences
if (isPushed && successLevel < SUCCESS_LEVELS.REGULAR) {
  message += `\n\n[color=red]**Pushed roll failed!** The Keeper determines the consequences.[/color]`;
}

// ============================================================
// Opposed Roll Support (Melee Combat)
// ============================================================

if (
  isAttack &&
  isMelee &&
  isOpposed &&
  successLevel >= SUCCESS_LEVELS.REGULAR
) {
  // Embed macro buttons for defender to Fight Back or Dodge
  const attackerSuccessLevel = successLevel;
  const attackerRoll = rollTotal;

  // Enrich weapon with attacker's damage bonus so defense resolution can build impale formula
  const weaponWithDb = weapon
    ? { ...weapon, damageBonus: record?.data?.damageBonus || "0" }
    : weapon;

  const fightBackMacro = `\`\`\`Fight_Back
  const selectedTokens = api.getSelectedOrDroppedToken();
  selectedTokens.forEach(token => {
    // Find the defender's Fighting (Brawl) skill
    const skills = token.data?.skills || [];
    let fightingValue = 0;
    for (let i = 0; i < skills.length; i++) {
      if (skills[i].name === "Fighting") {
        const specs = skills[i].data?.specializations || [];
        for (let j = 0; j < specs.length; j++) {
          if (specs[j].data?.value > fightingValue) {
            fightingValue = specs[j].data?.value || 0;
          }
        }
        break;
      }
    }
    if (fightingValue === 0) fightingValue = 25;

    performSkillCheck(token, "Fight Back", fightingValue, {
      isDefense: true,
      defenseType: "fightBack",
      attackerSuccessLevel: ${attackerSuccessLevel},
      attackerRoll: ${attackerRoll},
      attackerSkillValue: ${skillValue},
      attackerTokenId: "${tokenId || ""}",
      weapon: ${JSON.stringify(weaponWithDb)},
    });
  });
\`\`\``;

  const dodgeMacro = `\`\`\`Dodge
  const selectedTokens = api.getSelectedOrDroppedToken();
  selectedTokens.forEach(token => {
    const skills = token.data?.skills || [];
    let dodgeValue = 0;
    for (let i = 0; i < skills.length; i++) {
      if (skills[i].name === "Dodge") {
        dodgeValue = skills[i].data?.value || 0;
        break;
      }
    }

    performSkillCheck(token, "Dodge", dodgeValue, {
      isDefense: true,
      defenseType: "dodge",
      attackerSuccessLevel: ${attackerSuccessLevel},
      attackerRoll: ${attackerRoll},
      attackerSkillValue: ${skillValue},
      attackerTokenId: "${tokenId || ""}",
      weapon: ${JSON.stringify(weaponWithDb)},
      cannotPush: true,
    });
  });
\`\`\``;

  message += `\n${fightBackMacro}\n${dodgeMacro}`;
}

// ============================================================
// Opposed Defense Resolution
// ============================================================

if (metadata.isDefense) {
  const attackerSuccessLevel = metadata.attackerSuccessLevel;
  const defenseType = metadata.defenseType;

  if (successLevel > attackerSuccessLevel) {
    // Defender wins
    message += `\n\n**[center][color=green]Defense Succeeds![/color][/center]**`;
    if (defenseType === "fightBack" && successLevel >= SUCCESS_LEVELS.REGULAR) {
      // Defender gets to deal damage when fighting back
      message += `\n[center]Defender may deal damage to the attacker.[/center]`;
    }
  } else if (successLevel === attackerSuccessLevel) {
    // Tie — attacker wins on fight back, defender wins on dodge
    if (defenseType === "dodge") {
      message += `\n\n**[center][color=green]Dodge Succeeds![/color] (tie goes to defender)[/center]**`;
    } else {
      message += `\n\n**[center][color=red]Attack Hits![/color] (tie goes to attacker)[/center]**`;
      // Embed damage macro
      if (metadata.weapon) {
        const w = metadata.weapon;
        const dmgFormula = w.damage || "1D3";
        const isMeleeWeapon = true;
        const isImpaling = w.isImpaling || false;
        const isExtreme = attackerSuccessLevel >= SUCCESS_LEVELS.EXTREME;
        const wItemId = w.itemId || "";

        const wIsMagical = w.isMagical || false;
        const wDamageBonus = w.damageBonus || "0";
        const rollFormula =
          isImpaling && isExtreme
            ? buildImpaleFormula(dmgFormula, wDamageBonus, isMeleeWeapon)
            : dmgFormula;
        const damageMacro = `\`\`\`Roll_Damage
  const damageMods = getEffectsAndModifiers(["damageBonus", "damagePenalty"], "melee", "${wItemId}");
  const damageMetadata = {
    weaponDamage: "${dmgFormula}",
    isMelee: ${isMeleeWeapon},
    isImpaling: ${isImpaling},
    isExtreme: ${isExtreme},
    isMagical: ${wIsMagical},
    damageBonus: record?.data?.damageBonus || "0",
    attackerTokenId: "${metadata.attackerTokenId || ""}",
  };
  api.promptRoll("Damage", "${rollFormula}", damageMods, damageMetadata, "damage");
\`\`\``;
        message += `\n${damageMacro}`;
      }
    }
  } else {
    // Attacker wins
    message += `\n\n**[center][color=red]Attack Hits![/color][/center]**`;
    if (metadata.weapon) {
      const w = metadata.weapon;
      const dmgFormula = w.damage || "1D3";
      const isMeleeWeapon = true;
      const isImpaling = w.isImpaling || false;
      const isExtreme = metadata.attackerSuccessLevel >= SUCCESS_LEVELS.EXTREME;
      const wItemId = w.itemId || "";
      const wIsMagical = w.isMagical || false;
      const wDamageBonus = w.damageBonus || "0";
      const rollFormula =
        isImpaling && isExtreme
          ? buildImpaleFormula(dmgFormula, wDamageBonus, isMeleeWeapon)
          : dmgFormula;

      const damageMacro = `\`\`\`Roll_Damage
  const damageMods = getEffectsAndModifiers(["damageBonus", "damagePenalty"], "melee", "${wItemId}");
  const damageMetadata = {
    weaponDamage: "${dmgFormula}",
    isMelee: ${isMeleeWeapon},
    isImpaling: ${isImpaling},
    isExtreme: ${isExtreme},
    isMagical: ${wIsMagical},
    damageBonus: record?.data?.damageBonus || "0",
    attackerTokenId: "${metadata.attackerTokenId || ""}",
  };
  api.promptRoll("Damage", "${rollFormula}", damageMods, damageMetadata, "damage");
\`\`\``;
      message += `\n${damageMacro}`;
    }
  }
}

// ============================================================
// Firearm Attack — Non-Opposed
// ============================================================

if (isAttack && isFirearm && !isOpposed) {
  if (successLevel >= SUCCESS_LEVELS.REGULAR && weapon) {
    const dmgFormula = weapon.damage || "1D6";
    const isImpaling = weapon.isImpaling || false;
    const isExtreme = successLevel >= SUCCESS_LEVELS.EXTREME;
    const weaponItemId = weapon.itemId || "";

    const wIsMagical = weapon.isMagical || false;
    const rollFormula =
      isImpaling && isExtreme
        ? buildImpaleFormula(dmgFormula, "0", false)
        : dmgFormula;
    const damageMacro = `\`\`\`Roll_Damage
  const damageMods = getEffectsAndModifiers(["damageBonus", "damagePenalty"], "ranged", "${weaponItemId}");
  const damageMetadata = {
    weaponDamage: "${dmgFormula}",
    isMelee: false,
    isImpaling: ${isImpaling},
    isExtreme: ${isExtreme},
    isMagical: ${wIsMagical},
    damageBonus: "0",
  };
  api.promptRoll("Damage", "${rollFormula}", damageMods, damageMetadata, "damage");
\`\`\``;
    message += `\n${damageMacro}`;
  }

  // Check for malfunction
  if (weapon && weapon.malfunction) {
    const malfNum = parseInt(weapon.malfunction, 10) || 100;
    if (rollTotal >= malfNum) {
      message += `\n\n**[center][color=red]MALFUNCTION![/color] The weapon has jammed or misfired.[/center]**`;
      tags.push({
        name: "Malfunction",
        tooltip: `Rolled ${rollTotal}, weapon malfunctions on ${malfNum}+`,
      });
    }
  }
}

// Send the message
api.sendMessage(message, roll, [], tags);

// Play attack animation if this is an attack roll
if (isAttack && animation && tokenId) {
  api.playAnimation(animation, tokenId, targetId);
}
