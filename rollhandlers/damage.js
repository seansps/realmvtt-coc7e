// ============================================================
// Call of Cthulhu 7e - Damage Roll Handler
// Handles: normal damage, extreme success (impale), armor, major wounds
// ============================================================

const roll = {
  ...data.roll,
  dice: [...(data?.roll?.dice || [])],
  total: data?.roll?.total !== undefined ? data?.roll?.total : 0,
};

const metadata = data?.roll?.metadata || {};
const weaponDamage = metadata.weaponDamage || "1D6";
const isMelee = metadata.isMelee || false;
const isImpaling = metadata.isImpaling || false;
const isExtreme = metadata.isExtreme || false;
const damageBonus = metadata.damageBonus || "0";

const tags = [];
tags.push({
  name: "Damage",
  tooltip: `Weapon: ${weaponDamage}`,
});

let totalDamage = roll.total;
let message = "";

// On Extreme success with impaling weapon: additional effects
if (isExtreme && isImpaling) {
  tags.push({
    name: "Impale!",
    tooltip: "Extreme success with impaling weapon — maximum possible damage plus an additional damage roll.",
  });
  message += `\n**[center][color=#1E90FF]IMPALE![/color][/center]**`;
  message += `\n[center]Roll includes maximum weapon damage + maximum DB + bonus weapon damage die.[/center]`;
} else if (isExtreme) {
  tags.push({
    name: "Extreme Damage",
    tooltip: "Extreme success — maximum possible damage.",
  });
  message += `\n**[center][color=#1E90FF]Maximum Damage![/color][/center]**`;
}

// Display total
message += `\n\n**[center]Damage: ${totalDamage}[/center]**`;

if (isMelee && damageBonus && damageBonus !== "0") {
  tags.push({
    name: `DB: ${damageBonus}`,
    tooltip: `Damage Bonus: ${damageBonus}`,
  });
}

// Apply armor prompt — embed a macro for the target to apply armor
const applyDamageMacro = `\`\`\`Apply_Damage
  const selectedTokens = api.getSelectedOrDroppedToken();
  selectedTokens.forEach(token => {
    const armor = parseInt(token.data?.armor, 10) || 0;
    const finalDamage = Math.max(0, ${totalDamage} - armor);
    const currentHp = parseInt(token.data?.curHp, 10) || 0;
    const maxHp = parseInt(token.data?.maxHp, 10) || 1;
    const newHp = Math.max(0, currentHp - finalDamage);

    const fieldsToSet = {
      "data.curHp": newHp,
    };

    // Check for Major Wound (damage >= half max HP)
    const majorWoundThreshold = Math.floor(maxHp / 2);
    let majorWoundMsg = "";
    if (finalDamage >= majorWoundThreshold) {
      fieldsToSet["data.majorWound"] = true;
      majorWoundMsg = "\\n\\n**[color=red]MAJOR WOUND![/color]** Must make a CON roll or fall unconscious.";

      // Embed CON roll macro
      majorWoundMsg += "\\n" + \`\\\`\\\`\\\`CON_Roll
        performCharacteristicRoll(record, "con", parseInt(record?.data?.con, 10) || 0, { isMajorWoundCheck: true });
      \\\`\\\`\\\`\`;
    }

    // Check for dying (0 HP)
    if (newHp <= 0) {
      fieldsToSet["data.dying"] = true;
    }

    api.setValues(fieldsToSet);

    let msg = \`[center]Damage dealt: ${totalDamage}\`;
    if (armor > 0) {
      msg += \` (${totalDamage} - \${armor} armor = \${finalDamage})\`;
    }
    msg += \`\\nHP: \${currentHp} → \${newHp}[/center]\`;
    msg += majorWoundMsg;
    api.sendMessage(msg);
  });
\`\`\``;

message += `\n${applyDamageMacro}`;

api.sendMessage(message, roll, [], tags);
