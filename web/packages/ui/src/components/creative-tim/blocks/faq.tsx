"use client"

import * as React from "react"
import { Plus } from "lucide-react"

const faqs = [
  {
    question: "What are the opening hours?",
    answer:
      "We're open Monday–Friday 5:30 am–10 pm, Saturday 7 am–8 pm, and Sunday 8 am–6 pm. Members with 24/7 access can enter at any time using their key fob.",
  },
  {
    question: "How do I get started as a new member?",
    answer:
      "Drop in for a free tour — no appointment needed. We'll walk you through the facilities, discuss your goals, and help you choose the right membership plan. If you're ready to sign up online, the process takes under five minutes.",
  },
  {
    question: "Is there parking available?",
    answer:
      "Yes, we have a dedicated car park for members directly behind the building with 40 spaces. Overflow parking is available on the street after 6 pm on weekdays and all day on weekends.",
  },
  {
    question: "Can I freeze or cancel my membership?",
    answer:
      "Memberships can be frozen for up to 3 months per year at no charge — useful for travel or injury recovery. Cancellations require 30 days' written notice. No lock-in contracts on our standard plans.",
  },
  {
    question: "Do you offer student or concession rates?",
    answer:
      "Yes. Students with a valid ID receive 20% off any plan. Concession rates are available for over-60s and those holding a Healthcare Card. Just bring relevant ID when signing up.",
  },
  {
    question: "What equipment do you have?",
    answer:
      "Our floor has 40+ free-weight stations, a full cable system, four squat racks, a dedicated deadlift platform, and over 60 cardio machines including treadmills, rowers, and assault bikes. The studio hosts all group classes.",
  },
]

export default function Faq() {
  const [open, setOpen] = React.useState<number | null>(null)

  const toggle = (i: number) => setOpen((prev) => (prev === i ? null : i))

  return (
    <section className="px-4 pb-16 pt-4 md:px-6">
      <div className="mb-8 flex items-baseline justify-between">
        <h2 className="text-lg font-medium text-white">
          Frequently asked questions
        </h2>
        <span className="font-mono text-[11px] tracking-widest text-white/30 uppercase">
          FAQ
        </span>
      </div>

      <div className="grid grid-cols-1 gap-2 lg:grid-cols-2 lg:gap-x-6 lg:gap-y-2">
        {faqs.map(({ question, answer }, i) => {
          const isOpen = open === i
          return (
            <div
              key={question}
              className="overflow-hidden rounded-xl border border-white/8 transition-colors"
              style={{
                background: isOpen
                  ? "rgba(255,255,255,0.06)"
                  : "rgba(255,255,255,0.03)",
              }}
            >
              <button
                type="button"
                className="flex w-full items-start justify-between gap-4 px-5 py-4 text-left"
                onClick={() => toggle(i)}
              >
                <span className="text-sm font-medium leading-snug text-white">
                  {question}
                </span>
                <span
                  className="mt-0.5 shrink-0 text-white/40 transition-transform duration-300"
                  style={{ transform: isOpen ? "rotate(45deg)" : "none" }}
                >
                  <Plus className="h-4 w-4" />
                </span>
              </button>

              <div
                className="overflow-hidden transition-all duration-300 ease-in-out"
                style={{
                  maxHeight: isOpen ? "200px" : "0px",
                  opacity: isOpen ? 1 : 0,
                }}
              >
                <p className="px-5 pb-5 text-sm leading-relaxed text-white/50">
                  {answer}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
