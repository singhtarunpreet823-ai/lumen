"use client";

import { motion, type Variants } from "framer-motion";

export function Section({
  id,
  eyebrow,
  title,
  subtitle,
  children,
  className = "",
}: {
  id?: string;
  eyebrow?: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={`relative mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 lg:py-28 ${className}`}>
      <div className="mx-auto mb-12 max-w-2xl text-center lg:mb-16">
        {eyebrow && (
          <Reveal>
            <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
              {eyebrow}
            </span>
          </Reveal>
        )}
        <Reveal delay={0.05}>
          <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl lg:text-[2.75rem] lg:leading-[1.15]">
            {title}
          </h2>
        </Reveal>
        {subtitle && (
          <Reveal delay={0.1}>
            <p className="mt-4 text-base leading-relaxed text-muted">{subtitle}</p>
          </Reveal>
        )}
      </div>
      {children}
    </section>
  );
}

const revealVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
};

export function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
      variants={revealVariants}
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function BentoCard({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Reveal className={className}>
      <div className="glass group relative h-full overflow-hidden rounded-3xl p-6 transition-all duration-300 hover:border-primary/25 hover:shadow-glass lg:p-7">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-primary/10 blur-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        />
        {children}
      </div>
    </Reveal>
  );
}