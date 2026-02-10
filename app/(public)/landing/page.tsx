// app/page.tsx
"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import ThemeToggle from "@/components/ThemeToggle";

type NavItem = { label: string; href: string };
type Slide = { title: string; subtitle: string; bullets: string[]; image: string };
type CardItem = { title: string; tag: string; desc: string; image: string };
type NewsItem = { title: string; date: string; desc: string; image: string };
type FaqItem = { q: string; a: string };

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

const ASSETS = {
  hero: "https://images.unsplash.com/photo-1755756383664-af3cf523242b?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=80&w=2400",
  manga: "https://images.unsplash.com/photo-1763732397784-c5ff2651d40c?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=80&w=2400",
  figureNaruto: "https://images.unsplash.com/photo-1764730282820-f9cdd430b1c1?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=80&w=2400",
  neonStreet: "https://images.unsplash.com/photo-1769321790864-1b00340a54ad?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=80&w=2400",
  signs: "https://images.unsplash.com/photo-1758881820910-58c3de74dbdd?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=80&w=2400",
  strawHat: "https://images.unsplash.com/photo-1765708180250-9b423f3dfba8?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=80&w=2400",
  cosplay: "https://images.unsplash.com/photo-1750726446363-a0516820f139?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=80&w=2400",
};

export default function Page() {
  const reduceMotion = useReducedMotion();

  const tBase = useMemo(
    () => (reduceMotion ? { duration: 0 } : { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }),
    [reduceMotion],
  );
  const tFast = useMemo(
    () => (reduceMotion ? { duration: 0 } : { duration: 0.45, ease: [0.16, 1, 0.3, 1] as const }),
    [reduceMotion],
  );

  const nav: NavItem[] = [
    { label: "المنصة", href: "#platform" },
    { label: "المزايا", href: "#features" },
    { label: "محتوى المجتمع", href: "#community" },
    { label: "الأخبار", href: "#news" },
    { label: "الأسئلة الشائعة", href: "#faq" },
  ];

  const phoneSlides: Slide[] = [
    {
      title: "تجربة مصممة لعشاق الأنمي والكوميكس",
      subtitle: "كل تفاعل له معنى — من أول متابعة إلى آخر تعليق.",
      bullets: [
        "تغذية (Feed) مُصممة للأنمي: اقتراحات حسب ذوقك.",
        "غرف نقاش منظمة حسب الأنواع والاهتمامات.",
        "صفحات أنمي/مانجا/كوميكس قابلة للأرشفة وتحسن SEO.",
        "ملفات صناع + مهام + شارات + مكافآت.",
      ],
      image: ASSETS.hero,
    },
    {
      title: "اكتشاف ذكي بدل الضياع في الزحمة",
      subtitle: "خوارزميات واضحة + إشارات جودة بدل العشوائية.",
      bullets: [
        "ترشيحات مبنية على: مشاهدة، تفاعل، حفظ، تقييم.",
        "فلترة السبام وتخفيض المحتوى المكرر.",
        "مساحات “مواضيع الأسبوع” لتقود النقاش.",
        "قوائم متابعة للصناع والمجتمعات.",
      ],
      image: ASSETS.neonStreet,
    },
    {
      title: "صناعة محتوى… تُكافَأ عليها",
      subtitle: "Creator Program يدعم النمو الحقيقي مش بس أرقام.",
      bullets: [
        "مهام أسبوعية للصناع (Missions) قابلة للتخصيص.",
        "مكافآت: إبراز، شارات، وصول مبكر، وميزات داخل المنصة.",
        "لوحة Insights تساعدك تفهم جمهورك.",
        "نظام أعمال للـ Freelancers/Producers عند التوسع.",
      ],
      image: ASSETS.strawHat,
    },
  ];

  const works: CardItem[] = [
    { title: "سلسلة نقاشات الموسم", tag: "مجتمع • تفاعل", desc: "مواضيع أسبوعية منظمة: توقعات، تحليلات، ونقاشات بدون فوضى.", image: ASSETS.signs },
    { title: "مراجعات قصيرة ذكية", tag: "Reviews • تقييم", desc: "قالب مراجعة سريع + تقييم + أهم نقاط بدون حرق.", image: ASSETS.manga },
    { title: "Fanart وCreators Spotlight", tag: "صنّاع • إبراز", desc: "مساحة لإبراز الأعمال المميزة مع روابط ومتابعة مباشرة.", image: ASSETS.cosplay },
    { title: "صفحات محتوى قابلة للأرشفة", tag: "SEO • Pages", desc: "حلقات/فصول/شخصيات — صفحات منظمة تساعد على نمو البحث.", image: ASSETS.hero },
    { title: "غرف مجتمعات حسب الأنواع", tag: "Rooms • Topics", desc: "Shonen / Isekai / Seinen / Comics — لكل نوع مساحة محترمة.", image: ASSETS.neonStreet },
    { title: "قوائم مشاهدة وقراءة", tag: "Lists • حفظ", desc: "احفظ، رتّب، شارك قائمتك… وخلي المجتمع يقترح لك الأفضل.", image: ASSETS.figureNaruto },
  ];

  const news: NewsItem[] = [
    { title: "إطلاق نظام الشارات للملفات الشخصية", date: "قريبًا", desc: "شارات للصناع + الأعضاء النشطين + المتخصصين في أنواع محددة.", image: ASSETS.strawHat },
    { title: "تحديث هيكلة صفحات المحتوى لتحسين SEO", date: "قريبًا", desc: "Schema + صفحات حلقات وفصول + روابط داخلية محسّنة.", image: ASSETS.manga },
    { title: "أدوات إشراف جديدة لمكافحة السبام", date: "قريبًا", desc: "قواعد مرنة + مراجعة سريعة + إشعارات ذكية للمشرفين.", image: ASSETS.neonStreet },
    { title: "بداية برنامج الصنّاع (Pilot)", date: "قريبًا", desc: "دفعة أولى من الصنّاع + مهام أسبوعية + مكافآت إبراز داخل المنصة.", image: ASSETS.cosplay },
    { title: "نظام مجتمعات متعددة المستويات", date: "قريبًا", desc: "Public / Private / Verified + إدارة فرق الإشراف.", image: ASSETS.signs },
    { title: "إضافة صفحات مقالات وتحليلات طويلة", date: "قريبًا", desc: "Editor محسّن + دعم صور + جداول + تقسيم ذكي للمحتوى.", image: ASSETS.hero },
  ];

  const faqs: FaqItem[] = [
    { q: "ما الذي يميز فنّارة عن السوشيال العام؟", a: "فنّارة متخصصة: كل شيء مبني للأنمي والكوميكس (صفحات محتوى، نقاشات منظمة، مراجعات، صناع، واكتشاف أفضل) بدل ضياع المحتوى وسط منصات عامة." },
    { q: "هل عندكم صفحات أنمي/مانجا قابلة للأرشفة (SEO)؟", a: "نعم — تصميم المنصة يدعم صفحات محتوى منظمة (عمل/شخصيات/حلقات/فصول) مع روابط داخلية وتحسينات SEO لتسهيل الوصول من البحث." },
    { q: "كيف يدعم النظام الصنّاع والمؤثرين؟", a: "عبر Creator Program: ملفات صناع، مهام أسبوعية، شارات ومكافآت، وأدوات Insights. الهدف: نمو مستدام لصانع المحتوى وليس تفاعل لحظي فقط." },
    { q: "كيف تتعاملون مع السبام والمحتوى المسيء؟", a: "أدوات إشراف واضحة + فلترة ذكية (AI-assisted) + قواعد مرنة للمجتمعات + أنظمة بلاغات وتدرّج في العقوبات." },
    { q: "هل يوجد تطبيق؟ وهل هناك نسخة ويب؟", a: "الهدف دعم الاثنين: تطبيق موبايل للتفاعل السريع + نسخة ويب قوية للمحتوى الطويل والـ SEO والمجتمعات." },
    { q: "كيف أشارك كصانع أو أقدم خدمات (Freelance)؟", a: "ستتوفر مساحة للصناع وبرنامج Pilot، ومع التوسع سيتم تفعيل منظومة أعمال للـ Freelancers/Producers داخل المنصة." },
  ];

  const [platformIndex, setPlatformIndex] = useState(0);
  const [worksPage, setWorksPage] = useState(0);
  const [newsPage, setNewsPage] = useState(0);

  const WORKS_PER_PAGE = 3;
  const NEWS_PER_PAGE = 3;

  const worksPagesCount = Math.ceil(works.length / WORKS_PER_PAGE);
  const newsPagesCount = Math.ceil(news.length / NEWS_PER_PAGE);

  const worksSlice = useMemo(() => {
    const start = worksPage * WORKS_PER_PAGE;
    return works.slice(start, start + WORKS_PER_PAGE);
  }, [works, worksPage]);

  const newsSlice = useMemo(() => {
    const start = newsPage * NEWS_PER_PAGE;
    return news.slice(start, start + NEWS_PER_PAGE);
  }, [news, newsPage]);

  return (
    <div className="min-h-screen bg-white text-zinc-900 dark:bg-[#07060f] dark:text-white">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.18),transparent_55%),radial-gradient(ellipse_at_bottom,rgba(236,72,153,0.12),transparent_55%)] dark:bg-[radial-gradient(ellipse_at_top,rgba(139,92,246,0.18),transparent_55%),radial-gradient(ellipse_at_bottom,rgba(99,102,241,0.10),transparent_55%)]" />
        <div className="absolute inset-0 opacity-[0.25] dark:opacity-[0.22] bg-[linear-gradient(to_right,rgba(0,0,0,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.06)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:42px_42px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/0 via-white/40 to-white dark:from-[#07060f]/0 dark:via-[#07060f]/35 dark:to-[#07060f]" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-black/10 bg-white/70 backdrop-blur dark:border-white/10 dark:bg-[#07060f]/70">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-2xl border border-black/10 bg-black/5 dark:border-white/10 dark:bg-white/5">
                <span className="text-lg font-black tracking-tight">ف</span>
              </div>
              <div className="leading-tight">
                <div className="font-black tracking-tight">فنّارة</div>
                <div className="text-[11px] text-zinc-600 dark:text-white/55">
                  منصة الأنمي • المانجا • الكوميكس
                </div>
              </div>
            </div>

            <nav className="hidden items-center gap-6 lg:flex">
              {nav.map((n) => (
                <a
                  key={n.href}
                  href={n.href}
                  className="text-sm font-semibold text-zinc-700 hover:text-zinc-950 transition dark:text-white/70 dark:hover:text-white"
                >
                  {n.label}
                </a>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <a
                href="#download"
                className={cn(
                  "inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-black",
                  "bg-zinc-950 text-white hover:bg-zinc-800",
                  "dark:bg-violet-400/90 dark:text-[#07060f] dark:hover:bg-violet-300",
                  "transition",
                )}
              >
                حمّل تطبيقنا
              </a>

              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <main>
        {/* HERO */}
        <section className="pt-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="relative overflow-hidden rounded-[34px] border border-black/10 bg-white/60 shadow-[0_0_0_1px_rgba(0,0,0,0.04)] dark:border-white/10 dark:bg-white/5 dark:shadow-[0_0_0_1px_rgba(255,255,255,0.06)]">
              <div className="relative h-[440px] sm:h-[560px]">
                <motion.div initial={{ scale: 1.04, opacity: 0.9 }} animate={{ scale: 1, opacity: 1 }} transition={tBase} className="absolute inset-0">
                  <Image
                    src={ASSETS.hero}
                    alt="Anime billboards in Tokyo"
                    fill
                    priority
                    sizes="(max-width: 768px) 100vw, 1200px"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-white via-white/30 to-transparent dark:from-[#07060f] dark:via-[#07060f]/30 dark:to-transparent" />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(139,92,246,0.18),transparent_55%)]" />
                </motion.div>

                <div className="absolute inset-0 flex items-end justify-end p-6 sm:p-10">
                  <motion.div
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={tBase}
                    className="w-full max-w-2xl text-right"
                  >
                    <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-3 py-1 text-xs font-bold text-zinc-700 dark:border-white/10 dark:bg-white/5 dark:text-white/75">
                      <span className="inline-block h-2 w-2 rounded-full bg-violet-500 dark:bg-violet-300" />
                      منصة اجتماعية متخصصة للأنمي والكوميكس
                    </div>

                    <h1 className="mt-4 text-4xl font-black leading-[1.05] tracking-tight sm:text-6xl">
                      عِش الأنمي…
                      <span className="block">مع مجتمع يكمل القصة معك</span>
                    </h1>

                    <p className="mt-4 max-w-xl text-sm leading-relaxed text-zinc-700 sm:text-base dark:text-white/70">
                      مجتمعات منظمة، صفحات محتوى قابلة للأرشفة (SEO)، برنامج صنّاع،
                      وإشراف ذكي… بتجربة UI/UX محترمة وسريعة.
                    </p>

                    <div className="mt-6 flex flex-col items-end gap-3 sm:flex-row sm:justify-end">
                      <a
                        href="#cta"
                        className={cn(
                          "inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-black transition",
                          "bg-zinc-950 text-white hover:bg-zinc-800",
                          "dark:bg-white dark:text-[#07060f] dark:hover:opacity-90",
                        )}
                      >
                        ابدأ الآن <span className="ms-2">←</span>
                      </a>
                      <a
                        href="#platform"
                        className={cn(
                          "inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-black transition",
                          "border border-black/10 bg-white/70 text-zinc-900 hover:bg-white",
                          "dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10",
                        )}
                      >
                        شاهد كيف تعمل
                      </a>
                    </div>

                    <div className="mt-6 flex flex-wrap justify-end gap-2">
                      <Pill>SEO-ready</Pill>
                      <Pill>Creator Program</Pill>
                      <Pill>Rooms & Topics</Pill>
                      <Pill>Moderation</Pill>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PLATFORM */}
        <section id="platform" className="scroll-mt-24 py-14 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-center text-4xl font-black tracking-tight sm:text-6xl">
              تجربة فريدة من نوعها
            </h2>

            <div className="mt-10 mx-auto max-w-5xl">
              <GlassCard className="relative px-4 py-10 sm:px-10 sm:py-14">
                <div className="absolute left-4 top-4 flex items-center gap-2">
                  <CircleArrow
                    dir="prev"
                    onClick={() => setPlatformIndex((p) => (p - 1 + phoneSlides.length) % phoneSlides.length)}
                  />
                  <CircleArrow
                    dir="next"
                    onClick={() => setPlatformIndex((p) => (p + 1) % phoneSlides.length)}
                  />
                </div>

                <div className="grid items-center gap-10 lg:grid-cols-2">
                  {/* Phone */}
                  <div className="relative order-2 lg:order-1">
                    <motion.div
                      initial={{ rotate: -8, y: 14, opacity: 0 }}
                      whileInView={{ rotate: -6, y: 0, opacity: 1 }}
                      viewport={{ once: true, amount: 0.35 }}
                      transition={tBase}
                      className="mx-auto w-[270px] sm:w-[330px]"
                    >
                      <div className="relative rounded-[42px] border border-black/10 bg-white/60 p-3 shadow-[0_25px_80px_rgba(0,0,0,0.20)] dark:border-white/15 dark:bg-[#0a0913]/70 dark:shadow-[0_25px_80px_rgba(0,0,0,0.45)]">
                        <div className="absolute left-1/2 top-3 h-5 w-28 -translate-x-1/2 rounded-full bg-black/10 dark:bg-white/10" />

                        <div className="overflow-hidden rounded-[34px] border border-black/10 bg-white dark:border-white/10 dark:bg-[#0b0a14]">
                          <div className="relative h-[260px]">
                            <AnimatePresence mode="wait">
                              <motion.div
                                key={platformIndex}
                                initial={{ opacity: 0, scale: 1.02 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.02 }}
                                transition={tFast}
                                className="absolute inset-0"
                              >
                                <Image
                                  src={phoneSlides[platformIndex].image}
                                  alt="Slide image"
                                  fill
                                  sizes="(max-width: 768px) 70vw, 360px"
                                  className="object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-white via-white/30 to-transparent dark:from-[#07060f] dark:via-[#07060f]/35 dark:to-transparent" />
                              </motion.div>
                            </AnimatePresence>
                          </div>

                          <AnimatePresence mode="wait">
                            <motion.div
                              key={`content-${platformIndex}`}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              transition={tFast}
                              className="p-4"
                            >
                              <div className="text-xs text-zinc-600 dark:text-white/70 flex items-center justify-between">
                                <span className="font-black">فنّارة</span>
                                <span>الآن</span>
                              </div>

                              <div className="mt-3 text-base font-black leading-tight">
                                {phoneSlides[platformIndex].title}
                              </div>

                              <div className="mt-2 text-xs text-zinc-600 dark:text-white/70 leading-relaxed">
                                {phoneSlides[platformIndex].subtitle}
                              </div>

                              <div className="mt-4 space-y-2">
                                {phoneSlides[platformIndex].bullets.slice(0, 3).map((b) => (
                                  <div
                                    key={b}
                                    className="rounded-2xl border border-black/10 bg-black/5 px-3 py-2 text-xs text-zinc-800 dark:border-white/10 dark:bg-white/5 dark:text-white/80"
                                  >
                                    {b}
                                  </div>
                                ))}
                              </div>
                            </motion.div>
                          </AnimatePresence>
                        </div>
                      </div>
                    </motion.div>

                    <div className="mt-8 flex items-center justify-center gap-2">
                      {phoneSlides.map((_, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setPlatformIndex(i)}
                          className={cn(
                            "h-2.5 rounded-full transition",
                            i === platformIndex
                              ? "w-7 bg-violet-500 dark:bg-yellow-300"
                              : "w-2.5 bg-black/20 hover:bg-black/30 dark:bg-white/20 dark:hover:bg-white/30",
                          )}
                          aria-label={`سلايد ${i + 1}`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Text */}
                  <div className="order-1 lg:order-2 text-right">
                    <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-3 py-1 text-xs font-bold text-zinc-700 dark:border-white/10 dark:bg-white/5 dark:text-white/80">
                      <span className="inline-block h-2 w-2 rounded-full bg-violet-500 dark:bg-violet-300" />
                      منصة اجتماعية متخصصة
                    </div>

                    <h3 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
                      كل شيء يدور حول “المجتمع” — وليس مجرد مشاهدة
                    </h3>

                    <p className="mt-4 text-sm leading-relaxed text-zinc-700 sm:text-base dark:text-white/75">
                      فنّارة ليست قارئ محتوى فقط؛ هي تجربة تفاعل كاملة: متابعة، نقاش، مراجعات،
                      قوائم، وصفحات محتوى… بتصميم واضح يحترم المستخدم ويبرز الجودة.
                    </p>

                    <ul className="mt-6 space-y-3 text-sm text-zinc-800 dark:text-white/80">
                      <Li>نقاشات منظمة + غرف لكل نوع واهتمام.</Li>
                      <Li>صفحات قابلة للأرشفة وتحسن الوصول من البحث.</Li>
                      <Li>برنامج صنّاع: مهام، شارات، وإبراز للأعمال.</Li>
                      <Li>إشراف وفلترة ذكية لتقليل السبام.</Li>
                    </ul>

                    <div className="mt-7 flex flex-col items-end gap-3 sm:flex-row sm:justify-end">
                      <a
                        href="#cta"
                        className={cn(
                          "inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-black transition",
                          "bg-zinc-950 text-white hover:bg-zinc-800",
                          "dark:bg-white dark:text-[#07060f] dark:hover:opacity-90",
                        )}
                      >
                        افتح حسابك الآن <span className="ms-2">←</span>
                      </a>
                      <a
                        href="#features"
                        className={cn(
                          "inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-black transition",
                          "border border-black/10 bg-white/70 hover:bg-white",
                          "dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10",
                        )}
                      >
                        استعرض المزايا
                      </a>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section id="features" className="scroll-mt-24 py-14 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-5 lg:grid-cols-12 lg:grid-rows-2">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={tBase}
                className="lg:col-span-4 lg:row-span-2"
              >
                <GlassCard className="h-full p-7 sm:p-9">
                  <div className="text-right">
                    <div className="text-3xl font-black">مجتمع</div>
                    <div className="mt-1 text-sm text-zinc-600 dark:text-white/70">قبل أي شيء</div>
                  </div>

                  <p className="mt-5 text-sm leading-relaxed text-zinc-700 dark:text-white/75">
                    منشورات، تعليقات، تفاعلات، متابعات، وقوائم… لبناء كوميونتي حقيقي بدل “ساحة منشورات” عشوائية.
                  </p>

                  <div className="mt-6 flex flex-wrap gap-2 justify-end">
                    <Pill>متابعة الصنّاع</Pill>
                    <Pill>غرف النقاش</Pill>
                    <Pill>تفاعلات ذكية</Pill>
                    <Pill>قوائم مشاهدة</Pill>
                    <Pill>مراجعات</Pill>
                  </div>
                </GlassCard>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={tBase}
                className="lg:col-span-4 lg:row-span-1"
              >
                <ImageCard
                  title="اكتشاف"
                  desc="توصيات حسب الذوق + إشارات جودة… بدل الضجيج"
                  image={ASSETS.neonStreet}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={tBase}
                className="lg:col-span-4 lg:row-span-1"
              >
                <ImageCard
                  title="إشراف"
                  desc="قواعد واضحة + فلترة ذكية للمحتوى والسبام"
                  image={ASSETS.signs}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={tBase}
                className="lg:col-span-4 lg:row-span-2"
              >
                <ImageCard
                  title="SEO+"
                  desc="صفحات منظمة (عمل → شخصيات → حلقات/فصول → مراجعات → نقاشات) لنمو أسرع من البحث."
                  image={ASSETS.manga}
                  big
                />
              </motion.div>
            </div>
          </div>
        </section>

        {/* COMMUNITY */}
        <section id="community" className="scroll-mt-24 py-14 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-6 lg:grid-cols-12">
              <div className="lg:col-span-9">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={worksPage}
                    initial={{ opacity: 0, x: reduceMotion ? 0 : 18 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: reduceMotion ? 0 : -18 }}
                    transition={tFast}
                    className="grid gap-4 md:grid-cols-3"
                  >
                    {worksSlice.map((w) => (
                      <WorkCard key={w.title} {...w} />
                    ))}
                  </motion.div>
                </AnimatePresence>

                <div className="mt-8 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CircleArrow
                      dir="prev"
                      onClick={() => setWorksPage((p) => (p - 1 + worksPagesCount) % worksPagesCount)}
                    />
                    <CircleArrow
                      dir="next"
                      onClick={() => setWorksPage((p) => (p + 1) % worksPagesCount)}
                    />
                  </div>

                  <div className="flex items-center justify-center gap-2">
                    {Array.from({ length: worksPagesCount }).map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setWorksPage(i)}
                        className={cn(
                          "h-2.5 rounded-full transition",
                          i === worksPage
                            ? "w-7 bg-violet-500 dark:bg-yellow-300"
                            : "w-2.5 bg-black/20 hover:bg-black/30 dark:bg-white/20 dark:hover:bg-white/30",
                        )}
                        aria-label={`صفحة ${i + 1}`}
                      />
                    ))}
                  </div>

                  <div className="w-[92px]" />
                </div>
              </div>

              <div className="lg:col-span-3 flex items-center justify-end">
                <div className="text-right">
                  <h3 className="text-4xl font-black leading-tight">محتوى المجتمع</h3>
                  <p className="mt-3 text-sm text-zinc-700 dark:text-white/70 leading-relaxed">
                    إبراز المجتمع، الصنّاع، المراجعات، وصفحات المحتوى… بصيغة كروت أنيقة مع صور.
                  </p>
                  <div className="mt-5">
                    <a
                      href="#cta"
                      className="inline-flex items-center justify-center rounded-full bg-violet-500 px-5 py-2.5 text-sm font-black text-white hover:bg-violet-600 dark:bg-violet-400/90 dark:text-[#07060f] dark:hover:bg-violet-300 transition"
                    >
                      انضم الآن <span className="ms-2">←</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* NEWS */}
        <section id="news" className="scroll-mt-24 py-14 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-6 lg:grid-cols-12">
              <div className="lg:col-span-9">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={newsPage}
                    initial={{ opacity: 0, x: reduceMotion ? 0 : 18 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: reduceMotion ? 0 : -18 }}
                    transition={tFast}
                    className="grid gap-4 md:grid-cols-3"
                  >
                    {newsSlice.map((n) => (
                      <NewsCard key={n.title} {...n} />
                    ))}
                  </motion.div>
                </AnimatePresence>

                <div className="mt-8 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CircleArrow
                      dir="prev"
                      onClick={() => setNewsPage((p) => (p - 1 + newsPagesCount) % newsPagesCount)}
                    />
                    <CircleArrow
                      dir="next"
                      onClick={() => setNewsPage((p) => (p + 1) % newsPagesCount)}
                    />
                  </div>

                  <div className="flex items-center justify-center gap-2">
                    {Array.from({ length: newsPagesCount }).map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setNewsPage(i)}
                        className={cn(
                          "h-2.5 rounded-full transition",
                          i === newsPage
                            ? "w-7 bg-violet-500 dark:bg-yellow-300"
                            : "w-2.5 bg-black/20 hover:bg-black/30 dark:bg-white/20 dark:hover:bg-white/30",
                        )}
                        aria-label={`صفحة أخبار ${i + 1}`}
                      />
                    ))}
                  </div>

                  <div className="w-[92px]" />
                </div>
              </div>

              <div className="lg:col-span-3 flex items-center justify-end">
                <div className="text-right">
                  <h3 className="text-4xl font-black leading-tight">الأخبار والتحديثات</h3>
                  <p className="mt-3 text-sm text-zinc-700 dark:text-white/70 leading-relaxed">
                    نعرض القادم: مزايا، تحسينات، وتجارب جديدة… بشكل واضح للمجتمع.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="scroll-mt-24 py-14 sm:py-20">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-center text-4xl font-black tracking-tight sm:text-6xl">
              الأسئلة الشائعة
            </h2>

            <div className="mt-10 space-y-4">
              {faqs.map((f) => (
                <FaqRow key={f.q} q={f.q} a={f.a} />
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section id="cta" className="py-14 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="relative overflow-hidden rounded-[36px] border border-black/10 bg-white/60 p-7 dark:border-white/10 dark:bg-white/5 sm:p-10">
              <div className="absolute inset-0">
                <Image
                  src={ASSETS.neonStreet}
                  alt="CTA background"
                  fill
                  sizes="(max-width: 768px) 100vw, 1200px"
                  className="object-cover opacity-20 dark:opacity-25"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-white via-white/70 to-white/40 dark:from-[#07060f] dark:via-[#07060f]/55 dark:to-[#07060f]/20" />
              </div>

              <div className="relative grid gap-8 lg:grid-cols-2 lg:items-center">
                <div className="text-right">
                  <h3 className="text-3xl font-black tracking-tight sm:text-4xl">
                    جاهز تبني مجتمع الأنمي الخاص بك؟
                  </h3>
                  <p className="mt-3 text-sm text-zinc-700 dark:text-white/70 leading-relaxed sm:text-base">
                    ابدأ الآن بقائمة مبكرة — وبعدها نربط الصفحة بـ Auth + Onboarding + Waitlist.
                  </p>

                  <div className="mt-6 flex flex-col items-end gap-3 sm:flex-row sm:justify-end">
                    <a
                      href="#download"
                      className={cn(
                        "inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-black transition",
                        "bg-zinc-950 text-white hover:bg-zinc-800",
                        "dark:bg-white dark:text-[#07060f] dark:hover:opacity-90",
                      )}
                    >
                      حمّل التطبيق <span className="ms-2">←</span>
                    </a>
                    <a
                      href="#platform"
                      className={cn(
                        "inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-black transition",
                        "border border-black/10 bg-white/70 hover:bg-white",
                        "dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10",
                      )}
                    >
                      شاهد المنصة
                    </a>
                  </div>
                </div>

                <div className="rounded-[28px] border border-black/10 bg-white/70 p-6 dark:border-white/10 dark:bg-[#0a0913]/60">
                  <div className="text-right">
                    <div className="text-sm font-black">القائمة المبكرة</div>
                    <div className="mt-1 text-xs text-zinc-600 dark:text-white/60">
                      اترك بريدك (واجهة فقط — اربطها لاحقًا بـ API)
                    </div>
                  </div>

                  <div className="mt-4 flex flex-col gap-3">
                    <input
                      type="email"
                      placeholder="بريدك الإلكتروني"
                      className={cn(
                        "h-12 rounded-2xl border px-4 text-sm outline-none transition",
                        "border-black/10 bg-white text-zinc-900 placeholder:text-zinc-400 focus:border-violet-500/60",
                        "dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-white/40 dark:focus:border-violet-300/60",
                      )}
                    />
                    <button
                      type="button"
                      className="h-12 rounded-2xl bg-violet-500 text-sm font-black text-white hover:bg-violet-600 dark:bg-violet-400/90 dark:text-[#07060f] dark:hover:bg-violet-300 transition"
                    >
                      انضم الآن
                    </button>

                    <div className="text-xs text-zinc-600 dark:text-white/55 text-right leading-relaxed">
                      بالانضمام، ستصلك تحديثات الإطلاق ومزايا الوصول المبكر — بدون إزعاج.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <footer className="mt-10 border-t border-black/10 pt-8 text-center text-xs text-zinc-600 dark:border-white/10 dark:text-white/55">
              © {new Date().getFullYear()} فنّارة — جميع الحقوق محفوظة
            </footer>
          </div>
        </section>
      </main>
    </div>
  );
}

/* ------------------------- UI Blocks ------------------------- */

function GlassCard({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        "rounded-[28px] border bg-white/60 backdrop-blur",
        "border-black/10 shadow-[0_0_0_1px_rgba(0,0,0,0.04)]",
        "dark:border-white/10 dark:bg-white/5 dark:shadow-[0_0_0_1px_rgba(255,255,255,0.06)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-black/10 bg-white/70 px-4 py-2 text-xs font-black text-zinc-800 dark:border-white/10 dark:bg-white/5 dark:text-white/85">
      {children}
    </span>
  );
}

function CircleArrow({ dir, onClick }: { dir: "prev" | "next"; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="grid h-11 w-11 place-items-center rounded-full border border-black/10 bg-white/70 text-zinc-800 hover:bg-white transition dark:border-white/10 dark:bg-white/5 dark:text-white/80 dark:hover:bg-white/10"
      aria-label={dir === "prev" ? "السابق" : "التالي"}
    >
      {dir === "prev" ? "‹" : "›"}
    </button>
  );
}

function Li({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start justify-end gap-3">
      <span className="mt-2 inline-block h-2 w-2 rounded-full bg-violet-500 dark:bg-yellow-300" />
      <span className="text-right">{children}</span>
    </li>
  );
}

function ImageCard({ title, desc, image, big }: { title: string; desc: string; image: string; big?: boolean }) {
  return (
    <GlassCard className={cn("relative overflow-hidden p-7 sm:p-9", big && "min-h-[280px]")}>
      <div className="absolute inset-0">
        <Image src={image} alt={title} fill className="object-cover opacity-25 dark:opacity-25" sizes="(max-width: 768px) 100vw, 800px" />
        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/60 to-transparent dark:from-[#07060f] dark:via-[#07060f]/55 dark:to-transparent" />
      </div>

      <div className="relative text-right">
        <div className="text-4xl font-black">{title}</div>
        <div className="mt-2 text-sm text-zinc-700 dark:text-white/70">{desc}</div>

        <div className="mt-6 space-y-2">
          <div className="h-2 w-24 rounded-full bg-violet-500/60 dark:bg-violet-300/50" />
          <div className="h-2 w-40 rounded-full bg-black/10 dark:bg-white/10" />
          <div className="h-2 w-32 rounded-full bg-black/10 dark:bg-white/10" />
        </div>
      </div>
    </GlassCard>
  );
}

function WorkCard({ title, tag, desc, image }: CardItem) {
  return (
    <div className="overflow-hidden rounded-[26px] border border-black/10 bg-white/60 dark:border-white/10 dark:bg-white/5">
      <div className="relative h-40">
        <Image src={image} alt={title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 420px" />
        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/30 to-transparent dark:from-[#07060f] dark:via-[#07060f]/30 dark:to-transparent" />
      </div>

      <div className="p-5 text-right">
        <div className="text-xs text-violet-600 font-bold dark:text-yellow-300">{tag}</div>
        <div className="mt-2 text-lg font-black">{title}</div>
        <p className="mt-2 text-sm text-zinc-700 dark:text-white/70 leading-relaxed">{desc}</p>

        <div className="mt-4 flex items-center justify-end gap-2 text-violet-600 dark:text-yellow-300">
          <span className="text-sm font-black">استكشف</span>
          <span className="text-lg">↗</span>
        </div>
      </div>
    </div>
  );
}

function NewsCard({ title, date, desc, image }: NewsItem) {
  return (
    <div className="overflow-hidden rounded-[26px] border border-black/10 bg-white/60 dark:border-white/10 dark:bg-white/5">
      <div className="relative h-40">
        <Image src={image} alt={title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 420px" />
        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/30 to-transparent dark:from-[#07060f] dark:via-[#07060f]/30 dark:to-transparent" />
      </div>

      <div className="p-5 text-right">
        <div className="flex items-center justify-between text-xs text-zinc-600 dark:text-white/60">
          <span>{date}</span>
          <span className="text-violet-600 font-bold dark:text-yellow-300">تحديث</span>
        </div>

        <div className="mt-3 text-base font-black leading-snug">{title}</div>
        <p className="mt-2 text-sm text-zinc-700 dark:text-white/70 leading-relaxed">{desc}</p>

        <div className="mt-4 flex items-center justify-end gap-2 text-violet-600 dark:text-yellow-300">
          <span className="text-sm font-black">اقرأ</span>
          <span className="text-lg">↗</span>
        </div>
      </div>
    </div>
  );
}

function FaqRow({ q, a }: { q: string; a: string }) {
  return (
    <details className="group rounded-2xl border border-black/10 bg-white/60 px-5 py-4 open:bg-white transition dark:border-white/10 dark:bg-white/5 dark:open:bg-white/10">
      <summary className="cursor-pointer list-none">
        <div dir="ltr" className="flex items-center gap-4">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-black/5 border border-black/10 text-zinc-900 text-xl dark:bg-white/5 dark:border-white/10 dark:text-white/90">
            <span className="group-open:rotate-45 transition inline-block">+</span>
          </div>
          <div dir="rtl" className="flex-1 text-right text-sm sm:text-base font-black">
            {q}
          </div>
        </div>
      </summary>
      <div className="mt-3 text-right text-sm text-zinc-700 dark:text-white/75 leading-relaxed">{a}</div>
    </details>
  );
}
