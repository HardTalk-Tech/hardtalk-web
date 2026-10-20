"use client";

import { useRef, type RefObject } from "react";
import FadeIn from "@/components/ui/FadeIn";
import { clamp, easeInOutCubic, lerp } from "@/utils/math";
import { heroChannels } from "@/utils/site-data";
import { useAnimationFrame } from "@/utils/use-animation-frame";

/** Pointer position over the hero in -1..1 space, plus its smoothed values. */
export type HeroPointer = {
  x: number;
  y: number;
  inside: number;
  smoothX: number;
  smoothY: number;
  smoothInside: number;
};

const PULSE_COUNT = 6;
const BAR_COUNT = 16;
const PULSE_LIFETIME = 3400;
const AUTO_PULSE_INTERVAL = 1800;

export default function HeroVisual({ pointer }: { pointer: RefObject<HeroPointer> }) {
  const tiltRef = useRef<HTMLDivElement>(null);
  const spinRef = useRef<HTMLDivElement>(null);
  const liveRef = useRef<HTMLSpanElement>(null);
  const coreRef = useRef<HTMLDivElement>(null);
  const pulseRefs = useRef<(HTMLDivElement | null)[]>([]);
  const barRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const chipRefs = useRef<(HTMLDivElement | null)[]>([]);
  const anim = useRef({
    births: new Array<number>(PULSE_COUNT).fill(0),
    strengths: new Array<number>(PULSE_COUNT).fill(0),
    next: 0,
    lastAuto: 0,
    boost: 0,
    orbit: 0,
  });

  const emitPulse = (now: number, strength: number) => {
    const a = anim.current;
    const i = a.next++ % PULSE_COUNT;
    a.births[i] = now;
    a.strengths[i] = strength;
  };

  useAnimationFrame((now, dt) => {
    const tilt = tiltRef.current;
    if (!tilt || tilt.getBoundingClientRect().bottom < 0) return;
    const a = anim.current;
    const p = pointer.current;

    const drift = Math.sin(now / 3200) * (1 - p.smoothInside);
    tilt.style.transform = `rotateX(${6 - p.smoothY * 12}deg) rotateY(${p.smoothX * 16 + drift * 6}deg)`;
    if (spinRef.current) spinRef.current.style.transform = `rotate(${now * 0.006}deg)`;

    if (now - a.lastAuto > AUTO_PULSE_INTERVAL) {
      emitPulse(now, 0.42);
      a.lastAuto = now;
    }
    pulseRefs.current.forEach((el, i) => {
      if (!el) return;
      const birth = a.births[i];
      const age = (now - birth) / PULSE_LIFETIME;
      if (!birth || age > 1) {
        el.style.opacity = "0";
        return;
      }
      el.style.transform = `scale(${0.3 + easeInOutCubic(clamp(age)) * 0.8})`;
      el.style.opacity = String((1 - age) * a.strengths[i]);
    });

    a.boost = Math.max(0, a.boost - dt / 1100);
    const amp = 0.35 + p.smoothInside * 0.25 + a.boost * 0.5;
    barRefs.current.forEach((el, i) => {
      if (!el) return;
      const envelope = Math.sin((Math.PI * (i + 0.5)) / BAR_COUNT);
      const v =
        0.12 +
        amp *
          envelope *
          (0.5 + 0.5 * Math.sin((now / 170) * (1 + (i % 5) * 0.18) + i * 1.3)) *
          (0.75 + 0.25 * Math.sin(now / 530 + i));
      el.style.transform = `scaleY(${clamp(v, 0.08, 1)})`;
    });

    if (liveRef.current) liveRef.current.style.opacity = Math.sin(now / 380) > -0.2 ? "1" : "0.25";
    if (coreRef.current) {
      coreRef.current.style.boxShadow = `0 0 ${60 + a.boost * 90}px rgba(255,255,255,${(0.06 + a.boost * 0.18).toFixed(3)}),inset 0 1px 0 rgba(255,255,255,.14)`;
    }

    a.orbit += dt * 0.00016 * lerp(1, 0.25, p.smoothInside);
    const size = tilt.offsetWidth;
    const rx = size * 0.5;
    const ry = size * 0.2;
    const theta = (-16 * Math.PI) / 180;
    const chips = chipRefs.current;
    chips.forEach((el, i) => {
      if (!el) return;
      const angle = a.orbit + (i * Math.PI * 2) / chips.length;
      const cx = Math.cos(angle) * rx;
      const cy = Math.sin(angle) * ry;
      const depth = Math.sin(angle);
      const x = cx * Math.cos(theta) - cy * Math.sin(theta);
      const y = cx * Math.sin(theta) + cy * Math.cos(theta);
      el.style.transform = `translate(-50%,-50%) translate3d(${x}px,${y}px,${depth * 90}px) scale(${0.84 + (0.16 * (depth + 1)) / 2})`;
      el.style.opacity = String(0.4 + (0.6 * (depth + 1)) / 2);
    });
  });

  const broadcast = () => {
    emitPulse(performance.now(), 0.95);
    anim.current.boost = 1;
  };

  return (
    <FadeIn delay={500} className="hero-visual" onClick={broadcast}>
      <div ref={tiltRef} className="hero-visual__tilt">
        <div className="hero-visual__ring hero-visual__ring--outer" />
        <div ref={spinRef} className="hero-visual__ring hero-visual__ring--dashed" />
        <div className="hero-visual__ring hero-visual__ring--inner" />
        <div className="hero-visual__axis hero-visual__axis--h" />
        <div className="hero-visual__axis hero-visual__axis--v" />

        {Array.from({ length: PULSE_COUNT }, (_, i) => (
          <div key={i} ref={(el) => { pulseRefs.current[i] = el; }} className="hero-visual__pulse" />
        ))}

        <div ref={coreRef} className="hero-visual__core">
          <div className="hero-visual__on-air">
            <span ref={liveRef} className="hero-visual__live-dot" />
            On Air
          </div>
          <div className="hero-visual__bars">
            {Array.from({ length: BAR_COUNT }, (_, i) => (
              <span key={i} ref={(el) => { barRefs.current[i] = el; }} className="hero-visual__bar" />
            ))}
          </div>
        </div>

        {heroChannels.map((name, i) => (
          <div key={name} ref={(el) => { chipRefs.current[i] = el; }} className="hero-visual__chip">
            <span className="hero-visual__chip-dot" />
            {name}
          </div>
        ))}
      </div>
      <div className="hero-visual__hint">Move to steer · Click to broadcast</div>
    </FadeIn>
  );
}
