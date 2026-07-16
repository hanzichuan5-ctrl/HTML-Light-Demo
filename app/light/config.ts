export const CONCEPTS = {
  Space: "A sandbox universe where runtime state evolves with clear boundaries.",
  Meta: "A basic game unit that owns fields and receives rules.",
  Field: "Explicit data that keeps layout derivable and tightly packed.",
  Rule: "Rules declare what they need, and runtime derives the layout.",
  Latent: "Long-lived space-level systems for global capability and reusable scratch.",
} as const;

export type Concept = keyof typeof CONCEPTS;

export type LightingSettings = {
  enabled: boolean;
  angle: number;
  brightness: number;
  color: string;
};

export const COLOR_PRESETS = ["#ffb36b", "#ffd9a3", "#8fdcff", "#c79cff", "#ff5f7f", "#ffffff"] as const;

export const INITIAL_LIGHT: LightingSettings = {
  enabled: true,
  angle: 34,
  brightness: 1450,
  color: "#ffb36b",
};
