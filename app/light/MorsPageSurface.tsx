"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties, type PointerEvent, type Ref } from "react";
import {
  COLOR_PRESETS,
  CONCEPTS,
  INITIAL_LIGHT,
  type Concept,
  type LightingSettings,
} from "./config";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const COMPACT_VIEWPORT = "(max-width: 700px)";

function subscribeToCompactViewport(callback: () => void) {
  const media = window.matchMedia(COMPACT_VIEWPORT);
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}

function getCompactViewportSnapshot() {
  return window.matchMedia(COMPACT_VIEWPORT).matches;
}

const CLUE_DETECTION_RADIUS = 13;
const CLUE_HOLD_MS = 1000;

const CASE_CLUES = [
  {
    id: "varnish",
    name: "????????",
    role: "??????",
    detail: "??????????????????????????????????",
    positions: [{ x: 46, y: 42 }, { x: 61, y: 37 }, { x: 37, y: 54 }],
  },
  {
    id: "tape",
    name: "?????????",
    role: "???????",
    detail: "???????????????????????????????",
    positions: [{ x: 15, y: 22 }, { x: 83, y: 30 }, { x: 24, y: 79 }],
  },
  {
    id: "calibration",
    name: "??????????",
    role: "??????",
    detail: "??????????????????????????????????",
    positions: [{ x: 73, y: 72 }, { x: 29, y: 69 }, { x: 78, y: 51 }],
  },
  {
    id: "imprint",
    name: "???????",
    role: "?????",
    detail: "?????????????????????????",
    positions: [{ x: 50, y: 86 }, { x: 35, y: 82 }, { x: 68, y: 84 }],
  },
] as const;

const SUSPECTS = [
  { id: "curator", name: "???", role: "????" },
  { id: "restorer", name: "???", role: "????" },
  { id: "lighting", name: "?????", role: "????" },
] as const;

type CaseClue = Omit<(typeof CASE_CLUES)[number], "positions"> & {
  x: number;
  y: number;
};

function createCaseClues(): CaseClue[] {
  return CASE_CLUES.map(({ positions, ...clue }) => {
    const position = positions[Math.floor(Math.random() * positions.length)];
    return { ...clue, ...position };
  });
}

const LIGHT_MODES = [
  {
    id: "warm",
    label: "??",
    description: "????",
    settings: { enabled: true, color: "#ffb36b", brightness: 1450, angle: 34 },
  },
  {
    id: "white",
    label: "??",
    description: "???",
    settings: { enabled: true, color: "#ffffff", brightness: 1800, angle: 26 },
  },
  {
    id: "case",
    label: "??",
    description: "???",
    settings: { enabled: true, color: "#8fdcff", brightness: 1250, angle: 22 },
  },
  {
    id: "play",
    label: "??",
    description: "???",
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
  const isCompact = useSyncExternalStore(subscribeToCompactViewport, getCompactViewportSnapshot, () => false);
  const stageRef = useRef<HTMLDivElement>(null);
  const [caseClues, setCaseClues] = useState<CaseClue[]>(createCaseClues);
  const [foundClueIds, setFoundClueIds] = useState<string[]>([]);
  const [candidateClueId, setCandidateClueId] = useState<string | null>(null);
  const [lastFoundClueId, setLastFoundClueId] = useState<string | null>(null);
  const [casePhase, setCasePhase] = useState<"searching" | "deducing" | "solved">("searching");
  const [caseNotice, setCaseNotice] = useState<"wrong" | null>(null);
  const candidateClue = caseClues.find((clue) => clue.id === candidateClueId) ?? null;
  const activeClue = caseClues.find((clue) => clue.id === lastFoundClueId) ?? null;
  const foundClues = caseClues.filter((clue) => foundClueIds.includes(clue.id));
  const isChecking = Boolean(candidateClue && !foundClueIds.includes(candidateClue.id));

  useEffect(() => {
    if (!candidateClue || !isChecking || casePhase !== "searching") return;

    const timer = window.setTimeout(() => {
      setFoundClueIds((current) => current.includes(candidateClue.id) ? current : [...current, candidateClue.id]);
      setLastFoundClueId(candidateClue.id);
      setCandidateClueId(null);
      if (foundClueIds.length + 1 === caseClues.length) setCasePhase("deducing");
    }, CLUE_HOLD_MS);

    return () => window.clearTimeout(timer);
  }, [candidateClue, caseClues.length, casePhase, foundClueIds.length, isChecking]);

  function resetCase(wrongAnswer = false) {
    setCaseClues(createCaseClues());
    setFoundClueIds([]);
    setCandidateClueId(null);
    setLastFoundClueId(null);
    setCasePhase("searching");
    setCaseNotice(wrongAnswer ? "wrong" : null);
  }

  function chooseSuspect(suspectId: (typeof SUSPECTS)[number]["id"]) {
    if (suspectId === "lighting") {
      setCasePhase("solved");
      return;
    }
    resetCase(true);
  }

  function moveInspector(event: PointerEvent<HTMLDivElement>) {
    if (!lighting.enabled || casePhase !== "searching") {
      setCandidateClueId(null);
      return;
    }
    const rect = stageRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    const nearest = caseClues.map((clue) => ({
      clue,
      distance: Math.hypot(clue.x - x, clue.y - y),
    })).sort((a, b) => a.distance - b.distance)[0];

    setCaseNotice(null);
    setCandidateClueId(nearest.distance <= CLUE_DETECTION_RADIUS ? nearest.clue.id : null);
  }

  return (
    <div
      ref={sourceRef}
      className={`page-source${isCompact ? " is-compact" : ""}`}
      style={
        {
          "--lamp-color": lighting.color,
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
          <p className="page-kicker">??? ? ?? / ????</p>
          <h1 id={titleId}>
            ???<br />
            <span>&amp; ??</span>
          </h1>
          <p className="mouse-king">??????</p>
          <p className="page-subtitle" lang="ja">
            ????????????????
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
            onPointerLeave={() => setCandidateClueId(null)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`${BASE_PATH}/gallery-case-portrait.png`} alt="???????" />
          </div>

          <aside className={`clue-card case-clue-card${activeClue || isChecking ? "" : " is-empty"}`} data-interactive aria-live="polite">
            <div className="case-card-header">
              <p>{casePhase === "solved" ? "CASE SOLVED" : casePhase === "deducing" ? "READY TO DEDUCE" : isChecking ? "INSPECTING" : caseNotice === "wrong" ? "CASE RESET" : "SEARCHING"}</p>
              <span>{foundClues.length} / {caseClues.length}</span>
            </div>
            <h2>{casePhase === "solved" ? "??????" : casePhase === "deducing" ? "?????????" : isChecking ? "??????????" : activeClue?.name ?? "????????????"}</h2>
            <strong>{casePhase === "solved" ? "????????" : casePhase === "deducing" ? "???????????" : isChecking ? "??? 1 ?" : activeClue?.role ?? (caseNotice === "wrong" ? "???????" : lighting.enabled ? "??????" : "??????")}</strong>
            <span>{casePhase === "solved" ? "?????????????????????????" : casePhase === "deducing" ? "??????????????????????????" : isChecking ? "????????????" : activeClue?.detail ?? (caseNotice === "wrong" ? "?????????????????????" : "?????????????????")}</span>
          </aside>

          {casePhase === "deducing" || casePhase === "solved" ? (
            <section className={`deduction-card${casePhase === "solved" ? " is-solved" : ""}`} data-interactive aria-label="Point out the culprit">
              {casePhase === "deducing" ? (
                <>
                  <p>FINAL DEDUCTION / ?????</p>
                  <div className="suspect-options">
                    {SUSPECTS.map((suspect) => (
                      <button key={suspect.id} type="button" onClick={() => chooseSuspect(suspect.id)} tabIndex={tabIndex}>
                        <b>{suspect.name}</b><span>{suspect.role}</span>
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <p>CASE 01 CLOSED</p>
                  <button type="button" className="replay-case" onClick={() => resetCase()} tabIndex={tabIndex}>???? <span>?</span></button>
                </>
              )}
            </section>
          ) : (
            <div className="evidence-board" aria-label="Evidence board">
              {caseClues.map((clue, index) => {
                const found = foundClueIds.includes(clue.id);
                return <div key={clue.id} className={found ? "is-found" : ""}><b>0{index + 1}</b><span>{found ? clue.name : "??????"}</span></div>;
              })}
            </div>
          )}
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
            <span className="control-label"><b>BEAM</b><output>{lighting.angle}?</output></span>
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
            RESET LIGHT <span>?</span>
          </button>
        </aside>
      </div>

      <footer className="page-footer">
        <p>??? / ?? / CASE FILE / FUN LIGHT</p>
        <div className="drag-instruction">
          <span className="drag-orbit" aria-hidden="true"><i /></span>
          <div><b>LMB PULL ? RMB LIGHT</b><span>Light the photo ? Reveal clues</span></div>
        </div>
        <p>BRAVE BODYGUARD ? GENIUS PARTNER</p>
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
        concept="??"
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
