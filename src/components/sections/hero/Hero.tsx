"use client";

import { useRef, type MouseEvent } from "react";
import CountUp from "@/components/ui/CountUp";
import FadeIn from "@/components/ui/FadeIn";
import ImageSlot from "@/components/ui/ImageSlot";
import { lerp } from "@/utils/math";
import { stats } from "@/utils/site-data";
import { useAnimationFrame } from "@/utils/use-animation-frame";
import HeroVisual, { type HeroPointer } from "./HeroVisual";

export default function Hero() {
  const glowRef = useRef<HTMLDivElement>(null);
  const pointer = useRef<HeroPointer>({ x: 0, y: 0, inside: 0, smoothX: 0, smoothY: 0, smoothInside: 0 });

  const handleMouseMove = (e: MouseEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const p = pointer.current;
    p.x = ((e.clientX - r.left) / r.width) * 2 - 1;
    p.y = ((e.clientY - r.top) / r.height) * 2 - 1;
    p.inside = 1;
  };

  const handleMouseLeave = () => {
    Object.assign(pointer.current, { x: 0, y: 0, inside: 0 });
  };

  useAnimationFrame((now) => {
    const p = pointer.current;
    p.smoothX = lerp(p.smoothX, p.x, 0.06);
    p.smoothY = lerp(p.smoothY, p.y, 0.06);
    p.smoothInside = lerp(p.smoothInside, p.inside, 0.05);

    const glow = glowRef.current;
    if (glow) {
      const autoX = Math.sin(now / 4300) * 18;
      const autoY = Math.cos(now / 5200) * 12;
      glow.style.transform = `translate3d(${autoX + p.smoothX * 95}px,${autoY + p.smoothY * 65}px,0) scale(${1 + p.smoothInside * 0.06})`;
    }
  });

  return (
    <section id="top" className="hero" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
      <div className="hero__bg">
        <ImageSlot alt="Broadcast camera at a live event" placeholder="Hero photo: broadcast camera at a live event" />
      </div>

      <div className="hero-cinema" aria-hidden="true">
        <div ref={glowRef} className="hero-spotlight hero-spotlight-main" />
        <div className="hero-spotlight hero-spotlight-drift" />
        <div className="hero-beam" />
        <div className="hero-grain" />
        <div className="hero-vignette" />
      </div>
      <div className="hero__shade hero__shade--side" />
      <div className="hero__shade hero__shade--bottom" />

      <HeroVisual pointer={pointer} />

      <div className="hero__content">
        <FadeIn delay={0} className="eyebrow eyebrow--trail">
          Amplifying Voices
          <span className="eyebrow__line" />
        </FadeIn>
        <FadeIn delay={120}>
          <h1 className="hero__title">
            Your Story.
            <br />
            <span className="hero__title-accent">Amplified.</span>
          </h1>
        </FadeIn>
        <FadeIn delay={240}>
          <p className="hero__lead">
            Professional PR and content distribution services that get your message to the right audience at the right time.
          </p>
        </FadeIn>
        <FadeIn delay={360} className="hero__actions">
          <a href="#contact" className="btn btn--solid">
            Get Started <span aria-hidden="true">→</span>
          </a>
          <a href="#services" className="btn btn--outline">View Services</a>
        </FadeIn>
      </div>

      <div className="hero__stats-wrap">
        <FadeIn delay={480} className="hero__stats">
          {stats.map((stat) => (
            <div key={stat.label} className="hero__stat">
              <CountUp value={stat.value} suffix={stat.suffix} className="hero__stat-value" />
              <span className="hero__stat-label">{stat.label}</span>
            </div>
          ))}
        </FadeIn>
      </div>
    </section>
  );
}
