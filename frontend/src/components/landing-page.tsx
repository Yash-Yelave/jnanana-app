import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  Play,
  ChevronUp,
  Star,
  Sparkles,
  BookOpen,
} from "lucide-react";
import { Brand } from "@/components/brand";
import styles from "./landing-page.module.css";

function SocialFacebook() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>;
}
function SocialTwitter() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/></svg>;
}
function SocialLinkedin() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg>;
}
function SocialInstagram() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>;
}

const assets = "/assets/landing";
const mentors = [
  { name: "Kaisya Dias", role: "UI/UX Design", image: "source-18.png" },
  { name: "Jaxson Torff", role: "Photographer", image: "footer-mentor.png" },
  { name: "Emery Aminoff", role: "Developer", image: "source-15.jpeg", featured: true },
  { name: "Kaisya Dias", role: "Brand Designer", image: "source-13.png" },
];

function Arrow() {
  return <ArrowUpRight size={18} aria-hidden="true" />;
}

function PublicHeader() {
  return (
    <header className={styles.header}>
      <Brand />
      <nav className={styles.desktopNav} aria-label="Primary navigation">
        <a href="#categories">Category</a>
        <a href="#about">About Us</a>
        <Link href="/mentor">Jnanana Foundation Business</Link>
      </nav>
      <Link className={styles.signIn} href="/login">
        Sign Up <Arrow />
      </Link>
      <details className={styles.mobileNav}>
        <summary aria-label="Open navigation">
          <span />
          <span />
          <span />
        </summary>
        <nav aria-label="Mobile navigation">
          <a href="#categories">Category</a>
          <a href="#about">About Us</a>
          <Link href="/mentor">Jnanana Foundation Business</Link>
          <Link href="/login">Sign Up</Link>
        </nav>
      </details>
    </header>
  );
}

function Testimonial({ compact = false }: { compact?: boolean }) {
  return (
    <article className={compact ? styles.heroReview : styles.reviewCard}>
      <div className={styles.stars} aria-label="5 out of 5 stars">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} size={14} fill="#ffc107" color="#ffc107" />
        ))}
      </div>
      <p>“1:1 video sessions turned my organic chemistry confusion into clarity and boosted my confidence before exams.”</p>
      <div className={styles.reviewer}>
        <span>K</span>
        <div>
          <strong>KatieWatere</strong>
          <small>MEME Developer</small>
        </div>
      </div>
    </article>
  );
}

function MentorCard({ mentor }: { mentor: (typeof mentors)[number] }) {
  return (
    <article className={`${styles.mentorCard} ${mentor.featured ? styles.featuredMentor : ""}`}>
      <div className={styles.mentorPhoto}>
        <Image src={`${assets}/${mentor.image}`} alt={`${mentor.name}, ${mentor.role} mentor`} fill sizes="(max-width: 767px) 32vw, 280px" />
      </div>
      <h3>{mentor.name}</h3>
      <div className={styles.mentorMeta}>
        <span>{mentor.role}</span>
        <span className={styles.ratingBadge}>
          <Star size={12} fill="#ffc107" color="#ffc107" /> 4.5 (1,200)
        </span>
      </div>
      <Link href="/mentors/featured">
        Follow {mentor.featured && <Arrow />}
      </Link>
    </article>
  );
}

function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerCta}>
        <Image src={`${assets}/footer-mentor-cutout.svg`} alt="Upskillink learner" width={566} height={786} />
        <div>
          <h2>
            Learner Outcomes
            <br />
            On Upskillink
          </h2>
          <p>Start, switch or advance your career with more than 34,000+ courses in Upskillink.</p>
          <Link className="button button-secondary" href="/onboarding/mentor">
            Become Mentor <Arrow />
          </Link>
        </div>
      </div>
      <div className={styles.footerLinks}>
        <div>
          <strong>For Candidates</strong>
          <a href="#mentors">Explore Jobs</a>
          <a href="#categories">Discover Companies</a>
          <a href="#categories">Browse Collections</a>
          <a href="#about">The Career Blog</a>
        </div>
        <div>
          <strong>For Companies</strong>
          <Link href="/mentor">Upskillink Hire</Link>
          <Link href="/referrals">Upskillink Referrals</Link>
          <a href="#about">The Hiring Blog</a>
          <a href="#about">AI Job Builder</a>
        </div>
        <div>
          <strong>Upskillink</strong>
          <a href="#about">About Us</a>
          <a href="#about">Work with us</a>
          <a href="#about">Contact us</a>
        </div>
        <div>
          <strong>Social Media</strong>
          <div className={styles.socials}>
            <a href="#" aria-label="Facebook">
              <SocialFacebook />
            </a>
            <a href="#" aria-label="X (Twitter)">
              <SocialTwitter />
            </a>
            <a href="#" aria-label="LinkedIn">
              <SocialLinkedin />
            </a>
            <a href="#" aria-label="Instagram">
              <SocialInstagram />
            </a>
          </div>
        </div>
      </div>
      <a className={styles.backToTop} href="#top" aria-label="Back to top">
        <ChevronUp size={24} />
      </a>
      <div className={styles.footerWord}>Upskillink</div>
      <div className={styles.legal}>
        <span>Copyright@2024Upskillink</span>
        <span>Term Of Use &nbsp;&nbsp; Privacy Policy &nbsp;&nbsp; Licensing</span>
      </div>
    </footer>
  );
}

export function LandingPage() {
  return (
    <main id="top" className={styles.page}>
      <section className={styles.hero}>
        <PublicHeader />
        <div className={styles.heroHeading}>
          <span className="eyebrow">Welcome to Jnanana Foundation</span>
          <h1>
            Building the World's Largest
            <br />
            Mentorship Program
          </h1>
        </div>
        <div className={styles.heroStage}>
          <div className={styles.heroQuote}>
            <b>“</b>
            <p>Now you can learn anywhere, anytime, even if there is no institute access!</p>
            <strong>10K+</strong>
            <small>Mentors</small>
          </div>
          <div className={styles.heroPortrait}>
            <div className={styles.limeCircle} />
            <Image priority src={`${assets}/outcomes-video.png`} alt="Professional Upskillink mentor" width={976} height={1248} />
            <div className={styles.heroActions}>
              <Link className="button button-primary" href="/onboarding/student">
                Request Demo <Arrow />
              </Link>
              <Link className="button button-secondary" href="/onboarding/mentor">
                I’m Mentor
              </Link>
            </div>
          </div>
          <Testimonial compact />
        </div>
      </section>

      <section className={styles.companies} aria-labelledby="companies-title">
        <h2 id="companies-title">Mentors From Your Dream Companies</h2>
        <p>Connect, Learn and Grow with the Help of Top mentors</p>
        <div>
          <Image src={`${assets}/company-logos.png`} alt="Google, Amazon, AMD, Intel, Cisco and Microsoft" width={1627} height={223} />
        </div>
      </section>

      <section className={styles.outcomes} id="about">
        <div className={styles.outcomesIntro}>
          <h2>
            Learner Outcomes
            <br />
            On Upskillink
          </h2>
          <p>Start, switch or advance your career with more than 34,000+ courses in Upskillink.</p>
          <strong>
            <Arrow /> 87%
          </strong>
          <span>People learning for professional development report career benefits, including outcomes like getting a promotion.</span>
        </div>
        <div className={styles.reviews}>
          <Testimonial />
          <Testimonial />
        </div>
        <div className={styles.dots} aria-hidden="true">
          <i />
          <i />
          <i />
        </div>
        <div className={styles.stats}>
          <div>
            <strong>34K+</strong>
            <span>Classes</span>
          </div>
          <div>
            <strong>800K+</strong>
            <span>Members</span>
          </div>
          <div>
            <strong>10K+</strong>
            <span>Mentors</span>
          </div>
          <div>
            <strong>4.8</strong>
            <span>Rating</span>
          </div>
        </div>
      </section>

      <section className={styles.videoPanel}>
        <span className="eyebrow">Why Upskillink</span>
        <h2>Learner Outcomes On Upskillink</h2>
        <p>Start, switch or advance your career with more than 34,000+ courses in Upskillink.</p>
        <button className={styles.video} type="button" aria-label="Play learner outcomes video">
          <Image src={`${assets}/feature-community.png`} alt="Learner studying online" fill sizes="(max-width: 767px) 90vw, 1400px" />
          <span className={styles.playBtn} aria-hidden="true">
            <Play size={32} fill="currentColor" />
          </span>
        </button>
      </section>

      <section className={styles.features}>
        <h2>
          Level Up the
          <br />
          learning journey
        </h2>
        <Image className={styles.dashboardImage} src={`${assets}/mentor-kaisya.png`} alt="Upskillink learning dashboard" width={852} height={852} />
        <div className={styles.featureTabs}>
          <span>Open Mic</span>
          <strong>
            Easy To Use
            <br />
            Interface
          </strong>
          <span>Community</span>
        </div>
        <div className={styles.featureCard}>
          <div className={styles.learningIllustration} aria-hidden="true">
            <Sparkles size={24} color="var(--lime)" />
            <BookOpen size={24} color="var(--paper)" />
          </div>
          <p>Skills aim to cater to the diverse needs and preferences of both educators and students, fostering a dynamic and adaptable learning environment.</p>
        </div>
      </section>

      <section className={styles.catalog}>
        <div className={styles.steps}>
          <div className={styles.stepsIntro}>
            <span className="eyebrow">Let’s Begin</span>
            <h2>
              How To Start
              <br />
              Learning With
              <br />
              Upskillink
            </h2>
            <Link className="button button-primary" href="/onboarding/student">
              Get Started <Arrow />
            </Link>
          </div>
          <ol>
            <li>
              <div>
                <strong>Book The Lesson</strong>
                <p>Design a clear, goal-oriented curriculum that aligns with your expertise and meets learner needs.</p>
              </div>
            </li>
            <li>
              <div>
                <strong>Connect To Mentor</strong>
                <p>Connect for sessions that inspire and educate. Use our platform to provide interactive learning experiences.</p>
              </div>
            </li>
            <li>
              <div>
                <strong>Earn Rewards</strong>
                <p>Create and manage a dynamic learning hub. Foster collaboration, build a supportive network and earn rewards.</p>
              </div>
            </li>
          </ol>
        </div>

        <div className={styles.catalogBlock} id="categories">
          <div className={styles.sectionTitle}>
            <div>
              <span className="eyebrow">Top Category</span>
              <h2>Category You Must Know</h2>
            </div>
            <Link href="/mentors">
              See All <Arrow />
            </Link>
          </div>
          <div className={styles.categoryViewport}>
            <Image src={`${assets}/category-grid.png`} alt="Business, development, IT and software, marketing, art, music, photography and video editing categories" width={1536} height={730} />
          </div>
        </div>

        <div className={styles.catalogBlock} id="mentors">
          <div className={styles.sectionTitle}>
            <div>
              <span className="eyebrow">Meet Personal Mentors</span>
              <h2>Learn from the Top 1%</h2>
            </div>
            <Link href="/mentors">
              See All <Arrow />
            </Link>
          </div>
          <div className={styles.mentorGrid}>
            {mentors.map((mentor) => (
              <MentorCard key={`${mentor.name}-${mentor.role}`} mentor={mentor} />
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
