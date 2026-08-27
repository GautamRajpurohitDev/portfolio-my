"use client";

import { SlideUp } from "@/components/motion/MotionPrimitives";
import { ArrowRight, ExternalLink } from "lucide-react";
import { GithubIcon as Github } from "@/components/ui/SocialIcons";
import Link from "next/link";
import { cn } from "@/lib/utils";

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
  const publishedProjects = projects.filter((p) => (p as any).published !== false);

  return (
    <section
      className={hideHeader ? "py-16 sm:py-20 md:py-24 bg-bg" : "section border-t border-border bg-bg"}
      id="projects"
      aria-labelledby="projects-heading"
    >
      <div className="container">

        {/* Header */}
        {!hideHeader && (
          <SlideUp>
            <div className="flex items-end justify-between mb-14 pb-4 border-b border-border">
              <div>
                <span className="label-meta block mb-3 text-accent">04 / Selected Projects</span>
                <h2
                  id="projects-heading"
                  className="font-display font-bold tracking-tighter text-text-primary uppercase"
                  style={{ fontSize: "clamp(32px, 4.5vw, 64px)" }}
                >
                  Applied Engineering.
                </h2>
              </div>
              <Link
                href="/projects"
                className="hidden sm:flex items-center gap-2 text-[12px] font-mono font-semibold tracking-widest uppercase text-text-secondary hover:text-accent transition-colors duration-200"
              >
                All Projects <ArrowRight size={13} strokeWidth={2} />
              </Link>
            </div>
          </SlideUp>
        )}

        {/* Project Content: Intelligent Responsive Composition */}
        {publishedProjects.length === 1 ? (
          <SlideUp delay={0.05}>
            <SingleProjectEditorialCard project={publishedProjects[0]} />
          </SlideUp>
        ) : publishedProjects.length === 2 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10">
            {publishedProjects.map((project, idx) => (
              <SlideUp key={project._id} delay={0.05 * idx}>
                <ProjectCard project={project} />
              </SlideUp>
            ))}
          </div>
        ) : publishedProjects.length > 2 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
            {publishedProjects.map((project, idx) => (
              <SlideUp key={project._id} delay={0.05 * idx}>
                <ProjectCard project={project} />
              </SlideUp>
            ))}
          </div>
        ) : (
          <SlideUp delay={0.1}>
            <div className="py-20 border border-border rounded-2xl text-center bg-bg-card p-8">
              <span className="font-mono text-xs uppercase tracking-widest text-text-tertiary block mb-2">
                WORK IN DEVELOPMENT
              </span>
              <h3 className="font-display font-bold text-2xl text-text-primary mb-3 uppercase">
                Projects Are Being Built.
              </h3>
              <p className="text-[15px] text-text-secondary max-w-md mx-auto leading-relaxed">
                Software systems are only published here when they are functional, verified, and complete from first principles.
              </p>
            </div>
          </SlideUp>
        )}

        {/* Mobile all projects link */}
        {!hideHeader && publishedProjects.length > 0 && (
          <SlideUp delay={0.2} className="mt-12 sm:hidden">
            <Link
              href="/projects"
              className="flex items-center justify-center gap-2 w-full py-3.5 border border-border rounded-xl text-[12px] font-mono font-semibold tracking-widest uppercase text-text-secondary hover:text-text-primary"
            >
              All Projects <ArrowRight size={13} strokeWidth={2} />
            </Link>
          </SlideUp>
        )}

      </div>
    </section>
  );
}

function ProjectCard({ project }: { project: Project }) {
  const hasImage = project.images && project.images.length > 0;
  const statusLabel = project.status === "in-progress" ? "IN PROGRESS" : project.status.toUpperCase();

  return (
    <div className="flex flex-col bg-bg-card border border-border rounded-2xl overflow-hidden hover:border-border-hover transition-colors h-full">
      {/* Image / Cover */}
      <div className="aspect-[16/10] bg-bg-elevated overflow-hidden relative">
        {hasImage ? (
          <img
            src={project.images[0].url}
            alt={project.images[0].alt || project.title}
            className="w-full h-full object-cover hover:scale-102 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-bg-elevated p-8">
            <span className="font-display font-bold text-4xl text-text-tertiary/40 uppercase tracking-tighter">
              {project.title.slice(0, 3)}
            </span>
          </div>
        )}
        <div className="absolute top-3 right-3 font-mono text-[10px] tracking-widest uppercase text-text-tertiary bg-bg/90 px-2.5 py-1 rounded border border-border">
          {statusLabel}
        </div>
      </div>

      {/* Body */}
      <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 mb-3 text-[11px] font-mono text-text-tertiary">
            <span>{project.category || "Software"}</span>
            <span>{project.year || "2026"}</span>
          </div>

          <h3 className="font-display font-bold text-xl sm:text-2xl text-text-primary tracking-tight mb-3">
            {project.title}
          </h3>

          <p className="text-[14.5px] text-text-secondary leading-relaxed mb-6 line-clamp-3 font-body">
            {project.shortDescription}
          </p>

          {/* Tech stack */}
          {project.technologies && project.technologies.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {project.technologies.map((tech) => (
                <span
                  key={tech}
                  className="font-mono text-[10.5px] text-text-secondary bg-white/[0.03] border border-border px-2.5 py-0.5 rounded"
                >
                  {tech}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Footer Links */}
        <div className="pt-4 sm:pt-5 border-t border-border flex items-center justify-between text-[12px] font-mono">
          <div className="flex items-center gap-3">
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-secondary hover:text-text-primary flex items-center gap-1.5 transition-colors"
              >
                <Github className="w-3.5 h-3.5" />
                Code
              </a>
            )}
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-secondary hover:text-text-primary flex items-center gap-1.5 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Demo
              </a>
            )}
          </div>

          <Link
            href={`/projects/${project.slug}`}
            className="text-accent hover:underline inline-flex items-center gap-1"
          >
            Overview →
          </Link>
        </div>
      </div>
    </div>
  );
}
