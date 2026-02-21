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

// Determine the actual d100 result
const rollTotal = roll.total;

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
  tags.push({
    name: "Attack",
    tooltip: isMelee ? "Melee attack (opposed)" : "Ranged attack",
  });
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
if (
  successLevel === SUCCESS_LEVELS.FAILURE &&
  !isLuck &&
  !metadata.isSanity
) {
  const recType = metadata.recordType || "characters";
  const recId = metadata.recordId || "";
  const luckNeeded = rollTotal - skillValue;
  const currentLuck = parseInt(record?.data?.luck, 10) || 0;
  if (luckNeeded > 0 && currentLuck >= luckNeeded) {
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
      weapon: ${JSON.stringify(weapon)},
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
      weapon: ${JSON.stringify(weapon)},
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

        const damageMacro = `\`\`\`Roll_Damage
  const damageMods = getEffectsAndModifiers(["damageBonus", "damagePenalty"], "melee", "${wItemId}");
  const damageMetadata = {
    weaponDamage: "${dmgFormula}",
    isMelee: ${isMeleeWeapon},
    isImpaling: ${isImpaling},
    isExtreme: ${isExtreme},
    damageBonus: record?.data?.damageBonus || "0",
    attackerTokenId: "${metadata.attackerTokenId || ""}",
  };
  api.promptRoll("Damage", "${dmgFormula}", damageMods, damageMetadata, "damage");
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

      const damageMacro = `\`\`\`Roll_Damage
  const damageMods = getEffectsAndModifiers(["damageBonus", "damagePenalty"], "melee", "${wItemId}");
  const damageMetadata = {
    weaponDamage: "${dmgFormula}",
    isMelee: ${isMeleeWeapon},
    isImpaling: ${isImpaling},
    isExtreme: ${isExtreme},
    damageBonus: record?.data?.damageBonus || "0",
    attackerTokenId: "${metadata.attackerTokenId || ""}",
  };
  api.promptRoll("Damage", "${dmgFormula}", damageMods, damageMetadata, "damage");
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

    const damageMacro = `\`\`\`Roll_Damage
  const damageMods = getEffectsAndModifiers(["damageBonus", "damagePenalty"], "ranged", "${weaponItemId}");
  const damageMetadata = {
    weaponDamage: "${dmgFormula}",
    isMelee: false,
    isImpaling: ${isImpaling},
    isExtreme: ${isExtreme},
    damageBonus: "0",
  };
  api.promptRoll("Damage", "${dmgFormula}", damageMods, damageMetadata, "damage");
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
