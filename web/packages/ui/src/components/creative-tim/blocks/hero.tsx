"use client"

import * as React from "react"
import { Box, Dumbbell, Files, FileText, Menu, User } from "lucide-react"
import { Button } from "../../button"

export default function Hero() {
  return (
    <header className="flex h-full min-h-screen w-full flex-col p-4">
      <div className="absolute top-6 left-1/2 w-full -translate-x-1/2 px-4 lg:px-6">
        <div className="flex w-44 items-center gap-2 overflow-hidden rounded-md p-2 py-1 text-left font-bold ring-sidebar-ring outline-hidden transition-[width,height,padding] group-has-data-[sidebar=menu-action]/menu-item:pr-8 group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-2! focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-open:hover:bg-sidebar-accent data-open:hover:text-sidebar-accent-foreground data-active:bg-sidebar-accent data-active:font-medium data-active:text-sidebar-accent-foreground [&_svg]:size-4 [&_svg]:shrink-0 [&>span:last-child]:truncate">
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-ring text-sidebar-primary-foreground">
            <Dumbbell className="size-4" />
          </div>
          <span className="font-stretch-150 font-mono% size-6 w-44 tracking-widest text-sidebar-accent-foreground uppercase">
            Suplex Gym
          </span>
        </div>
      </div>
      <div className="grid h-full flex-grow grid-cols-1 items-center lg:grid-cols-2">
        <div className="px-0 pt-24 md:pb-12 lg:px-2 lg:py-24">
          <h1 className="mb-6 scroll-m-20 text-4xl !leading-tight font-bold tracking-tight [text-wrap:_balance] md:text-5xl lg:text-6xl">
            Built for limitless potential.
          </h1>
          <p className="mb-4 max-w-xl text-lg leading-relaxed [text-wrap:_balance] text-muted-foreground md:text-xl">
            A space defined by focus. Designed for progress. No excess. No
            distraction. Only what matters. Strength, refined through
            consistency. Potential, realized without limits.
          </p>
          <div className="flex -translate-x-2 flex-wrap items-center gap-4">
            <img
              src="https://v3.material-tailwind.com/logo/spotify.svg"
              alt="logo spotify"
              className="h-12 brightness-50 grayscale dark:brightness-90"
            />
            <img
              src="https://v3.material-tailwind.com/logo/coinbase.svg"
              alt="logo coinbase"
              className="h-12 grayscale dark:brightness-200"
            />
            <img
              src="https://v3.material-tailwind.com/logo/netflix.svg"
              alt="logo netflix"
              className="h-12 grayscale dark:brightness-200"
            />
            <img
              src="https://v3.material-tailwind.com/logo/pinterest.svg"
              alt="logo pinterest"
              className="h-12 grayscale dark:brightness-200"
            />
          </div>
        </div>
        <img
          alt="Nature landscape with mountains"
          src="https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&w=2000&q=85"
          className="h-full w-full rounded-xl object-cover shadow-xl"
        />
      </div>
    </header>
  )
}
