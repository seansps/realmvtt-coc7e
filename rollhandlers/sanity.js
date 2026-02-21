// ============================================================
// Call of Cthulhu 7e - Sanity Check Roll Handler
// Handles: SAN loss, temporary/indefinite insanity triggers,
// bout of madness table roll
// ============================================================

const roll = {
  ...data.roll,
  dice: [...(data?.roll?.dice || [])],
  total: data?.roll?.total !== undefined ? data?.roll?.total : 0,
};

const metadata = data?.roll?.metadata || {};
const skillValue = metadata.skillValue || 0; // Current SAN
const sanLossSuccess = metadata.sanLossSuccess || "0";
const sanLossFailure = metadata.sanLossFailure || "0";
const tokenId = metadata.tokenId;

const rollTotal = roll.total;
const successLevel = getSuccessLevel(rollTotal, skillValue);

const tags = [];
tags.push({
  name: "Sanity Check",
  tooltip: `Sanity: ${skillValue}%`,
});

let message = "";
let sanLost = 0;

// Determine success/failure and SAN loss amount
if (successLevel >= SUCCESS_LEVELS.REGULAR) {
  // Success
  const successColor = SUCCESS_LEVEL_COLORS[successLevel];
  const successName = SUCCESS_LEVEL_NAMES[successLevel];
  message += `\n**[center][color=${successColor}]${successName}[/color] (${rollTotal} vs ${skillValue}%)[/center]**`;

  // Roll or parse the success SAN loss
  if (sanLossSuccess === "0") {
    sanLost = 0;
    message += `\n[center]No Sanity lost.[/center]`;
  } else {
    // Could be a number or a dice formula
    const parsed = parseInt(sanLossSuccess, 10);
    if (!isNaN(parsed)) {
      sanLost = parsed;
      message += `\n[center]Sanity lost: ${sanLost}[/center]`;
    } else {
      // It's a dice formula — roll it
      const lossRoll = api.rollInstant(sanLossSuccess);
      sanLost = lossRoll?.total || 0;
      message += `\n[center]Sanity lost: ${sanLost} (${sanLossSuccess})[/center]`;
    }
  }

  tags.push({
    name: `SAN -${sanLost}`,
    tooltip: `Lost ${sanLost} Sanity (success)`,
  });
} else {
  // Failure
  const failColor = successLevel === SUCCESS_LEVELS.FUMBLE ? SUCCESS_LEVEL_COLORS[SUCCESS_LEVELS.FUMBLE] : "red";
  const failName = successLevel === SUCCESS_LEVELS.FUMBLE ? "FUMBLE!" : "Failure";
  message += `\n**[center][color=${failColor}]${failName}[/color] (${rollTotal} vs ${skillValue}%)[/center]**`;

  if (successLevel === SUCCESS_LEVELS.FUMBLE) {
    tags.push({
      name: "Fumble",
      tooltip: "Fumbled Sanity check — maximum possible SAN loss.",
    });
  }

  // Roll or parse the failure SAN loss
  const parsed = parseInt(sanLossFailure, 10);
  if (!isNaN(parsed)) {
    sanLost = parsed;
    // On fumble, take maximum possible loss
    if (successLevel === SUCCESS_LEVELS.FUMBLE) {
      sanLost = parsed; // For flat numbers, max = the number itself
      message += `\n[center]Sanity lost: ${sanLost} (maximum)[/center]`;
    } else {
      message += `\n[center]Sanity lost: ${sanLost}[/center]`;
    }
  } else {
    // It's a dice formula
    if (successLevel === SUCCESS_LEVELS.FUMBLE) {
      // On fumble, take maximum possible roll
      // Parse the formula to get max (e.g., "1D6" -> 6, "1D10" -> 10, "1D4+1" -> 5)
      const maxRoll = getMaxDiceValue(sanLossFailure);
      sanLost = maxRoll;
      message += `\n[center]Sanity lost: ${sanLost} (${sanLossFailure} — MAXIMUM on fumble)[/center]`;
    } else {
      const lossRoll = api.rollInstant(sanLossFailure);
      sanLost = lossRoll?.total || 0;
      message += `\n[center]Sanity lost: ${sanLost} (${sanLossFailure})[/center]`;
    }
  }

  tags.push({
    name: `SAN -${sanLost}`,
    tooltip: `Lost ${sanLost} Sanity (failure)`,
  });
}

// Apply SAN loss to the token/record
if (sanLost > 0 && record) {
  const currentSan = parseInt(record?.data?.san, 10) || 0;
  const newSan = Math.max(0, currentSan - sanLost);

  const fieldsToSet = {
    "data.san": newSan,
  };

  // Check for Temporary Insanity (5+ SAN lost in one check)
  if (sanLost >= 5) {
    message += `\n\n**[center][color=red]5+ Sanity lost! Check for Temporary Insanity.[/color][/center]**`;

    // Embed INT roll macro for temporary insanity check
    const intValue = parseInt(record?.data?.int, 10) || 0;
    const intRollMacro = `\`\`\`INT_Roll_(Insanity)
  const intValue = parseInt(record?.data?.int, 10) || 0;
  performSkillCheck(record, "INT Roll (Insanity)", intValue, {
    isInsanityCheck: true,
    cannotPush: true,
  });
\`\`\``;
    message += `\n${intRollMacro}`;

    // Bout of Madness table roll macro
    const boutMacro = `\`\`\`Bout_of_Madness
  api.rollOnTableByName("Bout of Madness");
\`\`\``;
    message += `\n${boutMacro}`;
  }

  // Check for Indefinite Insanity (lost 1/5 of starting-day SAN in one game session)
  const sanDayStart = parseInt(record?.data?.sanDayStart, 10) || currentSan;
  const totalDayLoss = sanDayStart - newSan;
  const insanityThreshold = Math.floor(sanDayStart / 5);
  if (totalDayLoss >= insanityThreshold && insanityThreshold > 0) {
    message += `\n\n**[center][color=#8B0000]Indefinite Insanity! Lost ${totalDayLoss} SAN today (threshold: ${insanityThreshold}).[/color][/center]**`;
    fieldsToSet["data.indefiniteInsanity"] = true;
  }

  // Check for Permanent Insanity (SAN = 0)
  if (newSan <= 0) {
    message += `\n\n**[center][color=#8B0000]PERMANENT INSANITY! Sanity has reached 0. The investigator is permanently insane.[/color][/center]**`;
    fieldsToSet["data.san"] = 0;
  }

  api.setValues(fieldsToSet);
}

// Send the message
api.sendMessage(message, roll, [], tags);

// ============================================================
// Helper: Parse max value from a dice formula
// ============================================================
function getMaxDiceValue(formula) {
  // Handle formats like "1D6", "1D10", "2D6", "1D4+1", "1D6+1"
  let total = 0;
  const parts = formula.toUpperCase().split("+");
  for (const part of parts) {
    const trimmed = part.trim();
    if (trimmed.includes("D")) {
      const diceParts = trimmed.split("D");
      const count = parseInt(diceParts[0], 10) || 1;
      const sides = parseInt(diceParts[1], 10) || 6;
      total += count * sides;
    } else {
      total += parseInt(trimmed, 10) || 0;
    }
  }
  return total;
}
