"use client";

import Image from "next/image";
import { useRef } from "react";
import { clamp, easeInOutCubic } from "@/utils/math";
import { aboutParagraphs } from "@/utils/site-data";
import { useAnimationFrame } from "@/utils/use-animation-frame";

const paragraphWords = aboutParagraphs.map((p) => p.split(" "));
// Global index of each paragraph's first word, so word refs form one sequence.
const paragraphOffsets = paragraphWords.map((_, p) =>
  paragraphWords.slice(0, p).reduce((total, words) => total + words.length, 0),
);

export default function About() {
  const textRef = useRef<HTMLDivElement>(null);
  const clipRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<SVGPathElement>(null);
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const litCount = useRef(-1);

  useAnimationFrame(() => {
    const vh = window.innerHeight;

    const text = textRef.current;
    if (text) {
      const r = text.getBoundingClientRect();
      const progress = clamp((vh * 0.8 - r.top) / (r.height + vh * 0.15));
      const words = wordRefs.current;
      const lit = Math.floor(progress * words.length * 1.05);
      if (lit !== litCount.current) {
        litCount.current = lit;
        words.forEach((w, i) => {
          if (w) w.style.opacity = i < lit ? "1" : "0.2";
        });
      }
    }

    const clip = clipRef.current;
    if (clip) {
      const r = clip.getBoundingClientRect();
      const progress = clamp((vh - r.top) / (vh * 0.9 + r.height * 0.3));
      clip.style.clipPath = `circle(${(20 + progress * 52).toFixed(2)}% at 50% 50%)`;
      const line = lineRef.current;
      if (line) {
        line.style.strokeDashoffset = String(1 - easeInOutCubic(progress));
        line.style.opacity = String(Math.min(1, progress * 1.8));
      }
    }
  });

  return (
    <section id="about" className="about">
      <svg aria-hidden="true" viewBox="0 0 1440 800" preserveAspectRatio="none" className="about__line">
        <defs>
          <linearGradient id="about-line-gradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#f4f4f2" stopOpacity=".04" />
            <stop offset=".48" stopColor="#f4f4f2" stopOpacity=".22" />
            <stop offset="1" stopColor="#f4f4f2" stopOpacity=".06" />
          </linearGradient>
        </defs>
        <path
          ref={lineRef}
          pathLength={1}
          d="M-80 92 C230 112 470 302 462 548 C456 724 244 752 210 610 C176 468 410 402 650 452 C882 500 908 690 1080 684 C1212 680 1280 574 1510 616"
          fill="none"
          stroke="url(#about-line-gradient)"
          strokeWidth="2.5"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      <div className="about__grid">
        <div className="about__visual">
          <div className="about__ring" />
          <div className="about__ring about__ring--dashed" />
          <div ref={clipRef} className="about__clip">
            <Image
              src="/images/about-team.png"
              alt="HardTalk integrated PR services team"
              fill
              sizes="(max-width: 900px) 100vw, 540px"
            />
          </div>
          <div className="about__badge">
            <span className="about__badge-dot" />
            <span className="about__badge-strong">A Triad Group Company</span>
            <span className="about__badge-sep">|</span>
            <span>Integrated Strategic Communications</span>
          </div>
        </div>

        <div ref={textRef}>
          <div className="eyebrow">About HardTalk</div>
          <h2 className="about__title">One Stop Shop</h2>
          {paragraphWords.map((words, p) => (
            <p key={p} className="about__paragraph">
              {words.map((word, w) => {
                const i = paragraphOffsets[p] + w;
                return (
                  <span key={i} ref={(el) => { wordRefs.current[i] = el; }} className="about__word">
                    {word}{" "}
                  </span>
                );
              })}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
