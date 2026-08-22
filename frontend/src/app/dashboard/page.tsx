"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, X, Sparkles, Calendar, MapPin, ArrowRight } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import type { Mentor } from "@/lib/types";
import { useApi } from "@/lib/use-api";
import { publicAsset } from "@/lib/supabase/client";

export default function DashboardPage() {
  const { data: mentorData, loading } = useApi<{ items: Mentor[] }>("/mentors");

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [minRating, setMinRating] = useState<number>(0);

  const mentorsList = (mentorData?.items || []).map((m, index) => ({
    id: m.id,
    name: `${m.first_name} ${m.last_name}`,
    headline: m.headline || "Verified Mentor",
    rating: m.average_rating || 4.9,
    reviews: m.review_count || 12,
    bio: m.bio || "Experienced industry mentor helping students build real-world skills and advance their tech careers.",
    tags: m.professions && m.professions.length > 0 ? m.professions : ["Mentorship", "Career Advice"],
    image: publicAsset("avatars", m.avatar_path) ?? `/assets/app/mentor-${(index % 4) + 1}.png`,
  }));

  const filteredMentors = mentorsList.filter((m) => {
    // 1. Search Query
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      m.name.toLowerCase().includes(q) ||
      m.headline.toLowerCase().includes(q) ||
      m.bio.toLowerCase().includes(q) ||
      m.tags.some((t) => t.toLowerCase().includes(q));

    // 2. Category / Skill
    const matchesCategory =
      selectedCategory === "All" ||
      (selectedCategory === "Design" && m.tags.some((t) => /design|ui|ux|figma/i.test(t))) ||
      (selectedCategory === "Engineering" && m.tags.some((t) => /tech|dsa|system|react|node|cloud|python|backend|architect/i.test(t))) ||
      (selectedCategory === "Marketing" && m.tags.some((t) => /marketing|brand|growth|gtm|seo/i.test(t))) ||
      (selectedCategory === "Product" && m.tags.some((t) => /product|strategy|management/i.test(t)));

    // 3. Minimum Rating
    const matchesRating = m.rating >= minRating;

    return matchesSearch && matchesCategory && matchesRating;
  });

  const hasActiveFilters = searchQuery !== "" || selectedCategory !== "All" || minRating > 0;

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All");
    setMinRating(0);
  };

  return (
    <AppShell active="/dashboard" domain={selectedCategory} onDomainChange={setSelectedCategory}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "16px 0", color: "#141210" }}>
        {/* Featured Event Highlight Banner */}
        <div
          style={{
            background: "linear-gradient(135deg, #0B6B44 0%, #141210 100%)",
            border: "1.5px solid #141210",
            boxShadow: "4px 4px 0 #141210",
            padding: "24px 28px",
            marginBottom: "28px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            color: "#FFFFFF",
          }}
        >
          {/* Top Badges Row */}
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "10px" }}>
            <span
              style={{
                background: "#D6206A",
                color: "#FFFFFF",
                fontSize: "0.75rem",
                fontWeight: 800,
                padding: "4px 10px",
                border: "1px solid #141210",
                boxShadow: "2px 2px 0 #141210",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              <Sparkles size={13} /> Featured Conclave
            </span>
            <span
              style={{
                background: "#F5B921",
                color: "#141210",
                fontSize: "0.75rem",
                fontWeight: 800,
                padding: "4px 10px",
                border: "1px solid #141210",
                boxShadow: "2px 2px 0 #141210",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              ⚡ Claim +50 Jools on check-in
            </span>
          </div>

          {/* Title & Description Row */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              flexWrap: "wrap",
              gap: "20px",
            }}
          >
            <div style={{ flex: 1, minWidth: "280px" }}>
              <h2 style={{ fontSize: "1.4rem", fontWeight: 800, margin: "0 0 8px", color: "#FFFFFF", lineHeight: 1.3 }}>
                J-Spotlight Edition 01: Finding the Next Junicorn
              </h2>
              <p style={{ fontSize: "0.925rem", color: "#F6EBDB", margin: "0 0 14px", lineHeight: 1.55 }}>
                Empowering India&apos;s next generation of high-impact founders. An exclusive pitch and mentorship conclave connecting student innovators with venture leads and global incubation pathways.
              </p>

              {/* Meta Info */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "18px", fontSize: "0.85rem", fontWeight: 700, color: "#FFFFFF" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "6px", color: "#F5B921" }}>
                  <Calendar size={15} color="#F5B921" /> Sat, 29 Aug 2026 • 4:00 PM IST
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: "6px", color: "#FFFFFF" }}>
                  <MapPin size={15} color="#F5B921" /> Draper U India, Hyderabad
                </span>
              </div>
            </div>

            {/* Action CTA Button */}
            <div style={{ display: "flex", alignItems: "center", alignSelf: "center" }}>
              <a
                href="https://forms.gle/y5R1jv5FbQuu6VrNA"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: "12px 22px",
                  background: "#F5B921",
                  color: "#141210",
                  fontWeight: 800,
                  fontSize: "0.95rem",
                  textDecoration: "none",
                  border: "1.5px solid #141210",
                  boxShadow: "3px 3px 0 #141210",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  whiteSpace: "nowrap",
                }}
              >
                Request delegate seat <ArrowRight size={16} />
              </a>
            </div>
          </div>
        </div>

        {/* Page Header */}
        <div style={{ marginBottom: "24px" }}>
          <h1 style={{ fontSize: "2rem", fontWeight: 800, margin: 0, color: "#141210" }}>
            Explore Verified Mentors
          </h1>
          <p style={{ color: "#6A675F", margin: "6px 0 0", fontSize: "1rem" }}>
            Connect 1-on-1 with industry leaders to accelerate your skills using your Jools.
          </p>
        </div>

        {/* Results Counter */}
        <div style={{ marginBottom: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "0.9rem", color: "#6A675F", fontWeight: 600 }}>
            Showing <strong>{filteredMentors.length}</strong> mentor{filteredMentors.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Mentor Cards Grid */}
        {filteredMentors.length === 0 ? (
          <div
            style={{
              background: "#FFFFFF",
              borderRadius: "0",
              padding: "48px 24px",
              textAlign: "center",
              border: "1.5px solid #141210",
              boxShadow: "4px 4px 0 #141210",
            }}
          >
            <h3 style={{ fontSize: "1.25rem", margin: "0 0 8px", color: "#141210" }}>No mentors found</h3>
            <p style={{ color: "#6A675F", margin: "0 0 20px" }}>
              No mentors match your search query or filter selection. Try clearing your filters!
            </p>
            <button
              type="button"
              onClick={resetFilters}
              style={{
                padding: "10px 20px",
                borderRadius: "0",
                background: "#0B6B44",
                color: "#FFF",
                fontWeight: 700,
                border: "1.5px solid #141210",
                cursor: "pointer",
              }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
              gap: "24px",
            }}
          >
            {filteredMentors.map((m) => (
              <article
                key={m.id}
                style={{
                  background: "#FFFFFF",
                  borderRadius: "0",
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
                    <Link href={`/mentors/${m.id}`} style={{ display: "block", flexShrink: 0 }}>
                      <Image
                        src={m.image}
                        alt={m.name}
                        width={72}
                        height={72}
                        style={{ borderRadius: "50%", objectFit: "cover", border: "2px solid #0B6B44", cursor: "pointer", aspectRatio: "1 / 1", flexShrink: 0 }}
                      />
                    </Link>
                    <div>
                      <h3 style={{ fontSize: "1.2rem", fontWeight: 800, margin: 0, color: "#141210" }}>
                        <Link href={`/mentors/${m.id}`} style={{ textDecoration: "none", color: "#141210" }}>
                          {m.name}
                        </Link>
                      </h3>
                      <span style={{ fontSize: "0.85rem", color: "#D6206A", fontWeight: 700, display: "block", marginTop: "2px" }}>
                        ♛ {m.headline}
                      </span>
                      <div style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "4px", fontSize: "0.85rem", color: "#F5B921", fontWeight: 700 }}>
                        <Star size={14} fill="#F5B921" color="#F5B921" /> {m.rating} <span style={{ color: "#6A675F", fontWeight: 400 }}>({m.reviews} reviews)</span>
                      </div>
                    </div>
                  </div>

                  {/* Description / Bio */}
                  <p style={{ fontSize: "0.925rem", color: "#141210", lineHeight: 1.5, marginBottom: "18px" }}>
                    {m.bio}
                  </p>

                  {/* Skill Chips */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "20px" }}>
                    {m.tags.map((tag) => (
                      <span
                        key={tag}
                        style={{
                          padding: "4px 10px",
                          borderRadius: "0",
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
                    borderRadius: "0",
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
        )}
      </div>
    </AppShell>
  );
}
