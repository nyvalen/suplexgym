"use client"

import * as React from "react"
import { Dumbbell } from "lucide-react"
import { Button } from "../../button"

const stats = [
  { label: "Active members", value: "1,240" },
  { label: "Weekly classes", value: "34" },
  { label: "Certified trainers", value: "12" },
  { label: "Years open", value: "8" },
]

const services = [
  {
    image:
      "https://images.unsplash.com/photo-1534367610401-9f5ed68180aa?auto=format&w=800&q=80",
    title: "Strength training",
    description:
      "Free weights, machines, and progressive programming for every level.",
    tag: "All levels",
  },
  {
    image:
      "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&w=800&q=80",
    title: "Group classes",
    description: "HIIT, yoga, boxing and more — 34 sessions per week.",
    tag: "34 / week",
  },
  {
    image:
      "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&w=800&q=80",
    title: "Personal training",
    description: "One-on-one sessions with certified trainers.",
    tag: "By appointment",
  },
]

export default function Hero() {
  return (
    <div className="to-zinc-650 flex flex-col gap-0 bg-radial-[at_120%_30%] from-purple-600 to-65% px-4 pt-6 pb-10 md:px-6">
      {/* Main hero */}
      <section className="relative mb-3 grid min-h-[560px] grid-cols-1 overflow-hidden rounded-2xl lg:grid-cols-[1fr_1.1fr]">
        {/* Left — text */}

        <div className="to-zinc-650 relative z-10 flex flex-col justify-end bg-radial-[at_-20%_30%] from-purple-900 to-60% p-8 md:p-12">
          <div className="pointer-events-none absolute -right-2 -bottom-22 h-30 w-90 rotate-10 rounded-full dark:bg-purple-800/15" />
          <div className="pointer-events-none absolute -right-3 -bottom-18 h-30 w-90 rotate-17 rounded-full dark:bg-purple-800/15" />
          <div className="mb-6 flex items-center gap-2">
            <div className="zbg-white/10 flex h-7 w-7 items-center justify-center rounded-md">
              <Dumbbell className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="font-mono text-[11px] tracking-[0.2em] text-white/40 uppercase">
              Suplex Gym
            </span>
          </div>
          <h1 className="mb-5 text-4xl leading-[1.1] font-medium tracking-tight [text-wrap:balance] text-white md:text-5xl">
            Built for <span className="text-white/50 italic">limitless</span>{" "}
            potential.
          </h1>
          <p className="mb-8 max-w-sm text-base leading-relaxed text-white/50">
            A space defined by focus. Designed for progress. No excess, no
            distraction — only what matters.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button
              size="lg"
              className="border-0 bg-violet-500 hover:bg-white/90 dark:bg-white dark:text-zinc-950"
            >
              Join now
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-black/2 bg-black/3 hover:border-white/40 hover:bg-white/5 hover:text-white dark:border-white/20 dark:text-white/70"
            >
              View plans
            </Button>
          </div>
        </div>

        {/* Right — photo */}
        <div className="relative min-h-[300px]">
          <img
            src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&w=1200&q=85"
            alt="Gym floor with equipment"
            className="h-full w-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/60 via-transparent to-transparent lg:from-transparent" />
        </div>
      </section>

      {/* Stats strip */}
      <div className="mb-3 grid grid-cols-2 gap-3 md:grid-cols-4">
        {stats.map(({ label, value }) => (
          <div
            key={label}
            className="rounded-xl border border-black/2 bg-black/3 px-5 py-4 dark:border-white/8 dark:bg-white/4"
          >
            <p className="light: mb-1 text-xs text-black/40 dark:text-white/40">
              {label}
            </p>
            <p className="light:text-black/70 text-2xl font-medium">{value}</p>
          </div>
        ))}
      </div>

      {/* Services — photo cards */}
      <div className="mb-3">
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="text-lg font-medium text-black/80 dark:text-white">
            What we offer
          </h2>
          <span className="font-mono text-[11px] tracking-widest text-black/50 uppercase dark:text-white/30">
            Est. 2025
          </span>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {services.map(({ image, title, description, tag }) => (
            <div
              key={title}
              className="group relative overflow-hidden rounded-xl"
              style={{ height: 280 }}
            >
              <img
                src={image}
                alt={title}
                className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <div className="absolute top-4 right-4">
                <span className="rounded-full border border-white/20 bg-black/40 px-3 py-1 font-mono text-[10px] tracking-widest text-white/70 uppercase backdrop-blur-sm">
                  {tag}
                </span>
              </div>
              <div className="absolute right-0 bottom-0 left-0 p-5">
                <p className="mb-1.5 text-sm font-medium text-white">{title}</p>
                <p className="text-xs leading-relaxed text-white/60">
                  {description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Full-width atmosphere photo */}
      <div
        className="relative mb-3 overflow-hidden rounded-xl"
        style={{ height: 260 }}
      >
        <img
          src="https://images.unsplash.com/photo-1549060279-7e168fcee0c2?auto=format&w=1600&q=85"
          alt="Athlete training"
          className="h-full w-full object-cover object-[center_30%]"
        />
        <div className="absolute inset-0 bg-black/45" />
        <div className="absolute inset-0 flex items-center justify-center px-6">
          <p className="max-w-md text-center text-2xl leading-snug font-medium [text-wrap:balance] text-white md:text-3xl">
            "Strength, refined through consistency."
          </p>
        </div>
      </div>

      {/* Partner logos */}
      <div className="flex flex-wrap items-center gap-8 px-2 py-4 opacity-30">
        <img
          src="https://v3.material-tailwind.com/logo/spotify.svg"
          alt="Spotify"
          className="h-6 brightness-0 invert"
        />
        <img
          src="https://v3.material-tailwind.com/logo/coinbase.svg"
          alt="Coinbase"
          className="h-6 brightness-0 invert"
        />
        <img
          src="https://v3.material-tailwind.com/logo/netflix.svg"
          alt="Netflix"
          className="h-6 brightness-0 invert"
        />
        <img
          src="https://v3.material-tailwind.com/logo/pinterest.svg"
          alt="Pinterest"
          className="h-6 brightness-0 invert"
        />
      </div>
    </div>
  )
}
