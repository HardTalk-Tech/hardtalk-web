"use client";

import { useRef } from "react";
import { useAnimationFrame } from "@/utils/use-animation-frame";

// Fallback geometry for a 1200×650 layout; recomputed from live card positions every frame.
const INITIAL_PATHS = [
  "M250 108 C390 108 410 250 500 290",
  "M250 325 L500 325",
  "M250 542 C390 542 410 400 500 360",
  "M950 108 C810 108 790 250 700 290",
  "M950 325 L700 325",
  "M950 542 C810 542 790 400 700 360",
];

const DOTS = [
  { dur: "3.8s", begin: "0s" },
  { dur: "3.2s", begin: "-.8s" },
  { dur: "4.1s", begin: "-1.7s" },
  { dur: "3.7s", begin: "-.4s" },
  { dur: "3.3s", begin: "-1.2s" },
  { dur: "4s", begin: "-2.1s" },
];

/** Hub entry heights (fraction of the hub) for the top/middle/bottom card on each side. */
const HUB_Y_RATIOS = [0.32, 0.5, 0.68];

/**
 * Curved connectors from each service card to the central hub. Must be rendered
 * inside the `.services-network` grid alongside the `[data-service-node]` cards
 * and the `[data-service-center]` hub.
 */
export default function ServiceNetworkLines() {
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRefs = useRef<(SVGPathElement | null)[]>([]);

  useAnimationFrame(() => {
    const svg = svgRef.current;
    const network = svg?.parentElement;
    if (!svg || !network || svg.getClientRects().length === 0) return;

    const box = svg.getBoundingClientRect();
    if (!box.width || !box.height || box.bottom < 0 || box.top > window.innerHeight) return;
    const center = network.querySelector("[data-service-center]");
    const nodes = network.querySelectorAll("[data-service-node]");
    if (!center || nodes.length !== INITIAL_PATHS.length) return;

    const hub = center.getBoundingClientRect();
    svg.setAttribute("viewBox", `0 0 ${box.width} ${box.height}`);
    nodes.forEach((node, i) => {
      const card = node.getBoundingClientRect();
      const left = i < 3;
      const sx = (left ? card.right : card.left) - box.left;
      const sy = card.top + card.height / 2 - box.top;
      const yRatio = HUB_Y_RATIOS[i % 3];
      const ey = hub.top + hub.height * yRatio - box.top;
      const radius = hub.width / 2;
      const dy = (yRatio - 0.5) * hub.height;
      const edgeOffset = Math.sqrt(Math.max(0, radius * radius - dy * dy));
      const ex = hub.left + radius + (left ? -edgeOffset : edgeOffset) - box.left;
      const gap = Math.abs(ex - sx);
      const dir = left ? 1 : -1;
      pathRefs.current[i]?.setAttribute(
        "d",
        `M${sx} ${sy} C${sx + dir * gap * 0.42} ${sy},${ex - dir * gap * 0.42} ${ey},${ex} ${ey}`,
      );
    });
  });

  return (
    <svg ref={svgRef} className="services-lines" viewBox="0 0 1200 650" preserveAspectRatio="none" aria-hidden="true">
      <g fill="none" stroke="rgba(255,255,255,.16)" strokeWidth="1.2">
        {INITIAL_PATHS.map((d, i) => (
          <path key={i} id={`service-path-${i + 1}`} ref={(el) => { pathRefs.current[i] = el; }} d={d} />
        ))}
      </g>
      <g fill="#f4f4f2">
        {DOTS.map((dot, i) => (
          <circle key={i} r="5">
            <animateMotion dur={dot.dur} begin={dot.begin} repeatCount="indefinite">
              <mpath href={`#service-path-${i + 1}`} />
            </animateMotion>
          </circle>
        ))}
      </g>
    </svg>
  );
}
