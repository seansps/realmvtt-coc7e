// ============================================================
// Call of Cthulhu 7e - On Roll Initiative Hook
// Called by the combat tracker when initiative is rolled.
// CoC 7e uses DEX as initiative (no dice roll, just DEX value).
// ============================================================

const token = data?.token;
const dex = parseInt(token?.data?.dex, 10) || 0;

const useRoll = api.getSetting("rollInit") === "yes";
const formula = useRoll ? "1d6 default" : `${dex}`;
const modifiers = useRoll ? [{ name: "DEX", value: dex, active: true }] : [];
const tooltip = useRoll ? "Initiative (1D6 + DEX)" : "Initiative (DEX Order)";

const tokenName = token.name || token.record?.name;

api.promptRollForToken(
  token,
  `Initiative for ${tokenName}`,
  formula,
  modifiers,
  {
    rollName: "Initiative",
    tooltip,
    recordType: token.recordType === "characters" ? "characters" : "tokens",
  },
  "initiative"
);
