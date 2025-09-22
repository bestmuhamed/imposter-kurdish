// app/single/hindernisgame/page.tsx
"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

type Obstacle = { x: number; y: number; w: number; h: number };

const CFG = {
    width: 800,
    height: 300,
    groundY: 240,
    gravity: 2200,          // warum: knackiges Sprunggefühl
    jumpVelocity: -900,
    baseSpeed: 320,
    speedGrowth: 0.06,      // skaliert Schwierigkeit über Zeit
    spawnMin: 0.9,
    spawnMax: 1.6,
    player: { x: 80, w: 28, h: 36 },
    colors: {
        bg: "#0b1020",
        ground: "#1a223d",
        player: "#e2e8f0",
        obstacle: "#60a5fa",
        text: "#cbd5e1",
        accent: "#a78bfa",
        overlay: "rgba(0,0,0,.35)",
        surface: "#101626",
        stroke: "rgba(255,255,255,.15)",
    },
} as const;

export default function HindernisGamePage() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const rafRef = useRef<number | null>(null);
    const lastTsRef = useRef<number | null>(null);

    const [running, setRunning] = useState(true);
    const [score, setScore] = useState(0);
    const [high, setHigh] = useState(0);

    const stateRef = useRef({
        vy: 0,
        py: CFG.groundY - CFG.player.h,
        obstacles: [] as Obstacle[],
        speed: CFG.baseSpeed,
        spawnTimer: 0,
    });

    // Highscore laden (warum: Persistenz ohne Server)
    useEffect(() => {
        try {
            const v = Number(localStorage.getItem("hindernis-high") || 0);
            if (!Number.isNaN(v)) setHigh(v);
        } catch { }
    }, []);

    const dpr = useMemo(() => (typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1), []);

    const reset = useCallback(() => {
        setRunning(true);
        setScore(0);
        stateRef.current = {
            vy: 0,
            py: CFG.groundY - CFG.player.h,
            obstacles: [],
            speed: CFG.baseSpeed,
            spawnTimer: 0,
        };
        lastTsRef.current = null;
    }, []);

    const spawnObstacle = useCallback((arr: Obstacle[]) => {
        const h = 20 + Math.floor(Math.random() * 60);
        const w = 20 + Math.floor(Math.random() * 40);
        arr.push({ x: CFG.width + 40, y: CFG.groundY - h, w, h });
    }, []);

    const collides = (px: number, py: number, pw: number, ph: number, o: Obstacle) =>
        px < o.x + o.w && px + pw > o.x && py < o.y + o.h && py + ph > o.y;

    const draw = (
        ctx: CanvasRenderingContext2D,
        py: number,
        obstacles: Obstacle[],
        s: number,
        h: number,
        speed: number,
        isRunning: boolean
    ) => {
        const W = CFG.width;
        const H = CFG.height;

        ctx.clearRect(0, 0, W, H);
        ctx.fillStyle = CFG.colors.bg;
        ctx.fillRect(0, 0, W, H);

        // Boden
        ctx.fillStyle = CFG.colors.ground;
        ctx.fillRect(0, CFG.groundY, W, H - CFG.groundY);

        // Spieler
        ctx.fillStyle = CFG.colors.player;
        ctx.fillRect(CFG.player.x, py, CFG.player.w, CFG.player.h);

        // Hindernisse
        ctx.fillStyle = CFG.colors.obstacle;
        for (const o of obstacles) ctx.fillRect(o.x, o.y, o.w, o.h);

        // HUD
        ctx.fillStyle = CFG.colors.text;
        ctx.font = "16px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
        ctx.textBaseline = "top";
        ctx.fillText(`Score ${s}`, 12, 10);
        ctx.fillText(`Best  ${h}`, 12, 30);

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
            ctx.fillText("Game Over", W / 2, 110);
            ctx.font = "16px system-ui, -apple-system, Segoe UI, Roboto";
            ctx.fillText(`Score: ${s}   Best: ${Math.max(s, h)}`, W / 2, 142);
            ctx.fillText("Leertaste/Tippen für Neustart", W / 2, 172);
            ctx.textAlign = "start";
            ctx.textBaseline = "alphabetic";
        }
    };

    const loop = useCallback((ts: number) => {
        const canvas = canvasRef.current;
        if (!canvas) {
            // Komponente unmounted oder Ref noch nicht gesetzt → Loop stoppen
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
            rafRef.current = null;
            return;
        }
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        if (!lastTsRef.current) lastTsRef.current = ts;
        const dt = Math.min(0.033, (ts - lastTsRef.current) / 1000);
        lastTsRef.current = ts;

        const st = stateRef.current;

        if (running) {
            st.speed += CFG.speedGrowth * dt * CFG.baseSpeed * 0.1;

            st.spawnTimer -= dt;
            if (st.spawnTimer <= 0) {
                spawnObstacle(st.obstacles);
                st.spawnTimer = CFG.spawnMin + Math.random() * (CFG.spawnMax - CFG.spawnMin);
                st.spawnTimer = Math.max(0.45, st.spawnTimer - (st.speed - CFG.baseSpeed) / 800); // warum: pacing bei höherer speed
            }

            st.vy += CFG.gravity * dt;
            st.py += st.vy * dt;
            if (st.py > CFG.groundY - CFG.player.h) {
                st.py = CFG.groundY - CFG.player.h;
                st.vy = 0;
            }

            st.obstacles.forEach((o) => (o.x -= st.speed * dt));
            st.obstacles = st.obstacles.filter((o) => o.x + o.w > -20);

            for (const o of st.obstacles) {
                if (collides(CFG.player.x, st.py, CFG.player.w, CFG.player.h, o)) {
                    setRunning(false);
                    setHigh((prev) => {
                        const next = Math.max(prev, Math.floor(score));
                        try { localStorage.setItem("hindernis-high", String(next)); } catch { }
                        return next;
                    });
                    break;
                }
            }

            setScore((s) => s + st.speed * dt * 0.1);
            draw(ctx, st.py, st.obstacles, Math.floor(score), Math.floor(high), st.speed, running);
        } else {
            draw(ctx, st.py, st.obstacles, Math.floor(score), Math.floor(high), st.speed, running);
        }

        rafRef.current = requestAnimationFrame(loop);
    }, [draw, high, running, score, spawnObstacle]);

    const jump = useCallback(() => {
        if (!running) return reset();
        const st = stateRef.current;
        if (st.vy === 0) st.vy = CFG.jumpVelocity;
    }, [reset, running]);

    const keyHandler = useCallback((e: KeyboardEvent) => {
        if (e.code === "Space" || e.code === "ArrowUp") {
            e.preventDefault();
            jump();
        } else if (!running && (e.code === "Enter" || e.code === "KeyR")) {
            e.preventDefault();
            reset();
        }
    }, [jump, reset, running]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // DPR-aware & responsive sizing (warum: gestochen scharf)
        canvas.style.width = "100%";
        const logicalW = Math.floor(CFG.width);
        const logicalH = Math.floor(CFG.height);
        const scale = Math.min(1, (typeof window !== "undefined" ? (window.innerWidth - 24) / CFG.width : 1));
        canvas.width = Math.floor(logicalW * dpr * scale);
        canvas.height = Math.floor(logicalH * dpr * scale);
        const ctx = canvas.getContext("2d")!;
        ctx.setTransform(dpr * scale, 0, 0, dpr * scale, 0, 0);

        const onResize = () => {
            const scale2 = Math.min(1, (typeof window !== "undefined" ? (window.innerWidth - 24) / CFG.width : 1));
            canvas.width = Math.floor(logicalW * dpr * scale2);
            canvas.height = Math.floor(logicalH * dpr * scale2);
            ctx.setTransform(dpr * scale2, 0, 0, dpr * scale2, 0, 0);
        };

        window.addEventListener("resize", onResize);
        window.addEventListener("keydown", keyHandler);
        canvas.addEventListener("pointerdown", jump, { passive: true });

        rafRef.current = requestAnimationFrame(loop);

        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
            window.removeEventListener("resize", onResize);
            window.removeEventListener("keydown", keyHandler);
            canvas.removeEventListener("pointerdown", jump);
        };
    }, [dpr, jump, keyHandler, loop]);

    return (
        <main
            style={{
                maxWidth: 920,
                margin: "40px auto",
                padding: "0 16px",
                color: "#e2e8f0",
            }}
        >
            <header
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    marginBottom: 16,
                }}
            >
                <h1 style={{ margin: 0, fontSize: 20 }}>Hindernis-Game (Endlos · Solo)</h1>
                <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
                    <Link
                        href="/"
                        style={{
                            padding: "8px 12px",
                            borderRadius: 10,
                            border: `1px solid ${CFG.colors.stroke}`,
                            textDecoration: "none",
                        }}
                        title="Zurück zum Menü"
                    >
                        Menü
                    </Link>
                    <button
                        onClick={reset}
                        style={{
                            padding: "8px 12px",
                            borderRadius: 10,
                            border: `1px solid ${CFG.colors.stroke}`,
                            background: "transparent",
                            color: "inherit",
                        }}
                        title="Neustart"
                    >
                        Neustart
                    </button>
                </div>
            </header>

            <section
                style={{
                    background: CFG.colors.surface,
                    border: `1px solid ${CFG.colors.stroke}`,
                    borderRadius: 16,
                    padding: 16,
                    display: "grid",
                    placeItems: "center",
                    gap: 10,
                }}
            >
                <canvas
                    ref={canvasRef}
                    role="img"
                    aria-label="Hindernis-Endless-Runner"
                    style={{
                        background: CFG.colors.bg,
                        borderRadius: 16,
                        boxShadow: "0 6px 24px rgba(0,0,0,.3)",
                        maxWidth: CFG.width,
                        width: "100%",
                        height: "auto",
                    }}
                />
                <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                    <span style={{ opacity: 0.85 }}>
                        Steuerung: <kbd>Leertaste</kbd>/<kbd>↑</kbd> oder Tippen
                    </span>
                    <span style={{ opacity: 0.6 }}>·</span>
                    <span style={{ opacity: 0.85 }}>Score: {Math.floor(score)}</span>
                    <span style={{ opacity: 0.6 }}>·</span>
                    <span style={{ opacity: 0.85 }}>Best: {high}</span>
                </div>
            </section>
        </main>
    );
}
