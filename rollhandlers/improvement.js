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
  // Improvement! Embed a macro to roll 1D10 for the increase
  message += `\n**[center][color=green]${skillName} Improves![/color][/center]**`;
  message += `\n[center]Rolled ${rollTotal} vs ${skillValue}% — exceeds current value![/center]`;

  tags.push({
    name: "Improves!",
    tooltip: `Rolled ${rollTotal}, exceeded ${skillValue}% — roll 1D10 for improvement`,
  });

  const recType = metadata.recordType || "characters";
  const recId = metadata.recordId || "";

  const improveMacro = `\`\`\`Roll_Improvement
  api.getRecord("${recType}", "${recId}", (rec) => {
    if (!rec) return;
    api.promptRollForToken(rec, "${skillName} +1D10", "1d10", [], {
      skillName: "${skillName}",
      skillValue: ${skillValue},
      skillIndex: ${skillIndex},
      specIndex: ${specIndex !== undefined ? specIndex : "undefined"},
      isSpecialization: ${isSpecialization},
      recordType: "${recType}",
      recordId: "${recId}",
    }, "improvementApply");
  });
\`\`\``;
  message += `\n${improveMacro}`;

  // Clear the check mark now (the d10 handler will update the value)
  api.getRecord(recType, recId, (rec) => {
    if (!rec) return;
    const valuesToSet = {};
    if (
      isSpecialization &&
      specIndex !== undefined &&
      skillIndex !== undefined
    ) {
      valuesToSet[
        `data.skills.${skillIndex}.data.specializations.${specIndex}.data.checked`
      ] = false;
    } else if (skillIndex !== undefined) {
      valuesToSet[`data.skills.${skillIndex}.data.checked`] = false;
    }
    if (Object.keys(valuesToSet).length > 0) {
      api.setValuesOnRecord(rec, valuesToSet);
    }
  });
} else {
  // No improvement
  message += `\n**[center][color=gray]${skillName} — No Improvement[/color][/center]**`;
  message += `\n[center]Rolled ${rollTotal} vs ${skillValue}% — did not exceed current value.[/center]`;

  tags.push({
    name: "No Change",
    tooltip: `Rolled ${rollTotal}, needed > ${skillValue}`,
  });

  // Clear the check mark
  const recType = metadata.recordType || "characters";
  const recId = metadata.recordId || "";
  api.getRecord(recType, recId, (rec) => {
    if (!rec) return;
    const valuesToSet = {};
    if (
      isSpecialization &&
      specIndex !== undefined &&
      skillIndex !== undefined
    ) {
      valuesToSet[
        `data.skills.${skillIndex}.data.specializations.${specIndex}.data.checked`
      ] = false;
    } else if (skillIndex !== undefined) {
      valuesToSet[`data.skills.${skillIndex}.data.checked`] = false;
    }
    if (Object.keys(valuesToSet).length > 0) {
      api.setValuesOnRecord(rec, valuesToSet);
    }
  });
}

// Send the message
api.sendMessage(message, roll, [], tags);
