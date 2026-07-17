export type EggKind = "phrase" | "environment";

export type EnvironmentEffect =
  | "footprints"
  | "sketch"
  | "silhouette"
  | "stars"
  | "note"
  | "cipher";

export type DetectiveEgg = {
  id: string;
  kind: EggKind;
  title: string;
  text: string;
  effect?: EnvironmentEffect;
  lang?: "ja";
};

export type RoundEgg = DetectiveEgg & {
  x: number;
  y: number;
  charge: number;
  reveal: number;
  unlocked: boolean;
};

const PHRASE_EGGS: DetectiveEgg[] = [
  { id: "phrase-01", kind: "phrase", title: "面包味线索", text: "菠萝包说：这条线索闻起来像刚出炉。" },
  { id: "phrase-02", kind: "phrase", title: "早已看穿", text: "さと已经知道答案，只是想看你再找一会儿。" },
  { id: "phrase-03", kind: "phrase", title: "侦探守则", text: "真正的侦探不会放过任何一粒面包屑。" },
  { id: "phrase-04", kind: "phrase", title: "秘密口袋", text: "帽子里没有兔子，只有一张没写完的线索。" },
  { id: "phrase-05", kind: "phrase", title: "轻声报告", text: "嘘——嫌疑人可能正在假装睡觉。" },
  { id: "phrase-06", kind: "phrase", title: "搭档暗号", text: "灯闪两下，就代表今天也要一起破案。" },
  { id: "phrase-07", kind: "phrase", title: "可靠直觉", text: "菠萝包的直觉很准，除了遇到零食的时候。" },
  { id: "phrase-08", kind: "phrase", title: "聪明办法", text: "さと把复杂的推理，藏进了一个很轻的微笑里。" },
  { id: "phrase-09", kind: "phrase", title: "现场温度", text: "有搭档在的地方，案发现场也不会太冷。" },
  { id: "phrase-10", kind: "phrase", title: "第三个脚印", text: "奇怪，第三个脚印怎么像一小块菠萝包？" },
  { id: "phrase-11", kind: "phrase", title: "临时结论", text: "目前最可疑的，是那位假装无辜的空盘子。" },
  { id: "phrase-12", kind: "phrase", title: "灯下约定", text: "你负责照亮秘密，我们负责把故事拼完整。" },
  { id: "phrase-13", kind: "phrase", title: "夜间值班", text: "深夜的侦探事务所，也会为好奇心留一盏灯。" },
  { id: "phrase-14", kind: "phrase", title: "微小证据", text: "最小的亮点，也可能是整件事的答案。" },
  { id: "phrase-15", kind: "phrase", title: "今日搭档", text: "破案不一定要严肃，默契就已经很厉害。" },
  { id: "phrase-16", kind: "phrase", title: "光里的秘密", text: "ひみつは、光の中にいる。", lang: "ja" },
  { id: "phrase-17", kind: "phrase", title: "全部看穿", text: "さとは全部お見通し。", lang: "ja" },
  { id: "phrase-18", kind: "phrase", title: "再靠近一点", text: "もう少しだけ、照らして。", lang: "ja" },
];

const ENVIRONMENT_EGGS: DetectiveEgg[] = [
  { id: "env-01", kind: "environment", title: "经过的小脚印", text: "一串小脚印绕过了案发现场。", effect: "footprints" },
  { id: "env-02", kind: "environment", title: "回头的脚印", text: "脚印走到这里，忽然又偷偷折返。", effect: "footprints" },
  { id: "env-03", kind: "environment", title: "手绘线索圈", text: "有人用铅笔把这里认真圈了三遍。", effect: "sketch" },
  { id: "env-04", kind: "environment", title: "歪歪的箭头", text: "一支不太自信的箭头指向了真相。", effect: "sketch" },
  { id: "env-05", kind: "environment", title: "搭档探头", text: "一个熟悉的影子从角落探出脑袋。", effect: "silhouette" },
  { id: "env-06", kind: "environment", title: "帽檐后的影子", text: "侦探帽的影子轻轻点了一下头。", effect: "silhouette" },
  { id: "env-07", kind: "environment", title: "线索星点", text: "几颗小星星替重要证据做了标记。", effect: "stars" },
  { id: "env-08", kind: "environment", title: "暖色星尘", text: "光落下时，空气里浮起一点金色星尘。", effect: "stars" },
  { id: "env-09", kind: "environment", title: "折角便签", text: "便签上写着：别忘了相信你的搭档。", effect: "note" },
  { id: "env-10", kind: "environment", title: "值班留言", text: "今晚也辛苦了，桌上给你留了点心。", effect: "note" },
  { id: "env-11", kind: "environment", title: "墙面暗号", text: "暗号解读结果：答案就在温暖的地方。", effect: "cipher" },
  { id: "env-12", kind: "environment", title: "隐藏坐标", text: "坐标最终指向：菠萝包和さと中间。", effect: "cipher" },
];

export const DETECTIVE_EGGS = [...PHRASE_EGGS, ...ENVIRONMENT_EGGS];

const SAFE_ZONES = [
  { x: [8, 27], y: [18, 75] },
  { x: [31, 45], y: [15, 78] },
  { x: [47, 69], y: [17, 76] },
  { x: [70, 78], y: [18, 76] },
] as const;

function shuffle<T>(items: T[]) {
  for (let index = items.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [items[index], items[swapIndex]] = [items[swapIndex], items[index]];
  }
  return items;
}

function pickRoundEggs(collectedIds: Set<string>) {
  const unseen = shuffle(DETECTIVE_EGGS.filter((egg) => !collectedIds.has(egg.id)));
  const seen = shuffle(DETECTIVE_EGGS.filter((egg) => collectedIds.has(egg.id)));
  return [...unseen, ...seen].slice(0, 6);
}

export function createRoundEggs(collectedIds: Iterable<string>): RoundEgg[] {
  const picked = pickRoundEggs(new Set(collectedIds));
  const zones = shuffle([...SAFE_ZONES]);

  return picked.map((egg, index) => {
    const zone = zones[index % zones.length];
    const [minX, maxX] = zone.x;
    const [minY, maxY] = zone.y;
    const rowOffset = Math.floor(index / zones.length) * 9;
    return {
      ...egg,
      x: minX + Math.random() * (maxX - minX),
      y: Math.min(maxY, minY + Math.random() * (maxY - minY) + rowOffset),
      charge: 0,
      reveal: 0,
      unlocked: false,
    };
  });
}
