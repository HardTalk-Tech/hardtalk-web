import Image from "next/image";
import FadeIn from "@/components/ui/FadeIn";
import { LOGO_HEIGHT, LOGO_SRC, LOGO_WIDTH, services } from "@/utils/site-data";
import ServiceNetworkLines from "./ServiceNetworkLines";

export default function ServicesNetwork() {
  return (
    <section id="services" className="services-section">
      <div className="container">
        <FadeIn className="section-head section-head--split">
          <div>
            <div className="eyebrow">
              <span className="eyebrow__num">02</span>
              <span className="eyebrow__line eyebrow__line--mid" />
              Our Services
            </div>
            <h2 className="services-section__title">
              One network.
              <br />
              Every story covered.
            </h2>
          </div>
          <p className="services-section__lead">
            Six specialist services connected by one clear strategy, working together to amplify your brand.
          </p>
        </FadeIn>

        <FadeIn delay={120} className="services-network">
          <ServiceNetworkLines />
          {services.map((service, i) => (
            <a
              key={service.title}
              href="#contact"
              data-service-node
              className={`service-node ${i < 3 ? "service-node-left" : "service-node-right"} service-node-${i + 1}`}
            >
              <div className="service-node-image">
                <Image src={service.image} alt={service.title} fill sizes="(max-width: 560px) 100vw, (max-width: 900px) 50vw, 320px" />
              </div>
              <div className="service-node-meta">
                <span className="service-node-num">{service.num} / SERVICE</span>
                <span className="service-node-arrow" aria-hidden="true">↗</span>
              </div>
              <div className="service-node-title">{service.title}</div>
            </a>
          ))}
          <div className="service-center" data-service-center>
            <div className="service-hub">
              <Image src={LOGO_SRC} alt="HardTalk" width={LOGO_WIDTH} height={LOGO_HEIGHT} />
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
