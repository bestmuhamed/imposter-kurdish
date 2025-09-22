// app/single/skyflap/page.tsx
"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

type Pipe = { x: number; w: number; gapY: number; gapH: number; passed: boolean };

const CFG = {
  W: 640,
  H: 420,
  groundY: 380,
  bird: { x: 120, r: 14 },
  gravity: 1800,
  flap: -520,
  baseSpeed: 180,
  speedGrowth: 12,
  gapStart: 160,
  gapMin: 96,
  gapShrinkPerSec: 6,
  pipeW: 70,
  spawnEvery: 1.25,
  colors: {
    bg: "#0b1020",
    pipe: "#60a5fa",
    bird: "#fef08a",
    ground: "#1a223d",
    text: "#cbd5e1",
    accent: "#a78bfa",
    overlay: "rgba(0,0,0,.35)",
    surface: "#101626",
    stroke: "rgba(255,255,255,.15)",
  },
} as const;

// >>> NEU: State-Typ erzwingt 'number' statt Literal
type GameState = {
  y: number;
  vy: number;
  pipes: Pipe[];
  speed: number;
  gap: number;
  spawnTimer: number;
  time: number;
};

const LS_KEY = "skyflap-high";

export default function SkyFlapPage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastTsRef = useRef<number | null>(null);

  const [running, setRunning] = useState(true);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);

  // >>> NEU: useRef<GameState>(...) statt implizit (vermeidet Literaltypen 180/160)
  const stateRef = useRef<GameState>({
    y: CFG.H * 0.45,
    vy: 0,
    pipes: [],
    speed: CFG.baseSpeed, // number (widened via GameState)
    gap: CFG.gapStart,    // number (widened via GameState)
    spawnTimer: 0,
    time: 0,
  });

  useEffect(() => {
    try {
      const v = Number(localStorage.getItem(LS_KEY) || 0);
      if (Number.isFinite(v)) setBest(v);
    } catch {}
  }, []);

  const dpr = useMemo(() => (typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1), []);

  const reset = useCallback(() => {
    setRunning(true);
    setScore(0);
    // >>> passt zum GameState
    stateRef.current = {
      y: CFG.H * 0.45,
      vy: 0,
      pipes: [],
      speed: CFG.baseSpeed,
      gap: CFG.gapStart,
      spawnTimer: 0,
      time: 0,
    };
    lastTsRef.current = null;
  }, []);

  const flap = useCallback(() => {
    if (!running) return reset();
    stateRef.current.vy = CFG.flap;
  }, [reset, running]);

  const spawnPipe = useCallback((arr: Pipe[], gapH: number) => {
    const margin = 32;
    const minY = margin;
    const maxY = CFG.groundY - margin - gapH;
    const gapY = minY + Math.random() * (maxY - minY);
    arr.push({ x: CFG.W + 30, w: CFG.pipeW, gapY, gapH, passed: false });
  }, []);

  const collides = (cx: number, cy: number, r: number, p: Pipe) => {
    const circleRect = (rx: number, ry: number, rw: number, rh: number) => {
      const nx = Math.max(rx, Math.min(cx, rx + rw));
      const ny = Math.max(ry, Math.min(cy, ry + rh));
      const dx = cx - nx;
      const dy = cy - ny;
      return dx * dx + dy * dy <= r * r;
    };
    if (circleRect(p.x, 0, p.w, p.gapY)) return true;
    if (circleRect(p.x, p.gapY + p.gapH, p.w, CFG.groundY - (p.gapY + p.gapH))) return true;
    return false;
  };

  const draw = (
    ctx: CanvasRenderingContext2D,
    y: number,
    pipes: Pipe[],
    s: number,
    b: number,
    speed: number,
    isRunning: boolean
  ) => {
    const { W, H } = CFG;
    ctx.clearRect(0, 0, W, H);

    ctx.fillStyle = CFG.colors.bg;
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = CFG.colors.pipe;
    for (const p of pipes) {
      ctx.fillRect(p.x, 0, p.w, p.gapY);
      const y2 = p.gapY + p.gapH;
      ctx.fillRect(p.x, y2, p.w, CFG.groundY - y2);
    }

    ctx.fillStyle = CFG.colors.bird;
    ctx.beginPath();
    ctx.arc(CFG.bird.x, y, CFG.bird.r, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = CFG.colors.ground;
    ctx.fillRect(0, CFG.groundY, W, H - CFG.groundY);

    ctx.fillStyle = CFG.colors.text;
    ctx.font = "16px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
    ctx.textBaseline = "top";
    ctx.fillText(`Score ${s}`, 12, 10);
    ctx.fillText(`Best  ${b}`, 12, 30);

    ctx.textAlign = "right";
    ctx.fillStyle = CFG.colors.accent;
    ctx.fillText(`${Math.max(1, speed / CFG.baseSpeed).toFixed(2)}x`, W - 12, 10);
    ctx.textAlign = "start";

    if (!isRunning) {
      ctx.fillStyle = CFG.colors.overlay;
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "#fff";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = "bold 26px system-ui, -apple-system, Segoe UI, Roboto";
      ctx.fillText("Game Over", W / 2, 140);
      ctx.font = "16px system-ui, -apple-system, Segoe UI, Roboto";
      ctx.fillText(`Score: ${s}   Best: ${Math.max(s, b)}`, W / 2, 172);
      ctx.fillText("Tap/Space für Neustart", W / 2, 200);
      ctx.textAlign = "start";
      ctx.textBaseline = "alphabetic";
    }
  };

  const loop = useCallback(
    (ts: number) => {
      const canvas = canvasRef.current;
      if (!canvas) {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
        return;
      }
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        rafRef.current = requestAnimationFrame(loop);
        return;
      }
      if (!lastTsRef.current) lastTsRef.current = ts;
      const dt = Math.min(0.033, (ts - lastTsRef.current) / 1000);
      lastTsRef.current = ts;

      const st = stateRef.current;

      if (running) {
        st.time += dt;
        // Difficulty (jetzt ohne TS2322, da 'speed'/'gap' number sind)
        st.speed = CFG.baseSpeed + CFG.speedGrowth * st.time;
        st.gap = Math.max(CFG.gapMin, CFG.gapStart - CFG.gapShrinkPerSec * st.time);

        st.vy += CFG.gravity * dt;
        st.y += st.vy * dt;

        st.spawnTimer -= dt;
        if (st.spawnTimer <= 0) {
          spawnPipe(st.pipes, st.gap);
          st.spawnTimer = CFG.spawnEvery;
        }
        for (const p of st.pipes) p.x -= st.speed * dt;

        for (const p of st.pipes) {
          if (!p.passed && p.x + p.w < CFG.bird.x - CFG.bird.r) {
            p.passed = true;
            setScore((v) => v + 1);
          }
        }
        st.pipes = st.pipes.filter((p) => p.x + p.w > -40);

        const hitGround = st.y + CFG.bird.r >= CFG.groundY;
        const hitTop = st.y - CFG.bird.r <= 0;
        let hitPipe = false;
        for (const p of st.pipes) if (collides(CFG.bird.x, st.y, CFG.bird.r, p)) { hitPipe = true; break; }
        if (hitGround || hitTop || hitPipe) {
          setRunning(false);
          setBest((prev) => {
            const next = Math.max(prev, Math.floor(score));
            try { localStorage.setItem(LS_KEY, String(next)); } catch {}
            return next;
          });
        }
      }

      draw(ctx, st.y, st.pipes, Math.floor(score), Math.floor(best), st.speed, running);
      rafRef.current = requestAnimationFrame(loop);
    },
    [best, draw, running, score, spawnPipe]
  );

  const keyHandler = useCallback((e: KeyboardEvent) => {
    if (e.code === "Space" || e.code === "ArrowUp") { e.preventDefault(); flap(); }
  }, [flap]);

  const pointerHandler = useCallback(() => flap(), [flap]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.style.width = "100%";
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const logicalW = CFG.W;
    const logicalH = CFG.H;

    const resize = () => {
      const vw = typeof window !== "undefined" ? window.innerWidth : CFG.W;
      const scale = Math.min(1, (vw - 24) / CFG.W);
      canvas.width = Math.floor(logicalW * dpr * scale);
      canvas.height = Math.floor(logicalH * dpr * scale);
      ctx.setTransform(dpr * scale, 0, 0, dpr * scale, 0, 0);
    };
    resize();

    window.addEventListener("resize", resize);
    window.addEventListener("keydown", keyHandler);
    canvas.addEventListener("pointerdown", pointerHandler, { passive: true });

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("keydown", keyHandler);
      canvas.removeEventListener("pointerdown", pointerHandler);
    };
  }, [dpr, keyHandler, loop, pointerHandler]);

  return (
    <main style={{ maxWidth: 920, margin: "40px auto", padding: "0 16px", color: "#e2e8f0" }}>
      <header style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <h1 style={{ margin: 0, fontSize: 20 }}>SkyFlap (Solo · Endlos)</h1>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <Link href="/" style={{ padding: "8px 12px", borderRadius: 10, border: `1px solid ${CFG.colors.stroke}`, textDecoration: "none" }}>
            Menü
          </Link>
          <button onClick={reset} style={{ padding: "8px 12px", borderRadius: 10, border: `1px solid ${CFG.colors.stroke}`, background: "transparent", color: "inherit" }}>
            Neustart
          </button>
        </div>
      </header>

      <section style={{ background: CFG.colors.surface, border: `1px solid ${CFG.colors.stroke}`, borderRadius: 16, padding: 16, display: "grid", placeItems: "center", gap: 10 }}>
        <canvas ref={canvasRef} role="img" aria-label="SkyFlap Spielfeld"
          style={{ background: CFG.colors.bg, borderRadius: 16, boxShadow: "0 6px 24px rgba(0,0,0,.3)", maxWidth: CFG.W, width: "100%", height: "auto" }} />
        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ opacity: 0.85 }}>Steuerung: <kbd>Leertaste</kbd>/<kbd>↑</kbd> oder Tippen</span>
          <span style={{ opacity: 0.6 }}>·</span>
          <span style={{ opacity: 0.85 }}>Score: {score}</span>
          <span style={{ opacity: 0.6 }}>·</span>
          <span style={{ opacity: 0.85 }}>Best: {best}</span>
        </div>
      </section>
    </main>
  );
}
