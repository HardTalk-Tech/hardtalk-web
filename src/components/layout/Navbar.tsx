"use client";

import Image from "next/image";
import { useEffect, useState, useSyncExternalStore } from "react";
import { LOGO_HEIGHT, LOGO_SRC, LOGO_WIDTH, navLinks } from "@/utils/site-data";

const SCROLL_THRESHOLD = 30;
const DESKTOP_NAV_QUERY = "(min-width: 1180px)";

function subscribeToScroll(onChange: () => void) {
  window.addEventListener("scroll", onChange, { passive: true });
  return () => window.removeEventListener("scroll", onChange);
}

export default function Navbar() {
  const scrolled = useSyncExternalStore(
    subscribeToScroll,
    () => window.scrollY > SCROLL_THRESHOLD,
    () => false,
  );
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(DESKTOP_NAV_QUERY);
    const close = () => setMenuOpen(false);
    mq.addEventListener("change", close);
    return () => mq.removeEventListener("change", close);
  }, []);

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <header className={`site-nav${scrolled ? " is-scrolled" : ""}`}>
        <a href="#top" className="site-nav__brand">
          <Image src={LOGO_SRC} alt="HardTalk" width={LOGO_WIDTH} height={LOGO_HEIGHT} loading="eager" className="site-nav__logo" />
        </a>

        <nav className="site-nav__links" aria-label="Primary">
          {navLinks.map((link, i) => (
            <a key={link.href} href={link.href} className={i === 0 ? "is-current" : undefined}>
              {link.label}
            </a>
          ))}
        </nav>

        <div className="site-nav__actions">
          <a href="#contact" className="btn-pill btn-pill--solid">Contact Us</a>
          <a href="#login" className="btn-pill btn-pill--outline">Login</a>
        </div>

        <button
          type="button"
          className="site-nav__toggle"
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? "Close" : "Menu"}
        </button>
      </header>

      {menuOpen && (
        <div id="mobile-menu" className="mobile-menu">
          {navLinks.map((link, i) => (
            <a key={link.href} href={link.href} onClick={closeMenu} className={i === 0 ? "is-current" : undefined}>
              {link.label}
            </a>
          ))}
          <div className="mobile-menu__actions">
            <a href="#contact" onClick={closeMenu} className="btn-pill btn-pill--solid">Contact Us</a>
            <a href="#login" onClick={closeMenu} className="btn-pill btn-pill--outline">Login</a>
          </div>
        </div>
      )}
    </>
  );
}
