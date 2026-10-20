import FadeIn from "@/components/ui/FadeIn";
import { blogPosts } from "@/utils/site-data";
import BlogCard from "./BlogCard";

export default function LatestBlog() {
  return (
    <section id="blog" className="blog">
      <div className="container">
        <FadeIn className="section-head section-head--split blog__head">
          <div>
            <div className="eyebrow">Insights</div>
            <h2 className="section-title">Latest Blog</h2>
          </div>
          <a href="#blog" className="link-pill">
            View All Blog Posts <span aria-hidden="true">→</span>
          </a>
        </FadeIn>

        <div className="blog__grid">
          {blogPosts.map((post, i) => (
            <FadeIn key={post.title} delay={i * 120} className={`blog__cell${i === 0 ? " blog__cell--featured" : ""}`}>
              <BlogCard post={post} featured={i === 0} />
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
