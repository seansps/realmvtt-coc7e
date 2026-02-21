// Apply damage to a Call of Cthulhu 7e token
// Subtracts armor, checks for Major Wound, dying, and death
if (value > 0) {
  // Collect armor bonus modifiers from equipped items
  const armorBonusMods = getEffectsAndModifiersForToken(record, ["armorBonus"]);
  let armorBonus = 0;
  for (const mod of armorBonusMods) {
    if (mod.active) armorBonus += parseInt(mod.value, 10) || 0;
  }

  const baseArmor = parseInt(record.data?.armor, 10) || 0;
  const totalArmor = baseArmor + armorBonus;
  const finalDamage = Math.max(0, value - totalArmor);

  const maxHp = parseInt(record.data?.maxHp, 10) || 1;
  var curHp = parseInt(record.data?.curHp, 10) || 0;
  curHp = Math.max(0, curHp - finalDamage);

  const fieldsToSet = {
    "data.curHp": curHp,
  };

  // Check immunity flags
  const immuneMajorWound = getEffectsAndModifiersForToken(record, [
    "immuneToMajorWound",
  ]);
  const hasMajorWoundImmunity = immuneMajorWound.some((m) => m.active);

  // Major Wound: damage >= half max HP
  const majorWoundThreshold = Math.floor(maxHp / 2);
  if (finalDamage >= majorWoundThreshold && !hasMajorWoundImmunity) {
    fieldsToSet["data.majorWound"] = true;
  }

  // Dying at 0 HP
  if (curHp <= 0) {
    fieldsToSet["data.dying"] = true;
  }

  api.setValues(fieldsToSet);
}

// Float damage text
const token = api.getToken();
if (value > 0 && token) {
  const baseArmor = parseInt(record.data?.armor, 10) || 0;
  if (baseArmor > 0) {
    api.floatText(token, `-${value} (${baseArmor} armor)`, "#FF0000");
  } else {
    api.floatText(token, `-${value}`, "#FF0000");
  }
}
