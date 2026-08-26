"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { SlideUp } from "@/components/motion/MotionPrimitives";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, ArrowRight, Send, CheckCircle, Copy, Check } from "lucide-react";
import { GithubIcon as Github, LinkedinIcon as Linkedin, XSocialIcon as XIcon } from "@/components/ui/SocialIcons";
import { cn } from "@/lib/utils";

const contactSchema = z.object({
  name:    z.string().min(2, "Name must be at least 2 characters"),
  email:   z.string().email("Please enter a valid email address"),
  message: z.string().min(20, "Message must be at least 20 characters"),
});

type ContactFormData = z.infer<typeof contactSchema>;

interface ContactSectionProps {
  config?: any;
  hideHeader?: boolean;
}

export function ContactSection({ config, hideHeader = false }: ContactSectionProps) {
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);

  // Fallback defaults if config is undefined
  const email = config?.email || config?.identity?.email || "hello@example.com";
  const formEnabled = config?.formEnabled ?? true;
  const availability = config?.availability || config?.identity?.availability || "Currently open to new opportunities.";
  const successMessage = config?.successMessage || "Message sent successfully!";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ContactFormData>({ resolver: zodResolver(contactSchema) });

  const onSubmit = async (data: ContactFormData) => {
    // Will connect to backend API in Phase 6
    await new Promise((r) => setTimeout(r, 1000));
    console.log("Contact form submission:", data);
    setSubmitted(true);
    reset();
  };

  const handleCopyEmail = async () => {
    await navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section
      className={hideHeader ? "py-12 md:py-16 bg-bg-alt" : "section border-t border-border bg-bg-alt"}
      id="contact"
      aria-labelledby="contact-heading"
    >
      <div className="container">
        
        {/* Header */}
        {!hideHeader && (
          <SlideUp>
            <span className="label-meta block mb-4">11 / Contact</span>
          </SlideUp>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-20">
          
          {/* Left: Heading & Info */}
          <div className="lg:col-span-6 flex flex-col justify-between">
            <div>
              <SlideUp delay={0.05}>
                <h2
                  id="contact-heading"
                  className="font-display font-bold text-display-md leading-tight tracking-tighter text-text-primary mb-6"
                >
                  LET'S BUILD SOMETHING
                </h2>
              </SlideUp>
              <SlideUp delay={0.1}>
                <p className="text-body-lg text-text-secondary leading-relaxed max-w-md mb-12">
                  {availability}
                </p>
              </SlideUp>

              <SlideUp delay={0.15}>
                <a
                  href={`mailto:${email}`}
                  className="font-display font-bold text-[clamp(24px,4vw,40px)] text-text-primary hover:text-accent transition-colors leading-none tracking-tight block mb-12"
                >
                  {email}
                </a>
              </SlideUp>

              <SlideUp delay={0.2}>
                <p className="text-body-sm text-text-secondary mb-4 uppercase tracking-widest font-semibold">
                  Find me on
                </p>
                <div className="flex flex-col gap-1">
                  {config?.socials?.github?.enabled && config?.socials?.github?.url && (
                    <a
                      href={config.socials.github.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center justify-between p-4 rounded-xl border border-transparent hover:border-border hover:bg-bg-card transition-all duration-300"
                    >
                      <div className="flex items-center gap-3">
                        <span className="p-2.5 bg-bg-card border border-border rounded-lg group-hover:bg-bg group-hover:border-border-muted transition-colors">
                          <Github className="w-4 h-4 text-text-secondary group-hover:text-text-primary" />
                        </span>
                        <span className="font-medium text-text-primary">GitHub</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-text-tertiary group-hover:text-text-primary -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300" />
                    </a>
                  )}
                  {config?.socials?.linkedin?.enabled && config?.socials?.linkedin?.url && (
                    <a
                      href={config.socials.linkedin.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center justify-between p-4 rounded-xl border border-transparent hover:border-border hover:bg-bg-card transition-all duration-300"
                    >
                      <div className="flex items-center gap-3">
                        <span className="p-2.5 bg-bg-card border border-border rounded-lg group-hover:bg-bg group-hover:border-border-muted transition-colors">
                          <Linkedin className="w-4 h-4 text-text-secondary group-hover:text-text-primary" />
                        </span>
                        <span className="font-medium text-text-primary">LinkedIn</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-text-tertiary group-hover:text-text-primary -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300" />
                    </a>
                  )}
                  {config?.socials?.x?.enabled && config?.socials?.x?.url && (
                    <a
                      href={config.socials.x.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center justify-between p-4 rounded-xl border border-transparent hover:border-border hover:bg-bg-card transition-all duration-300"
                    >
                      <div className="flex items-center gap-3">
                        <span className="p-2.5 bg-bg-card border border-border rounded-lg group-hover:bg-bg group-hover:border-border-muted transition-colors">
                          <XIcon className="w-4 h-4 text-text-secondary group-hover:text-text-primary" />
                        </span>
                        <span className="font-medium text-text-primary">X (Twitter)</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-text-tertiary group-hover:text-text-primary -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300" />
                    </a>
                  )}
                </div>
              </SlideUp>
            </div>
          </div>

          {/* Right: Contact Form */}
          {formEnabled && (
            <div className="lg:col-span-6 flex flex-col justify-center">
              <SlideUp delay={0.25}>
                <AnimatePresence mode="wait">
                  {submitted ? (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex flex-col items-center justify-center text-center p-12 bg-bg border border-border rounded-2xl h-[500px]"
                    >
                      <CheckCircle className="w-16 h-16 text-success mb-6" />
                      <h3 className="font-display font-bold text-heading-xl text-text-primary mb-3">
                        {successMessage}
                      </h3>
                      <button
                        onClick={() => setSubmitted(false)}
                        className="text-text-secondary hover:text-text-primary transition-colors mt-8 underline decoration-border hover:decoration-text-primary underline-offset-4"
                      >
                        Send another message
                      </button>
                    </motion.div>
                  ) : (
                    <motion.form
                      key="form"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      onSubmit={handleSubmit(onSubmit)}
                      className="bg-bg border border-border p-8 md:p-10 rounded-2xl space-y-6"
                      noValidate
                    >
                      <div className="space-y-2">
                        <label htmlFor="name" className="text-[13px] font-semibold tracking-wide uppercase text-text-secondary">
                          Name
                        </label>
                        <input
                          id="name"
                          {...register("name")}
                          className={cn(
                            "w-full bg-bg-alt border px-4 py-3.5 rounded-xl text-text-primary placeholder:text-text-muted outline-none transition-all duration-200",
                            errors.name
                              ? "border-error focus:border-error focus:ring-1 focus:ring-error"
                              : "border-border focus:border-accent focus:ring-1 focus:ring-accent/50"
                          )}
                          placeholder="John Doe"
                        />
                        {errors.name && <p className="text-error text-xs font-medium mt-1.5">{errors.name.message}</p>}
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="email" className="text-[13px] font-semibold tracking-wide uppercase text-text-secondary">
                          Email
                        </label>
                        <input
                          id="email"
                          type="email"
                          {...register("email")}
                          className={cn(
                            "w-full bg-bg-alt border px-4 py-3.5 rounded-xl text-text-primary placeholder:text-text-muted outline-none transition-all duration-200",
                            errors.email
                              ? "border-error focus:border-error focus:ring-1 focus:ring-error"
                              : "border-border focus:border-accent focus:ring-1 focus:ring-accent/50"
                          )}
                          placeholder="john@example.com"
                        />
                        {errors.email && <p className="text-error text-xs font-medium mt-1.5">{errors.email.message}</p>}
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="message" className="text-[13px] font-semibold tracking-wide uppercase text-text-secondary">
                          Message
                        </label>
                        <textarea
                          id="message"
                          {...register("message")}
                          rows={4}
                          className={cn(
                            "w-full bg-bg-alt border px-4 py-3.5 rounded-xl text-text-primary placeholder:text-text-muted outline-none transition-all duration-200 resize-none",
                            errors.message
                              ? "border-error focus:border-error focus:ring-1 focus:ring-error"
                              : "border-border focus:border-accent focus:ring-1 focus:ring-accent/50"
                          )}
                          placeholder="How can we help?"
                        />
                        {errors.message && <p className="text-error text-xs font-medium mt-1.5">{errors.message.message}</p>}
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full h-14 flex items-center justify-center gap-2 bg-text-primary text-bg font-semibold rounded-xl hover:bg-accent hover:text-text-primary transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
                      >
                        {isSubmitting ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                            className="w-5 h-5 border-2 border-bg/30 border-t-bg rounded-full"
                          />
                        ) : (
                          <>
                            Send Message
                            <Send className="w-4 h-4 ml-1" />
                          </>
                        )}
                      </button>
                    </motion.form>
                  )}
                </AnimatePresence>
              </SlideUp>
            </div>
          )}

        </div>
      </div>
    </section>
  );
}
