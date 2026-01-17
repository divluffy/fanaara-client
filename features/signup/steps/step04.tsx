// features/signup/steps/step04.tsx
"use client";

import React from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { motion, useReducedMotion } from "framer-motion";
import { useLocale } from "next-intl";

import { LocalizedSelect, type SelectOption } from "@/design/Select";
import { Button } from "@/design/button";
import { cn } from "@/utils";
import { useAppSelector } from "@/redux/hooks";
import type { SignupStep1Props } from "@/types";

type Step04Values = {
  purpose: string[]; // <- multi now
  interests: string[];
  genres: string[];
};

const PURPOSE: SelectOption[] = [
  // Community & Social
  {
    value: "make-friends",
    label: "Make friends",
    description: "Meet fans & build your circle",
    group: "Community",
  },
  {
    value: "join-clubs",
    label: "Join clubs",
    description: "Fandom groups & communities",
    group: "Community",
  },
  {
    value: "watch-parties",
    label: "Watch parties",
    description: "Group streams & episode nights",
    group: "Community",
  },
  {
    value: "reading-rooms",
    label: "Reading rooms",
    description: "Manga / comics reading sessions",
    group: "Community",
  },
  {
    value: "meetups-events",
    label: "Meetups & events",
    description: "Local + online hangouts",
    group: "Community",
  },
  {
    value: "find-crew",
    label: "Find a crew",
    description: "People with the same taste",
    group: "Community",
  },

  // Discover & Track
  {
    value: "discover-titles",
    label: "Discover titles",
    description: "Find new anime, manga & comics",
    group: "Discover & Track",
  },
  {
    value: "recommendations",
    label: "Get recommendations",
    description: "Personalized suggestions",
    group: "Discover & Track",
  },
  {
    value: "seasonal",
    label: "Seasonal hub",
    description: "What’s airing / trending",
    group: "Discover & Track",
  },
  {
    value: "track-lists",
    label: "Track my lists",
    description: "Watchlist / reading list",
    group: "Discover & Track",
  },
  {
    value: "stats",
    label: "Stats & insights",
    description: "See your taste + progress",
    group: "Discover & Track",
  },

  // Create & Share
  {
    value: "reviews",
    label: "Write reviews",
    description: "Ratings, reactions, and breakdowns",
    group: "Create & Share",
  },
  {
    value: "posts",
    label: "Post & discuss",
    description: "Threads, opinions, and takes",
    group: "Create & Share",
  },
  {
    value: "fanart",
    label: "Share fanart",
    description: "Illustrations, sketches & art",
    group: "Create & Share",
  },
  {
    value: "edits-amv",
    label: "Share edits / AMVs",
    description: "Clips, edits, and videos",
    group: "Create & Share",
  },
  {
    value: "cosplay",
    label: "Cosplay showcase",
    description: "Fits, builds & photos",
    group: "Create & Share",
  },
  {
    value: "fanfiction",
    label: "Write fanfiction",
    description: "Stories, one-shots & series",
    group: "Create & Share",
  },
  {
    value: "portfolio",
    label: "Build a portfolio",
    description: "Creator profile + showcase",
    group: "Create & Share",
  },

  // Workspace (your programs)
  {
    value: "workspace-projects",
    label: "Workspace projects",
    description: "Organize programs & projects",
    group: "Workspace",
  },
  {
    value: "collaboration",
    label: "Collaborate",
    description: "Find teammates & build together",
    group: "Workspace",
  },
  {
    value: "challenges",
    label: "Challenges",
    description: "Art, writing, cosplay challenges",
    group: "Workspace",
  },
  {
    value: "learning",
    label: "Learn & improve",
    description: "Tutorials, feedback, practice",
    group: "Workspace",
  },
  {
    value: "focus-rooms",
    label: "Focus rooms",
    description: "Study / grind / build sessions",
    group: "Workspace",
  },
  {
    value: "teams-guilds",
    label: "Teams / guilds",
    description: "Run groups like a squad",
    group: "Workspace",
  },
];

const INTERESTS: SelectOption[] = [
  // Discussion
  {
    value: "episode-discussion",
    label: "Episode discussions",
    description: "Weekly episode threads",
    group: "Discussion",
  },
  {
    value: "chapter-discussion",
    label: "Chapter discussions",
    description: "Manga / comics chapter talk",
    group: "Discussion",
  },
  {
    value: "theories",
    label: "Theories",
    description: "Predictions & lore",
    group: "Discussion",
  },
  {
    value: "analysis",
    label: "Analysis",
    description: "Deep dives & breakdowns",
    group: "Discussion",
  },
  {
    value: "character-talk",
    label: "Characters",
    description: "Favorites, arcs, and rankings",
    group: "Discussion",
  },
  {
    value: "ships",
    label: "Ships",
    description: "Romance & pairings",
    group: "Discussion",
  },
  {
    value: "powerscaling",
    label: "Power scaling",
    description: "Matchups & debates",
    group: "Discussion",
  },
  {
    value: "spoilers",
    label: "Spoilers zone",
    description: "Spoiler-friendly threads",
    group: "Discussion",
  },

  // Content & Creation
  {
    value: "fanart",
    label: "Fanart",
    description: "Art posts & galleries",
    group: "Creation",
  },
  {
    value: "cosplay",
    label: "Cosplay",
    description: "Builds, wigs, armor, photos",
    group: "Creation",
  },
  {
    value: "amv-edits",
    label: "AMVs / edits",
    description: "Edits, clips & montages",
    group: "Creation",
  },
  {
    value: "writing",
    label: "Writing",
    description: "Fanfic, scripts, storytelling",
    group: "Creation",
  },
  {
    value: "oc-worldbuilding",
    label: "OCs & worldbuilding",
    description: "Original characters & lore",
    group: "Creation",
  },
  {
    value: "art-tutorials",
    label: "Art tutorials",
    description: "Tips, brushes, process",
    group: "Creation",
  },
  {
    value: "voice-acting",
    label: "Voice acting",
    description: "Dubs, clips & practice",
    group: "Creation",
  },
  {
    value: "music-ops",
    label: "Openings / endings",
    description: "OP/ED talk & playlists",
    group: "Creation",
  },
  {
    value: "ost",
    label: "OST",
    description: "Soundtracks & composers",
    group: "Creation",
  },

  // Discovery & News
  {
    value: "recommendations",
    label: "Recommendations",
    description: "What should I watch/read next?",
    group: "Discovery",
  },
  {
    value: "seasonal",
    label: "Seasonal releases",
    description: "Airing charts & hype",
    group: "Discovery",
  },
  {
    value: "news",
    label: "News",
    description: "Industry updates",
    group: "Discovery",
  },
  {
    value: "announcements",
    label: "Announcements",
    description: "New seasons, adaptations, trailers",
    group: "Discovery",
  },

  // Culture & Events
  {
    value: "conventions",
    label: "Conventions",
    description: "Cons, meetups, and photos",
    group: "Culture",
  },
  {
    value: "japan-culture",
    label: "Japanese culture",
    description: "Language, food, traditions",
    group: "Culture",
  },
  {
    value: "k-culture",
    label: "K-culture",
    description: "Manhwa, webtoons, trends",
    group: "Culture",
  },

  // Merch & Collecting
  {
    value: "collecting",
    label: "Collecting",
    description: "Figures & merch",
    group: "Collecting",
  },
  {
    value: "figures",
    label: "Figures",
    description: "Hauls, displays, reviews",
    group: "Collecting",
  },
  {
    value: "tcg",
    label: "Trading cards",
    description: "TCG, packs & decks",
    group: "Collecting",
  },
  {
    value: "manga-hauls",
    label: "Manga hauls",
    description: "Shelfies & collections",
    group: "Collecting",
  },

  // Games
  {
    value: "gaming",
    label: "Gaming",
    description: "Anime games & JRPGs",
    group: "Games",
  },
  {
    value: "gacha",
    label: "Gacha games",
    description: "Pulls, meta, events",
    group: "Games",
  },
  {
    value: "visual-novels",
    label: "Visual novels",
    description: "Routes, endings, stories",
    group: "Games",
  },

  // Fun
  { value: "memes", label: "Memes", description: "Fun & chaos", group: "Fun" },
  {
    value: "quizzes",
    label: "Quizzes",
    description: "Trivia & personality tests",
    group: "Fun",
  },
  {
    value: "polls",
    label: "Polls",
    description: "Vote on anything",
    group: "Fun",
  },

  // Workspace
  {
    value: "workspace-projects",
    label: "Workspace projects",
    description: "Build programs & collabs",
    group: "Workspace",
  },
  {
    value: "collab-teams",
    label: "Collab teams",
    description: "Find artists/writers/editors",
    group: "Workspace",
  },
  {
    value: "challenges",
    label: "Challenges",
    description: "Community challenges & sprints",
    group: "Workspace",
  },
  {
    value: "focus-rooms",
    label: "Focus rooms",
    description: "Study / build / grind sessions",
    group: "Workspace",
  },
];

const GENRES: SelectOption[] = [
  // Demographics (JP)
  {
    value: "kodomo",
    label: "Kodomo",
    description: "Kids / family",
    group: "Demographic",
  },
  {
    value: "shonen",
    label: "Shonen",
    description: "Action & growth",
    group: "Demographic",
  },
  {
    value: "shojo",
    label: "Shojo",
    description: "Romance & emotions",
    group: "Demographic",
  },
  {
    value: "seinen",
    label: "Seinen",
    description: "Mature themes",
    group: "Demographic",
  },
  {
    value: "josei",
    label: "Josei",
    description: "Adult romance & life",
    group: "Demographic",
  },

  // Format & Origin
  {
    value: "manga",
    label: "Manga",
    description: "Japanese comics",
    group: "Format & Origin",
  },
  {
    value: "manhwa",
    label: "Manhwa",
    description: "Korean comics",
    group: "Format & Origin",
  },
  {
    value: "manhua",
    label: "Manhua",
    description: "Chinese comics",
    group: "Format & Origin",
  },
  {
    value: "webtoon",
    label: "Webtoon",
    description: "Vertical scroll format",
    group: "Format & Origin",
  },
  {
    value: "western-comics",
    label: "Western comics",
    description: "US/EU comics",
    group: "Format & Origin",
  },
  {
    value: "graphic-novel",
    label: "Graphic novel",
    description: "Long-form comics",
    group: "Format & Origin",
  },
  {
    value: "light-novel",
    label: "Light novel",
    description: "LN adaptations / vibe",
    group: "Format & Origin",
  },

  // Core Genres
  {
    value: "action",
    label: "Action",
    description: "Fights & intensity",
    group: "Core",
  },
  {
    value: "adventure",
    label: "Adventure",
    description: "Journeys & quests",
    group: "Core",
  },
  {
    value: "comedy",
    label: "Comedy",
    description: "Laughs & chaos",
    group: "Core",
  },
  {
    value: "drama",
    label: "Drama",
    description: "Heavy emotions",
    group: "Core",
  },
  {
    value: "romance",
    label: "Romance",
    description: "Love stories",
    group: "Core",
  },
  {
    value: "fantasy",
    label: "Fantasy",
    description: "Magic & worlds",
    group: "Core",
  },
  {
    value: "sci-fi",
    label: "Sci-Fi",
    description: "Tech & space",
    group: "Core",
  },
  {
    value: "mystery",
    label: "Mystery",
    description: "Secrets & clues",
    group: "Core",
  },
  {
    value: "thriller",
    label: "Thriller",
    description: "Tension & twists",
    group: "Core",
  },
  {
    value: "horror",
    label: "Horror",
    description: "Fear & darkness",
    group: "Core",
  },
  {
    value: "supernatural",
    label: "Supernatural",
    description: "Spirits & powers",
    group: "Core",
  },
  {
    value: "psychological",
    label: "Psychological",
    description: "Mind games",
    group: "Core",
  },
  {
    value: "slice-of-life",
    label: "Slice of Life",
    description: "Everyday vibes",
    group: "Core",
  },
  {
    value: "sports",
    label: "Sports",
    description: "Competition",
    group: "Core",
  },
  {
    value: "music",
    label: "Music",
    description: "Bands, idols, performances",
    group: "Core",
  },
  {
    value: "historical",
    label: "Historical",
    description: "Past eras",
    group: "Core",
  },
  {
    value: "crime",
    label: "Crime",
    description: "Mafia, gangs, cases",
    group: "Core",
  },
  {
    value: "war",
    label: "War",
    description: "Conflict & survival",
    group: "Core",
  },
  {
    value: "military",
    label: "Military",
    description: "Units & tactics",
    group: "Core",
  },
  {
    value: "mecha",
    label: "Mecha",
    description: "Robots & pilots",
    group: "Core",
  },
  {
    value: "magical-girl",
    label: "Magical Girl",
    description: "Transformations & teams",
    group: "Core",
  },
  {
    value: "superhero",
    label: "Superhero",
    description: "Heroes & villains",
    group: "Core",
  },

  // Themes & Tropes
  {
    value: "isekai",
    label: "Isekai",
    description: "Another world",
    group: "Themes",
  },
  {
    value: "reincarnation",
    label: "Reincarnation",
    description: "Second life",
    group: "Themes",
  },
  {
    value: "time-travel",
    label: "Time Travel",
    description: "Loops & rewinds",
    group: "Themes",
  },
  {
    value: "school-life",
    label: "School Life",
    description: "Clubs & drama",
    group: "Themes",
  },
  {
    value: "college-life",
    label: "College Life",
    description: "Campus stories",
    group: "Themes",
  },
  {
    value: "workplace",
    label: "Workplace",
    description: "Office / jobs",
    group: "Themes",
  },
  {
    value: "coming-of-age",
    label: "Coming of Age",
    description: "Growing up",
    group: "Themes",
  },
  {
    value: "found-family",
    label: "Found Family",
    description: "Chosen bonds",
    group: "Themes",
  },
  {
    value: "tournament",
    label: "Tournament Arc",
    description: "Brackets & battles",
    group: "Themes",
  },
  {
    value: "martial-arts",
    label: "Martial Arts",
    description: "Techniques & discipline",
    group: "Themes",
  },
  {
    value: "samurai",
    label: "Samurai",
    description: "Swords & honor",
    group: "Themes",
  },
  {
    value: "ninja",
    label: "Ninja",
    description: "Stealth & clans",
    group: "Themes",
  },
  {
    value: "pirates",
    label: "Pirates",
    description: "Seas & treasure",
    group: "Themes",
  },
  {
    value: "space",
    label: "Space",
    description: "Cosmic adventures",
    group: "Themes",
  },
  {
    value: "space-opera",
    label: "Space Opera",
    description: "Epic scale sci-fi",
    group: "Themes",
  },
  {
    value: "cyberpunk",
    label: "Cyberpunk",
    description: "Neon + dystopia",
    group: "Themes",
  },
  {
    value: "steampunk",
    label: "Steampunk",
    description: "Gears & airships",
    group: "Themes",
  },
  {
    value: "post-apocalyptic",
    label: "Post-Apocalyptic",
    description: "After the fall",
    group: "Themes",
  },
  {
    value: "dystopian",
    label: "Dystopian",
    description: "Broken systems",
    group: "Themes",
  },
  {
    value: "survival",
    label: "Survival",
    description: "Last one standing",
    group: "Themes",
  },
  {
    value: "zombies",
    label: "Zombies",
    description: "Undead threats",
    group: "Themes",
  },
  {
    value: "vampires",
    label: "Vampires",
    description: "Night legends",
    group: "Themes",
  },
  {
    value: "werewolves",
    label: "Werewolves",
    description: "Beasts & curses",
    group: "Themes",
  },
  {
    value: "monsters",
    label: "Monsters",
    description: "Creatures & hunts",
    group: "Themes",
  },
  {
    value: "kaiju",
    label: "Kaiju",
    description: "Giant monsters",
    group: "Themes",
  },
  {
    value: "aliens",
    label: "Aliens",
    description: "Visitors & invasions",
    group: "Themes",
  },
  {
    value: "detective",
    label: "Detective",
    description: "Cases & mysteries",
    group: "Themes",
  },
  {
    value: "heist",
    label: "Heist",
    description: "Plans & betrayals",
    group: "Themes",
  },
  {
    value: "spy",
    label: "Spy",
    description: "Agents & missions",
    group: "Themes",
  },
  {
    value: "political",
    label: "Political",
    description: "Power & strategy",
    group: "Themes",
  },
  {
    value: "medical",
    label: "Medical",
    description: "Hospitals & surgeons",
    group: "Themes",
  },
  {
    value: "legal",
    label: "Legal",
    description: "Courts & trials",
    group: "Themes",
  },
  {
    value: "business",
    label: "Business",
    description: "Money & hustle",
    group: "Themes",
  },
  {
    value: "gourmet",
    label: "Gourmet / Cooking",
    description: "Food & recipes",
    group: "Themes",
  },
  {
    value: "gaming",
    label: "Game World",
    description: "MMO / VR / game life",
    group: "Themes",
  },
  {
    value: "idol",
    label: "Idol",
    description: "Showbiz & stages",
    group: "Themes",
  },
  {
    value: "parody",
    label: "Parody",
    description: "Spoofs & references",
    group: "Themes",
  },
  {
    value: "satire",
    label: "Satire",
    description: "Sharp humor",
    group: "Themes",
  },
  {
    value: "tragedy",
    label: "Tragedy",
    description: "Tearjerkers",
    group: "Themes",
  },

  // Relationship & Romance subtypes
  {
    value: "harem",
    label: "Harem",
    description: "Many love interests",
    group: "Relationships",
  },
  {
    value: "reverse-harem",
    label: "Reverse Harem",
    description: "Many suitors",
    group: "Relationships",
  },
  {
    value: "bl",
    label: "Boys’ Love (BL)",
    description: "Romance between men",
    group: "Relationships",
  },
  {
    value: "gl",
    label: "Girls’ Love (GL)",
    description: "Romance between women",
    group: "Relationships",
  },
  {
    value: "otome",
    label: "Otome",
    description: "Romance game vibe",
    group: "Relationships",
  },
  {
    value: "love-triangle",
    label: "Love Triangle",
    description: "Complicated feelings",
    group: "Relationships",
  },

  // Tone / Content level
  {
    value: "dark-fantasy",
    label: "Dark Fantasy",
    description: "Grim worlds",
    group: "Tone",
  },
  {
    value: "urban-fantasy",
    label: "Urban Fantasy",
    description: "Magic in modern cities",
    group: "Tone",
  },
  {
    value: "noir",
    label: "Noir",
    description: "Gritty mystery vibe",
    group: "Tone",
  },
  {
    value: "wholesome",
    label: "Wholesome",
    description: "Feel-good stories",
    group: "Tone",
  },
  {
    value: "iyashikei",
    label: "Iyashikei",
    description: "Healing & calm",
    group: "Tone",
  },
  {
    value: "mature",
    label: "Mature",
    description: "Adult themes",
    group: "Tone",
  },
  {
    value: "ecchi",
    label: "Ecchi",
    description: "Fanservice (not explicit)",
    group: "Tone",
  },
];

const COPY = {
  ar: {
    title: "خلّينا نفهم ذوقك",
    subtitle: "اختيارات بسيطة تساعدنا نرتّب تجربتك.",
    purpose: "ليش انضمّيت؟ (اختر على الأقل عنصر واحد)",
    interests: "إيش تهتم تتابع؟ (اختر 3 على الأقل)",
    genres: "إيش الأنواع اللي تحبها؟ (اختر 3 على الأقل)",
    continue: "متابعة",
    min1: "اختر عنصر واحد على الأقل.",
    min3: "اختر 3 عناصر على الأقل.",
  },
  en: {
    title: "Tell us your vibe",
    subtitle: "A few picks to personalize your feed.",
    purpose: "Why did you join? (pick at least 1)",
    interests: "What are you into? (pick at least 3)",
    genres: "Preferred genres (pick at least 3)",
    continue: "Continue",
    min1: "Pick at least 1 item.",
    min3: "Pick at least 3 items.",
  },
  tr: {
    title: "Tarzını söyle",
    subtitle: "Deneyimini kişiselleştirelim.",
    purpose: "Neden katıldın? (en az 1)",
    interests: "Neler ilgini çekiyor? (en az 3)",
    genres: "Sevdiğin türler (en az 3)",
    continue: "Devam",
    min1: "En az 1 öğe seç.",
    min3: "En az 3 öğe seç.",
  },
} as const;

type CopyLocale = keyof typeof COPY;

function toArray(value: string | string[] | null): string[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

export default function Step04({ onSuccess }: SignupStep1Props) {
  const reduceMotion = useReducedMotion();
  const { isRTL, direction } = useAppSelector((s) => s.state);

  const locale = useLocale();
  const copy = COPY[(locale as CopyLocale) ?? "en"] ?? COPY.en;

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<Step04Values>({
    mode: "onChange",
    defaultValues: { purpose: [], interests: [], genres: [] },
  });

  const onSubmit: SubmitHandler<Step04Values> = async () => {
    onSuccess?.();
  };

  return (
    <div dir={direction} className="space-y-4">
      <motion.header
        initial={reduceMotion ? false : { opacity: 0, y: 8 }}
        animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
        className="text-center space-y-1"
      >
        <h2 className="text-[18px] sm:text-[20px] font-extrabold text-foreground-strong">
          <bdi>{copy.title}</bdi>
        </h2>
        <p className="text-[12.5px] text-foreground-muted">
          <bdi>{copy.subtitle}</bdi>
        </p>
      </motion.header>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        {/* Purpose (multi min 1, no search) */}
        <Controller
          control={control}
          name="purpose"
          rules={{
            validate: (v) =>
              Array.isArray(v) && v.length >= 1 ? true : copy.min1,
          }}
          render={({ field }) => (
            <div>
              <LocalizedSelect
                label={copy.purpose}
                placeholder="Select…"
                options={PURPOSE}
                value={field.value}
                multiple
                searchable={false}
                variant="solid"
                onChange={(val) => field.onChange(toArray(val))}
              />
              {errors.purpose?.message ? (
                <p className="mt-1 text-xs text-danger-solid">
                  <bdi>{String(errors.purpose.message)}</bdi>
                </p>
              ) : null}
            </div>
          )}
        />

        {/* Interests (multi min 3, no search) */}
        <Controller
          control={control}
          name="interests"
          rules={{
            validate: (v) =>
              Array.isArray(v) && v.length >= 3 ? true : copy.min3,
          }}
          render={({ field }) => (
            <div>
              <LocalizedSelect
                label={copy.interests}
                placeholder="Select…"
                options={INTERESTS}
                value={field.value}
                multiple
                searchable={false}
                variant="solid"
                onChange={(val) => field.onChange(toArray(val))}
              />
              {errors.interests?.message ? (
                <p className="mt-1 text-xs text-danger-solid">
                  <bdi>{String(errors.interests.message)}</bdi>
                </p>
              ) : null}
            </div>
          )}
        />

        {/* Genres (multi min 3, keep search ON because list is big) */}
        <Controller
          control={control}
          name="genres"
          rules={{
            validate: (v) =>
              Array.isArray(v) && v.length >= 3 ? true : copy.min3,
          }}
          render={({ field }) => (
            <div>
              <LocalizedSelect
                label={copy.genres}
                placeholder="Select…"
                options={GENRES}
                value={field.value}
                multiple
                searchable
                variant="solid"
                onChange={(val) => field.onChange(toArray(val))}
              />
              {errors.genres?.message ? (
                <p className="mt-1 text-xs text-danger-solid">
                  <bdi>{String(errors.genres.message)}</bdi>
                </p>
              ) : null}
            </div>
          )}
        />

        <div className="pt-1">
          <Button
            type="submit"
            variant="gradient"
            gradient="aurora"
            size="xl"
            fullWidth
            isLoading={isSubmitting}
            loadingText="..."
            disabled={!isValid}
            className={cn("shadow-[var(--shadow-glow-brand)]")}
          >
            {copy.continue}
          </Button>
        </div>

        <div
          className={cn(
            "rounded-2xl border border-border-subtle bg-surface/60 p-3 text-[12px] text-foreground-muted",
            isRTL && "text-right"
          )}
        >
          <bdi>
            ✨ Anime UI tip: هذه الاختيارات تتحول لاحقًا لتغذية (Feed) مخصصة +
            اقتراحات متابعة.
          </bdi>
        </div>
      </form>
    </div>
  );
}
