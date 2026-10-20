import FadeIn from "@/components/ui/FadeIn";
import { clients } from "@/utils/site-data";

export default function Clients() {
  // Rendered twice so the marquee can loop seamlessly by shifting -50%.
  const loop = [...clients, ...clients];

  return (
    <section id="clients" className="clients">
      <FadeIn className="clients__head">
        <div className="eyebrow eyebrow--centered">
          <span className="eyebrow__line eyebrow__line--short" />
          Trusted By
          <span className="eyebrow__line eyebrow__line--short" />
        </div>
        <h2 className="clients__title">Our Clients</h2>
        <p className="clients__lead">We work with leading brands across diverse industries in Sri Lanka and beyond.</p>
      </FadeIn>

      <div className="marquee">
        <div className="marquee__track">
          {loop.map((client, i) => (
            <div key={`${client.name}-${i}`} className="client-logo" aria-hidden={i >= clients.length || undefined}>
              <span className="client-logo__name">{client.name}</span>
              <span className="client-logo__sub">{client.sub}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
