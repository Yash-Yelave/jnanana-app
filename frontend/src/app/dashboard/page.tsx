"use client";

import Image from "next/image";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import type { Mentor } from "@/lib/types";
import { useApi } from "@/lib/use-api";
import { publicAsset } from "@/lib/supabase/client";

const mentorFixtures = [
  {
    id: "m1",
    name: "Emery Aminoff",
    headline: "Senior UI/UX Designer & Product Lead",
    rating: 4.9,
    reviews: 128,
    bio: "Passionate about building scalable design systems, user-centric products, and mentoring early-stage designers to accelerate their careers.",
    tags: ["UI/UX", "Figma", "Design Systems", "Product Strategy"],
    image: "/assets/app/mentor-1.png",
  },
  {
    id: "m2",
    name: "Kristin Watson",
    headline: "Staff Software Engineer @ Google",
    rating: 4.8,
    reviews: 94,
    bio: "Helping students master System Design, Data Structures, Algorithms, and technical interview preparation for tier-1 tech companies.",
    tags: ["System Design", "Python", "DSA", "Backend Architecture"],
    image: "/assets/app/mentor-2.png",
  },
  {
    id: "m3",
    name: "Jaxson Torff",
    headline: "Head of Marketing & Brand Growth",
    rating: 5.0,
    reviews: 156,
    bio: "Specializing in growth loops, personal branding, go-to-market strategies, and content monetization for creators and tech founders.",
    tags: ["Brand Growth", "GTM Strategy", "Marketing", "SEO"],
    image: "/assets/app/mentor-3.png",
  },
  {
    id: "m4",
    name: "Kaisya Dias",
    headline: "Lead Fullstack Architect @ Microsoft",
    rating: 4.9,
    reviews: 82,
    bio: "10+ years architecting enterprise cloud applications. Dedicated to guiding developers through React, Next.js, Node.js, and Cloud DevOps.",
    tags: ["React", "Next.js", "Node.js", "AWS Cloud"],
    image: "/assets/app/mentor-4.png",
  },
];

export default function DashboardPage() {
  const { data: mentorData, loading } = useApi<{ items: Mentor[] }>("/mentors");

  const mentorsList = (mentorData?.items && mentorData.items.length > 0)
    ? mentorData.items.map((m, index) => ({
        id: m.id,
        name: `${m.first_name} ${m.last_name}`,
        headline: m.headline || "Verified Mentor",
        rating: m.average_rating || 4.9,
        reviews: m.review_count || 12,
        bio: m.bio || "Experienced industry mentor helping students build real-world skills and advance their tech careers.",
        tags: m.professions && m.professions.length > 0 ? m.professions : ["Mentorship", "Career Advice"],
        image: publicAsset("avatars", m.avatar_path) ?? `/assets/app/mentor-${(index % 4) + 1}.png`,
      }))
    : mentorFixtures;

  return (
    <AppShell active="/dashboard">
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "16px 0", color: "#141210" }}>
        {/* Page Header */}
        <div style={{ marginBottom: "28px" }}>
          <h1 style={{ fontSize: "2rem", fontWeight: 800, margin: 0, color: "#141210" }}>
            Explore Verified Mentors
          </h1>
          <p style={{ color: "#6A675F", margin: "6px 0 0", fontSize: "1rem" }}>
            Connect 1-on-1 with industry leaders to accelerate your skills using your Jools.
          </p>
        </div>

        {/* Mentor Cards Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
            gap: "24px",
          }}
        >
          {mentorsList.map((m) => (
            <article
              key={m.id}
              style={{
                background: "#FFFFFF",
                borderRadius: "20px",
                padding: "24px",
                border: "1.5px solid #141210",
                boxShadow: "4px 4px 0 #141210",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <div>
                {/* Avatar & Title Row */}
                <div style={{ display: "flex", gap: "16px", alignItems: "center", marginBottom: "16px" }}>
                  <Image
                    src={m.image}
                    alt={m.name}
                    width={72}
                    height={72}
                    style={{ borderRadius: "50%", objectFit: "cover", border: "2px solid #0B6B44" }}
                  />
                  <div>
                    <h3 style={{ fontSize: "1.2rem", fontWeight: 800, margin: 0, color: "#141210" }}>
                      {m.name}
                    </h3>
                    <span style={{ fontSize: "0.85rem", color: "#D6206A", fontWeight: 700, display: "block", marginTop: "2px" }}>
                      ♛ {m.headline}
                    </span>
                    <div style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "4px", fontSize: "0.85rem", color: "#F5B921", fontWeight: 700 }}>
                      ★ {m.rating} <span style={{ color: "#6A675F", fontWeight: 400 }}>({m.reviews} reviews)</span>
                    </div>
                  </div>
                </div>

                {/* Description / Bio */}
                <p style={{ fontSize: "0.925rem", color: "#333", lineHeight: 1.5, marginBottom: "18px" }}>
                  {m.bio}
                </p>

                {/* Skill Chips */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "20px" }}>
                  {m.tags.map((tag) => (
                    <span
                      key={tag}
                      style={{
                        padding: "4px 10px",
                        borderRadius: "99px",
                        border: "1px solid #141210",
                        background: "#F6EBDB",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        color: "#141210",
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <Link
                href={`/mentors/${m.id}?request=true`}
                style={{
                  padding: "12px 20px",
                  borderRadius: "12px",
                  background: "#0B6B44",
                  color: "#FFF",
                  fontWeight: 700,
                  textDecoration: "none",
                  textAlign: "center",
                  fontSize: "0.95rem",
                  boxShadow: "3px 3px 0 #141210",
                  border: "1.5px solid #141210",
                  display: "block",
                }}
              >
                ⚡ Request Mentorship (10 Jools)
              </Link>
            </article>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
