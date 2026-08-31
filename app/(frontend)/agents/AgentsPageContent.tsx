"use client";

import { useState, useMemo } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import Link from "next/link";
import { useRef } from "react";

// Agent data
import { AGENTS, type Agent } from "./agents-data";

// UI Components
import GradientMesh from "@/components/ui/GradientMesh";

// Category filters
const CATEGORIES = [
  "All",
  "Research",
  "Drafting",
  "Auditing",
  "Optimization",
  "SEO",
  "Content",
  "Development",
  "Design",
  "Marketing",
  "Operations",
];

// Status colors
const STATUS_COLORS = {
  active: "bg-green-500/20 text-green-400 border-green-500/30",
  maintenance: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  deprecated: "bg-red-500/20 text-red-400 border-red-500/30",
};

// Category colors
const CATEGORY_COLORS: Record<string, string> = {
  Research: "bg-blue-500/20 text-blue-400",
  Drafting: "bg-purple-500/20 text-purple-400",
  Auditing: "bg-orange-500/20 text-orange-400",
  Optimization: "bg-emerald-500/20 text-emerald-400",
  SEO: "bg-lime-500/20 text-lime-400",
  Content: "bg-rose-500/20 text-rose-400",
  Development: "bg-indigo-500/20 text-indigo-400",
  Design: "bg-fuchsia-500/20 text-fuchsia-400",
  Marketing: "bg-cyan-500/20 text-cyan-400",
  Operations: "bg-violet-500/20 text-violet-400",
  All: "bg-gray-500/20 text-gray-400",
};

function AgentCard({ agent }: { agent: Agent }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      if (reduced) return;
      gsap.from(cardRef.current, {
        opacity: 0,
        y: 20,
        duration: 0.4,
        ease: "power2.out",
        scrollTrigger: {
          trigger: cardRef.current,
          start: "top 80%",
          toggleActions: "play none none none",
        },
      });
    },
    { scope: cardRef },
  );

  return (
    <div
      ref={cardRef}
      className="group/agent relative rounded-2xl border border-white/10 bg-[var(--panel)] p-6 transition-all duration-300 hover:border-[var(--accent)] hover:shadow-[0_0_20px_-5px_rgba(99,102,241,0.15)]"
    >
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-[var(--bg-deep)] text-xl font-bold">
            {agent.avatar}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-[var(--text)]">{agent.name}</h3>
            <span
              className={`rounded-full px-2 py-1 text-xs font-medium ${CATEGORY_COLORS[agent.category] || CATEGORY_COLORS.All}`}
            >
              {agent.category}
            </span>
          </div>

          <p className="mt-2 text-sm text-[var(--muted)]">{agent.description}</p>

          <div className="mt-4 flex flex-wrap gap-2">
            {agent.skills.slice(0, 3).map((skill) => (
              <span
                key={skill}
                className="rounded-full px-2 py-1 text-xs bg-white/5 text-[var(--muted)] border border-white/10"
              >
                {skill}
              </span>
            ))}
            {agent.skills.length > 3 && (
              <span className="rounded-full px-2 py-1 text-xs bg-white/5 text-[var(--muted)] border border-white/10">
                +{agent.skills.length - 3}
              </span>
            )}
          </div>

          <div className="mt-4 flex items-center justify-between">
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium border ${STATUS_COLORS[agent.status]}`}
            >
              {agent.status === "active" && "Active"}
              {agent.status === "maintenance" && "Maintenance"}
              {agent.status === "deprecated" && "Deprecated"}
            </span>
            <Link
              href={`/agents/${agent.slug}`}
              className="text-sm text-[var(--accent)] hover:text-[var(--accent-2)] transition-colors"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              View →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function AgentsGrid({ agents }: { agents: Agent[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      if (reduced) return;
      const cards = gsap.utils.toArray(".group/agent");
      gsap.set(cards, { opacity: 0, y: 30 });
      gsap.to(cards, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.05,
        ease: "power2.out",
      });
    },
    { scope: containerRef },
  );

  return (
    <div
      ref={containerRef}
      className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    >
      {agents.map((agent) => (
        <AgentCard key={agent.id} agent={agent} />
      ))}
    </div>
  );
}

function SearchAndFilters() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "/" && e.target instanceof HTMLInputElement) {
      e.preventDefault();
      (e.currentTarget as HTMLInputElement).focus();
    }
  };

  const filteredAgents = useMemo(() => {
    return AGENTS.filter((agent) => {
      const matchesSearch =
        agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.skills.some((skill) => skill.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCategory =
        selectedCategory === "All" || agent.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory]);

  const stats = {
    total: AGENTS.length,
    active: AGENTS.filter((a) => a.status === "active").length,
    categories: Array.from(new Set(AGENTS.map((a) => a.category))).length,
  };

  return (
    <div className="space-y-8">
      {/* Stats Bar */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-white/10 bg-[var(--panel)] p-4 text-center">
          <div className="text-3xl font-bold text-[var(--accent-cool)]">{stats.total}</div>
          <div className="mt-1 text-sm text-[var(--muted)]">Total Agents</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-[var(--panel)] p-4 text-center">
          <div className="text-3xl font-bold text-green-400">{stats.active}</div>
          <div className="mt-1 text-sm text-[var(--muted)]">Active</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-[var(--panel)] p-4 text-center">
          <div className="text-3xl font-bold text-[var(--accent)]">{stats.categories}</div>
          <div className="mt-1 text-sm text-[var(--muted)]">Categories</div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
          <span className="text-[var(--muted)]">/</span>
        </div>
        <input
          type="text"
          placeholder="Search agents by name, role, or skills..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full rounded-xl border border-white/10 bg-[var(--panel)] px-12 py-4 text-[var(--text)] placeholder-[var(--muted)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 transition-all"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm("")}
            className="absolute inset-y-0 right-0 flex items-center pr-4 text-[var(--muted)] hover:text-[var(--text)]"
          >
            &times;
          </button>
        )}
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
              selectedCategory === category
                ? "bg-[var(--accent)] text-[var(--accent-ink)]"
                : "bg-white/5 text-[var(--muted)] hover:bg-white/10"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Results Info */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-[var(--muted)]">
          Showing <span className="font-semibold text-[var(--text)]">{filteredAgents.length}</span> of {stats.total} agents
        </div>
        {selectedCategory !== "All" && (
          <button
            onClick={() => setSelectedCategory("All")}
            className="text-sm text-[var(--accent)] hover:text-[var(--accent-2)]"
          >
            Clear filter
          </button>
        )}
      </div>

      {/* Filtered Agents Grid */}
      <AgentsGrid agents={filteredAgents} />
    </div>
  );
}

function LoadingSkeleton() {
  const skeletonRefs = useRef<HTMLDivElement[]>([]);
  const reduced = useReducedMotion();

  useGSAP(() => {
    if (reduced) return;
    gsap.fromTo(
      skeletonRefs.current,
      { opacity: 0 },
      {
        opacity: 0.5,
        duration: 1.5,
        repeat: -1,
        stagger: 0.1,
        ease: "power2.inOut" as any,
      },
    );
  }, [reduced]);

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {[...Array(12)].map((_, i) => (
        <div
          key={i}
          ref={(el) => {
            if (el && !skeletonRefs.current.includes(el)) {
              skeletonRefs.current[i] = el;
            }
          }}
          className="rounded-2xl border border-white/10 bg-[var(--panel)] p-6"
        >
          <div className="animate-pulse space-y-3">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-white/10"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 rounded bg-white/10"></div>
                <div className="h-3 w-1/2 rounded bg-white/10"></div>
              </div>
            </div>
            <div className="space-y-2 pt-2">
              <div className="h-3 rounded bg-white/10"></div>
              <div className="h-3 w-5/6 rounded bg-white/10"></div>
              <div className="h-3 w-4/6 rounded bg-white/10"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AgentsPageContent() {
  const containerRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      if (reduced) return;
      gsap.from(containerRef.current, {
        opacity: 0,
        y: 30,
        duration: 0.6,
        ease: "power2.out",
      });
    },
    { scope: containerRef },
  );

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      {/* Gradient Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <GradientMesh />
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(135deg, var(--bg) 70%, transparent 100%)",
          }}
        />
      </div>

      {/* Main Content */}
      <div
        ref={containerRef}
        className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-8"
      >
        {/* Header */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1 text-xs text-[var(--muted)] backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent-2)]" />
            Agent OS v3.0
          </div>

          <h1 className="mt-6 text-4xl font-bold tracking-tight text-[var(--text)] sm:text-5xl lg:text-6xl">
            AI Agents <span className="text-[var(--accent)]">Powering Autonomous Operations</span>
          </h1>

          <p className="mt-6 max-w-2xl text-lg text-[var(--muted)]">
            A fleet of 73 specialized AI agents working together to automate marketing,
            research, content creation, and optimization. Each agent is an expert in its
            domain, designed to handle complex tasks with precision.
          </p>
        </div>

        {/* Search and Filters */}
        <SearchAndFilters />

        {/* Footer Note */}
        <div className="mt-16 text-center">
          <p className="text-sm text-[var(--muted)]">
            Agents are continuously updated. Last updated: August 2026
          </p>
        </div>
      </div>
    </div>
  );
}
