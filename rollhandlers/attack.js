// ============================================================
// Call of Cthulhu 7e - Attack Roll Handler
// This handler is used when attacks need special processing
// beyond what skill.js handles. Currently, melee and firearms
// attacks are routed through skill.js with isAttack metadata.
// This file is reserved for future attack-specific extensions.
// ============================================================

// Attack rolls in CoC 7e are handled by skill.js with:
// - isMelee = true, isOpposed = true  → triggers opposed roll flow
// - isFirearm = true, isOpposed = false → triggers non-opposed firearm flow
// - Both embed damage macros on success

// If additional attack-specific logic is needed (e.g., fighting maneuvers,
// called shots, etc.), it can be added here.
