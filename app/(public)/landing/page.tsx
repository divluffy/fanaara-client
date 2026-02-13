// app/(public)/landing/page.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
} from "framer-motion";

import ThemeToggle from "@/components/ThemeToggle";
import LanguageMenuToggle from "@/components/LanguageMenuToggle";
import { useSupportedLocales } from "@/hooks/use-supported-locales";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

const EASE_OUT = [0.16, 1, 0.3, 1] as const;
const VIEWPORT_ONCE = { once: true, amount: 0.22 };

/**
 * v3 ✅ Real Anime images from AlphaCoders (direct image CDN)
 * NOTE: configure next.config.js remotePatterns for images*.alphacoders.com
 */
const ASSETS = {
  heroCity: "https://images5.alphacoders.com/783/thumb-1920-783208.jpg",
  heroCity2: "https://images4.alphacoders.com/993/thumb-1920-993395.jpg",
  mangaShelf: "https://images3.alphacoders.com/850/thumb-1920-850633.jpg",
  comicsPile: "https://images7.alphacoders.com/895/thumb-1920-895992.jpg",
  mangaPanel: "https://images3.alphacoders.com/137/thumb-1920-1376355.jpg",
  cosplayRed: "https://images.alphacoders.com/136/thumb-1920-1361663.png",
  cosplayBlue: "https://images5.alphacoders.com/799/thumb-1920-799379.jpg",
  bookshop: "https://images8.alphacoders.com/106/thumb-1920-1068123.jpg",
  demonSlayer: "https://images7.alphacoders.com/136/thumb-1920-1363137.png",
};

type LocaleKey = "ar" | "en";

const COPY: Record<LocaleKey, any> = {
  ar: {
    brandLine:
      "منصة اجتماعية للأنمي • المانجا • القصص المصوّرة — بيئة إسلامية محترمة",
    nav: [
      { label: "المنصة", href: "#platform" },
      { label: "عالم المحتوى", href: "#universe" },
      { label: "البيئة الإسلامية", href: "#values" },
      { label: "كيف تشتغل", href: "#how" },
      { label: "المزايا", href: "#features" },
      { label: "خارطة الطريق", href: "#roadmap" },
      { label: "الأسئلة", href: "#faq" },
    ],
    auth: {
      login: "تسجيل الدخول",
      signup: "إنشاء حساب",
      waitlist: "انضم للـ Waitlist",
    },
    hero: {
      title1: "Fanaara",
      title2: "مجتمع الأنمي والمانجا والقصص المصوّرة… لكن بشكل محترم",
      rotatePrefix: "مجتمع",
      rotateWords: ["الأنمي", "المانجا", "القصص المصوّرة", "المانهوا", "الويب تون"],
      rotateSuffix: "— بشكل محترم",
      title3: "بيئة إسلامية: بدون محتوى خادش + قوانين واضحة",
      desc: "فنّارة منصة اجتماعية متخصصة للأنمي/المانجا/القصص المصوّرة والويب تون: Feed ذكي، Rooms منظمة، صفحات محتوى قابلة للأرشفة (SEO)، مراجعات بدون حرق، برنامج صنّاع… مع موديريشن قوي يحافظ على بيئة محترمة.",
      ctaPrimary: "انضم للـ Waitlist",
      ctaSecondary: "استكشف المنصة",
      ctaGhost: "تسجيل الدخول",
      comingSoon: "App (iOS/Android) — قريباً",
      bullets: [
        "Anime • Manga • Manhwa • Comic Books • Webtoons • Reviews • Articles",
        "Profiles • Follows • Posts • Comments • Reactions",
        "Spoiler-safe Reviews + Templates",
        "Islamic-friendly environment (No NSFW + clear rules)",
      ],
      notice: {
        title: "تنبيه مهم: مجتمع ببيئة إسلامية محترمة",
        desc: "نرحّب بالجميع—لكن نلتزم بخط أحمر واضح: بدون محتوى خادش/مخل، بدون تحرش/تنمّر، وبدون سبام. الهدف: مجتمع راقٍ للمتعة والنقاش.",
        points: ["فلترة + سياسات", "أدوات بلاغات", "حماية من السبام", "ضبط الحرق"],
      },
    },
    sections: {
      highlightsTitle: "نظرة سريعة",
      highlightsDesc: "الزبدة في ثواني: أهم نقاط فنّارة قبل ما ندخل بالتفاصيل.",
      platformTitle: "اللي يميّز فنّارة",
      platformDesc:
        "مش Social عام… فنّارة معمولة للأنمي والقصص المصوّرة: discovery + community + content hub + creators — كله مترابط.",
      universeTitle: "عالم المحتوى داخل فنّارة",
      universeDesc:
        "مو بس منشورات. عندك صفحات محتوى + نقاشات + قوائم + مراجعات + مقالات — كل شيء مرتبط بنفس العمل والـ fandom.",
      valuesTitle: "بيئة إسلامية محترمة + مجتمع آمن",
      valuesDesc:
        "فنّارة تركز على مجتمع راقٍ مناسب للعوائل والشباب: بدون محتوى خادش، وبدون إساءة. مع أدوات قوية للمشرفين وسياسات واضحة.",
      howTitle: "كيف تبدأ خلال دقائق؟",
      howDesc:
        "اختصر الطريق: افتح حساب → اختر اهتماماتك → ادخل Rooms → شارك بدون حرق وبأسلوب محترم.",
      featuresTitle: "Bento Features",
      featuresDesc: "كل كرت = ميزة حقيقية داخل المنصة (مش كلام تسويق).",
      roadmapTitle: "Roadmap قريباً",
      roadmapDesc: "إطلاق تدريجي + ميزات قوية + تطبيق موبايل قريباً.",
      faqTitle: "أسئلة شائعة",
      ctaTitle: "جاهز تبدأ؟",
      ctaDesc:
        "إبدأ الآن بـ Waitlist (واجهة فقط) — بعدين نربطها بـ Auth + Onboarding + API.",
    },
  },

  en: {
    brandLine:
      "Built for Anime • Manga • Comic Books — Islamic-friendly community",
    nav: [
      { label: "Platform", href: "#platform" },
      { label: "Universe", href: "#universe" },
      { label: "Values", href: "#values" },
      { label: "How it works", href: "#how" },
      { label: "Features", href: "#features" },
      { label: "Roadmap", href: "#roadmap" },
      { label: "FAQ", href: "#faq" },
    ],
    auth: { login: "Login", signup: "Sign up", waitlist: "Join Waitlist" },
    hero: {
      title1: "Fanaara",
      title2: "Anime, manga & comic books community—done right",
      rotatePrefix: "Your home for",
      rotateWords: ["Anime", "Manga", "Comic Books", "Manhwa", "Webtoons"],
      rotateSuffix: "fans",
      title3: "Islamic-friendly: No NSFW + clear community rules",
      desc: "A focused social platform for anime/manga/comic books & webtoons: smarter feed, structured rooms, SEO-ready content pages, spoiler-safe reviews, creator program—and strong moderation to keep it respectful.",
      ctaPrimary: "Join Waitlist",
      ctaSecondary: "Explore Platform",
      ctaGhost: "Login",
      comingSoon: "Mobile app (iOS/Android) — Coming soon",
      bullets: [
        "Anime • Manga • Manhwa • Comic Books • Webtoons • Reviews • Articles",
        "Profiles • Follows • Posts • Comments • Reactions",
        "Spoiler-safe Reviews + Templates",
        "Islamic-friendly environment (No NSFW + clear rules)",
      ],
      notice: {
        title: "Notice: Islamic-friendly & respectful community",
        desc: "Everyone is welcome—but we enforce clear boundaries: no NSFW/explicit content, no harassment, no spam. Goal: a clean, enjoyable space for discussion.",
        points: ["Filters + rules", "Reports tooling", "Anti-spam", "Spoiler control"],
      },
    },
    sections: {
      highlightsTitle: "At a glance",
      highlightsDesc: "The key highlights in seconds—before the details.",
      platformTitle: "What makes Fanaara different",
      platformDesc:
        "Not a generic social network. Built specifically for anime & comic books: discovery + community + content hub + creators—connected.",
      universeTitle: "Your content universe",
      universeDesc:
        "Not just posts. You get pages, discussions, lists, reviews, and articles—all linked to the same work & fandom.",
      valuesTitle: "Islamic-friendly values + safety",
      valuesDesc:
        "We’re building a clean, respectful environment suitable for families and youth: no NSFW, no harassment—with clear policy and strong moderation tooling.",
      howTitle: "Start in minutes",
      howDesc:
        "Simple flow: create an account → choose interests → join rooms → post spoiler-safe, stay respectful.",
      featuresTitle: "Bento Features",
      featuresDesc: "Each card is a real product feature—not marketing fluff.",
      roadmapTitle: "Roadmap",
      roadmapDesc: "Gradual launch, strong features, and mobile apps soon.",
      faqTitle: "FAQ",
      ctaTitle: "Ready to join?",
      ctaDesc:
        "Start with the waitlist (UI-only) — then wire it to Auth + Onboarding + API.",
    },
  },
};

type Tone = "brand" | "purple" | "pink" | "lime" | "cyan" | "warning";

type BentoItem = {
  title: string;
  desc: string;
  icon: string;
  tone: Tone;
};

type LabItem = {
  key: string;
  title: string;
  desc: string;
  bullets: string[];
  image: string;
  tone: Tone;
};

type UniverseItem = {
  title: string;
  desc: string;
  icon: string;
  image: string;
  tone: Tone;
};

type ValueItem = {
  title: string;
  desc: string;
  icon: string;
  tone: Tone;
};

type HowStep = {
  title: string;
  desc: string;
  icon: string;
  tone: Tone;
};

export default function Page() {
  const reduceMotion = useReducedMotion();

  const { activeLocale } = useSupportedLocales();
  const localeCode = (activeLocale?.code === "en" ? "en" : "ar") as LocaleKey;
  const T = COPY[localeCode];

  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Sticky navbar: top 1rem + subtle “scrolled” shadow change
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);
  useMotionValueEvent(scrollY, "change", (v) => {
    const next = v > 16;
    setIsScrolled((prev) => (prev === next ? prev : next));
  });

  const tBase = useMemo(
    () =>
      reduceMotion
        ? { duration: 0 }
        : { duration: 0.65, ease: EASE_OUT },
    [reduceMotion],
  );

  const tFast = useMemo(
    () =>
      reduceMotion
        ? { duration: 0 }
        : { duration: 0.35, ease: EASE_OUT },
    [reduceMotion],
  );

  const heroTitleVariants = useMemo(
    () => ({
      hidden: {},
      show: {
        transition: reduceMotion
          ? { duration: 0 }
          : { staggerChildren: 0.08, delayChildren: 0.06 },
      },
    }),
    [reduceMotion],
  );

  const heroLineVariants = useMemo(
    () => ({
      hidden: reduceMotion
        ? { opacity: 1, y: 0, filter: "blur(0px)" }
        : { opacity: 0, y: 14, filter: "blur(6px)" },
      show: reduceMotion
        ? { opacity: 1, y: 0, filter: "blur(0px)" }
        : {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            transition: { duration: 0.55, ease: EASE_OUT },
          },
    }),
    [reduceMotion],
  );

  const bento: BentoItem[] = [
    {
      title: localeCode === "ar" ? "Community Feed" : "Community Feed",
      desc:
        localeCode === "ar"
          ? "تغذية مبنية على الذوق + إشارات جودة بدل الضجيج."
          : "Taste-based feed with quality signals (not noise).",
      icon: "✦",
      tone: "brand",
    },
    {
      title: localeCode === "ar" ? "Rooms & Topics" : "Rooms & Topics",
      desc:
        localeCode === "ar"
          ? "غرف منظمة حسب الأنواع والاهتمامات + إدارة واضحة."
          : "Structured rooms by genres & interests with real controls.",
      icon: "⌂",
      tone: "cyan",
    },
    {
      title:
        localeCode === "ar"
          ? "Content Pages (SEO+)"
          : "Content Pages (SEO+)",
      desc:
        localeCode === "ar"
          ? "صفحات Anime/Manga/Comic Books قابلة للأرشفة + روابط داخلية."
          : "Indexable pages with clean internal linking.",
      icon: "◎",
      tone: "lime",
    },
    {
      title: localeCode === "ar" ? "Reviews & Articles" : "Reviews & Articles",
      desc:
        localeCode === "ar"
          ? "قوالب مراجعات بدون حرق + مقالات طويلة منظمة."
          : "Spoiler-safe reviews + long-form articles done right.",
      icon: "✎",
      tone: "purple",
    },
    {
      title: localeCode === "ar" ? "Creator Program" : "Creator Program",
      desc:
        localeCode === "ar"
          ? "Missions + Badges + Spotlight + Insights."
          : "Missions, badges, spotlight, and creator insights.",
      icon: "⚡",
      tone: "pink",
    },
    {
      title:
        localeCode === "ar" ? "Moderation & Safety" : "Moderation & Safety",
      desc:
        localeCode === "ar"
          ? "Anti-spam + بلاغات + سياسات مجتمع واضحة."
          : "Anti-spam + reports + clear community policy.",
      icon: "⛨",
      tone: "warning",
    },
  ];

  const universe: UniverseItem[] = [
    {
      title: localeCode === "ar" ? "Anime" : "Anime",
      desc:
        localeCode === "ar"
          ? "صفحات أعمال، حلقات، شخصيات، تقييمات ومتابعة."
          : "Work pages, episodes, characters, ratings & follow.",
      icon: "🎬",
      image: ASSETS.heroCity2,
      tone: "brand",
    },
    {
      title: localeCode === "ar" ? "Manga" : "Manga",
      desc:
        localeCode === "ar"
          ? "فصول، مراجعات بدون حرق، قوائم قراءة."
          : "Chapters, spoiler-safe reviews, reading lists.",
      icon: "📖",
      image: ASSETS.mangaPanel,
      tone: "lime",
    },
    {
      title: localeCode === "ar" ? "القصص المصوّرة" : "Comic Books",
      desc:
        localeCode === "ar"
          ? "نقاشات مرتبة + توصيات حسب ذوقك."
          : "Structured discussions + taste-based recommendations.",
      icon: "🗯️",
      image: ASSETS.comicsPile,
      tone: "cyan",
    },
    {
      title: localeCode === "ar" ? "Webtoons" : "Webtoons",
      desc:
        localeCode === "ar"
          ? "تصنيفات + Rooms حسب النوع + متابعة."
          : "Genres, rooms, and tracking.",
      icon: "📱",
      image: ASSETS.bookshop,
      tone: "purple",
    },
    {
      title: localeCode === "ar" ? "Reviews" : "Reviews",
      desc:
        localeCode === "ar"
          ? "قوالب منظمة + منع الحرق."
          : "Structured templates + spoiler control.",
      icon: "⭐",
      image: ASSETS.mangaShelf,
      tone: "pink",
    },
    {
      title: localeCode === "ar" ? "Creators" : "Creators",
      desc:
        localeCode === "ar"
          ? "مهام + شارات + إبراز + مكافآت."
          : "Missions, badges, spotlight & rewards.",
      icon: "🧩",
      image: ASSETS.cosplayRed,
      tone: "warning",
    },
  ];

  const values: ValueItem[] = [
    {
      title:
        localeCode === "ar"
          ? "بيئة إسلامية محترمة"
          : "Islamic-friendly boundaries",
      desc:
        localeCode === "ar"
          ? "بدون محتوى خادش/مخل، وفلترة واضحة."
          : "No NSFW/explicit content, with clear filtering.",
      icon: "🕌",
      tone: "brand",
    },
    {
      title: localeCode === "ar" ? "ضد التنمّر" : "Anti-harassment",
      desc:
        localeCode === "ar"
          ? "سياسات صارمة ضد الإساءة والتحرش."
          : "Strict policy against harassment and abuse.",
      icon: "🛡️",
      tone: "cyan",
    },
    {
      title: localeCode === "ar" ? "مكافحة السبام" : "Anti-spam",
      desc:
        localeCode === "ar"
          ? "تقليل الضجيج + منع الروابط المزعجة."
          : "Noise reduction + link/spam protection.",
      icon: "🚫",
      tone: "warning",
    },
    {
      title: localeCode === "ar" ? "احترام الحرق" : "Spoiler-safe by design",
      desc:
        localeCode === "ar"
          ? "قوالب + تحذيرات + إخفاء الحرق."
          : "Templates, warnings, and spoiler hiding.",
      icon: "🫧",
      tone: "purple",
    },
  ];

  const how: HowStep[] = [
    {
      title: localeCode === "ar" ? "1) أنشئ حساب" : "1) Create account",
      desc:
        localeCode === "ar"
          ? "اختيار اسم + اهتماماتك الأساسية."
          : "Pick a handle and core interests.",
      icon: "👤",
      tone: "brand",
    },
    {
      title: localeCode === "ar" ? "2) اختر Rooms" : "2) Choose rooms",
      desc:
        localeCode === "ar"
          ? "Shonen / Seinen / Isekai / قصص مصوّرة…"
          : "Shonen / Seinen / Isekai / Comic Books…",
      icon: "🧭",
      tone: "cyan",
    },
    {
      title: localeCode === "ar" ? "3) شارك بدون حرق" : "3) Post spoiler-safe",
      desc:
        localeCode === "ar"
          ? "منشورات + تعليقات + مراجعات بقوالب."
          : "Posts, comments, and template-based reviews.",
      icon: "✍️",
      tone: "purple",
    },
    {
      title: localeCode === "ar" ? "4) تابع وابدع" : "4) Follow & create",
      desc:
        localeCode === "ar"
          ? "قوائم + حفظ + شارات + Spotlight."
          : "Lists, saves, badges, and spotlight.",
      icon: "⚡",
      tone: "pink",
    },
  ];

  const labItems: LabItem[] = [
    {
      key: "feed",
      title: localeCode === "ar" ? "الـ Feed الذكي" : "Smart Feed",
      desc:
        localeCode === "ar"
          ? "اكتشاف حسب الذوق مع تقليل التكرار والضجيج."
          : "Taste-based discovery with less repetition and noise.",
      bullets:
        localeCode === "ar"
          ? ["ترشيحات واضحة", "مواضيع أسبوعية", "قوائم متابعة", "فلترة + إشارات جودة"]
          : ["Clear recommendations", "Weekly topics", "Following lists", "Quality signals"],
      image: ASSETS.heroCity,
      tone: "brand",
    },
    {
      key: "content",
      title: localeCode === "ar" ? "صفحات الأعمال" : "Work Pages",
      desc:
        localeCode === "ar"
          ? "عمل → شخصيات → حلقات/فصول → مراجعات → نقاشات… SEO-ready."
          : "Work → characters → episodes/chapters → reviews → discussions.",
      bullets:
        localeCode === "ar"
          ? ["روابط داخلية قوية", "Schema-ready", "بحث سريع", "حفظ ومتابعة"]
          : ["Strong internal links", "Schema-ready", "Fast search", "Save & follow"],
      image: ASSETS.mangaPanel,
      tone: "lime",
    },
    {
      key: "reviews",
      title: localeCode === "ar" ? "مراجعات بدون حرق" : "Spoiler-safe Reviews",
      desc:
        localeCode === "ar"
          ? "قالب مراجعة سريع + تقييم + تحذير حرق."
          : "Fast review template, rating, spoiler controls.",
      bullets:
        localeCode === "ar"
          ? ["قوالب جاهزة", "إخفاء الحرق", "تقييمات المجتمع", "أرشفة"]
          : ["Templates", "Spoiler hiding", "Community ratings", "Archiving"],
      image: ASSETS.comicsPile,
      tone: "purple",
    },
    {
      key: "creator",
      title: localeCode === "ar" ? "Creator Dashboard" : "Creator Dashboard",
      desc:
        localeCode === "ar"
          ? "مهام أسبوعية + Insights + إبراز + مكافآت."
          : "Weekly missions, insights, spotlight, and rewards.",
      bullets:
        localeCode === "ar"
          ? ["Missions", "Badges", "Insights", "Spotlight"]
          : ["Missions", "Badges", "Insights", "Spotlight"],
      image: ASSETS.cosplayRed,
      tone: "pink",
    },
    {
      key: "moderation",
      title: localeCode === "ar" ? "Moderation Center" : "Moderation Center",
      desc:
        localeCode === "ar"
          ? "قواعد مجتمع + بلاغات + Anti-spam + ضبط المحتوى."
          : "Community rules, reports, anti-spam, and content control.",
      bullets:
        localeCode === "ar"
          ? ["قواعد واضحة", "إجراءات تدريجية", "تنبيهات", "حماية من السبام"]
          : ["Clear rules", "Graduated actions", "Alerts", "Anti-spam"],
      image: ASSETS.bookshop,
      tone: "warning",
    },
  ];

  const [activeLab, setActiveLab] = useState<LabItem>(labItems[0]);

  // keep activeLab in-sync when locale changes (labItems recreated)
  useEffect(() => {
    setActiveLab(labItems[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localeCode]);

  return (
    <div
      dir={localeCode === "ar" ? "rtl" : "ltr"}
      className="min-h-screen bg-background text-foreground"
    >
      {/* ===================== Global Background ===================== */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div
          className="absolute inset-0 opacity-[0.18]"
          style={{
            backgroundImage:
              "linear-gradient(to right, color-mix(in srgb, var(--color-border-strong) 18%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in srgb, var(--color-border-strong) 18%, transparent) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        <div
          className="absolute -top-40 left-1/2 h-[520px] w-[920px] -translate-x-1/2 rounded-full blur-3xl opacity-60 animate-aurora-lite"
          style={{ backgroundImage: "var(--gradient-brand-soft)" }}
        />
        <div
          className="absolute -bottom-52 left-1/2 h-[520px] w-[920px] -translate-x-1/2 rounded-full blur-3xl opacity-40 animate-aurora-lite"
          style={{ backgroundImage: "var(--gradient-info-soft)" }}
        />

        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(1200px 700px at 50% 0%, transparent 40%, var(--bg-page) 100%)",
          }}
        />
      </div>

      {/* ===================== Header ===================== */}
      <header className="sticky top-4 z-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div
            className={cn(
              "rounded-3xl border bg-nav/75 backdrop-blur-xl transition-all",
              "border-nav-border",
              isScrolled
                ? "shadow-[var(--shadow-glass-strong)]"
                : "shadow-[var(--shadow-glass)]",
            )}
          >
            <div className="flex h-16 items-center justify-between px-3 sm:px-4">
              <Link href="/landing" className="flex items-center gap-3">
                <div
                  className={cn(
                    "grid h-11 w-11 place-items-center rounded-2xl border",
                    "border-border-subtle bg-surface/70 shadow-soft",
                  )}
                >
                  <span className="text-lg font-black tracking-tight text-foreground-strong">
                    ف
                  </span>
                </div>

                <div className="leading-tight">
                  <div className="font-black tracking-tight text-foreground-strong">
                    Fanaara
                  </div>
                  <div className="text-[11px] text-foreground-muted">
                    {T.brandLine}
                  </div>
                </div>
              </Link>

              <nav className="hidden items-center gap-6 lg:flex">
                {T.nav.map((item: any) => (
                  <a
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "group relative text-sm font-semibold text-foreground-muted transition",
                      "hover:text-foreground-strong",
                    )}
                  >
                    <span>{item.label}</span>
                    <span
                      className={cn(
                        "absolute -bottom-2 left-0 h-[2px] w-full scale-x-0 rounded-full transition",
                        "bg-accent group-hover:scale-x-100",
                      )}
                    />
                  </a>
                ))}
              </nav>

              <div className="flex items-center gap-2">
                <div className="hidden items-center gap-2 md:flex">
                  <Link
                    href="/login"
                    className={cn(
                      "inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold",
                      "border border-border-subtle bg-surface/60",
                      "text-foreground-strong transition",
                      "hover:bg-surface",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                    )}
                  >
                    {T.auth.login}
                  </Link>

                  <Link
                    href="/signup"
                    className={cn(
                      "inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-black",
                      "bg-accent text-accent-foreground shadow-[var(--shadow-glow-brand)]",
                      "transition hover:bg-accent-strong",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                    )}
                  >
                    {T.auth.signup}
                  </Link>

                  <a
                    href="#cta"
                    className={cn(
                      "inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-black",
                      "bg-surface/70 border border-border-subtle",
                      "text-foreground-strong transition hover:bg-surface",
                    )}
                  >
                    {T.auth.waitlist}
                  </a>
                </div>

                <div className="hidden sm:flex items-center gap-2">
                  <LanguageMenuToggle />
                  <ThemeToggle />
                </div>

                <button
                  type="button"
                  onClick={() => setMobileNavOpen(true)}
                  className={cn(
                    "md:hidden inline-flex h-11 w-11 items-center justify-center rounded-2xl",
                    "border border-border-subtle bg-surface/60",
                    "text-foreground-strong transition hover:bg-surface",
                  )}
                  aria-label="Open menu"
                >
                  ☰
                </button>
              </div>
            </div>
          </div>
        </div>

        <MobileNav
          open={mobileNavOpen}
          onClose={() => setMobileNavOpen(false)}
          nav={T.nav}
          auth={T.auth}
          locale={localeCode}
        />
      </header>

      <main>
        {/* ===================== HERO (Simple + Modern) ===================== */}
        <section className="pt-6 sm:pt-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div
              className={cn(
                "relative overflow-hidden rounded-[36px] border",
                "border-border-subtle bg-card/70 shadow-[var(--shadow-glass-strong)]",
              )}
            >
              <div className="relative h-[520px] sm:h-[580px]">
                <motion.div
                  initial={{ opacity: 0, scale: 1.02 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={tBase}
                  className="absolute inset-0"
                >
                  <Image
                    src={ASSETS.heroCity}
                    alt="Anime city night wallpaper"
                    fill
                    priority
                    sizes="(max-width: 768px) 100vw, 1400px"
                    className="object-cover"
                  />
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(to top, var(--bg-page) 14%, rgba(0,0,0,0) 62%), radial-gradient(900px 520px at 20% 10%, color-mix(in srgb, var(--color-accent) 22%, transparent), transparent 60%), radial-gradient(900px 520px at 90% 20%, color-mix(in srgb, var(--color-extra-purple) 16%, transparent), transparent 62%)",
                    }}
                  />
                </motion.div>

                <div className="hidden lg:block">
                  <SakuraLayer reduceMotion={reduceMotion} />
                </div>

                <div className="relative flex h-full items-center">
                  <div className="w-full p-6 sm:p-10 lg:p-12">
                    <motion.div
                      variants={heroTitleVariants}
                      initial="hidden"
                      animate="show"
                      className="max-w-3xl"
                    >
                      <motion.div variants={heroLineVariants}>
                        <div
                          className={cn(
                            "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold",
                            "border-border-subtle bg-surface/70 text-foreground-strong",
                          )}
                        >
                          <span className="inline-block h-2 w-2 rounded-full bg-accent shadow-[var(--shadow-glow-brand)]" />
                          {T.brandLine}
                        </div>
                      </motion.div>

                      <motion.h1
                        variants={heroLineVariants}
                        className="mt-5 font-black tracking-tight text-foreground-strong text-[clamp(2.6rem,6vw,4.6rem)] leading-[1.02]"
                      >
                        {T.hero.title1}
                      </motion.h1>

                      {/* Rotating words */}
                      <motion.div
                        variants={heroLineVariants}
                        className="mt-3 font-black tracking-tight text-foreground text-[clamp(1.35rem,3.7vw,2.7rem)] leading-[1.12]"
                      >
                        <span className="me-2 opacity-90">{T.hero.rotatePrefix}</span>

                        <span
                          className="inline-flex rounded-2xl border px-3 py-1.5 bg-glass/70 backdrop-blur"
                          style={{
                            borderColor:
                              "color-mix(in srgb, var(--color-border-strong) 35%, transparent)",
                          }}
                        >
                          <span
                            className="text-transparent bg-clip-text"
                            style={{ backgroundImage: "var(--gradient-brand-soft)" }}
                          >
                            <RotatingWords words={T.hero.rotateWords} intervalMs={2100} />
                          </span>
                        </span>

                        <span className="ms-2 opacity-90">{T.hero.rotateSuffix}</span>
                      </motion.div>

                      <motion.div
                        variants={heroLineVariants}
                        className={cn(
                          "mt-4 inline-flex rounded-2xl border px-4 py-2",
                          "border-border-subtle bg-glass/70 backdrop-blur",
                        )}
                      >
                        <span
                          className="text-sm font-black text-transparent bg-clip-text"
                          style={{ backgroundImage: "var(--gradient-brand-soft)" }}
                        >
                          {T.hero.title3}
                        </span>
                      </motion.div>

                      <motion.p
                        variants={heroLineVariants}
                        className="mt-4 max-w-2xl text-sm leading-relaxed text-foreground-muted sm:text-base"
                      >
                        {T.hero.desc}
                      </motion.p>

                      <motion.div
                        variants={heroLineVariants}
                        className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center"
                      >
                        <a
                          href="#cta"
                          className={cn(
                            "inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-black",
                            "bg-accent text-accent-foreground shadow-[var(--shadow-glow-brand)]",
                            "transition hover:bg-accent-strong",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                          )}
                        >
                          {T.hero.ctaPrimary} <span className="ms-2">↗</span>
                        </a>

                        <a
                          href="#platform"
                          className={cn(
                            "inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-black",
                            "border border-border-subtle bg-surface/70 text-foreground-strong",
                            "transition hover:bg-surface",
                          )}
                        >
                          {T.hero.ctaSecondary}
                        </a>

                        <Link
                          href="/login"
                          className={cn(
                            "inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold",
                            "bg-transparent text-foreground-strong",
                            "transition hover:bg-surface/50",
                          )}
                        >
                          {T.hero.ctaGhost}
                        </Link>
                      </motion.div>
                    </motion.div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===================== HIGHLIGHTS (Clear new section) ===================== */}
        <section id="highlights" className="scroll-mt-32 py-14 sm:py-20">
          <Container>
            <Reveal>
              <SectionHead
                title={T.sections.highlightsTitle}
                desc={T.sections.highlightsDesc}
              />
            </Reveal>

            <div className="mt-10 grid gap-6 lg:grid-cols-12 lg:items-start">
              <Reveal className="lg:col-span-7" delay={0.02}>
                <div className="space-y-4">
                  <NoticeCard
                    title={T.hero.notice.title}
                    desc={T.hero.notice.desc}
                    points={T.hero.notice.points}
                  />

                  <div className="grid gap-2 sm:grid-cols-2">
                    {T.hero.bullets.map((b: string, i: number) => (
                      <Reveal key={b} delay={0.06 + i * 0.04}>
                        <div
                          className={cn(
                            "rounded-2xl border px-4 py-3 text-xs sm:text-sm",
                            "border-border-subtle bg-glass/70 backdrop-blur",
                            "text-foreground",
                          )}
                        >
                          {b}
                        </div>
                      </Reveal>
                    ))}
                  </div>

                  <div className="inline-flex items-center gap-2 rounded-full border border-border-subtle bg-surface/60 px-4 py-2 text-xs font-bold text-foreground-strong">
                    <span className="text-[10px] opacity-70">●</span>
                    {T.hero.comingSoon}
                  </div>
                </div>
              </Reveal>

              <div className="lg:col-span-5">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                  {[
                    {
                      title: localeCode === "ar" ? "Rooms منظمة" : "Structured Rooms",
                      desc:
                        localeCode === "ar"
                          ? "Shonen / Isekai / Seinen / قصص مصوّرة…"
                          : "Shonen / Isekai / Seinen / Comic Books…",
                      tone: "cyan" as const,
                    },
                    {
                      title: localeCode === "ar" ? "Spoiler-safe" : "Spoiler-safe",
                      desc:
                        localeCode === "ar"
                          ? "مراجعات بدون حرق + إخفاء"
                          : "Reviews + spoiler hiding",
                      tone: "purple" as const,
                    },
                    {
                      title: localeCode === "ar" ? "SEO Content Hub" : "SEO Content Hub",
                      desc:
                        localeCode === "ar"
                          ? "صفحات قابلة للأرشفة + نمو بحث"
                          : "Indexable pages + search growth",
                      tone: "lime" as const,
                    },
                    {
                      title: localeCode === "ar" ? "بيئة محترمة" : "Respectful environment",
                      desc:
                        localeCode === "ar"
                          ? "بدون محتوى خادش + سياسات واضحة"
                          : "No NSFW + clear rules",
                      tone: "warning" as const,
                    },
                  ].map((c, i) => (
                    <Reveal key={c.title} delay={0.05 + i * 0.06}>
                      <FloatingCard title={c.title} desc={c.desc} tone={c.tone} />
                    </Reveal>
                  ))}
                </div>
              </div>
            </div>
          </Container>
        </section>

        {/* ===================== PLATFORM ===================== */}
        <section id="platform" className="scroll-mt-32 py-14 sm:py-20">
          <Container>
            <Reveal>
              <SectionHead title={T.sections.platformTitle} desc={T.sections.platformDesc} />
            </Reveal>

            <div className="mt-10 grid gap-6 lg:grid-cols-12">
              <Reveal className="lg:col-span-5" delay={0.03}>
                <Glass className="relative overflow-hidden p-6 sm:p-8">
                  <div className="absolute inset-0 opacity-35">
                    <Image
                      src={ASSETS.mangaShelf}
                      alt="Manga room wallpaper"
                      fill
                      sizes="(max-width: 768px) 100vw, 900px"
                      className="object-cover"
                    />
                  </div>
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(to top, var(--bg-page) 10%, color-mix(in srgb, var(--color-surface) 70%, transparent) 55%, transparent 85%)",
                    }}
                  />
                  <div className="relative">
                    <Badge tone="brand">{localeCode === "ar" ? "Fanaara DNA" : "Fanaara DNA"}</Badge>
                    <h3 className="mt-4 text-2xl font-black tracking-tight text-foreground-strong sm:text-3xl">
                      {localeCode === "ar"
                        ? "منصة مبنية على: مجتمع + محتوى + صنّاع"
                        : "Built around: Community + Content + Creators"}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-foreground-muted sm:text-base">
                      {localeCode === "ar"
                        ? "نفس المستخدم داخل نفس التجربة: يتابع، يناقش، يراجع، ينشئ محتوى… ببيئة محترمة."
                        : "One cohesive experience: follow, discuss, review, create… in a respectful environment."}
                    </p>

                    <div className="mt-6 grid gap-3 sm:grid-cols-2">
                      <MiniStat k={localeCode === "ar" ? "Rooms" : "Rooms"} v={localeCode === "ar" ? "منظمة" : "Structured"} />
                      <MiniStat k="SEO" v={localeCode === "ar" ? "جاهز" : "Ready"} />
                      <MiniStat k={localeCode === "ar" ? "Creators" : "Creators"} v={localeCode === "ar" ? "برنامج" : "Program"} />
                      <MiniStat k={localeCode === "ar" ? "Safety" : "Safety"} v={localeCode === "ar" ? "سياسات" : "Policy"} />
                    </div>
                  </div>
                </Glass>
              </Reveal>

              <div className="lg:col-span-7">
                <div className="grid gap-4 sm:grid-cols-2">
                  {bento.map((x, i) => (
                    <Reveal key={x.title} delay={0.06 + i * 0.05}>
                      <BentoCard item={x} />
                    </Reveal>
                  ))}
                </div>
              </div>
            </div>
          </Container>
        </section>

        {/* ===================== UNIVERSE ===================== */}
        <section id="universe" className="scroll-mt-32 py-14 sm:py-20">
          <Container>
            <Reveal>
              <SectionHead title={T.sections.universeTitle} desc={T.sections.universeDesc} />
            </Reveal>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {universe.map((u, i) => (
                <Reveal key={u.title} delay={0.04 + i * 0.05}>
                  <UniverseCard item={u} />
                </Reveal>
              ))}
            </div>
          </Container>
        </section>

        {/* ===================== VALUES ===================== */}
        <section id="values" className="scroll-mt-32 py-14 sm:py-20">
          <Container>
            <Reveal>
              <SectionHead title={T.sections.valuesTitle} desc={T.sections.valuesDesc} />
            </Reveal>

            <div className="mt-10 grid gap-6 lg:grid-cols-12 lg:items-stretch">
              <Reveal className="lg:col-span-5" delay={0.03}>
                <Glass className="relative overflow-hidden p-6 sm:p-8">
                  <div className="absolute inset-0 opacity-30">
                    <Image
                      src={ASSETS.cosplayBlue}
                      alt="Anime library wallpaper"
                      fill
                      sizes="(max-width: 768px) 100vw, 900px"
                      className="object-cover"
                    />
                  </div>
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(to top, var(--bg-page) 10%, color-mix(in srgb, var(--color-surface) 72%, transparent) 58%, transparent 86%)",
                    }}
                  />
                  <div className="relative">
                    <Badge tone="warning">
                      {localeCode === "ar" ? "Community Rules" : "Community Rules"}
                    </Badge>

                    <h3 className="mt-4 text-2xl font-black tracking-tight text-foreground-strong sm:text-3xl">
                      {localeCode === "ar"
                        ? "هدفنا: متعة + نقاش… بدون ابتذال"
                        : "Goal: fun + discussion… without toxicity"}
                    </h3>

                    <p className="mt-3 text-sm leading-relaxed text-foreground-muted sm:text-base">
                      {localeCode === "ar"
                        ? "نحافظ على بيئة إسلامية محترمة: نمنع المحتوى الخادش والإساءة والسبام. مع أدوات بلاغات وفلترة وموديريشن فعّال."
                        : "We enforce an Islamic-friendly, respectful environment: no explicit content, no harassment, no spam—backed by reports, filters, and moderation tooling."}
                    </p>

                    <div className="mt-6 grid gap-3">
                      <RulePill tone="brand" title="No NSFW" desc={localeCode === "ar" ? "محتوى نظيف" : "Clean content"} />
                      <RulePill tone="cyan" title={localeCode === "ar" ? "No harassment" : "No harassment"} desc={localeCode === "ar" ? "احترام الجميع" : "Respect everyone"} />
                      <RulePill tone="purple" title={localeCode === "ar" ? "Spoiler control" : "Spoiler control"} desc={localeCode === "ar" ? "بدون حرق" : "Spoiler-safe"} />
                      <RulePill tone="warning" title={localeCode === "ar" ? "Anti-spam" : "Anti-spam"} desc={localeCode === "ar" ? "ضجيج أقل" : "Less noise"} />
                    </div>
                  </div>
                </Glass>
              </Reveal>

              <div className="lg:col-span-7">
                <div className="grid gap-4 sm:grid-cols-2">
                  {values.map((v, i) => (
                    <Reveal key={v.title} delay={0.05 + i * 0.05}>
                      <ValueCard item={v} />
                    </Reveal>
                  ))}
                </div>
              </div>
            </div>
          </Container>
        </section>

        {/* ===================== HOW ===================== */}
        <section id="how" className="scroll-mt-32 py-14 sm:py-20">
          <Container>
            <Reveal>
              <SectionHead title={T.sections.howTitle} desc={T.sections.howDesc} />
            </Reveal>

            <div className="mt-10 grid gap-4 lg:grid-cols-4">
              {how.map((s, i) => (
                <Reveal key={s.title} delay={0.05 + i * 0.05}>
                  <HowCard item={s} />
                </Reveal>
              ))}
            </div>

            <Reveal delay={0.08} className="mt-8 flex justify-center">
              <a
                href="#cta"
                className={cn(
                  "inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-black",
                  "bg-accent text-accent-foreground shadow-[var(--shadow-glow-brand)]",
                  "transition hover:bg-accent-strong",
                )}
              >
                {T.auth.waitlist} <span className="ms-2">↗</span>
              </a>
            </Reveal>
          </Container>
        </section>

        {/* ===================== FEATURES ===================== */}
        <section id="features" className="scroll-mt-32 py-14 sm:py-20">
          <Container>
            <Reveal>
              <SectionHead title={T.sections.featuresTitle} desc={T.sections.featuresDesc} />
            </Reveal>

            <div className="mt-10 grid gap-6 lg:grid-cols-12">
              <Reveal className="lg:col-span-7" delay={0.03}>
                <Glass className="overflow-hidden p-0">
                  <div className="relative h-[420px] sm:h-[520px]">
                    <Image
                      src={ASSETS.comicsPile}
                      alt="Library wallpaper"
                      fill
                      sizes="(max-width: 768px) 100vw, 1100px"
                      className="object-cover"
                    />
                    <div
                      className="absolute inset-0"
                      style={{
                        background:
                          "linear-gradient(to top, var(--bg-page) 12%, rgba(0,0,0,0) 70%), radial-gradient(700px 450px at 20% 20%, color-mix(in srgb, var(--color-accent) 22%, transparent), transparent 60%)",
                      }}
                    />
                    <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <FeatureChip
                          title={localeCode === "ar" ? "Posts & Reactions" : "Posts & Reactions"}
                          desc={localeCode === "ar" ? "تفاعل سريع + Meaningful" : "Fast + meaningful"}
                        />
                        <FeatureChip
                          title={localeCode === "ar" ? "Lists" : "Lists"}
                          desc={localeCode === "ar" ? "Watch/Read lists" : "Watch/Read lists"}
                        />
                        <FeatureChip
                          title={localeCode === "ar" ? "Reviews" : "Reviews"}
                          desc={localeCode === "ar" ? "قوالب بدون حرق" : "Spoiler-safe"}
                        />
                        <FeatureChip
                          title={localeCode === "ar" ? "Safety" : "Safety"}
                          desc={localeCode === "ar" ? "بيئة محترمة" : "Respectful environment"}
                        />
                      </div>
                    </div>
                  </div>
                </Glass>
              </Reveal>

              <div className="lg:col-span-5">
                <div className="grid gap-4">
                  {[
                    {
                      image: ASSETS.mangaPanel,
                      title: localeCode === "ar" ? "مراجعات وتحليلات" : "Reviews & analysis",
                      desc:
                        localeCode === "ar"
                          ? "من القصير للسريع… إلى المقالات الطويلة."
                          : "From quick reviews to long-form articles.",
                      tone: "purple" as const,
                    },
                    {
                      image: ASSETS.cosplayRed,
                      title: localeCode === "ar" ? "Creator Spotlight" : "Creator Spotlight",
                      desc:
                        localeCode === "ar"
                          ? "مساحة إبراز للصنّاع والمؤثرين + مكافآت."
                          : "Spotlight and rewards for creators.",
                      tone: "pink" as const,
                    },
                    {
                      image: ASSETS.heroCity2,
                      title: localeCode === "ar" ? "Discovery" : "Discovery",
                      desc:
                        localeCode === "ar"
                          ? "اقتراحات حسب الذوق — بدون ضياع."
                          : "Taste-based discovery without noise.",
                      tone: "brand" as const,
                    },
                  ].map((c, i) => (
                    <Reveal key={c.title} delay={0.05 + i * 0.06}>
                      <ImageSideCard image={c.image} title={c.title} desc={c.desc} tone={c.tone} />
                    </Reveal>
                  ))}
                </div>
              </div>
            </div>
          </Container>
        </section>

        {/* ===================== LAB ===================== */}
        <section id="lab" className="scroll-mt-32 py-14 sm:py-20">
          <Container>
            <Reveal>
              <SectionHead
                title={localeCode === "ar" ? "Feature Lab" : "Feature Lab"}
                desc={
                  localeCode === "ar"
                    ? "معاينة سريعة (صور أنمي مؤقتة) — لاحقاً استبدلها بسكرينشوتات حقيقية من تصميم فنّارة."
                    : "Quick preview (anime placeholders) — later replace with real Fanaara screenshots."
                }
              />
            </Reveal>

            <div className="mt-10 grid gap-6 lg:grid-cols-12 lg:items-stretch">
              <Reveal className="lg:col-span-5" delay={0.03}>
                <Glass className="p-4 sm:p-6">
                  <div className="flex flex-wrap gap-2">
                    {labItems.map((it) => {
                      const active = it.key === activeLab.key;
                      return (
                        <button
                          key={it.key}
                          type="button"
                          onClick={() => setActiveLab(it)}
                          className={cn(
                            "rounded-full px-4 py-2 text-xs font-black transition",
                            "border",
                            active
                              ? "border-accent-border bg-accent text-accent-foreground shadow-[var(--shadow-glow-brand)]"
                              : "border-border-subtle bg-surface/60 text-foreground-strong hover:bg-surface",
                          )}
                        >
                          {it.title}
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-6">
                    <Badge tone={activeLab.tone}>{localeCode === "ar" ? "Preview" : "Preview"}</Badge>
                    <h3 className="mt-3 text-2xl font-black tracking-tight text-foreground-strong">
                      {activeLab.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-foreground-muted">
                      {activeLab.desc}
                    </p>

                    <ul className="mt-5 space-y-3">
                      {activeLab.bullets.map((b) => (
                        <li key={b} className="flex items-start gap-3">
                          <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-accent/15 text-accent">
                            ✓
                          </span>
                          <span className="text-sm text-foreground">{b}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                      <Link
                        href="/signup"
                        className={cn(
                          "inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-black",
                          "bg-accent text-accent-foreground transition hover:bg-accent-strong",
                        )}
                      >
                        {T.auth.signup} <span className="ms-2">↗</span>
                      </Link>
                      <Link
                        href="/login"
                        className={cn(
                          "inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold",
                          "border border-border-subtle bg-surface/60 text-foreground-strong transition hover:bg-surface",
                        )}
                      >
                        {T.auth.login}
                      </Link>
                    </div>
                  </div>
                </Glass>
              </Reveal>

              <Reveal className="lg:col-span-7" delay={0.06}>
                <Glass className="p-5 sm:p-7">
                  <div className="grid gap-5 lg:grid-cols-12 lg:items-center">
                    <div className="lg:col-span-6">
                      <div className="text-sm font-black text-foreground-strong">
                        {localeCode === "ar" ? "Concept Preview" : "Concept Preview"}
                      </div>
                      <div className="mt-1 text-xs text-foreground-muted">
                        {localeCode === "ar"
                          ? "الهدف: عرض إحساس بصري عام. استبدلها لاحقاً بسكرينشوتات حقيقية."
                          : "Purpose: show the vibe. Replace later with real screenshots."}
                      </div>

                      <div className="mt-6 grid gap-3">
                        <RoadmapPill
                          tone="brand"
                          title={localeCode === "ar" ? "Web أولاً (SEO)" : "Web-first (SEO)"}
                          desc={localeCode === "ar" ? "مقالات + صفحات محتوى" : "Pages + articles"}
                        />
                        <RoadmapPill
                          tone="cyan"
                          title={localeCode === "ar" ? "Communities" : "Communities"}
                          desc={localeCode === "ar" ? "Rooms منظمة" : "Structured rooms"}
                        />
                        <RoadmapPill
                          tone="warning"
                          title={localeCode === "ar" ? "Safety" : "Safety"}
                          desc={localeCode === "ar" ? "بيئة إسلامية محترمة" : "Islamic-friendly rules"}
                        />
                      </div>
                    </div>

                    <div className="lg:col-span-6">
                      <PhoneFrame>
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={activeLab.key}
                            initial={{ opacity: 0, y: 10, scale: 0.99 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.99 }}
                            transition={tFast}
                            className="absolute inset-0"
                          >
                            <Image
                              src={activeLab.image}
                              alt="Preview image"
                              fill
                              sizes="(max-width: 768px) 80vw, 520px"
                              className="object-cover"
                            />
                            <div
                              className="absolute inset-0"
                              style={{
                                background:
                                  "linear-gradient(to top, color-mix(in srgb, var(--bg-page) 45%, transparent) 0%, transparent 55%)",
                              }}
                            />
                          </motion.div>
                        </AnimatePresence>
                      </PhoneFrame>
                    </div>
                  </div>
                </Glass>
              </Reveal>
            </div>
          </Container>
        </section>

        {/* ===================== ROADMAP ===================== */}
        <section id="roadmap" className="scroll-mt-32 py-14 sm:py-20">
          <Container>
            <Reveal>
              <SectionHead title={T.sections.roadmapTitle} desc={T.sections.roadmapDesc} />
            </Reveal>

            <div className="mt-10 grid gap-4 lg:grid-cols-3">
              <Reveal delay={0.05}>
                <TimelineCard
                  tone="brand"
                  step={localeCode === "ar" ? "المرحلة 1" : "Phase 1"}
                  title={localeCode === "ar" ? "Launch الويب" : "Web Launch"}
                  points={
                    localeCode === "ar"
                      ? ["Landing + SEO pages", "Auth + Onboarding", "Rooms + Feed", "Profiles + Follows"]
                      : ["Landing + SEO pages", "Auth + onboarding", "Rooms + feed", "Profiles + follows"]
                  }
                />
              </Reveal>

              <Reveal delay={0.1}>
                <TimelineCard
                  tone="pink"
                  step={localeCode === "ar" ? "المرحلة 2" : "Phase 2"}
                  title={localeCode === "ar" ? "Creator Pilot" : "Creator Pilot"}
                  points={
                    localeCode === "ar"
                      ? ["Missions", "Badges", "Spotlight", "Insights"]
                      : ["Missions", "Badges", "Spotlight", "Insights"]
                  }
                />
              </Reveal>

              <Reveal delay={0.15}>
                <TimelineCard
                  tone="cyan"
                  step={localeCode === "ar" ? "المرحلة 3" : "Phase 3"}
                  title={localeCode === "ar" ? "تطبيق موبايل" : "Mobile Apps"}
                  points={
                    localeCode === "ar"
                      ? ["iOS/Android", "Push Notifications", "Fast Compose", "Offline reading (later)"]
                      : ["iOS/Android", "Push notifications", "Fast compose", "Offline reading (later)"]
                  }
                />
              </Reveal>
            </div>
          </Container>
        </section>

        {/* ===================== FAQ ===================== */}
        <section id="faq" className="scroll-mt-32 py-14 sm:py-20">
          <Container className="max-w-4xl">
            <Reveal>
              <SectionHead title={T.sections.faqTitle} desc="" />
            </Reveal>

            <div className="mt-10 space-y-4">
              <Reveal delay={0.03}>
                <FaqRow
                  q={
                    localeCode === "ar"
                      ? "وش يفرق فنّارة عن أي Social عام؟"
                      : "How is Fanaara different from generic social apps?"
                  }
                  a={
                    localeCode === "ar"
                      ? "فنّارة متخصصة: Rooms حسب الأنواع، صفحات محتوى SEO-ready، مراجعات منظمة بدون حرق، وبرنامج صنّاع—بدل محتوى يضيع وسط الزحمة."
                      : "Fanaara is specialized: rooms by genres, SEO-ready content pages, structured spoiler-safe reviews, and a creator program—so content doesn’t drown in noise."
                  }
                />
              </Reveal>

              <Reveal delay={0.06}>
                <FaqRow
                  q={localeCode === "ar" ? "ليش تقولون بيئة إسلامية؟" : "Why Islamic-friendly?"}
                  a={
                    localeCode === "ar"
                      ? "يعني مجتمع محترم بحدود واضحة: بدون محتوى خادش أو تحرش أو سبام. نرحّب بالجميع بشرط احترام القيم والقوانين."
                      : "It means a respectful community with clear boundaries: no explicit content, harassment, or spam. Everyone is welcome as long as they follow the rules."
                  }
                />
              </Reveal>

              <Reveal delay={0.09}>
                <FaqRow
                  q={localeCode === "ar" ? "هل في تطبيق؟" : "Do you have a mobile app?"}
                  a={
                    localeCode === "ar"
                      ? "مو جاهز الآن—لكن قريباً. حالياً: Web قوية للمحتوى الطويل والـ SEO + بعدها iOS/Android."
                      : "Not yet—coming soon. Web first for long-form + SEO, then iOS/Android."
                  }
                />
              </Reveal>

              <Reveal delay={0.12}>
                <FaqRow
                  q={localeCode === "ar" ? "كيف تتعاملون مع السبام؟" : "How do you handle spam?"}
                  a={
                    localeCode === "ar"
                      ? "سياسات واضحة + بلاغات + أدوات مشرفين + فلاتر وقيود ضد الضجيج والروابط المزعجة."
                      : "Clear policy + reports + moderator tools + filters and constraints against noise and spam links."
                  }
                />
              </Reveal>

              <Reveal delay={0.15}>
                <FaqRow
                  q={localeCode === "ar" ? "هل في Monetization؟" : "Will there be monetization?"}
                  a={
                    localeCode === "ar"
                      ? "نعم تدريجياً: Creator Program + مزايا مدفوعة لاحقاً + منظومة أعمال للصنّاع/المنتجين."
                      : "Yes gradually: creator program, optional paid features later, and creator/producer business tooling."
                  }
                />
              </Reveal>
            </div>
          </Container>
        </section>

        {/* ===================== CTA ===================== */}
        <section id="cta" className="py-14 sm:py-20">
          <Container>
            <Reveal>
              <Glass className="relative overflow-hidden p-7 sm:p-10">
                <div className="absolute inset-0 opacity-25">
                  <Image
                    src={ASSETS.cosplayBlue}
                    alt="Anime wallpaper"
                    fill
                    sizes="(max-width: 768px) 100vw, 1200px"
                    className="object-cover"
                  />
                </div>
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(to right, var(--bg-page) 0%, color-mix(in srgb, var(--bg-page) 70%, transparent) 55%, transparent 100%)",
                  }}
                />

                <div className="relative grid gap-8 lg:grid-cols-2 lg:items-center">
                  <div>
                    <Badge tone="brand">{localeCode === "ar" ? "Early Access" : "Early Access"}</Badge>
                    <h3 className="mt-3 text-3xl font-black tracking-tight text-foreground-strong sm:text-4xl">
                      {T.sections.ctaTitle}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-foreground-muted sm:text-base">
                      {T.sections.ctaDesc}
                    </p>

                    <div className="mt-4">
                      <Badge tone="warning">
                        {localeCode === "ar" ? "بيئة إسلامية محترمة" : "Islamic-friendly environment"}
                      </Badge>
                      <div className="mt-2 text-xs text-foreground-muted">
                        {localeCode === "ar"
                          ? "بدون محتوى خادش • بدون تحرش • بدون سبام"
                          : "No NSFW • No harassment • No spam"}
                      </div>
                    </div>

                    <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                      <Link
                        href="/signup"
                        className={cn(
                          "inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-black",
                          "bg-accent text-accent-foreground transition hover:bg-accent-strong",
                        )}
                      >
                        {T.auth.signup} <span className="ms-2">↗</span>
                      </Link>
                      <Link
                        href="/login"
                        className={cn(
                          "inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold",
                          "border border-border-subtle bg-surface/60 text-foreground-strong transition hover:bg-surface",
                        )}
                      >
                        {T.auth.login}
                      </Link>
                    </div>

                    <div className="mt-6 flex flex-wrap gap-2">
                      <StoreBadge label="App Store" comingSoon />
                      <StoreBadge label="Google Play" comingSoon />
                    </div>
                  </div>

                  <div className="rounded-[26px] border border-border-subtle bg-surface/70 p-6 backdrop-blur">
                    <div className="text-sm font-black text-foreground-strong">
                      {localeCode === "ar" ? "Join Waitlist" : "Join Waitlist"}
                    </div>
                    <div className="mt-1 text-xs text-foreground-muted">
                      {localeCode === "ar"
                        ? "واجهة فقط — اربطها لاحقاً بـ API"
                        : "UI-only — connect later to your API"}
                    </div>

                    <div className="mt-4 flex flex-col gap-3">
                      <input
                        type="email"
                        placeholder={localeCode === "ar" ? "بريدك الإلكتروني" : "Your email"}
                        className={cn(
                          "h-12 rounded-2xl border px-4 text-sm outline-none transition",
                          "border-border-subtle bg-background-elevated text-foreground-strong placeholder:text-foreground-disabled",
                          "focus-visible:ring-2 focus-visible:ring-accent-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                        )}
                      />

                      <button
                        type="button"
                        className={cn(
                          "h-12 rounded-2xl text-sm font-black transition",
                          "bg-accent text-accent-foreground hover:bg-accent-strong",
                          "shadow-[var(--shadow-glow-brand)]",
                        )}
                      >
                        {T.auth.waitlist}
                      </button>

                      <p className="text-xs leading-relaxed text-foreground-muted">
                        {localeCode === "ar"
                          ? "بنرسل تحديثات الإطلاق والوصول المبكر — بدون إزعاج."
                          : "We’ll send launch updates and early access—no spam."}
                      </p>
                    </div>
                  </div>
                </div>
              </Glass>
            </Reveal>

            <footer className="mt-10 border-t border-divider pt-8 text-center text-xs text-foreground-muted">
              © {new Date().getFullYear()} Fanaara — All rights reserved
            </footer>
          </Container>
        </section>
      </main>
    </div>
  );
}

/* ======================================================================================
   Motion helpers
====================================================================================== */

function Reveal({
  children,
  className = "",
  delay = 0,
  y = 16,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={
        reduceMotion
          ? { opacity: 1, y: 0, filter: "blur(0px)" }
          : { opacity: 0, y, filter: "blur(8px)" }
      }
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={VIEWPORT_ONCE}
      transition={
        reduceMotion ? { duration: 0 } : { duration: 0.6, ease: EASE_OUT, delay }
      }
    >
      {children}
    </motion.div>
  );
}

function RotatingWords({
  words,
  intervalMs = 2200,
}: {
  words: string[];
  intervalMs?: number;
}) {
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);

  const key = useMemo(() => (words ?? []).join("|"), [words]);
  const longest = useMemo(() => {
    const w = words ?? [];
    return w.reduce((a, b) => (a.length >= b.length ? a : b), w[0] ?? "");
  }, [key, words]);

  useEffect(() => setIndex(0), [key]);

  useEffect(() => {
    if (reduceMotion) return;
    if (!words || words.length <= 1) return;

    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % words.length);
    }, intervalMs);

    return () => window.clearInterval(id);
  }, [reduceMotion, intervalMs, key, words]);

  if (!words?.length) return null;
  if (reduceMotion) return <span>{words[0]}</span>;

  const minCh = Math.max(longest.length, 10);

  return (
    <span className="relative inline-grid align-baseline" style={{ minWidth: `${minCh}ch` }}>
      <span className="invisible whitespace-nowrap">{longest}</span>

      <AnimatePresence mode="wait">
        <motion.span
          key={`${key}-${index}`}
          className="absolute inset-0 text-start whitespace-nowrap"
          initial={{ opacity: 0, y: 10, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -10, filter: "blur(8px)" }}
          transition={{ duration: 0.35, ease: EASE_OUT }}
        >
          {words[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

/* ======================================================================================
   UI Components
====================================================================================== */

function Container({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto max-w-7xl px-4 sm:px-6 lg:px-8", className)}>
      {children}
    </div>
  );
}

function Glass({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-[30px] border bg-glass/75 backdrop-blur-xl",
        "border-glass-border shadow-[var(--shadow-glass)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

function SectionHead({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="text-center">
      <h2 className="text-[clamp(2.1rem,5vw,3.7rem)] font-black tracking-tight text-foreground-strong leading-[1.05]">
        {title}
      </h2>
      {desc ? (
        <p className="mx-auto mt-4 max-w-3xl text-sm leading-relaxed text-foreground-muted sm:text-base">
          {desc}
        </p>
      ) : null}
    </div>
  );
}

function Badge({ children, tone }: { children: React.ReactNode; tone: Tone }) {
  const cls =
    tone === "brand"
      ? "bg-accent/15 text-accent border-accent/25"
      : tone === "purple"
        ? "bg-extra-purple-soft text-extra-purple border-extra-purple-border"
        : tone === "pink"
          ? "bg-extra-pink-soft text-extra-pink border-extra-pink-border"
          : tone === "lime"
            ? "bg-extra-lime-soft text-extra-lime border-extra-lime-border"
            : tone === "cyan"
              ? "bg-extra-cyan-soft text-extra-cyan border-extra-cyan-border"
              : "bg-warning-soft text-warning-foreground border-warning-soft-border";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-black",
        cls,
      )}
    >
      {children}
    </span>
  );
}

function MiniStat({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-2xl border border-border-subtle bg-surface/60 px-4 py-3">
      <div className="text-[11px] font-semibold text-foreground-muted">{k}</div>
      <div className="mt-1 text-sm font-black text-foreground-strong">{v}</div>
    </div>
  );
}

function BentoCard({ item }: { item: BentoItem }) {
  const tone =
    item.tone === "brand"
      ? "from-accent/20 to-accent/0"
      : item.tone === "purple"
        ? "from-extra-purple-soft to-transparent"
        : item.tone === "pink"
          ? "from-extra-pink-soft to-transparent"
          : item.tone === "lime"
            ? "from-extra-lime-soft to-transparent"
            : item.tone === "cyan"
              ? "from-extra-cyan-soft to-transparent"
              : "from-warning-soft to-transparent";

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-[26px] border p-5 sm:p-6",
        "border-border-subtle bg-card/70 backdrop-blur",
        "transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-elevated)]",
      )}
    >
      <div
        className={cn(
          "absolute inset-0 opacity-0 transition group-hover:opacity-100",
          "bg-gradient-to-br",
          tone,
        )}
      />
      <div className="relative">
        <div className="flex items-center justify-between">
          <div className="text-2xl">{item.icon}</div>
          <div className="h-8 w-8 rounded-full border border-border-subtle bg-surface/70" />
        </div>

        <div className="mt-4 text-lg font-black text-foreground-strong">
          {item.title}
        </div>
        <p className="mt-2 text-sm leading-relaxed text-foreground-muted">
          {item.desc}
        </p>
      </div>
    </div>
  );
}

function UniverseCard({ item }: { item: UniverseItem }) {
  return (
    <Glass className="relative overflow-hidden p-0">
      <div className="relative h-40">
        <Image
          src={item.image}
          alt={item.title}
          fill
          sizes="(max-width: 768px) 100vw, 900px"
          className="object-cover"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, var(--bg-page) 10%, rgba(0,0,0,0) 70%)",
          }}
        />
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
          <Badge tone={item.tone}>
            <span className="me-2">{item.icon}</span>
            {item.title}
          </Badge>
          <div className="h-9 w-9 rounded-2xl border border-border-subtle bg-surface/60" />
        </div>
      </div>
      <div className="p-5 sm:p-6">
        <p className="text-sm leading-relaxed text-foreground-muted">
          {item.desc}
        </p>
      </div>
    </Glass>
  );
}

function ValueCard({ item }: { item: ValueItem }) {
  return (
    <div
      className={cn(
        "rounded-[26px] border p-5 sm:p-6",
        "border-border-subtle bg-card/70 backdrop-blur",
        "transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-elevated)]",
      )}
    >
      <div className="flex items-center justify-between">
        <Badge tone={item.tone}>
          <span className="me-2">{item.icon}</span>
          {item.title}
        </Badge>
        <div className="h-8 w-8 rounded-full border border-border-subtle bg-surface/70" />
      </div>

      <p className="mt-3 text-sm leading-relaxed text-foreground-muted">
        {item.desc}
      </p>
    </div>
  );
}

function HowCard({ item }: { item: HowStep }) {
  return (
    <Glass className="p-6 sm:p-7">
      <Badge tone={item.tone}>
        <span className="me-2">{item.icon}</span>
        {item.title}
      </Badge>
      <div className="mt-3 text-sm leading-relaxed text-foreground-muted">
        {item.desc}
      </div>
    </Glass>
  );
}

function RulePill({
  tone,
  title,
  desc,
}: {
  tone: Tone;
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-2xl border border-border-subtle bg-surface/60 px-4 py-3">
      <Badge tone={tone}>{title}</Badge>
      <div className="mt-2 text-xs text-foreground-muted">{desc}</div>
    </div>
  );
}

function FeatureChip({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-2xl border border-border-subtle bg-glass/70 px-4 py-3 backdrop-blur">
      <div className="text-sm font-black text-foreground-strong">{title}</div>
      <div className="mt-1 text-xs text-foreground-muted">{desc}</div>
    </div>
  );
}

function ImageSideCard({
  image,
  title,
  desc,
  tone,
}: {
  image: string;
  title: string;
  desc: string;
  tone: Tone;
}) {
  return (
    <Glass className="relative overflow-hidden p-0">
      <div className="relative h-44 sm:h-48">
        <Image
          src={image}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, 900px"
          className="object-cover"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, var(--bg-page) 8%, rgba(0,0,0,0) 65%)",
          }}
        />
      </div>
      <div className="p-5 sm:p-6">
        <Badge tone={tone}>{title}</Badge>
        <p className="mt-3 text-sm leading-relaxed text-foreground-muted">
          {desc}
        </p>
      </div>
    </Glass>
  );
}

function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative mx-auto w-[290px] sm:w-[340px]">
      <div className="relative overflow-hidden rounded-[44px] border border-border-subtle bg-surface/70 p-3 shadow-[0_25px_90px_rgba(0,0,0,0.25)]">
        <div className="absolute left-1/2 top-3 h-6 w-28 -translate-x-1/2 rounded-full bg-border-subtle/40" />
        <div className="relative h-[560px] overflow-hidden rounded-[36px] border border-border-subtle bg-background-elevated">
          {children}
        </div>
      </div>
    </div>
  );
}

function TimelineCard({
  tone,
  step,
  title,
  points,
}: {
  tone: Tone;
  step: string;
  title: string;
  points: string[];
}) {
  return (
    <Glass className="p-6 sm:p-7">
      <Badge tone={tone}>{step}</Badge>
      <div className="mt-3 text-2xl font-black tracking-tight text-foreground-strong">
        {title}
      </div>
      <ul className="mt-4 space-y-2">
        {points.map((p) => (
          <li key={p} className="flex items-start gap-3 text-sm">
            <span className="mt-2 inline-block h-2 w-2 rounded-full bg-accent" />
            <span className="text-foreground-muted">{p}</span>
          </li>
        ))}
      </ul>
    </Glass>
  );
}

function RoadmapPill({
  tone,
  title,
  desc,
}: {
  tone: Tone;
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-2xl border border-border-subtle bg-surface/60 px-4 py-3">
      <Badge tone={tone}>{title}</Badge>
      <div className="mt-2 text-xs text-foreground-muted">{desc}</div>
    </div>
  );
}

function StoreBadge({
  label,
  comingSoon,
}: {
  label: string;
  comingSoon?: boolean;
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-black",
        "border-border-subtle bg-surface/60 text-foreground-strong",
        comingSoon && "opacity-80",
      )}
      aria-disabled={comingSoon ? true : undefined}
    >
      <span className="text-lg">⌁</span>
      <span>{label}</span>
      {comingSoon ? (
        <span className="text-[10px] text-foreground-muted">(soon)</span>
      ) : null}
    </div>
  );
}

function FloatingCard({
  title,
  desc,
  tone,
}: {
  title: string;
  desc: string;
  tone: Tone;
}) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "rounded-[26px] border p-5 sm:p-6",
        "border-border-subtle bg-glass/70 backdrop-blur",
        "shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-elevated)]",
      )}
    >
      <Badge tone={tone}>{title}</Badge>
      <p className="mt-3 text-sm leading-relaxed text-foreground-muted">
        {desc}
      </p>
    </motion.div>
  );
}

function NoticeCard({
  title,
  desc,
  points,
}: {
  title: string;
  desc: string;
  points: string[];
}) {
  return (
    <div
      className={cn(
        "rounded-[22px] border p-4 sm:p-5",
        "border-border-subtle bg-glass/70 backdrop-blur",
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm font-black text-foreground-strong">{title}</div>
        <Badge tone="warning">Policy</Badge>
      </div>
      <p className="mt-2 text-xs leading-relaxed text-foreground-muted sm:text-sm">
        {desc}
      </p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {points.map((p) => (
          <div
            key={p}
            className="rounded-2xl border border-border-subtle bg-surface/60 px-3 py-2 text-xs text-foreground-strong"
          >
            {p}
          </div>
        ))}
      </div>
    </div>
  );
}

function FaqRow({ q, a }: { q: string; a: string }) {
  return (
    <details className="group rounded-2xl border border-border-subtle bg-card/70 px-5 py-4 backdrop-blur open:bg-surface/60">
      <summary className="cursor-pointer list-none">
        <div className="flex items-center gap-4">
          <div className="grid h-10 w-10 place-items-center rounded-xl border border-border-subtle bg-surface/60 text-foreground-strong">
            <span className="inline-block transition group-open:rotate-45">+</span>
          </div>
          <div className="flex-1 text-sm font-black text-foreground-strong sm:text-base">
            {q}
          </div>
        </div>
      </summary>
      <div className="mt-3 text-sm leading-relaxed text-foreground-muted">
        {a}
      </div>
    </details>
  );
}

/* ===================== Mobile Nav Drawer ===================== */

function MobileNav({
  open,
  onClose,
  nav,
  auth,
  locale,
}: {
  open: boolean;
  onClose: () => void;
  nav: Array<{ label: string; href: string }>;
  auth: { login: string; signup: string; waitlist: string };
  locale: LocaleKey;
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-[var(--overlay-soft)]"
          />

          <motion.div
            initial={{ x: 30, opacity: 0, scale: 0.98 }}
            animate={{ x: 0, opacity: 1, scale: 1 }}
            exit={{ x: 30, opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className={cn(
              "fixed right-4 top-4 z-[70] w-[92%] max-w-sm overflow-hidden rounded-[28px] border",
              "border-border-subtle bg-nav/90 backdrop-blur-xl shadow-[var(--shadow-glass-strong)]",
            )}
          >
            <div className="flex items-center justify-between p-4">
              <div className="text-sm font-black text-foreground-strong">
                {locale === "ar" ? "القائمة" : "Menu"}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="grid h-10 w-10 place-items-center rounded-2xl border border-border-subtle bg-surface/60"
                aria-label="Close menu"
              >
                ✕
              </button>
            </div>

            <div className="px-4 pb-4">
              <div className="grid gap-2">
                {nav.map((n) => (
                  <a
                    key={n.href}
                    href={n.href}
                    onClick={onClose}
                    className={cn(
                      "rounded-2xl border border-border-subtle bg-surface/60 px-4 py-3",
                      "text-sm font-semibold text-foreground-strong transition hover:bg-surface",
                    )}
                  >
                    {n.label}
                  </a>
                ))}
              </div>

              <div className="mt-4 grid gap-2">
                <Link
                  href="/login"
                  onClick={onClose}
                  className={cn(
                    "rounded-2xl border border-border-subtle bg-surface/60 px-4 py-3 text-center",
                    "text-sm font-semibold text-foreground-strong transition hover:bg-surface",
                  )}
                >
                  {auth.login}
                </Link>

                <Link
                  href="/signup"
                  onClick={onClose}
                  className={cn(
                    "rounded-2xl bg-accent px-4 py-3 text-center",
                    "text-sm font-black text-accent-foreground transition hover:bg-accent-strong",
                  )}
                >
                  {auth.signup}
                </Link>

                <a
                  href="#cta"
                  onClick={onClose}
                  className={cn(
                    "rounded-2xl border border-border-subtle bg-surface/60 px-4 py-3 text-center",
                    "text-sm font-black text-foreground-strong transition hover:bg-surface",
                  )}
                >
                  {auth.waitlist}
                </a>

                <div className="mt-2 flex items-center justify-between rounded-2xl border border-border-subtle bg-surface/60 px-4 py-3">
                  <LanguageMenuToggle />
                  <ThemeToggle />
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ===================== Sakura Layer ===================== */

function SakuraLayer({ reduceMotion }: { reduceMotion: boolean }) {
  const petals = useMemo(
    () =>
      Array.from({ length: 14 }).map((_, i) => {
        const x = (i * 7) % 100;
        const delay = (i * 0.55) % 6;
        const dur = 10 + (i % 6) * 1.2;
        const size = 0.55 + (i % 5) * 0.12;
        return { x, delay, dur, size, i };
      }),
    [],
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {petals.map((p) => (
        <span
          key={p.i}
          className={cn(
            "absolute top-[-10%] left-0 select-none",
            reduceMotion ? "animate-sakura-lite" : "animate-sakura",
          )}
          style={{
            left: `${p.x}%`,
            // @ts-expect-error css variables
            "--sx": "0px",
            "--sy": "-120px",
            "--ex": "0px",
            "--ey": "980px",
            "--r1": `${(p.i * 33) % 180}deg`,
            "--r2": `${(p.i * 77) % 360}deg`,
            "--s": p.size,
            "--dur": `${p.dur}s`,
            "--drift": `${20 + (p.i % 6) * 14}px`,
            animationDelay: `${p.delay}s`,
            opacity: 0.55,
          }}
        >
          <span
            className="inline-block h-6 w-6 rounded-full"
            style={{
              background:
                "radial-gradient(circle at 30% 30%, color-mix(in srgb, var(--color-extra-pink) 55%, transparent), transparent 60%)",
              filter: "blur(0.2px)",
            }}
          />
        </span>
      ))}
    </div>
  );
}
