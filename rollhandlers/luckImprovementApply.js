// ============================================================
// Call of Cthulhu 7e - Luck Improvement Apply Handler
// Receives a 1D10 roll and applies the improvement to Luck
// Luck cannot exceed 99
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

const increase = roll.total || 1;
const newValue = Math.min(luckValue + increase, 99);

const tags = [];
tags.push({
  name: "Luck Improvement",
  tooltip: "Luck improvement result",
});
tags.push({
  name: `+${increase}`,
  tooltip: `Improved by ${increase} to ${newValue}`,
});

let message = "";
message += `\n**[center][color=green]Luck: +${increase}[/color][/center]**`;
message += `\n**[center]${luckValue} → ${newValue}[/center]**`;

// Apply the improvement
api.getRecord(recType, recId, (rec) => {
  if (!rec) return;
  api.setValuesOnRecord(rec, {
    "data.luck": newValue,
    "data.luckHalf": getHalf(newValue),
    "data.luckFifth": getFifth(newValue),
  });
});

api.sendMessage(message, roll, [], tags);
