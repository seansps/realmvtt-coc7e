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
const isMagical = metadata.isMagical || false;
// Active damage modifiers from effects/equipped items (already baked into roll.total)
const damageModifiers = data?.roll?.modifiers || [];

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
    tooltip:
      "Extreme success with impaling weapon — maximum possible damage plus an additional damage roll.",
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

message += `\n\n**[center]Damage: ${totalDamage}[/center]**`;

// Tags for active damage modifiers from effects/items (DB for melee is included here)
damageModifiers.forEach(function (mod) {
  if (mod.active === false) return;
  const valStr = String(mod.value);
  const displayVal = valStr.startsWith("-") ? valStr : `+${valStr}`;
  tags.push({
    name: `${mod.name}: ${displayVal}`,
    tooltip: mod.tooltip || mod.name,
  });
});
if (isMagical) {
  tags.push({
    name: "Magical",
    tooltip: "Magical damage — ignores armor",
  });
}

// totalDamage is baked in as a literal when the handler runs.
// The Apply_Damage macro reads the token live when clicked.
const applyDamageMacro = `
\`\`\`Apply_Damage
const tokens = api.getSelectedOrDroppedToken();
if (!tokens || tokens.length === 0) {
  api.showNotification("Select or drop a token to apply damage to.", "red", "Apply Damage");
  return;
}
tokens.forEach(function(token) {
  const totalDmg = ${totalDamage};
  const armor = ${isMagical} ? 0 : (parseInt(token.data?.armor, 10) || 0);
  const finalDamage = Math.max(0, totalDmg - armor);
  const oldHp = parseInt(token.data?.curHp, 10) || 0;
  const maxHp = parseInt(token.data?.maxHp, 10) || 1;
  const newHp = Math.max(0, oldHp - finalDamage);
  const oldMajorWound = token.data?.majorWound || false;
  const oldDying = token.data?.dying || false;

  const fieldsToSet = { "data.curHp": newHp };
  const majorWoundThreshold = Math.floor(maxHp / 2);
  const causesMajorWound = finalDamage >= majorWoundThreshold;
  if (causesMajorWound) fieldsToSet["data.majorWound"] = true;
  if (newHp <= 0) fieldsToSet["data.dying"] = true;

  let dmgLine = "[center]Damage dealt: " + totalDmg;
  if (armor > 0) dmgLine += " (" + armor + " armor, " + finalDamage + " dealt)";
  dmgLine += "[/center]";
  const hpLine = "[center]HP: " + oldHp + " -> " + newHp + "[/center]";
  const majorWoundMsg = causesMajorWound ? "\\n**[color=red][center]MAJOR WOUND![/center][/color]**\\n[center]Must make a CON roll or fall unconscious.[/center]" : "";
  const resultMsg = dmgLine + "\\n" + hpLine + majorWoundMsg;
  const undoMacro = \`\\\`\\\`\\\`Undo\\n if (isGM) { api.setValueOnTokenById('\${token._id}', '\${token.recordType}', 'data.curHp', \${oldHp}); api.setValueOnTokenById('\${token._id}', '\${token.recordType}', 'data.majorWound', \${oldMajorWound}); api.setValueOnTokenById('\${token._id}', '\${token.recordType}', 'data.dying', \${oldDying}); api.editMessage(null, '~Damage: \${totalDmg}~'); } else { api.showNotification('Only the GM can undo damage.', 'yellow', 'Undo'); } \\n\\\`\\\`\\\`\`;

  api.setValuesOnTokenById(token._id, token.recordType, fieldsToSet, function() {
    api.floatText(token, "-" + finalDamage, "#FF4444");
    api.sendMessage(resultMsg + "\\n" + undoMacro);
  });
});
\`\`\`
`;

message += `\n${applyDamageMacro}`;

api.sendMessage(message, roll, [], tags);
