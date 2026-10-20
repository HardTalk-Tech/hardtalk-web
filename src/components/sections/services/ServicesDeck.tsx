"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { clamp, easeInOutCubic as ease, lerp, pad } from "@/utils/math";
import { LOGO_HEIGHT, LOGO_SRC, LOGO_WIDTH, services } from "@/utils/site-data";
import { useAnimationFrame } from "@/utils/use-animation-frame";

/** Deal speed in progress units per second (wheel / click-to-expand). */
const DEAL_SPEED = 0.28;
const EXPAND_SPEED = 0.55;
/** Progress spent sliding the deck aside, then per-card flip segment. */
const DECK_SHIFT = 0.05;
const CARD_SEGMENT = 0.125;

const HINT_DEALING = "Scroll to deal the cards · or click the deck to expand all";
const HINT_DONE = "Hover a card to focus";

type PillState = "active" | "revealed" | "upcoming";

const PILL_STYLES: Record<PillState, { background: string; color: string; borderColor: string }> = {
  active: { background: "#f4f4f2", color: "#0b0b0c", borderColor: "#f4f4f2" },
  revealed: { background: "transparent", color: "#f4f4f2", borderColor: "rgba(255,255,255,.4)" },
  upcoming: { background: "transparent", color: "#8c8e92", borderColor: "rgba(255,255,255,.14)" },
};

export default function ServicesDeck() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const pillbarRef = useRef<HTMLDivElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const hintRef = useRef<HTMLSpanElement>(null);
  const arrowRef = useRef<HTMLSpanElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const innerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const dimRefs = useRef<(HTMLDivElement | null)[]>([]);
  const pillRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const anim = useRef({
    progress: 0,
    target: 0,
    started: false,
    done: false,
    fastExpand: false,
    hover: -1,
    hoverMix: services.map(() => 0),
    dimMix: services.map(() => 0),
    pillStates: [] as PillState[],
    pillbarHidden: false,
  });

  const isPinned = (r: DOMRect, vh: number) => r.top <= 8 && r.bottom > vh + 8;

  // A downward wheel gesture while pinned starts the full deal and holds the
  // page in place until every card is open.
  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      const a = anim.current;
      const section = sectionRef.current;
      if (e.deltaY <= 0 || a.done || !section) return;
      const r = section.getBoundingClientRect();
      if (!isPinned(r, window.innerHeight)) return;
      e.preventDefault();
      if (!a.started) {
        if (Math.abs(r.top) > 1) window.scrollBy(0, r.top);
        a.started = true;
      }
    };
    window.addEventListener("wheel", onWheel, { passive: false });
    return () => window.removeEventListener("wheel", onWheel);
  }, []);

  const goToService = (index: number) => {
    const a = anim.current;
    a.target = Math.max(a.target, index < 0 ? 1 : DECK_SHIFT + (index + 1) * CARD_SEGMENT);
    const section = sectionRef.current;
    if (!section) return;
    const r = section.getBoundingClientRect();
    if (r.top > 1 || r.bottom < window.innerHeight) {
      window.scrollTo({ top: window.scrollY + r.top, behavior: "smooth" });
    }
  };

  const expandAll = () => {
    anim.current.target = 1;
    anim.current.fastExpand = true;
  };

  useAnimationFrame((now, dt) => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    if (!section || !stage) return;
    const a = anim.current;
    const vh = window.innerHeight;
    const rect = section.getBoundingClientRect();

    // Touch and keyboard scrolling don't fire wheel events; start once pinned.
    if (!a.started && !a.done && isPinned(rect, vh)) a.started = true;

    const target = a.done || a.started ? 1 : a.target;
    const step = (dt / 1000) * (a.fastExpand ? EXPAND_SPEED : DEAL_SPEED);
    a.progress = a.progress < target ? Math.min(target, a.progress + step) : Math.max(target, a.progress - step);
    if (a.progress >= 0.999 && !a.done) {
      a.done = true;
      // Collapse the pinned spacer so the next scroll leaves the section.
      section.style.height = "100vh";
    }
    const p = a.progress;

    const pillbar = pillbarRef.current;
    if (pillbar && pillbar.dataset.hidden !== String(a.done)) {
      pillbar.dataset.hidden = String(a.done);
    }

    if (rect.bottom < 0 || rect.top > vh) return;

    const cards = cardRefs.current;
    const n = cards.length;
    if (!n || !cards[0]) return;
    const mid = (n - 1) / 2;
    const cardWidth = cards[0].offsetWidth;
    const stageWidth = stage.clientWidth;
    const full = Math.max(24, Math.min(cardWidth * 0.86, (stageWidth - cardWidth - 48) / (n - 1)));
    const tight = full * 0.62;
    const spreadT = ease(clamp((p - 0.8) / 0.12));
    const spacing = lerp(tight, full, spreadT);
    const fanned = p > 0.9;
    const deckShift = ease(clamp(p / DECK_SHIFT));
    let revealed = 0;

    cards.forEach((card, i) => {
      if (!card) return;
      const u = clamp((p - DECK_SHIFT - i * CARD_SEGMENT) / CARD_SEGMENT);
      if (u >= 0.5) revealed++;
      const lift = ease(clamp(u / 0.2));
      const flip = ease(clamp((u - 0.08) / 0.74));
      const settle = ease(clamp((u - 0.74) / 0.26));

      const pill = pillRefs.current[i];
      if (pill) {
        const state: PillState = u > 0.02 && u < 0.98 ? "active" : u >= 0.45 ? "revealed" : "upcoming";
        if (a.pillStates[i] !== state) {
          a.pillStates[i] = state;
          Object.assign(pill.style, PILL_STYLES[state]);
        }
      }

      const o = i - mid;
      const slotX = o * spacing;
      const slotY = o * o * lerp(3, 8, spreadT) + 10;
      const slotR = o * lerp(1.2, 3, spreadT);
      const deckX = mid * tight * deckShift + i * 1.2;
      const deckY = i * 3 + 10;
      const deckR = (i % 2 ? 1 : -1) * i * 0.7;
      const x = lerp(lerp(deckX, 0, lift), slotX, settle);
      let y = lerp(lerp(deckY, -14, lift), slotY, settle);
      let r = lerp(lerp(deckR, 0, lift), slotR, settle);
      let s = lerp(lerp(1, 1.2, lift), 1, settle);
      const rotateY = 180 * (1 - flip);
      const flipLift = Math.sin(flip * Math.PI) * 42;
      const flipTilt = Math.sin(flip * Math.PI) * -5;
      let z = u <= 0 ? 40 - i : u < 1 ? 100 : 20 + i;

      const hoverTarget = fanned && a.hover === i ? 1 : 0;
      a.hoverMix[i] += (hoverTarget - a.hoverMix[i]) * 0.12;
      const dimTarget = fanned ? (a.hover >= 0 && a.hover !== i ? 0.55 : 0) : u >= 1 ? 0.4 : 0;
      a.dimMix[i] += (dimTarget - a.dimMix[i]) * 0.1;
      const h = a.hoverMix[i];
      y -= h * 36;
      s *= 1 + h * 0.07;
      r *= 1 - h;
      if (h > 0.02) z = 90;

      card.style.zIndex = String(z);
      card.style.transform = `translate(-50%,-50%) translate3d(${x}px,${y}px,0) rotate(${r}deg) scale(${s})`;
      const inner = innerRefs.current[i];
      if (inner) inner.style.transform = `translateZ(${flipLift}px) rotateX(${flipTilt}deg) rotateY(${rotateY}deg)`;
      const dim = dimRefs.current[i];
      if (dim) dim.style.opacity = String(a.dimMix[i]);
    });

    if (countRef.current) countRef.current.textContent = pad(revealed);
    if (barRef.current) barRef.current.style.width = `${(revealed / n) * 100}%`;
    const hint = hintRef.current;
    const hintText = fanned ? HINT_DONE : HINT_DEALING;
    if (hint && hint.textContent !== hintText) hint.textContent = hintText;
    const arrow = arrowRef.current;
    if (arrow) {
      arrow.style.transform = fanned ? "none" : `translateY(${Math.sin(now / 260) * 3}px)`;
      arrow.textContent = fanned ? "✦" : "↓";
    }
  });

  return (
    <section ref={sectionRef} id="services-deck" className="services-deck">
      <div className="services-deck__sticky">
        <div className="services-deck__head">
          <div>
            <div className="eyebrow">
              <span className="eyebrow__num">01</span>
              <span className="eyebrow__line eyebrow__line--mid" />
              Our Services
            </div>
            <h2 className="services-deck__title">Services</h2>
          </div>
          <div className="services-deck__controls">
            <div className="services-deck__progress">
              <span ref={countRef} className="services-deck__count">00</span>
              <span className="services-deck__track">
                <span ref={barRef} className="services-deck__bar" />
              </span>
              <span>{pad(services.length)}</span>
            </div>
            <a href="#services" className="link-arrow">
              View All Services <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>

        <div ref={stageRef} className="services-deck__stage" onClick={expandAll}>
          {services.map((service, i) => (
            <div
              key={service.title}
              ref={(el) => { cardRefs.current[i] = el; }}
              className="deck-card"
              onMouseEnter={() => { anim.current.hover = i; }}
              onMouseLeave={() => { if (anim.current.hover === i) anim.current.hover = -1; }}
            >
              <div ref={(el) => { innerRefs.current[i] = el; }} className="deck-card__inner">
                <div className="deck-card__face deck-card__front">
                  <div className="deck-card__media">
                    <Image src={service.image} alt={service.title} fill sizes="(max-width: 940px) 160px, 17vw" />
                  </div>
                  <div className="deck-card__body">
                    <div className="deck-card__meta">
                      <span className="deck-card__num">{service.num}</span>
                      <span>SERVICE</span>
                    </div>
                    <div className="deck-card__title">{service.title}</div>
                    <div className="deck-card__desc">{service.description}</div>
                  </div>
                  <div ref={(el) => { dimRefs.current[i] = el; }} className="deck-card__dim" />
                </div>
                <div className="deck-card__face deck-card__back">
                  <div className="deck-card__frame" />
                  <div className="deck-card__frame deck-card__frame--inner" />
                  <Image src={LOGO_SRC} alt="HardTalk" width={LOGO_WIDTH} height={LOGO_HEIGHT} className="deck-card__logo" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="services-deck__footer">
          <div className="services-deck__hint">
            <span ref={arrowRef} className="services-deck__arrow">↓</span>
            <span ref={hintRef}>{HINT_DEALING}</span>
          </div>
          <div ref={pillbarRef} className="services-deck__pills" data-hidden="false">
            {services.map((service, i) => (
              <button
                key={service.title}
                type="button"
                ref={(el) => { pillRefs.current[i] = el; }}
                className="deck-pill"
                title={service.title}
                onClick={() => goToService(i)}
              >
                <span className="deck-pill__num">{service.num}</span>
                <span className="deck-pill__label">{service.title}</span>
              </button>
            ))}
            <button type="button" className="deck-pill deck-pill--all" onClick={() => goToService(-1)}>
              See all <span aria-hidden="true">→</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
