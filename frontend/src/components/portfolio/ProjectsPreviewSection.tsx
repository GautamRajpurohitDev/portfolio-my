"use client";

import { SlideUp, StaggerContainer, StaggerItem } from "@/components/motion/MotionPrimitives";
import { ArrowRight, ExternalLink } from "lucide-react";
import { GithubIcon as Github } from "@/components/ui/SocialIcons";
import Link from "next/link";
import { cn } from "@/lib/utils";



const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  "idea":        { label: "IDEA",         color: "text-text-secondary border-border-muted" },
  "in-progress": { label: "IN PROGRESS",  color: "text-accent border-accent"              },
  "completed":   { label: "COMPLETED",    color: "text-success border-success"            },
  "archived":    { label: "ARCHIVED",     color: "text-text-tertiary border-border"       },
};

interface Project {
  _id: string;
  slug: string;
  title: string;
  shortDescription: string;
  status: "idea" | "in-progress" | "completed" | "archived";
  technologies: string[];
  category: string;
  featured: boolean;
  year: string;
  githubUrl?: string;
  liveUrl?: string;
  images: { url: string; alt: string }[];
}

interface ProjectsPreviewProps {
  projects?: Project[];
  hideHeader?: boolean;
}

export function ProjectsPreviewSection({ projects = [], hideHeader = false }: ProjectsPreviewProps) {
  const featured = projects.find((p) => p.featured) ?? projects[0];
  const rest = projects.filter((p) => p._id !== featured?._id).slice(0, 3); // 2-3 smaller projects

  return (
    <section
      className={hideHeader ? "py-12 md:py-16" : "section border-t border-border"}
      id="projects"
      aria-labelledby="projects-heading"
    >
      <div className="container">

        {/* Header */}
        {!hideHeader && (
          <SlideUp>
            <div className="flex items-end justify-between mb-14 pb-4 border-b border-border">
              <div>
                <span className="label-meta block mb-3">05 / Selected Work</span>
                <h2
                  id="projects-heading"
                  className="font-display font-bold text-display-md tracking-tighter text-text-primary uppercase"
                >
                  Building things that make the learning real.
                </h2>
              </div>
              <Link
                href="/projects"
                className="hidden sm:flex items-center gap-2 text-[12px] font-semibold tracking-widest uppercase text-text-secondary hover:text-accent transition-colors duration-200"
              >
                ALL PROJECTS <ArrowRight size={14} strokeWidth={2} />
              </Link>
            </div>
          </SlideUp>
        )}

        {/* Featured project */}
        {featured && (
          <SlideUp delay={0.1} className="mb-6">
            <FeaturedProjectCard project={featured} />
          </SlideUp>
        )}

        {/* Project grid */}
        {rest.length > 0 && (
          <StaggerContainer staggerDelay={0.1} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {rest.map((project) => (
              <StaggerItem key={project._id}>
                <ProjectCard project={project} />
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}

        {/* Empty state — honest message */}
        {(!projects || projects.length === 0) && (
          <SlideUp delay={0.1}>
            <EmptyProjectsState />
          </SlideUp>
        )}

        {/* Mobile all projects link */}
        <SlideUp delay={0.2} className="mt-8 sm:hidden">
          <Link
            href="/projects"
            className="flex items-center justify-center gap-2 w-full py-4 border border-border rounded-lg text-[13px] font-semibold tracking-wide uppercase text-text-secondary hover:border-border-hover hover:text-text-primary transition-all duration-200"
          >
            All Projects <ArrowRight size={14} strokeWidth={2} />
          </Link>
        </SlideUp>

      </div>
    </section>
  );
}

// ── FEATURED PROJECT CARD ─────────────────────────────────────

function FeaturedProjectCard({ project }: { project: Project }) {
  const statusInfo = STATUS_LABELS[project.status];
  const hasImage = project.images.length > 0;

  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group block bg-bg-card border border-border rounded-lg overflow-hidden hover:border-border-hover transition-colors duration-300"
      aria-label={`View ${project.title} project`}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[380px]">

        {/* Image / placeholder */}
        <div className="lg:col-span-7 bg-bg-elevated relative overflow-hidden">
          {hasImage ? (
            <img
              src={project.images[0].url}
              alt={project.images[0].alt}
              className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
              loading="lazy"
            />
          ) : (
            <ProjectPlaceholder title={project.title} large />
          )}

          {/* FEATURED badge */}
          <span className="absolute top-4 left-4 px-3 py-1 bg-bg-card/90 backdrop-blur-sm border border-border rounded-pill font-mono text-[10px] tracking-widest uppercase text-accent">
            FEATURED
          </span>
        </div>

        {/* Content */}
        <div className="lg:col-span-5 p-8 flex flex-col justify-between">
          <div>
            {/* Meta row */}
            <div className="flex items-center gap-3 mb-6">
              <span
                className={cn(
                  "px-2.5 py-1 border rounded-pill font-mono text-[10px] tracking-widest uppercase",
                  statusInfo.color
                )}
              >
                {statusInfo.label}
              </span>
              <span className="font-mono text-mono-sm text-text-tertiary">
                {project.year}
              </span>
              <span className="font-mono text-mono-sm text-text-tertiary">
                {project.category}
              </span>
            </div>

            {/* Title */}
            <h3 className="font-display font-bold text-display-md text-text-primary tracking-tight mb-4 group-hover:text-accent transition-colors duration-300">
              {project.title}
            </h3>

            {/* Description */}
            <p className="text-body-md text-text-secondary leading-relaxed mb-6">
              {project.shortDescription}
            </p>

            {/* Tech tags */}
            <div className="flex flex-wrap gap-2">
              {project.technologies.map((tech) => (
                <span key={tech} className="tag">{tech}</span>
              ))}
            </div>
          </div>

          {/* Links */}
          <div className="flex items-center gap-4 mt-8 pt-6 border-t border-border">
            {project.githubUrl && project.githubUrl !== "#" && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1.5 text-[12px] font-medium text-text-secondary hover:text-text-primary transition-colors duration-200"
                aria-label="View GitHub repository"
              >
                <Github size={14} strokeWidth={1.5} />
                GitHub
              </a>
            )}
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1.5 text-[12px] font-medium text-text-secondary hover:text-text-primary transition-colors duration-200"
                aria-label="View live demo"
              >
                <ExternalLink size={14} strokeWidth={1.5} />
                Live
              </a>
            )}
            <span className="ml-auto flex items-center gap-1 text-[12px] font-semibold uppercase tracking-wide text-text-secondary group-hover:text-accent transition-colors duration-300">
              View Project
              <ArrowRight size={14} strokeWidth={2} className="group-hover:translate-x-1 transition-transform duration-200" />
            </span>
          </div>
        </div>

      </div>
    </Link>
  );
}

// ── PROJECT CARD (grid) ───────────────────────────────────────

function ProjectCard({ project }: { project: Project }) {
  const statusInfo = STATUS_LABELS[project.status];
  const hasImage = project.images.length > 0;

  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group block bg-bg-card border border-border rounded-lg overflow-hidden hover:border-border-hover transition-all duration-300 hover:-translate-y-1 h-full flex flex-col"
      aria-label={`View ${project.title} project`}
    >
      {/* Image */}
      <div className="aspect-video bg-bg-elevated overflow-hidden shrink-0">
        {hasImage ? (
          <img
            src={project.images[0].url}
            alt={project.images[0].alt}
            className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
            loading="lazy"
          />
        ) : (
          <ProjectPlaceholder title={project.title} />
        )}
      </div>

      <div className="p-5 flex-1 flex flex-col">
        {/* Status */}
        <div className="flex items-center gap-2 mb-3">
          <span className={cn("px-2 py-0.5 border rounded-pill font-mono text-[10px] tracking-widest uppercase", statusInfo.color)}>
            {statusInfo.label}
          </span>
          <span className="font-mono text-mono-sm text-text-tertiary">{project.year}</span>
        </div>

        {/* Title */}
        <h3 className="font-display font-semibold text-[20px] text-text-primary tracking-tight mb-2 group-hover:text-accent transition-colors duration-200">
          {project.title}
        </h3>

        <p className="text-body-sm text-text-secondary leading-relaxed mb-4 line-clamp-2">
          {project.shortDescription}
        </p>

        {/* Tech tags (max 3) */}
        <div className="flex flex-wrap gap-1.5 mt-auto pt-4 border-t border-border">
          {project.technologies.slice(0, 3).map((tech) => (
            <span key={tech} className="tag text-[10px]">{tech}</span>
          ))}
          {project.technologies.length > 3 && (
            <span className="tag text-[10px]">+{project.technologies.length - 3}</span>
          )}
        </div>
      </div>
    </Link>
  );
}

// ── PLACEHOLDER ───────────────────────────────────────────────

function ProjectPlaceholder({ title, large }: { title: string; large?: boolean }) {
  const hue = title.charCodeAt(0) * 17 % 360;

  return (
    <div
      className={cn(
        "w-full h-full flex items-end p-8",
        large ? "min-h-[280px]" : "min-h-[180px]"
      )}
      style={{
        background: `linear-gradient(135deg, hsl(${hue}, 15%, 8%) 0%, hsl(${hue}, 20%, 12%) 100%)`,
      }}
    >
      <span
        className="font-display font-bold tracking-tighter text-text-tertiary select-none"
        style={{ fontSize: large ? "clamp(40px, 5vw, 72px)" : "32px", lineHeight: "1" }}
      >
        {title.slice(0, 2).toUpperCase()}
      </span>
    </div>
  );
}

// ── EMPTY STATE ───────────────────────────────────────────────

function EmptyProjectsState() {
  return (
    <div className="py-20 text-center border border-border border-dashed rounded-lg bg-bg-card flex flex-col items-center">
      <h3 className="font-display font-bold text-heading-xl text-text-primary mb-4 uppercase">
        Projects Are Being Built.
      </h3>
      <p className="text-body-md text-text-secondary max-w-md mx-auto">
        The work will appear here as it becomes worth showing.
      </p>
    </div>
  );
}
