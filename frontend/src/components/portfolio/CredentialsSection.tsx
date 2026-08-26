"use client";

import { SlideUp, StaggerContainer, StaggerItem } from "@/components/motion/MotionPrimitives";
import { Award, ExternalLink } from "lucide-react";

interface Certificate {
  _id: string;
  title: string;
  issuer: string;
  date?: string;
  credentialUrl?: string;
  imageUrl?: string;
  featured: boolean;
  published: boolean;
}

interface CredentialsSectionProps {
  certificates?: Certificate[];
}

export function CredentialsSection({ certificates = [] }: CredentialsSectionProps) {
  const published = certificates.filter((c) => c.published);

  // Hide entire section if no real certs exist
  if (published.length === 0) return null;

  const featured = published.filter((c) => c.featured).slice(0, 4);
  const shown = featured.length > 0 ? featured : published.slice(0, 4);

  return (
    <section
      className="section border-t border-border bg-bg-alt"
      id="credentials"
      aria-labelledby="credentials-heading"
    >
      <div className="container">

        <SlideUp>
          <span className="label-meta block mb-4">09 / Credentials</span>
          <h2
            id="credentials-heading"
            className="font-display font-bold tracking-tighter text-text-primary uppercase mb-16"
            style={{ fontSize: "clamp(36px, 5vw, 72px)" }}
          >
            Certificates & Milestones
          </h2>
        </SlideUp>

        <StaggerContainer
          staggerDelay={0.1}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {shown.map((cert) => (
            <StaggerItem key={cert._id}>
              <CertificateCard cert={cert} />
            </StaggerItem>
          ))}
        </StaggerContainer>

      </div>
    </section>
  );
}

function CertificateCard({ cert }: { cert: Certificate }) {
  const inner = (
    <div className="group h-full bg-bg-card border border-border rounded-xl p-6 flex flex-col hover:border-border-hover transition-all duration-300 hover:-translate-y-0.5 card-hover-glow">
      {/* Icon/Image */}
      <div className="mb-4">
        {cert.imageUrl ? (
          <img
            src={cert.imageUrl}
            alt={cert.title}
            className="w-12 h-12 object-contain rounded-lg"
            loading="lazy"
          />
        ) : (
          <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
            <Award size={20} strokeWidth={1.5} className="text-accent" />
          </div>
        )}
      </div>

      {/* Content */}
      <h3 className="font-display font-semibold text-[16px] text-text-primary tracking-tight mb-1 flex-1 group-hover:text-accent transition-colors duration-200">
        {cert.title}
      </h3>
      <p className="font-mono text-[11px] tracking-widest uppercase text-text-secondary mb-2">
        {cert.issuer}
      </p>
      {cert.date && (
        <p className="font-mono text-[11px] text-text-tertiary">
          {new Date(cert.date).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
        </p>
      )}

      {/* Link indicator */}
      {cert.credentialUrl && (
        <div className="mt-4 pt-4 border-t border-border flex items-center gap-1.5 text-[11px] font-semibold tracking-widest uppercase text-text-tertiary group-hover:text-accent transition-colors duration-200">
          <ExternalLink size={10} strokeWidth={2} />
          Verify
        </div>
      )}
    </div>
  );

  if (cert.credentialUrl) {
    return (
      <a
        href={cert.credentialUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`View certificate: ${cert.title}`}
      >
        {inner}
      </a>
    );
  }

  return <div>{inner}</div>;
}
