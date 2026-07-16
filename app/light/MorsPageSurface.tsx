import type { CSSProperties, Ref } from "react";
import {
  COLOR_PRESETS,
  CONCEPTS,
  INITIAL_LIGHT,
  type Concept,
  type LightingSettings,
} from "./config";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

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

  return (
    <div
      ref={sourceRef}
      className="page-source"
      style={{ "--lamp-color": lighting.color } as CSSProperties}
    >
      <header className="page-header">
        <div className="page-brand">
          <span className="page-logo-wrap">
            {/* The logo is captured by HTMLTexture, so it must remain a plain DOM image. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`${BASE_PATH}/mors-logo.svg`} alt="" />
          </span>
          <span>HZC</span>
          <span className="page-brand-suffix">GAME ENGINE</span>
        </div>
        <div className="page-status"><span /> EARLY DEVELOPMENT</div>
      </header>

      <div className="page-main">
        <section className="page-copy" aria-labelledby={titleId}>
          <p className="page-kicker">01 / RUNTIME ARCHITECTURE</p>
          <h1 id={titleId}>
            Meta is observed<br />
            by Rule to <span>Step in Space.</span>
          </h1>
          <p className="page-subtitle">
            A Rust engine architecture where rules derive tightly packed data layout for elegant performance.
          </p>

          <div className="concepts" data-interactive>
            <div className="concept-list" role="list" aria-label="HZC engine model">
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
            <p className="concept-description"><span>{concept}</span>{CONCEPTS[concept]}</p>
          </div>
        </section>

        <aside className="light-controls" data-interactive aria-label="Spotlight controls">
          <div className="control-heading">
            <div>
              <p>LIGHT CONTROL</p>
              <span>PHYSICAL SPOT / 01</span>
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
        <p>SPACE / META / FIELD / RULE / LATENT</p>
        <div className="drag-instruction">
          <span className="drag-orbit" aria-hidden="true"><i /></span>
          <div><b>LMB PULL · RMB LIGHT</b><span>Right-drag beam · Right-click color</span></div>
        </div>
        <p>FOUNDATION FIRST — OPEN SOURCE WHEN READY</p>
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
        concept="Space"
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
    <main className="experience-shell" aria-label="Interactive HZC light study">
      <MorsLightPreview />
      <div className="scene-status" aria-live="polite">
        <span /> LOADING INTERACTIVE LIGHT
      </div>
    </main>
  );
}
