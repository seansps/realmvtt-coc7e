// ============================================================
// Call of Cthulhu 7e - Skill Improvement Roll Handler
// Handles: End-of-scenario skill improvement checks
// Called from character-skills.html "Improve Skills" button
// ============================================================
//
// Improvement mechanic:
// For each skill with the improvement check mark (data.checked = true):
// 1. Roll 1d100
// 2. If roll > current skill value → skill improves by 1D10
// 3. If roll ≤ current skill value → no improvement
// 4. Clear the check mark either way
//
// This handler processes a single skill's improvement roll.
// The skill index and data are passed via metadata.

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

const rollTotal = roll.total;
const tags = [];

tags.push({
  name: "Improvement",
  tooltip: `Skill improvement check for ${skillName}`,
});

let message = "";

if (rollTotal > skillValue) {
  // Improvement! Roll 1D10 for the increase
  const improveRoll = api.rollInstant("1d10");
  const increase = improveRoll?.total || 1;
  const newValue = skillValue + increase;

  message += `\n**[center][color=green]${skillName} Improves![/color][/center]**`;
  message += `\n[center]Rolled ${rollTotal} vs ${skillValue}% — exceeds current value![/center]`;
  message += `\n[center]Improvement: +${increase} (1D10) → **${newValue}%**[/center]`;

  tags.push({
    name: `+${increase}`,
    tooltip: `Improved by ${increase} to ${newValue}%`,
  });

  // Apply the improvement to the character
  if (record) {
    const valuesToSet = {};
    if (isSpecialization && specIndex !== undefined && skillIndex !== undefined) {
      const basePath = `data.skills[${skillIndex}].data.specializations[${specIndex}]`;
      valuesToSet[`${basePath}.data.value`] = newValue;
      valuesToSet[`${basePath}.data.halfValue`] = getHalf(newValue);
      valuesToSet[`${basePath}.data.fifthValue`] = getFifth(newValue);
      valuesToSet[`${basePath}.data.checked`] = false;
    } else if (skillIndex !== undefined) {
      valuesToSet[`data.skills[${skillIndex}].data.value`] = newValue;
      valuesToSet[`data.skills[${skillIndex}].data.halfValue`] = getHalf(newValue);
      valuesToSet[`data.skills[${skillIndex}].data.fifthValue`] = getFifth(newValue);
      valuesToSet[`data.skills[${skillIndex}].data.checked`] = false;
    }

    if (Object.keys(valuesToSet).length > 0) {
      api.setValues(valuesToSet);
    }
  }
} else {
  // No improvement
  message += `\n**[center][color=gray]${skillName} — No Improvement[/color][/center]**`;
  message += `\n[center]Rolled ${rollTotal} vs ${skillValue}% — did not exceed current value.[/center]`;

  tags.push({
    name: "No Change",
    tooltip: `Rolled ${rollTotal}, needed > ${skillValue}`,
  });

  // Clear the check mark
  if (record) {
    const valuesToSet = {};
    if (isSpecialization && specIndex !== undefined && skillIndex !== undefined) {
      valuesToSet[`data.skills[${skillIndex}].data.specializations[${specIndex}].data.checked`] = false;
    } else if (skillIndex !== undefined) {
      valuesToSet[`data.skills[${skillIndex}].data.checked`] = false;
    }

    if (Object.keys(valuesToSet).length > 0) {
      api.setValues(valuesToSet);
    }
  }
}

// Send the message
api.sendMessage(message, roll, [], tags);
