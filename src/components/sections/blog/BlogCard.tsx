"use client";

import { useRef, type MouseEvent } from "react";
import ImageSlot from "@/components/ui/ImageSlot";
import { lerp } from "@/utils/math";
import type { BlogPost } from "@/utils/site-data";
import { useAnimationFrame } from "@/utils/use-animation-frame";

type BlogCardProps = {
  post: BlogPost;
  featured?: boolean;
};

/** Blog card that tilts toward the cursor with a soft glare highlight. */
export default function BlogCard({ post, featured = false }: BlogCardProps) {
  const cardRef = useRef<HTMLElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const target = useRef({ x: 0.5, y: 0.5, on: 0 });
  const current = useRef({ x: 0.5, y: 0.5, on: 0, resting: true });

  const handleMouseMove = (e: MouseEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    target.current = { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height, on: 1 };
  };

  const handleMouseLeave = () => {
    target.current = { x: 0.5, y: 0.5, on: 0 };
  };

  useAnimationFrame(() => {
    const card = cardRef.current;
    if (!card) return;
    const t = target.current;
    const c = current.current;
    c.x = lerp(c.x, t.x, 0.1);
    c.y = lerp(c.y, t.y, 0.1);
    c.on = lerp(c.on, t.on, 0.08);
    if (Math.abs(c.on) < 0.001 && !t.on) {
      if (c.resting) return;
      c.resting = true;
    } else {
      c.resting = false;
    }

    card.style.transform = `rotateX(${((0.5 - c.y) * 9 * c.on).toFixed(3)}deg) rotateY(${((c.x - 0.5) * 11 * c.on).toFixed(3)}deg) translateZ(${(c.on * 10).toFixed(2)}px)`;
    const glare = glareRef.current;
    if (glare) {
      glare.style.opacity = String(c.on);
      glare.style.setProperty("--gx", `${c.x * 100}%`);
      glare.style.setProperty("--gy", `${c.y * 100}%`);
    }
    if (mediaRef.current) mediaRef.current.style.transform = `scale(${1 + c.on * 0.06})`;
  });

  return (
    <article
      ref={cardRef}
      className={`blog-card${featured ? " blog-card--featured" : ""}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div className="blog-card__media">
        <div ref={mediaRef} className="blog-card__media-inner">
          <ImageSlot src={post.image} alt={post.title} placeholder={post.imagePlaceholder} sizes="(max-width: 920px) 100vw, 50vw" />
        </div>
      </div>
      <div className="blog-card__body">
        <div className="blog-card__text">
          <div className="blog-card__meta">
            <span>{post.date}</span>
            <span>{post.category}</span>
          </div>
          <h3 className="blog-card__title">{post.title}</h3>
          <p className="blog-card__excerpt">{post.excerpt}</p>
        </div>
        <a href="#blog" className="link-underline">
          Read Article <span aria-hidden="true">→</span>
        </a>
      </div>
      <div ref={glareRef} className="blog-card__glare" />
    </article>
  );
}
