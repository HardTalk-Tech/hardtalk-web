"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import FadeIn from "@/components/ui/FadeIn";
import { pad } from "@/utils/math";
import { stories } from "@/utils/site-data";
import { useAnimationFrame } from "@/utils/use-animation-frame";

export default function TopStories() {
  const [active, setActive] = useState(0);
  const blockRefs = useRef<(HTMLElement | null)[]>([]);

  // The story whose block is closest to the viewport centre drives the sticky visual.
  useAnimationFrame(() => {
    const vh = window.innerHeight;
    let best = 0;
    let bestDistance = Infinity;
    blockRefs.current.forEach((block, i) => {
      if (!block) return;
      const r = block.getBoundingClientRect();
      const distance = Math.abs(r.top + r.height / 2 - vh / 2);
      if (distance < bestDistance) {
        bestDistance = distance;
        best = i;
      }
    });
    if (best !== active) setActive(best);
  });

  return (
    <section id="stories" className="stories">
      <div className="container">
        <FadeIn className="section-head section-head--split">
          <div>
            <div className="eyebrow">Our Stories</div>
            <h2 className="section-title">Top Stories</h2>
          </div>
          <a href="#stories" className="link-pill">
            View All Stories <span aria-hidden="true">→</span>
          </a>
        </FadeIn>

        <div className="stories__grid">
          <div>
            {stories.map((story, i) => (
              <article
                key={story.num}
                ref={(el) => { blockRefs.current[i] = el; }}
                className={`story-block${i === active ? " is-active" : ""}`}
              >
                <div className="story-block__media">
                  <Image src={story.image} alt={story.title} fill sizes="100vw" />
                </div>
                <div className="story-block__num">{story.num}</div>
                <div className="story-block__meta">
                  <span>{story.date}</span>
                  <span className="story-block__meta-line" />
                  <span>{story.category}</span>
                </div>
                <h3 className="story-block__title">{story.title}</h3>
                <p className="story-block__desc">{story.description}</p>
                <a href="#stories" className="link-underline">
                  Read Story <span aria-hidden="true">→</span>
                </a>
              </article>
            ))}
          </div>

          <div className="stories__aside">
            <div className="stories__sticky">
              <div className="stories__frame">
                {stories.map((story, i) => (
                  <div key={story.num} className={`story-layer${i <= active ? " is-revealed" : ""}`}>
                    <div className={`story-layer__zoom${i === active ? " is-active" : ""}`}>
                      <Image src={story.image} alt={story.title} fill sizes="(max-width: 1320px) 45vw, 560px" />
                    </div>
                  </div>
                ))}
                <div className="stories__frame-bar">
                  <span>{`${pad(active + 1)} / ${pad(stories.length)}`}</span>
                  <span>{stories[active].category.toUpperCase()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
