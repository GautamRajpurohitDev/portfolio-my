"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { SlideUp } from "@/components/motion/MotionPrimitives";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Send, CheckCircle } from "lucide-react";
import { GithubIcon as Github, LinkedinIcon as Linkedin, XSocialIcon as XIcon } from "@/components/ui/SocialIcons";
import { cn } from "@/lib/utils";

const contactSchema = z.object({
  name:    z.string().min(2, "Name must be at least 2 characters"),
  email:   z.string().email("Please enter a valid email address"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactFormData = z.infer<typeof contactSchema>;

interface ContactSectionProps {
  config?: any;
  hideHeader?: boolean;
}

export function ContactSection({ config, hideHeader = false }: ContactSectionProps) {
  const [submitted, setSubmitted] = useState(false);

  const email = config?.email || config?.identity?.email || "gautam@example.com";
  const formEnabled = config?.formEnabled ?? true;
  const availability = config?.availability || config?.identity?.availability || "Currently open to software engineering discussions and technical collaboration.";
  const successMessage = config?.successMessage || "Message sent successfully!";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ContactFormData>({ resolver: zodResolver(contactSchema) });

  const onSubmit = async (data: ContactFormData) => {
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      await fetch(`${apiBase}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).catch(() => null);
    } catch {
      // Graceful fallback
    }
    setSubmitted(true);
    reset();
  };

  return (
    <section
      className={hideHeader ? "py-16 sm:py-20 md:py-24 bg-bg" : "section border-t border-border bg-bg"}
      id="contact"
      aria-labelledby="contact-heading"
    >
      <div className="container">
        
        {/* Header */}
        {!hideHeader && (
          <SlideUp>
            <span className="label-meta block mb-4 text-accent">07 / Contact</span>
          </SlideUp>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start">
          
          {/* Left: Heading & Info */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div>
              <SlideUp delay={0.05}>
                <h2
                  id="contact-heading"
                  className="font-display font-bold text-display-md leading-[0.95] tracking-tighter text-text-primary mb-6 uppercase"
                  style={{ fontSize: "clamp(36px, 5vw, 68px)" }}
                >
                  Let's Build<br />Something.
                </h2>
              </SlideUp>
              <SlideUp delay={0.1}>
                <p className="text-[16px] sm:text-[17px] text-text-secondary leading-relaxed mb-8 font-body">
                  {availability}
                </p>
              </SlideUp>

              <SlideUp delay={0.15}>
                <div className="mb-10 pb-8 border-b border-border">
                  <span className="font-mono text-[11px] uppercase tracking-widest text-text-tertiary block mb-2">
                    Direct Email
                  </span>
                  <a
                    href={`mailto:${email}`}
                    className="font-display font-bold text-2xl sm:text-3xl text-text-primary hover:text-accent transition-colors block"
                  >
                    {email}
                  </a>
                </div>
              </SlideUp>

              <SlideUp delay={0.2}>
                <span className="font-mono text-[11px] uppercase tracking-widest text-text-tertiary block mb-4">
                  Public Channels
                </span>
                <div className="flex flex-col divide-y divide-border/60">
                  <a
                    href="https://github.com/GautamRajpurohitDev"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-3 flex items-center justify-between text-text-secondary hover:text-text-primary transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <Github className="w-4 h-4 text-text-tertiary group-hover:text-text-primary transition-colors" />
                      <span className="text-[14px] font-medium">GitHub</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-text-tertiary group-hover:text-accent group-hover:translate-x-1 transition-all" />
                  </a>

                  <a
                    href="https://linkedin.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-3 flex items-center justify-between text-text-secondary hover:text-text-primary transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <Linkedin className="w-4 h-4 text-text-tertiary group-hover:text-text-primary transition-colors" />
                      <span className="text-[14px] font-medium">LinkedIn</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-text-tertiary group-hover:text-accent group-hover:translate-x-1 transition-all" />
                  </a>

                  <a
                    href="https://x.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-3 flex items-center justify-between text-text-secondary hover:text-text-primary transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <XIcon className="w-4 h-4 text-text-tertiary group-hover:text-text-primary transition-colors" />
                      <span className="text-[14px] font-medium">X (Twitter)</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-text-tertiary group-hover:text-accent group-hover:translate-x-1 transition-all" />
                  </a>
                </div>
              </SlideUp>
            </div>
          </div>

          {/* Right: Clean Lightweight Contact Form */}
          {formEnabled && (
            <div className="lg:col-span-7">
              <SlideUp delay={0.25}>
                <AnimatePresence mode="wait">
                  {submitted ? (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-10 border border-border rounded-2xl text-center py-20 flex flex-col items-center justify-center bg-bg-card"
                    >
                      <CheckCircle className="w-12 h-12 text-success mb-4" />
                      <h3 className="font-display font-bold text-2xl text-text-primary mb-2">
                        {successMessage}
                      </h3>
                      <p className="text-[14px] text-text-secondary mb-6">
                        Thank you for reaching out. I will get back to you shortly.
                      </p>
                      <button
                        onClick={() => setSubmitted(false)}
                        className="text-[13px] font-mono uppercase tracking-widest text-accent hover:underline cursor-pointer"
                      >
                        Send another message →
                      </button>
                    </motion.div>
                  ) : (
                    <motion.form
                      key="form"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      onSubmit={handleSubmit(onSubmit)}
                      className="space-y-6"
                      noValidate
                    >
                      <div className="space-y-2">
                        <label htmlFor="name" className="block font-mono text-[11px] uppercase tracking-widest text-text-secondary font-medium">
                          Name
                        </label>
                        <input
                          id="name"
                          {...register("name")}
                          className={cn(
                            "w-full h-12 bg-bg-elevated border px-4 rounded-xl text-text-primary text-[14px] placeholder:text-text-tertiary outline-none transition-colors shadow-xs",
                            errors.name
                              ? "border-error focus:border-error"
                              : "border-border focus:border-accent"
                          )}
                          placeholder="Your name"
                        />
                        {errors.name && <p className="text-error text-xs mt-1">{errors.name.message}</p>}
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="email" className="block font-mono text-[11px] uppercase tracking-widest text-text-secondary font-medium">
                          Email
                        </label>
                        <input
                          id="email"
                          type="email"
                          {...register("email")}
                          className={cn(
                            "w-full h-12 bg-bg-elevated border px-4 rounded-xl text-text-primary text-[14px] placeholder:text-text-tertiary outline-none transition-colors shadow-xs",
                            errors.email
                              ? "border-error focus:border-error"
                              : "border-border focus:border-accent"
                          )}
                          placeholder="your.email@example.com"
                        />
                        {errors.email && <p className="text-error text-xs mt-1">{errors.email.message}</p>}
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="message" className="block font-mono text-[11px] uppercase tracking-widest text-text-secondary font-medium">
                          Message
                        </label>
                        <textarea
                          id="message"
                          {...register("message")}
                          rows={6}
                          className={cn(
                            "w-full bg-bg-elevated border p-4 rounded-xl text-text-primary text-[14px] placeholder:text-text-tertiary outline-none transition-colors resize-none shadow-xs",
                            errors.message
                              ? "border-error focus:border-error"
                              : "border-border focus:border-accent"
                          )}
                          placeholder="What would you like to discuss?"
                        />
                        {errors.message && <p className="text-error text-xs mt-1">{errors.message.message}</p>}
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="inline-flex items-center justify-center gap-2 px-8 h-12 bg-accent text-[#171717] font-semibold font-display text-[14px] uppercase tracking-wider rounded-xl hover:bg-accent/90 transition-all disabled:opacity-50 cursor-pointer active:scale-98 shadow-xs"
                      >
                        {isSubmitting ? "Sending..." : "Send Message →"}
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
