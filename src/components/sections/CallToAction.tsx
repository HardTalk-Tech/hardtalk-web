"use client";

import { useRef, type MouseEvent } from "react";
import FadeIn from "@/components/ui/FadeIn";
import { lerp } from "@/utils/math";
import { useAnimationFrame } from "@/utils/use-animation-frame";

export default function CallToAction() {
  const buttonRef = useRef<HTMLAnchorElement>(null);
  const target = useRef({ x: 0, y: 0 });
  const offset = useRef({ x: 0, y: 0 });

  // The button is pulled toward the cursor while it's inside the padded hit area.
  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    target.current = {
      x: (e.clientX - (r.left + r.width / 2)) * 0.3,
      y: (e.clientY - (r.top + r.height / 2)) * 0.4,
    };
  };

  useAnimationFrame(() => {
    const button = buttonRef.current;
    if (!button) return;
    const o = offset.current;
    o.x = lerp(o.x, target.current.x, 0.15);
    o.y = lerp(o.y, target.current.y, 0.15);
    button.style.transform = `translate3d(${o.x}px,${o.y}px,0)`;
  });

  return (
    <section id="contact" className="cta">
      <FadeIn className="cta__inner">
        <div className="eyebrow">Ready To Begin</div>
        <h2 className="cta__title">Ready to Amplify Your Story?</h2>
        <p className="cta__lead">Join hundreds of companies that trust HardTalk for their PR needs.</p>
        <div
          className="cta__magnet"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => { target.current = { x: 0, y: 0 }; }}
        >
          <a ref={buttonRef} href="#contact" className="btn-round btn-round--large">
            Start Your Campaign Today <span className="btn-round__icon" aria-hidden="true">→</span>
          </a>
        </div>
      </FadeIn>
    </section>
  );
}
