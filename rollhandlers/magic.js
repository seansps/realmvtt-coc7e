// ============================================================
// Call of Cthulhu 7e - Magic/Spell Casting Roll Handler
// Handles: POW rolls for casting, pushed casting, opposed POW
// ============================================================

const roll = {
  ...data.roll,
  dice: [...(data?.roll?.dice || [])],
  total: data?.roll?.total !== undefined ? data?.roll?.total : 0,
};

const metadata = data?.roll?.metadata || {};
const spellName = metadata.spellName || "Spell";
const skillValue = metadata.skillValue || 0; // Hard POW value
const mpCost = metadata.mpCost || 0;
const sanCost = metadata.sanCost || "0";
const powCost = metadata.powCost || 0;
const isPushed = metadata.isPushed || false;
const isOpposedPow = metadata.isOpposedPow || false;
const targetPow = metadata.targetPow || 0;
const spellEffects = metadata.spellEffects || [];
const tokenId = metadata.tokenId;

const rollTotal = roll.total;
const successLevel = getSuccessLevel(rollTotal, skillValue);
const successName = SUCCESS_LEVEL_NAMES[successLevel];
const successColor = SUCCESS_LEVEL_COLORS[successLevel];

const tags = [];
tags.push({
  name: spellName,
  tooltip: `Casting: ${spellName} (POW/2: ${skillValue}%)`,
});

let message = "";

// ============================================================
// Opposed POW Roll
// ============================================================

if (isOpposedPow) {
  tags.push({
    name: "Opposed POW",
    tooltip: `Caster POW vs Target POW: ${targetPow}`,
  });

  if (successLevel >= SUCCESS_LEVELS.REGULAR) {
    message += `\n**[center][color=${successColor}]${successName}[/color] (${rollTotal} vs ${skillValue}%)[/center]**`;

    // Caster succeeded — embed target's resistance roll
    const targetResistMacro = `\`\`\`Target_Resist
  const selectedTokens = api.getSelectedOrDroppedToken();
  selectedTokens.forEach(token => {
    const tPow = parseInt(token.data?.pow, 10) || 0;
    const tHardPow = Math.floor(tPow / 2);
    performSkillCheck(token, "Resist: ${spellName}", tPow, {
      isMagic: true,
      isResist: true,
      cannotPush: true,
      casterSuccessLevel: ${successLevel},
      spellName: "${spellName}",
    });
  });
\`\`\``;
    message += `\n[center]Target must resist with a POW roll.[/center]`;
    message += `\n${targetResistMacro}`;
  } else if (successLevel === SUCCESS_LEVELS.FUMBLE) {
    message += `\n**[center][color=${successColor}]FUMBLE![/color] (${rollTotal} vs ${skillValue}%)[/center]**`;
    message += `\n[center]The spell fails catastrophically. The Keeper determines the consequences.[/center]`;
  } else {
    message += `\n**[center][color=${successColor}]${successName}[/color] (${rollTotal} vs ${skillValue}%)[/center]**`;
    message += `\n[center]The spell fails to overcome the target's resistance.[/center]`;

    // Offer push if not already pushed
    if (!isPushed) {
      const recType = metadata.recordType || "characters";
      const recId = metadata.recordId || "";
      const pushMacro = `\`\`\`Push_Casting
  api.getRecord("${recType}", "${recId}", (rec) => {
    if (!rec) return;
    const pow = parseInt(rec?.data?.pow, 10) || 0;
    const hardPow = Math.floor(pow / 2);
    performSkillCheck(rec, "Cast: ${spellName}", hardPow, {
      isMagic: true,
      isPushed: true,
      isOpposedPow: true,
      targetPow: ${targetPow},
      spellName: "${spellName}",
      mpCost: ${mpCost},
      sanCost: "${sanCost}",
      powCost: ${powCost},
    });
  });
\`\`\``;
      message += `\n${pushMacro}`;
    }
  }
} else {
  // ============================================================
  // Standard Casting Roll (Hard POW)
  // ============================================================

  if (successLevel >= SUCCESS_LEVELS.REGULAR) {
    message += `\n**[center][color=${successColor}]${successName}[/color] (${rollTotal} vs ${skillValue}%)[/center]**`;
    message += `\n[center]${spellName} is cast successfully![/center]`;

    if (mpCost > 0) {
      tags.push({ name: `MP -${mpCost}`, tooltip: `${mpCost} Magic Points spent` });
    }
    if (sanCost && sanCost !== "0") {
      tags.push({ name: `SAN -${sanCost}`, tooltip: `${sanCost} Sanity lost` });
    }
    if (powCost > 0) {
      tags.push({ name: `POW -${powCost}`, tooltip: `${powCost} POW sacrificed` });
    }

    // Embed effect application macros on success
    if (spellEffects.length > 0) {
      message += getEffectMacrosFor(spellEffects);
    }
  } else if (successLevel === SUCCESS_LEVELS.FUMBLE) {
    message += `\n**[center][color=${successColor}]FUMBLE![/color] (${rollTotal} vs ${skillValue}%)[/center]**`;
    message += `\n[center]The spell fails catastrophically! The Keeper determines the consequences.[/center]`;
    message += `\n[center][color=gray]Magic Points and any Sanity cost are still spent.[/color][/center]`;
  } else {
    // Failure
    message += `\n**[center][color=${successColor}]${successName}[/color] (${rollTotal} vs ${skillValue}%)[/center]**`;
    message += `\n[center]The spell fails. Magic Points and any costs are still spent.[/center]`;

    // Offer push if not already pushed
    if (!isPushed) {
      const recType2 = metadata.recordType || "characters";
      const recId2 = metadata.recordId || "";
      const pushMacro = `\`\`\`Push_Casting
  api.getRecord("${recType2}", "${recId2}", (rec) => {
    if (!rec) return;
    const pow = parseInt(rec?.data?.pow, 10) || 0;
    const hardPow = Math.floor(pow / 2);
    performSkillCheck(rec, "Cast: ${spellName}", hardPow, {
      isMagic: true,
      isPushed: true,
      spellName: "${spellName}",
      mpCost: ${mpCost},
      sanCost: "${sanCost}",
      powCost: ${powCost},
    });
  });
\`\`\``;
      message += `\n${pushMacro}`;
    }
  }

  // ============================================================
  // Pushed Casting Failure
  // ============================================================

  if (isPushed && successLevel < SUCCESS_LEVELS.REGULAR) {
    message += `\n\n**[center][color=red]Pushed Casting Failed![/color][/center]**`;
    message += `\n[center]The spell takes effect, but at a terrible cost.[/center]`;
    message += `\n[center]MP cost is multiplied (1D6× original). The Keeper may impose additional side effects.[/center]`;

    // Pushed failure still applies the spell — embed effect macros
    if (spellEffects.length > 0) {
      message += getEffectMacrosFor(spellEffects);
    }

    // Roll the multiplied MP cost
    const recType3 = metadata.recordType || "characters";
    const recId3 = metadata.recordId || "";
    const multiplierMacro = `\`\`\`Roll_Extra_MP_Cost
  api.getRecord("${recType3}", "${recId3}", (rec) => {
    if (!rec) return;
    const multiplier = api.rollInstant("1d6");
    const extraMp = (${mpCost} * (multiplier.total - 1));
    const currentMp = parseInt(rec?.data?.curMp, 10) || 0;
    const newMp = Math.max(0, currentMp - extraMp);
    api.setValue("data.curMp", newMp);
    api.sendMessage("[center]Pushed casting cost: ${mpCost} × " + multiplier.total + " = " + (${mpCost} * multiplier.total) + " MP total (extra " + extraMp + " MP deducted)[/center]");
  });
\`\`\``;
    message += `\n${multiplierMacro}`;
  }
}

// Show thresholds
message += `\n\n[center][color=gray]Hard POW: ≤${skillValue}%[/color][/center]`;

api.sendMessage(message, roll, [], tags);
