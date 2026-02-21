// ============================================================
// Call of Cthulhu 7e - On Roll Initiative Hook
// Called by the combat tracker when initiative is rolled.
// CoC 7e uses DEX as initiative (no dice roll, just DEX value).
// ============================================================

const token = data?.token;
const dex = parseInt(token?.data?.dex, 10) || 0;

// CoC uses straight DEX for initiative order (highest goes first)
// We use a "1d1" roll with DEX as a modifier to produce the DEX value
// through the standard roll pipeline
const modifiers = [
  {
    name: "DEX",
    value: dex,
    active: true,
  },
];

const tokenName = token.name || token.record?.name;

api.promptRollForToken(
  token,
  `Initiative for ${tokenName}`,
  "0d1",
  modifiers,
  {
    rollName: "Initiative",
    tooltip: "Initiative (DEX Order)",
    recordType: token.recordType === "characters" ? "characters" : "tokens",
  },
  "initiative"
);
