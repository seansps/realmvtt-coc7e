// ============================================================
// Call of Cthulhu 7e - Initiative Roll Handler
// Processes the initiative roll result and sets data.initiative
// ============================================================

if (data.roll?.metadata?.group && data.roll?.metadata?.group.length > 0) {
  data.roll?.metadata?.group.forEach((tokenId) => {
    api.setValueOnTokenById(
      tokenId,
      "tokens",
      "data.initiative",
      data.roll.total
    );
  });
  api.sendMessage(
    "",
    data.roll,
    [],
    [
      {
        name: "Group Initiative",
        tooltip: "Group Initiative Roll",
      },
    ]
  );
} else {
  api.setValue("data.initiative", data.roll.total);
  api.sendMessage(
    "",
    data.roll,
    [],
    [
      {
        name: "Initiative",
        tooltip: "Initiative Roll (DEX)",
      },
    ]
  );
}
