import Image from "next/image";
import BackToTopButton from "./BackToTopButton";
import { contactInfo, LOGO_HEIGHT, LOGO_SRC, LOGO_WIDTH, socialLinks } from "@/utils/site-data";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container container--narrow">
        <div className="site-footer__grid">
          <div className="site-footer__brand">
            <Image src={LOGO_SRC} alt="HardTalk" width={LOGO_WIDTH} height={LOGO_HEIGHT} className="site-footer__logo" />
            <div className="site-footer__social">
              {socialLinks.map((link) => (
                <a key={link.label} href={link.href}>{link.label}</a>
              ))}
            </div>
          </div>

          <div className="site-footer__col">
            <span className="site-footer__label">Address</span>
            <span className="site-footer__value">
              {contactInfo.addressLines[0]}
              <br />
              {contactInfo.addressLines[1]}
            </span>
          </div>

          <div className="site-footer__col">
            <span className="site-footer__label">Phone</span>
            <span className="site-footer__value">
              {contactInfo.phones[0]}
              <br />
              {contactInfo.phones[1]}
            </span>
          </div>

          <div className="site-footer__email-row">
            <div className="site-footer__col">
              <span className="site-footer__label">Email</span>
              <a href={`mailto:${contactInfo.email}`} className="site-footer__value">{contactInfo.email}</a>
            </div>
            <BackToTopButton />
          </div>
        </div>

        <div className="site-footer__bottom">
          <span>© 2026 HardTalk. All rights reserved.</span>
          <span className="site-footer__tagline">Amplifying voices. Building reputations.</span>
        </div>
      </div>
    </footer>
  );
}
