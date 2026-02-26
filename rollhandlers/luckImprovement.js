// ============================================================
// Call of Cthulhu 7e - Luck Improvement Roll Handler
// Handles: End-of-session luck improvement check
// Roll 1d100: if > current luck → roll 1D10 to add (cap 99)
// ============================================================

const roll = {
  ...data.roll,
  dice: [...(data?.roll?.dice || [])],
  total: data?.roll?.total !== undefined ? data?.roll?.total : 0,
};

const metadata = data?.roll?.metadata || {};
const luckValue = metadata.luckValue || 0;
const recType = metadata.recordType || "characters";
const recId = metadata.recordId || "";

const rollTotal = roll.total;
const tags = [];

tags.push({
  name: "Luck Improvement",
  tooltip: "End-of-session Luck improvement check",
});

let message = "";

if (rollTotal > luckValue) {
  message += `\n**[center][color=green]Luck Improves![/color][/center]**`;
  message += `\n[center]Rolled ${rollTotal} vs ${luckValue} — exceeds current Luck![/center]`;

  tags.push({
    name: "Improves!",
    tooltip: `Rolled ${rollTotal}, exceeded ${luckValue} — roll 1D10 for improvement`,
  });

  const improveMacro = `\`\`\`Roll_Luck_Improvement
  api.getRecord("${recType}", "${recId}", (rec) => {
    if (!rec) return;
    api.promptRollForToken(rec, "Luck +1D10", "1d10", [], {
      luckValue: ${luckValue},
      recordType: "${recType}",
      recordId: "${recId}",
    }, "luckImprovementApply");
  });
\`\`\``;
  message += `\n${improveMacro}`;
} else {
  message += `\n**[center][color=gray]Luck — No Improvement[/color][/center]**`;
  message += `\n[center]Rolled ${rollTotal} vs ${luckValue} — did not exceed current Luck.[/center]`;

  tags.push({
    name: "No Change",
    tooltip: `Rolled ${rollTotal}, needed > ${luckValue}`,
  });
}

api.sendMessage(message, roll, [], tags);
