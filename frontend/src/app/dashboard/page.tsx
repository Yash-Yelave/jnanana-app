"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, SlidersHorizontal, Star, X } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import type { Mentor } from "@/lib/types";
import { useApi } from "@/lib/use-api";
import { publicAsset } from "@/lib/supabase/client";

const categoryFilters = [
  { label: "All", id: "All" },
  { label: "Design & UI/UX", id: "Design" },
  { label: "Engineering & Tech", id: "Engineering" },
  { label: "Marketing & Growth", id: "Marketing" },
  { label: "Product Strategy", id: "Product" },
];

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
    <AppShell active="/dashboard">
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "16px 0", color: "#141210" }}>
        {/* Page Header */}
        <div style={{ marginBottom: "24px" }}>
          <h1 style={{ fontSize: "2rem", fontWeight: 800, margin: 0, color: "#141210" }}>
            Explore Verified Mentors
          </h1>
          <p style={{ color: "#6A675F", margin: "6px 0 0", fontSize: "1rem" }}>
            Connect 1-on-1 with industry leaders to accelerate your skills using your Jools.
          </p>
        </div>

        {/* Filter Controls Bar */}
        <div
          style={{
            background: "#FFFFFF",
            borderRadius: "16px",
            padding: "20px",
            border: "1.5px solid #141210",
            boxShadow: "3px 3px 0 #141210",
            marginBottom: "28px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          {/* Top Row: Search Input & Rating Select */}
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <div style={{ position: "relative", flex: 1, minWidth: "260px" }}>
              <Search
                size={18}
                color="#6A675F"
                style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }}
              />
              <input
                type="text"
                placeholder="Search mentors by name, company, or skills (e.g. React, UI/UX)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 14px 12px 42px",
                  borderRadius: "10px",
                  border: "1.5px solid #141210",
                  fontSize: "0.925rem",
                  outline: "none",
                  background: "#FAFAFA",
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "4px",
                    display: "flex",
                  }}
                >
                  <X size={16} color="#6A675F" />
                </button>
              )}
            </div>

            {/* Rating Dropdown */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <SlidersHorizontal size={18} color="#141210" />
              <select
                value={minRating}
                onChange={(e) => setMinRating(Number(e.target.value))}
                style={{
                  padding: "12px 16px",
                  borderRadius: "10px",
                  border: "1.5px solid #141210",
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  background: "#FAFAFA",
                  color: "#141210",
                  cursor: "pointer",
                }}
              >
                <option value={0}>★ All Ratings</option>
                <option value={4.9}>★ 4.9 & above</option>
                <option value={4.8}>★ 4.8 & above</option>
              </select>
            </div>
          </div>

          {/* Bottom Row: Category Chips */}
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#6A675F", marginRight: "4px" }}>
              Domain:
            </span>
            {categoryFilters.map((cat) => {
              const active = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  style={{
                    padding: "6px 14px",
                    borderRadius: "99px",
                    border: "1.5px solid #141210",
                    background: active ? "#0B6B44" : "#F6EBDB",
                    color: active ? "#FFFFFF" : "#141210",
                    fontWeight: 700,
                    fontSize: "0.825rem",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                >
                  {cat.label}
                </button>
              );
            })}

            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                style={{
                  marginLeft: "auto",
                  padding: "6px 12px",
                  borderRadius: "8px",
                  background: "transparent",
                  border: "1px solid #D6206A",
                  color: "#D6206A",
                  fontSize: "0.825rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <X size={14} /> Clear Filters
              </button>
            )}
          </div>
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
              borderRadius: "20px",
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
                borderRadius: "10px",
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
                        <Star size={14} fill="#F5B921" color="#F5B921" /> {m.rating} <span style={{ color: "#6A675F", fontWeight: 400 }}>({m.reviews} reviews)</span>
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
        )}
      </div>
    </AppShell>
  );
}
