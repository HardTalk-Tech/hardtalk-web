"use client";

import { useLayoutEffect, useRef } from "react";
import { clamp } from "@/utils/math";
import { useAnimationFrame } from "@/utils/use-animation-frame";

type CountUpProps = {
  value: number;
  suffix?: string;
  className?: string;
};

const START_DELAY = 500;
const DURATION = 1800;

/** Counts from 0 to `value` once visible. Server HTML keeps the final value. */
export default function CountUp({ value, suffix = "", className }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const anim = useRef<{ start: number | null; done: boolean }>({ start: null, done: false });

  useLayoutEffect(() => {
    if (ref.current) ref.current.textContent = `0${suffix}`;
  }, [suffix]);

  useAnimationFrame((now) => {
    const el = ref.current;
    const a = anim.current;
    if (!el || a.done) return;
    if (a.start === null) {
      const r = el.getBoundingClientRect();
      if (r.top >= window.innerHeight || r.bottom <= 0) return;
      a.start = now + START_DELAY;
    }
    const t = clamp((now - a.start) / DURATION);
    el.textContent = `${Math.round(value * (1 - Math.pow(1 - t, 3)))}${suffix}`;
    if (t >= 1) a.done = true;
  });

  return (
    <span ref={ref} className={className}>
      {`${value}${suffix}`}
    </span>
  );
}
