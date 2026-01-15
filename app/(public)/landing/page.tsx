// app/(public)/landing/page.tsx
import { LanguageMenuToggle } from "@/components";
import { ThemeToggle } from "@/components";
import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Top Nav */}
      <header className="border-b border-border-subtle bg-surface/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 lg:px-6">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 text-xl font-black text-slate-950 shadow-soft">
              F
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold tracking-tight">
                Fanara
              </span>
              <span className="text-[11px] text-muted">
                Anime & Comics Community
              </span>
            </div>
          </div>

          <hr />

          {/* Nav Links */}
          <nav className="hidden items-center gap-6 text-sm text-muted md:flex">
            <a href="#features" className="hover:text-foreground">
              Features
            </a>
            <a href="#community" className="hover:text-foreground">
              Community
            </a>
            <a href="#creators" className="hover:text-foreground">
              For Creators
            </a>
            <a href="#how-it-works" className="hover:text-foreground">
              How it works
            </a>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <LanguageMenuToggle />

            <Link
              href="/login"
              className="hidden rounded-lg border border-border-subtle bg-surface-muted px-3 py-1.5 text-sm font-medium text-foreground/80 shadow-soft hover:bg-surface md:inline-flex"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 px-3.5 py-1.5 text-sm font-semibold text-slate-950 shadow-soft hover:brightness-110"
            >
              Sign up
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section
        id="hero"
        className="section-shell border-b border-border-subtle"
      >
        <div className="mx-auto flex max-w-6xl flex-col gap-12 px-4 py-16 lg:flex-row lg:items-center lg:px-6 lg:py-20">
          {/* Left side text */}
          <div className="flex-1 space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-accent-soft bg-accent-soft px-3 py-1 text-xs font-medium text-accent">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              Built for anime & manga fans
            </span>

            <h1 className="text-balance text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
              Your home for{" "}
              <span className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 bg-clip-text text-transparent">
                anime
              </span>{" "}
              &{" "}
              <span className="bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">
                manga
              </span>{" "}
              communities.
            </h1>

            <p className="max-w-xl text-sm leading-relaxed text-muted sm:text-base">
              Discover new series, follow your favorite creators, build lists,
              discuss episodes in real time, and grow your own audience – all in
              one social platform designed especially for otaku.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/signup"
                className="rounded-lg bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 px-5 py-2.5 text-sm font-semibold text-slate-950 shadow-soft hover:brightness-110"
              >
                Get started free
              </Link>
              <Link
                href="/login"
                className="rounded-lg border border-border-subtle bg-surface px-4 py-2.5 text-sm font-medium text-foreground/90 shadow-soft hover:bg-surface-muted"
              >
                I already have an account
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-6 pt-3 text-xs text-muted sm:text-sm">
              <div>
                <span className="font-semibold text-foreground">10k+</span>{" "}
                watchlists created
              </div>
              <div>
                <span className="font-semibold text-foreground">2k+</span>{" "}
                active creators
              </div>
              <div>
                <span className="font-semibold text-foreground">No ads</span>{" "}
                during beta
              </div>
            </div>
          </div>

          {/* Right side preview card */}
          <div className="flex-1">
            <div className="card relative mx-auto max-w-md">
              <div className="mb-4 flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
              </div>

              <div className="space-y-4 text-xs">
                {/* Watch party */}
                <div className="rounded-xl bg-surface-muted/60 px-3 py-3">
                  <div className="mb-2 flex items-center justify-between text-[11px] text-muted">
                    <span>Tonight&apos;s watch party</span>
                    <span>Starts in 2h</span>
                  </div>
                  <div className="text-sm font-semibold">
                    Jujutsu Kaisen S2 – Episode 15
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2 text-[10px] text-foreground/90">
                    <span className="rounded-full bg-surface px-2 py-0.5">
                      🔥 Live chat
                    </span>
                    <span className="rounded-full bg-surface px-2 py-0.5">
                      🎧 Spoiler-safe threads
                    </span>
                    <span className="rounded-full bg-surface px-2 py-0.5">
                      👥 Friends invited
                    </span>
                  </div>
                </div>

                {/* Watchlist + Creator panel */}
                <div className="grid grid-cols-2 gap-3 text-[11px]">
                  <div className="rounded-xl bg-surface-muted/60 px-3 py-3">
                    <div className="text-[10px] uppercase tracking-wide text-muted">
                      Your watchlist
                    </div>
                    <div className="mt-2 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span>One Piece</span>
                        <span className="text-emerald-500">+1024 eps</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Demon Slayer</span>
                        <span className="text-emerald-500">+48 eps</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Attack on Titan</span>
                        <span className="text-emerald-500">Completed</span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl bg-gradient-to-br from-purple-500/18 via-surface to-surface px-3 py-3">
                    <div className="text-[10px] uppercase tracking-wide text-foreground">
                      Creator panel
                    </div>
                    <div className="mt-2 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span>Followers</span>
                        <span className="font-semibold">5,214</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Monthly views</span>
                        <span className="font-semibold">148k</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Series tracked</span>
                        <span className="font-semibold">37</span>
                      </div>
                    </div>
                    <div className="mt-3 rounded-lg bg-background/70 px-2 py-1 text-[10px]">
                      Unlock{" "}
                      <span className="font-semibold">Creator Dashboard</span>{" "}
                      as influencer, indie creator, or producer.
                    </div>
                  </div>
                </div>

                {/* Quote */}
                <div className="rounded-xl border border-border-subtle bg-surface-muted/60 px-3 py-3 text-[11px] text-muted">
                  “Finally a platform where I can talk about anime the way I
                  want – spoiler tags, episode threads, and real fans.”
                  <div className="mt-2 text-[10px]">
                    — @otaku-senpai · Beta tester
                  </div>
                </div>
              </div>
            </div>
            <p className="mt-3 text-center text-[11px] text-muted">
              UI preview only – for illustration. Your actual dashboard will be
              fully interactive inside the app.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
