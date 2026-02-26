// ============================================================
// Call of Cthulhu 7e - Skill Improvement Apply Handler
// Receives a 1D10 roll and applies the improvement to the skill
// ============================================================

const roll = {
  ...data.roll,
  dice: [...(data?.roll?.dice || [])],
  total: data?.roll?.total !== undefined ? data?.roll?.total : 0,
};

const metadata = data?.roll?.metadata || {};
const skillName = metadata.skillName || "Skill";
const skillValue = metadata.skillValue || 0;
const skillIndex = metadata.skillIndex;
const specIndex = metadata.specIndex;
const isSpecialization = metadata.isSpecialization || false;
const recType = metadata.recordType || "characters";
const recId = metadata.recordId || "";

const increase = roll.total || 1;
const newValue = skillValue + increase;

const tags = [];
tags.push({
  name: "Improvement",
  tooltip: `Skill improvement for ${skillName}`,
});
tags.push({
  name: `+${increase}`,
  tooltip: `Improved by ${increase} to ${newValue}%`,
});

let message = "";
message += `\n**[center][color=green]${skillName}: +${increase}[/color][/center]**`;
message += `\n**[center]${skillValue}% → ${newValue}%[/center]**`;

// Apply the improvement to the character
api.getRecord(recType, recId, (rec) => {
  if (!rec) return;
  const valuesToSet = {};
  if (isSpecialization && specIndex !== undefined && skillIndex !== undefined) {
    const basePath = `data.skills.${skillIndex}.data.specializations.${specIndex}`;
    valuesToSet[`${basePath}.data.value`] = newValue;
    valuesToSet[`${basePath}.data.halfValue`] = getHalf(newValue);
    valuesToSet[`${basePath}.data.fifthValue`] = getFifth(newValue);
  } else if (skillIndex !== undefined) {
    valuesToSet[`data.skills.${skillIndex}.data.value`] = newValue;
    valuesToSet[`data.skills.${skillIndex}.data.halfValue`] = getHalf(newValue);
    valuesToSet[`data.skills.${skillIndex}.data.fifthValue`] = getFifth(newValue);

    // Sync derived display fields for special skills
    if (skillName === "Dodge") {
      valuesToSet["data.dodgeValue"] = newValue;
      valuesToSet["data.dodgeHalf"] = getHalf(newValue);
      valuesToSet["data.dodgeFifth"] = getFifth(newValue);
    }
    if (skillName === "Credit Rating") {
      valuesToSet["data.creditRating"] = newValue;
    }
  }

  if (Object.keys(valuesToSet).length > 0) {
    api.setValuesOnRecord(rec, valuesToSet);
  }
});

// Send the message
api.sendMessage(message, roll, [], tags);
