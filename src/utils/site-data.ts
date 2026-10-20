import { pad } from "./math";

export type NavLink = { label: string; href: string };

export type Service = {
  num: string;
  title: string;
  description: string;
  image: string;
};

export type Story = {
  num: string;
  date: string;
  category: string;
  title: string;
  description: string;
  image: string;
};

export type BlogPost = {
  date: string;
  category: string;
  title: string;
  excerpt: string;
  imagePlaceholder: string;
  image?: string;
};

export type Stat = { value: number; suffix: string; label: string };

export type Client = { name: string; sub: string };

export const LOGO_SRC = "/images/logo.png";
export const LOGO_WIDTH = 640;
export const LOGO_HEIGHT = 110;

export const navLinks: NavLink[] = [
  { label: "Home", href: "#top" },
  { label: "About", href: "#about" },
  { label: "Services", href: "#services" },
  { label: "Clients", href: "#clients" },
  { label: "Top Stories", href: "#stories" },
  { label: "Blog", href: "#blog" },
  { label: "FAQ", href: "#faq" },
];

export const heroChannels = [
  "Press Releases",
  "Broadcast",
  "Digital Media",
  "Social",
  "Events",
  "Print",
];

export const stats: Stat[] = [
  { value: 497, suffix: "+", label: "Campaigns Delivered" },
  { value: 49, suffix: "+", label: "Media Partners" },
  { value: 199, suffix: "+", label: "Happy Clients" },
  { value: 97, suffix: "%", label: "Success Rate" },
];

export const clients: Client[] = [
  { name: "Cinnamon", sub: "Hotels & Resorts" },
  { name: "Allianz", sub: "Insurance" },
  { name: "Daraz", sub: "E-commerce" },
  { name: "DFCC", sub: "Bank" },
  { name: "Fonterra", sub: "Dairy for life" },
  { name: "HUTCH", sub: "Telecom" },
];

export const aboutParagraphs = [
  "HardTalk PR delivers a seamless, integrated communications experience by tapping into the extensive resources and expertise within the Triad Group. Our unique position allows us to synergize with specialized teams across various disciplines, from creative branding and digital marketing to strategic planning and content creation. This collaboration ensures that every aspect of your public relations campaign is cohesive, consistent, and carefully aligned with your overarching business objectives.",
  "Imagine a world where the complexities of your journey are expertly handled, allowing you to focus on what you do best. Let HardTalk be your guide through the intricacies of public relations.",
];

const serviceList: Omit<Service, "num">[] = [
  {
    title: "Public Relations",
    description:
      "Strategic media relations, press releases and reputation management that put your story in front of the right audience.",
    image: "/images/services/public-relations.png",
  },
  {
    title: "Event Management",
    description:
      "Launches, conferences and corporate events planned and produced end to end, from concept to final applause.",
    image: "/images/services/event-management.png",
  },
  {
    title: "Media Monitoring",
    description:
      "Daily tracking of print, broadcast and digital coverage, with clear reports on reach, sentiment and share of voice.",
    image: "/images/services/media-monitoring.png",
  },
  {
    title: "Social Media Management",
    description:
      "Platform strategy, content calendars and community management that keep your brand active and consistent.",
    image: "/images/services/social-media.png",
  },
  {
    title: "Content Creation",
    description:
      "Copy, photography, video and design produced in multiple languages for every channel you use.",
    image: "/images/services/media-monitoring.png",
  },
  {
    title: "Activations & Stunts",
    description:
      "Experiential campaigns and live moments designed to create attention, conversation and coverage.",
    image: "/images/services/event-management.png",
  },
];

export const services: Service[] = serviceList.map((s, i) => ({ ...s, num: pad(i + 1) }));

const storyList: Omit<Story, "num">[] = [
  {
    date: "17 April 2025",
    category: "Mobility",
    title: "Uber drives up safety for women drivers with Women Rider Preference",
    description:
      "Uber launches Women Rider Preference in Sri Lanka to enhance safety, empower female drivers and offer flexible earning opportunities.",
    image: "/images/stories/uber-women-rider-preference.png",
  },
  {
    date: "24 June 2025",
    category: "Healthcare",
    title: "Hemas Hospital Wattala begins cardiac care with advanced technology",
    description:
      "Hemas Hospital Wattala launches Sri Lanka's most advanced Cath Lab, delivering world-class cardiac care and life-saving technology to the community.",
    image: "/images/stories/hemas-wattala-cath-lab.png",
  },
  {
    date: "26 June 2025",
    category: "Technology",
    title: "MillenniumIT ESP Expands Global Footprint with Strategic Entry into Australia",
    description:
      "MillenniumIT ESP expands into Australia, boosting global reach and accelerating digital transformation with advanced IT solutions.",
    image: "/images/stories/millenniumit-esp-australia.png",
  },
];

export const stories: Story[] = storyList.map((s, i) => ({ ...s, num: pad(i + 1) }));

export const blogPosts: BlogPost[] = [
  {
    date: "27 January 2025",
    category: "Media Monitoring",
    title: "The Power of Media Monitoring in Sri Lanka's Rapidly Evolving Business Landscape",
    excerpt:
      "How real-time tracking of print, broadcast and online coverage helps Sri Lankan brands respond faster and make better decisions.",
    imagePlaceholder: "Blog photo: analyst at monitoring screens",
  },
  {
    date: "24 January 2025",
    category: "Measurement",
    title: "Measuring the value of media monitoring for impact and ROI in Sri Lanka",
    excerpt:
      "A practical look at the metrics that connect coverage to business outcomes, from reach and sentiment to share of voice.",
    imagePlaceholder: "Blog photo: team reviewing dashboards",
  },
  {
    date: "20 January 2025",
    category: "Data & PR",
    title: "Data-driven PR is changing how Sri Lanka communicates and measures success",
    excerpt:
      "Brands are moving from instinct to evidence, using analytics to plan campaigns and report results with confidence.",
    imagePlaceholder: "Blog photo: presentation in boardroom",
  },
];

export const features = [
  "Instant media distribution to leading outlets",
  "Professional content in multiple languages",
  "Real-time monitoring and reporting",
  "Transparent pricing with no hidden costs",
  "Dedicated account management",
  "24/7 online portal access",
];

export const socialLinks: NavLink[] = [
  { label: "Facebook", href: "#" },
  { label: "Instagram", href: "#" },
  { label: "LinkedIn", href: "#" },
  { label: "YouTube", href: "#" },
];

export const contactInfo = {
  addressLines: ["Street address", "Colombo 03, Sri Lanka"],
  phones: ["+94 77 000 0000", "+94 11 000 0000"],
  email: "info@hardtalk.lk",
};
