export const CONCEPTS = {
  案件: "谁偷走了最后一口菠萝包？现场看起来很可疑，但さと已经发现三个关键细节。",
  菠萝包: "前线行动担当。勇敢、热情、冲得很快，判断力偶尔会突然掉线。",
  "さと": "帅气智商担当。负责推理、复盘、补刀，以及把菠萝包带回正确方向。",
  装备: "一顶侦探帽、一副眼镜、一束可以到处乱照的灯，就是今天的全部工具。",
  结论: "这对搭档破案靠的不是严肃，是气势、默契和一点点好运。",
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
