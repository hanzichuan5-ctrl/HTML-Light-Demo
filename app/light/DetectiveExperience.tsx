"use client";

import { useEffect, useRef, useState, type CSSProperties, type MouseEvent } from "react";
import { DETECTIVE_EGGS, type DetectiveEgg, type RoundEgg } from "./detective-eggs";
import type { DetectiveProgress } from "./detective-storage";

type EasterEggLayerProps = {
  eggs: RoundEgg[];
  onUnlock: (id: string) => void;
};

function EnvironmentVisual({ effect }: Pick<DetectiveEgg, "effect">) {
  switch (effect) {
    case "footprints":
      return <div className="egg-footprints" aria-hidden="true"><i>●</i><i>●</i><i>●</i><i>●</i></div>;
    case "sketch":
      return <div className="egg-sketch" aria-hidden="true"><span>↗</span></div>;
    case "silhouette":
      return <div className="egg-silhouette" aria-hidden="true"><i /><span>?</span></div>;
    case "stars":
      return <div className="egg-stars" aria-hidden="true"><i>✦</i><i>·</i><i>✧</i><i>✦</i></div>;
    case "note":
      return <div className="egg-note" aria-hidden="true"><span>CASE<br />NOTE</span></div>;
    case "cipher":
      return <div className="egg-cipher" aria-hidden="true">△ 07 · ○ 21<br />H Z C</div>;
    default:
      return null;
  }
}

export function EasterEggLayer({ eggs, onUnlock }: EasterEggLayerProps) {
  return (
    <div className="easter-egg-layer">
      {eggs.map((egg) => {
        const ready = !egg.unlocked && egg.charge >= 0.995;
        const sensing = !egg.unlocked && egg.charge > 0.03;
        return (
          <div
            key={egg.id}
            data-egg-id={egg.id}
            data-egg-x={egg.x.toFixed(2)}
            data-egg-y={egg.y.toFixed(2)}
            className={`easter-egg egg-${egg.kind}${sensing ? " is-sensing" : ""}${ready ? " is-ready" : ""}${egg.reveal > 0 ? " is-revealed" : ""}`}
            style={
              {
                "--egg-x": `${egg.x}%`,
                "--egg-y": `${egg.y}%`,
                "--egg-charge": egg.charge,
                "--egg-reveal": egg.reveal,
              } as CSSProperties
            }
          >
            <span className="egg-signal" aria-hidden="true" />
            {ready ? (
              <button
                type="button"
                className="fingerprint-unlock"
                data-interactive
                onClick={() => onUnlock(egg.id)}
                aria-label={`解锁线索：${egg.title}`}
              >
                <span aria-hidden="true">◉</span>
              </button>
            ) : null}
            {egg.unlocked ? (
              <div className="egg-reveal-card" aria-live="polite">
                {egg.kind === "environment" ? <EnvironmentVisual effect={egg.effect} /> : null}
                <p>{egg.kind === "phrase" ? "SECRET LINE" : "SCENE SHIFT"}</p>
                <strong>{egg.title}</strong>
                <span lang={egg.lang}>{egg.text}</span>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

type DetectiveNotebookProps = {
  open: boolean;
  progress: DetectiveProgress;
  roundFound: number;
  soundEnabled: boolean;
  onOpenChange: (open: boolean) => void;
  onReplay: (egg: DetectiveEgg) => void;
  onClear: () => void;
  onSoundToggle: () => void;
};

export function DetectiveNotebook({
  open,
  progress,
  roundFound,
  soundEnabled,
  onOpenChange,
  onReplay,
  onClear,
  onSoundToggle,
}: DetectiveNotebookProps) {
  const [confirmingClear, setConfirmingClear] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const collectedById = new Map(progress.collected.map((item) => [item.id, item]));

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  function handleDialogClick(event: MouseEvent<HTMLDialogElement>) {
    // Close when clicking outside the dialog content (backdrop click).
    const dialog = dialogRef.current;
    if (!dialog) return;
    const rect = dialog.getBoundingClientRect();
    const isInsideDialog =
      event.clientX >= rect.left &&
      event.clientX <= rect.right &&
      event.clientY >= rect.top &&
      event.clientY <= rect.bottom;
    if (!isInsideDialog) {
      onOpenChange(false);
    }
  }

  return (
    <>
      <div className="detective-dock" data-ui-overlay>
        <button
          type="button"
          className="notebook-trigger"
          onClick={() => onOpenChange(!open)}
          aria-expanded={open}
          aria-controls="detective-notebook"
        >
          <span aria-hidden="true">▤</span>
          <b>侦探手册</b>
          <small>{roundFound}/6</small>
        </button>
        <button
          type="button"
          className="sound-toggle"
          onClick={onSoundToggle}
          aria-label={soundEnabled ? "关闭音效" : "开启音效"}
          aria-pressed={soundEnabled}
        >
          {soundEnabled ? "♪" : "×"}
        </button>
      </div>

      <dialog
        ref={dialogRef}
        id="detective-notebook"
        className="detective-notebook"
        aria-label="侦探手册"
        onClose={() => onOpenChange(false)}
        onClick={handleDialogClick}
      >
          <header>
            <div>
              <p>DETECTIVE ARCHIVE</p>
              <h2>侦探手册</h2>
            </div>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onOpenChange(false);
              }}
              aria-label="关闭侦探手册"
            >
              ×
            </button>
          </header>

          <div className="notebook-stats">
            <span><b>{progress.collected.length}/30</b>收藏进度</span>
            <span><b>{progress.totalDiscoveries}</b>发现总数</span>
            <span><b>{progress.completedRounds}</b>完成轮数</span>
          </div>

          <div className="notebook-grid">
            {DETECTIVE_EGGS.map((egg, index) => {
              const collected = collectedById.get(egg.id);
              return collected ? (
                <button key={egg.id} type="button" className="notebook-card is-collected" onClick={() => onReplay(egg)}>
                  <small>{String(index + 1).padStart(2, "0")} · {egg.kind === "phrase" ? "短句" : "环境"}</small>
                  <strong>{egg.title}</strong>
                  <span>{egg.text}</span>
                  <time dateTime={collected.discoveredAt}>{new Date(collected.discoveredAt).toLocaleDateString("zh-CN")}</time>
                </button>
              ) : (
                <div key={egg.id} className="notebook-card is-locked" aria-label={`未发现线索 ${index + 1}`}>
                  <small>{String(index + 1).padStart(2, "0")} · UNKNOWN</small>
                  <strong>未发现</strong>
                  <span>继续移动灯光寻找秘密</span>
                </div>
              );
            })}
          </div>

          <footer>
            {confirmingClear ? (
              <div className="clear-confirmation">
                <span>确定清空全部收藏？</span>
                <button type="button" onClick={() => { onClear(); setConfirmingClear(false); }}>确定清空</button>
                <button type="button" onClick={() => setConfirmingClear(false)}>取消</button>
              </div>
            ) : (
              <button type="button" className="clear-notebook" onClick={() => setConfirmingClear(true)}>清空手册</button>
            )}
          </footer>
      </dialog>
    </>
  );
}

export function NotebookReplay({ egg, onClose }: { egg: DetectiveEgg; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
    return () => {
      if (dialog?.open) dialog.close();
    };
  }, []);

  return (
    <dialog ref={dialogRef} className="notebook-replay" data-ui-overlay aria-label={egg.title} onClose={onClose}>
      <button type="button" onClick={onClose} aria-label="关闭回放">×</button>
      {egg.kind === "environment" ? <EnvironmentVisual effect={egg.effect} /> : <span className="replay-spark">✦</span>}
      <p>{egg.kind === "phrase" ? "SECRET REPLAY" : "SCENE REPLAY"}</p>
      <h2>{egg.title}</h2>
      <div lang={egg.lang}>{egg.text}</div>
    </dialog>
  );
}

export function RoundCompleteDialog({ onNextRound }: { onNextRound: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
    return () => {
      if (dialog?.open) dialog.close();
    };
  }, []);

  return (
    <dialog ref={dialogRef} className="round-complete" data-ui-overlay aria-live="polite">
      <p>INVESTIGATION COMPLETE</p>
      <h2>本轮调查完成</h2>
      <span>六个秘密已经全部归档。</span>
      <button type="button" onClick={onNextRound}>开始下一轮</button>
    </dialog>
  );
}
