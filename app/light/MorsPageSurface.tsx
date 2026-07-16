"use client";

import { useRef, useState, type CSSProperties, type PointerEvent, type Ref } from "react";
import {
  COLOR_PRESETS,
  CONCEPTS,
  INITIAL_LIGHT,
  type Concept,
  type LightingSettings,
} from "./config";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const CLUES = [
  {
    id: "boluobao",
    name: "菠萝包",
    role: "行动担当",
    detail: "很勇敢，先冲再说。偶尔会把线索当零食看。",
    x: 42,
    y: 54,
  },
  {
    id: "sato",
    name: "さと",
    role: "智商担当",
    detail: "聪明并且帅气，真正负责把案件拼起来。",
    x: 78,
    y: 67,
  },
  {
    id: "hat",
    name: "侦探帽",
    role: "气氛担当",
    detail: "戴上之后，菠萝包会觉得自己已经接近真相。",
    x: 47,
    y: 17,
  },
  {
    id: "glasses",
    name: "眼镜",
    role: "帅气证据",
    detail: "さと的推理加成。也是现场最闪的线索之一。",
    x: 80,
    y: 59,
  },
] as const;

const LIGHT_MODES = [
  {
    id: "warm",
    label: "暖光",
    description: "角色介绍",
    settings: { enabled: true, color: "#ffb36b", brightness: 1450, angle: 34 },
  },
  {
    id: "white",
    label: "白光",
    description: "手电筒",
    settings: { enabled: true, color: "#ffffff", brightness: 1800, angle: 26 },
  },
  {
    id: "case",
    label: "探案",
    description: "找线索",
    settings: { enabled: true, color: "#8fdcff", brightness: 1250, angle: 22 },
  },
  {
    id: "play",
    label: "玩闹",
    description: "随便玩",
    settings: { enabled: true, color: "#ff5f7f", brightness: 2100, angle: 48 },
  },
] as const;

type MorsPageSurfaceProps = {
  concept: Concept;
  lighting: LightingSettings;
  onConceptChange: (concept: Concept) => void;
  onLightingChange: (patch: Partial<LightingSettings>) => void;
  onReset: () => void;
  preview?: boolean;
  sourceRef?: Ref<HTMLDivElement>;
};

export function MorsPageSurface({
  concept,
  lighting,
  onConceptChange,
  onLightingChange,
  onReset,
  preview = false,
  sourceRef,
}: MorsPageSurfaceProps) {
  const titleId = preview ? "mors-title-preview" : "mors-title";
  const tabIndex = preview ? -1 : undefined;
  const stageRef = useRef<HTMLDivElement>(null);
  const [activeClue, setActiveClue] = useState<(typeof CLUES)[number]>(CLUES[0]);
  const [inspectPoint, setInspectPoint] = useState({ x: 42, y: 54 });

  function moveInspector(event: PointerEvent<HTMLDivElement>) {
    const rect = stageRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    setInspectPoint({
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y)),
    });
  }

  function inspectClue(clue: (typeof CLUES)[number]) {
    setActiveClue(clue);
    setInspectPoint({ x: clue.x, y: clue.y });
  }

  return (
    <div
      ref={sourceRef}
      className="page-source"
      style={
        {
          "--lamp-color": lighting.color,
          "--inspect-x": `${inspectPoint.x}%`,
          "--inspect-y": `${inspectPoint.y}%`,
        } as CSSProperties
      }
    >
      <header className="page-header">
        <div className="page-brand">
          <span className="page-logo-wrap">
            {/* The logo is captured by HTMLTexture, so it must remain a plain DOM image. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`${BASE_PATH}/mors-logo.svg`} alt="" />
          </span>
          <span>HZC</span>
          <span className="page-brand-suffix">DETECTIVE LIGHT</span>
        </div>
        <div className="page-status"><span /> CASE LIVE</div>
      </header>

      <div className="page-main">
        <section className="page-copy" aria-labelledby={titleId}>
          <p className="page-kicker">菠萝包 × さと / 侦探搭档</p>
          <h1 id={titleId}>
            菠萝包<br />
            <span>&amp; さと</span>
          </h1>
          <p className="mouse-king">我是鼠鼠大王</p>
          <p className="page-subtitle" lang="ja">
            はじめましてよろしくお願いします
          </p>

          <div className="case-summary" data-interactive>
            <div className="case-files" role="list" aria-label="Detective partner files">
              {(Object.keys(CONCEPTS) as Concept[]).map((item, index) => (
                <button
                  key={item}
                  type="button"
                  className={concept === item ? "is-active" : ""}
                  onClick={() => onConceptChange(item)}
                  aria-pressed={concept === item}
                  tabIndex={tabIndex}
                >
                  <span>0{index + 1}</span>{item}
                </button>
              ))}
            </div>
            <p className="case-description"><span>{concept}</span>{CONCEPTS[concept]}</p>
          </div>
        </section>

        <section className="investigation-panel" aria-label="Detective partner investigation">
          <div
            ref={stageRef}
            className="investigation-stage"
            data-interactive
            onPointerMove={moveInspector}
            onPointerEnter={moveInspector}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`${BASE_PATH}/20260716-231908.jpg`} alt="菠萝包和さと侦探搭档" />
            <div className="inspector-light" aria-hidden="true" />
            {CLUES.map((clue) => (
              <button
                key={clue.id}
                type="button"
                className={`clue-marker${activeClue.id === clue.id ? " is-active" : ""}`}
                style={{ "--clue-x": `${clue.x}%`, "--clue-y": `${clue.y}%` } as CSSProperties}
                onClick={() => inspectClue(clue)}
                onFocus={() => inspectClue(clue)}
                onPointerEnter={() => inspectClue(clue)}
                aria-label={`查看线索：${clue.name}`}
                tabIndex={tabIndex}
              >
                <span />
              </button>
            ))}
          </div>

          <aside className="clue-card" data-interactive aria-live="polite">
            <p>FOUND CLUE</p>
            <h2>{activeClue.name}</h2>
            <strong>{activeClue.role}</strong>
            <span>{activeClue.detail}</span>
          </aside>
        </section>

        <aside className="light-controls" data-interactive aria-label="Spotlight controls">
          <div className="control-heading">
            <div>
              <p>LIGHT CONTROL</p>
              <span>DETECTIVE SPOT / 01</span>
            </div>
            <button
              type="button"
              className={`power-toggle${lighting.enabled ? " is-on" : ""}`}
              onClick={() => onLightingChange({ enabled: !lighting.enabled })}
              aria-pressed={lighting.enabled}
              aria-label={lighting.enabled ? "Turn spotlight off" : "Turn spotlight on"}
              tabIndex={tabIndex}
            >
              <span />{lighting.enabled ? "ON" : "OFF"}
            </button>
          </div>

          <div className="light-modes" role="group" aria-label="Light modes">
            {LIGHT_MODES.map((mode) => (
              <button
                key={mode.id}
                type="button"
                className={lighting.color === mode.settings.color ? "is-active" : ""}
                onClick={() => onLightingChange(mode.settings)}
                tabIndex={tabIndex}
              >
                <b>{mode.label}</b>
                <span>{mode.description}</span>
              </button>
            ))}
          </div>

          <label className="control-row">
            <span className="control-label"><b>BEAM</b><output>{lighting.angle}°</output></span>
            <input
              type="range"
              min="16"
              max="58"
              step="1"
              value={lighting.angle}
              onInput={(event) => onLightingChange({ angle: Number(event.currentTarget.value) })}
              aria-label="Spotlight beam angle"
              tabIndex={tabIndex}
            />
          </label>

          <label className="control-row">
            <span className="control-label"><b>BRIGHTNESS</b><output>{lighting.brightness} lm</output></span>
            <input
              type="range"
              min="300"
              max="2600"
              step="50"
              value={lighting.brightness}
              onInput={(event) => onLightingChange({ brightness: Number(event.currentTarget.value) })}
              aria-label="Spotlight brightness"
              tabIndex={tabIndex}
            />
          </label>

          <div className="control-row color-control">
            <span className="control-label"><b>COLOR</b><output>{lighting.color.toUpperCase()}</output></span>
            <div className="color-options">
              {COLOR_PRESETS.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={lighting.color === color ? "is-active" : ""}
                  style={{ "--swatch": color } as CSSProperties}
                  onClick={() => onLightingChange({ color })}
                  aria-label={`Set light color to ${color}`}
                  aria-pressed={lighting.color === color}
                  tabIndex={tabIndex}
                />
              ))}
              <label className="custom-color" aria-label="Choose a custom light color">
                <input
                  type="color"
                  value={lighting.color}
                  onInput={(event) => onLightingChange({ color: event.currentTarget.value })}
                  tabIndex={tabIndex}
                />
                <span>+</span>
              </label>
            </div>
          </div>

          <button type="button" className="reset-light" onClick={onReset} tabIndex={tabIndex}>
            RESET LIGHT <span>↗</span>
          </button>
        </aside>
      </div>

      <footer className="page-footer">
        <p>菠萝包 / さと / CASE FILE / FUN LIGHT</p>
        <div className="drag-instruction">
          <span className="drag-orbit" aria-hidden="true"><i /></span>
          <div><b>LMB PULL · RMB LIGHT</b><span>Move over photo · Find clues</span></div>
        </div>
        <p>BRAVE BODYGUARD — GENIUS PARTNER</p>
      </footer>
    </div>
  );
}

const ignoreConceptChange = () => {};
const ignoreLightingChange = () => {};
const ignoreReset = () => {};

export function MorsLightPreview({ hidden = false }: { hidden?: boolean }) {
  return (
    <div className={`scene-preview${hidden ? " is-hidden" : ""}`} aria-hidden="true" inert>
      <MorsPageSurface
        concept="案件"
        lighting={INITIAL_LIGHT}
        onConceptChange={ignoreConceptChange}
        onLightingChange={ignoreLightingChange}
        onReset={ignoreReset}
        preview
      />
    </div>
  );
}

export function MorsLightLoading() {
  return (
    <main className="experience-shell" aria-label="Interactive HZC detective light playroom">
      <MorsLightPreview />
      <div className="scene-status" aria-live="polite">
        <span /> LOADING INTERACTIVE LIGHT
      </div>
    </main>
  );
}
