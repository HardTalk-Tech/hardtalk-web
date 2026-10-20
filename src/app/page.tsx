import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import About from "@/components/sections/About";
import CallToAction from "@/components/sections/CallToAction";
import Clients from "@/components/sections/Clients";
import TopStories from "@/components/sections/TopStories";
import LatestBlog from "@/components/sections/blog/LatestBlog";
import Hero from "@/components/sections/hero/Hero";
import ServicesDeck from "@/components/sections/services/ServicesDeck";
import ServicesNetwork from "@/components/sections/services/ServicesNetwork";
import WhyHardTalk from "@/components/sections/why/WhyHardTalk";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Clients />
        <About />
        <ServicesNetwork />
        <ServicesDeck />
        <TopStories />
        <LatestBlog />
        <WhyHardTalk />
        <CallToAction />
      </main>
      <Footer />
    </>
  );
}
