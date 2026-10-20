import FadeIn from "@/components/ui/FadeIn";
import { features } from "@/utils/site-data";
import FeatureConsole from "./FeatureConsole";

export default function WhyHardTalk() {
  return (
    <section id="why" className="why">
      <div className="why__grid">
        <FadeIn>
          <div className="eyebrow">Why HardTalk</div>
          <h2 className="section-title why__title">Why Choose HardTalk?</h2>
          <p className="why__lead">
            We combine traditional PR expertise with modern technology to deliver exceptional results for your brand.
          </p>
          <a href="#about" className="btn-round">
            Learn More About Us <span className="btn-round__icon" aria-hidden="true">→</span>
          </a>
        </FadeIn>
        <FeatureConsole features={features} />
      </div>
    </section>
  );
}
