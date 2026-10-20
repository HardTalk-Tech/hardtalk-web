"use client";

import { useLayoutEffect, useRef } from "react";
import { pad } from "@/utils/math";
import { useAnimationFrame } from "@/utils/use-animation-frame";

const CHARS_PER_SECOND = 55;
/** Pause between lines, measured in characters. */
const LINE_PAUSE = 8;

/** Terminal-style list that types each feature out once scrolled into view. */
export default function FeatureConsole({ features }: { features: string[] }) {
  const consoleRef = useRef<HTMLDivElement>(null);
  const textRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const okRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const typed = useRef<number[]>([]);
  const anim = useRef<{ start: number | null; done: boolean }>({ start: null, done: false });

  // Server HTML contains the full text; clear it before the first paint.
  useLayoutEffect(() => {
    textRefs.current.forEach((el) => { if (el) el.textContent = ""; });
    okRefs.current.forEach((el) => { if (el) el.style.opacity = "0"; });
  }, []);

  useAnimationFrame((now) => {
    const a = anim.current;
    const el = consoleRef.current;
    if (!el || a.done) return;
    if (a.start === null) {
      const r = el.getBoundingClientRect();
      if (r.top >= window.innerHeight * 0.8 || r.bottom <= 0) return;
      a.start = now;
    }

    let budget = ((now - a.start) / 1000) * CHARS_PER_SECOND;
    let done = true;
    features.forEach((text, i) => {
      const count = Math.max(0, Math.min(text.length, Math.floor(budget)));
      if (typed.current[i] !== count) {
        typed.current[i] = count;
        const line = textRefs.current[i];
        if (line) line.textContent = text.slice(0, count);
        const ok = okRefs.current[i];
        if (ok) ok.style.opacity = count >= text.length ? "1" : "0";
      }
      if (count < text.length) done = false;
      budget -= text.length + LINE_PAUSE;
    });
    if (done) a.done = true;
  });

  return (
    <div ref={consoleRef} className="console">
      <div className="console__bar">
        <span className="console__light" />
        <span className="console__light" />
        <span className="console__light" />
        <span className="console__path">hardtalk / advantages</span>
      </div>
      <div className="console__body">
        {features.map((text, i) => (
          <div key={text} className="console__row">
            <span className="console__line">
              <span className="console__index">{pad(i + 1)}</span>
              <span ref={(el) => { textRefs.current[i] = el; }}>{text}</span>
            </span>
            <span ref={(el) => { okRefs.current[i] = el; }} className="console__ok">OK</span>
          </div>
        ))}
        <span className="console__caret" />
      </div>
    </div>
  );
}
