"use client";

import { useEffect, useRef } from "react";

export default function CursorGlow() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const cursorRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const canvasElement = canvasRef.current;
        const cursor = cursorRef.current;
        if (!canvasElement) {
            return;
        }
        const canvas: HTMLCanvasElement = canvasElement;
        if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
            return;
        }

        const context = canvas.getContext("2d");
        if (!context) return;

        const trail: { x: number; y: number; time: number }[] = [];
        const lifetime = 900;
        let animationFrame = 0;
        let width = window.innerWidth;
        let height = window.innerHeight;
        const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

        function resizeCanvas() {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = Math.round(width * pixelRatio);
            canvas.height = Math.round(height * pixelRatio);
            context?.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
        }

        function drawFrame() {
            const now = performance.now();
            while (trail.length > 0 && now - trail[0].time > lifetime) {
                trail.shift();
            }

            context!.clearRect(0, 0, width, height);
            context!.lineCap = "round";
            context!.lineJoin = "round";

            for (let index = 1; index < trail.length; index += 1) {
                const previous = trail[index - 1];
                const current = trail[index];
                const age = now - current.time;
                const opacity = Math.max(0, 1 - age / lifetime);
                const widthScale = index / (trail.length - 1);

                context!.beginPath();
                context!.moveTo(previous.x, previous.y);
                context!.lineTo(current.x, current.y);
                context!.strokeStyle = `rgba(15, 23, 42, ${opacity * 0.72})`;
                context!.lineWidth = 0.8 + widthScale * 2.4;
                context!.shadowColor = `rgba(15, 23, 42, ${opacity * 0.45})`;
                context!.shadowBlur = 9 * opacity;
                context!.stroke();
            }

            context!.shadowBlur = 0;
            if (trail.length > 1) {
                animationFrame = window.requestAnimationFrame(drawFrame);
            } else {
                animationFrame = 0;
            }
        }

        const handlePointerMove = (event: PointerEvent) => {
            if (event.pointerType !== "mouse") return;
            if (cursor) {
                cursor.style.left = `${event.clientX}px`;
                cursor.style.top = `${event.clientY}px`;
                cursor.style.opacity = "1";
                const target = event.target;
                const isInteractive =
                    target instanceof Element &&
                    target.closest("a, button, [role='button'], input, textarea, select, label") !== null;
                cursor.classList.toggle("cursor-dot--interactive", isInteractive);
            }

            const now = performance.now();
            const lastPoint = trail[trail.length - 1];
            if (lastPoint && Math.hypot(event.clientX - lastPoint.x, event.clientY - lastPoint.y) < 2) {
                return;
            }

            trail.push({ x: event.clientX, y: event.clientY, time: now });
            if (trail.length > 64) trail.shift();
            if (!animationFrame) animationFrame = window.requestAnimationFrame(drawFrame);
        };

        const handlePointerLeave = () => {
            if (cursor) {
                cursor.style.opacity = "0";
                cursor.classList.remove("cursor-dot--interactive");
            }
        };

        resizeCanvas();
        window.addEventListener("resize", resizeCanvas);
        window.addEventListener("pointermove", handlePointerMove, { passive: true });
        document.documentElement.addEventListener("pointerleave", handlePointerLeave);
        return () => {
            window.removeEventListener("resize", resizeCanvas);
            window.removeEventListener("pointermove", handlePointerMove);
            document.documentElement.removeEventListener("pointerleave", handlePointerLeave);
            window.cancelAnimationFrame(animationFrame);
        };
    }, []);

    return (
        <>
            <canvas aria-hidden="true" className="cursor-trail-canvas" ref={canvasRef} />
            <div aria-hidden="true" className="cursor-dot" ref={cursorRef} />
        </>
    );
}
