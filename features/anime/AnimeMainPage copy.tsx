"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { 
  motion, 
  AnimatePresence, 
  useScroll, 
  useTransform 
} from "framer-motion";
import { 
  IoPlay, 
  IoAdd, 
  IoInformationCircleOutline, 
  IoStar, 
  IoCalendarOutline, 
  IoTimeOutline, 
  IoEyeOutline, 
  IoHeartOutline, 
  IoTrendingUpOutline, 
  IoFilter, 
  IoChevronForward, 
  IoChevronBack,
  IoWarningOutline,
  IoPerson
} from "react-icons/io5";

// --- استيراد المكونات الجاهزة (افترضنا وجودها في المسارات المحددة) ---
import { Button } from "@/design/DeButton"; // تأكد من المسار
import { Avatar } from "@/design/DeAvatar"; // تأكد من المسار
// (يمكنك استيراد DeModal أو DeOptions عند الحاجة للتفاعلات الإضافية)

// ==========================================
// 1. Mock Data (بيانات وهمية للمعاينة)
// ==========================================

const HERO_SLIDES = [
  {
    id: 1,
    title: "One Piece: Egghead Arc",
    image: "https://images5.alphacoders.com/133/1339947.png",
    logo: "https://upload.wikimedia.org/wikipedia/en/2/2c/One_Piece_Logo.svg",
    description: "تواصل قراصنة قبعة القش مغامراتهم في جزيرة إيجهيد، حيث تنتظرهم أسرار الدكتور فيجابونك ومواجهات مصيرية مع الحكومة العالمية.",
    tags: ["مغامرات", "اكشن", "خيال"],
    rating: 9.2,
    season: "شتاء 2024",
    year: 2024,
    type: "TV",
    episodes: "غير محدد",
    ageRating: "+13",
    studio: "Toei Animation",
    views: "1.2M",
    rank: "#1",
    popularity: "عالي جداً",
    addedBy: { name: "Ahmed Saber", date: "منذ يومين", avatar: "https://i.pravatar.cc/150?u=a042581f4e29026024d" },
    socialProof: [
      "https://i.pravatar.cc/150?u=1",
      "https://i.pravatar.cc/150?u=2",
      "https://i.pravatar.cc/150?u=3"
    ],
    warnings: ["عنف متوسط", "ألفاظ"],
    color: "var(--color-op-ocean)" 
  },
  {
    id: 2,
    title: "Solo Leveling",
    image: "https://images8.alphacoders.com/134/1346043.jpeg",
    description: "في عالم حيث الصيادون، البشر الذين يمتلكون قدرات سحرية، يجب عليهم محاربة الوحوش القاتلة لحماية الجنس البشري من الفناء المحتم.",
    tags: ["اكشن", "خيال", "سحر"],
    rating: 8.9,
    season: "شتاء 2024",
    year: 2024,
    type: "TV",
    episodes: "12 حلقة",
    ageRating: "+17",
    studio: "A-1 Pictures",
    views: "900K",
    rank: "#3",
    popularity: "متفجر",
    addedBy: { name: "Sarah Tech", date: "منذ ساعة", avatar: "https://i.pravatar.cc/150?u=sarah" },
    socialProof: ["https://i.pravatar.cc/150?u=4", "https://i.pravatar.cc/150?u=5"],
    warnings: ["دماء", "عنف شديد"],
    color: "var(--color-extra-purple)"
  },
  {
    id: 3,
    title: "Frieren: Beyond Journey's End",
    image: "https://images3.alphacoders.com/133/1333898.jpeg",
    description: "الساحرة فريرال، وهي قزم عاش لسنوات طويلة، تبدأ رحلة جديدة بعد هزيمة ملك الشياطين لتفهم معنى الحياة والعلاقات البشرية.",
    tags: ["دراما", "خيال", "شريحة من الحياة"],
    rating: 9.4,
    season: "خريف 2023",
    year: 2023,
    type: "TV",
    episodes: "28 حلقة",
    ageRating: "+13",
    studio: "Madhouse",
    views: "1.5M",
    rank: "#2",
    popularity: "أسطوري",
    addedBy: { name: "Fanaara Admin", date: "منذ أسبوع", avatar: "https://i.pravatar.cc/150?u=admin" },
    socialProof: ["https://i.pravatar.cc/150?u=6"],
    warnings: ["آمن للمشاهدة"],
    color: "var(--color-brand-500)"
  }
];

const CATEGORIES = [
  { id: "latest", label: "آخر المضاف" },
  { id: "trending", label: "الرائج الآن" },
  { id: "seasonal", label: "أنميات الموسم" },
  { id: "schedule", label: "جدول العرض" },
  { id: "action", label: "أكشن وإثارة" },
  { id: "isekai", label: "عوالم أخرى (Isekai)" },
  { id: "romance", label: "رومنسي" },
];

const ANIME_LIST = Array(8).fill(null).map((_, i) => ({
  id: i,
  title: i % 2 === 0 ? "Jujutsu Kaisen Season 2" : "Attack on Titan: Final",
  image: i % 2 === 0 
    ? "https://images7.alphacoders.com/132/1328972.jpeg" 
    : "https://images.alphacoders.com/605/605592.jpg",
  type: "TV",
  year: "2024",
  rating: "8.7",
  rank: `#${i + 1}`,
  views: "500K",
  status: "مستمر",
  episodes: i % 2 === 0 ? 24 : 12,
  tags: ["اكشن", "شياطين"]
}));

// ==========================================
// 2. Components Sections
// ==========================================

// --- A. بطاقة الأنمي الإنتاجية (القوائم) ---
const AnimeCard = ({ data }: { data: any }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group relative flex flex-col gap-2 w-full"
    >
      {/* Image Container */}
      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-xl bg-surface-soft shadow-sm border border-border-subtle group-hover:shadow-md transition-all duration-300 group-hover:border-brand-500/50">
        <Image 
          src={data.image} 
          alt={data.title} 
          fill 
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        
        {/* Overlay Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
        
        {/* Top Badges */}
        <div className="absolute top-2 start-2 flex gap-1">
          <span className="px-1.5 py-0.5 rounded-md bg-background-elevated/90 text-[10px] font-bold text-foreground-strong backdrop-blur-sm border border-white/10">
            {data.rank}
          </span>
          <span className="px-1.5 py-0.5 rounded-md bg-brand-600/90 text-[10px] font-bold text-white backdrop-blur-sm">
            {data.type}
          </span>
        </div>

        {/* Hover Actions (Desktop) / Always Visible Actions (Bottom) */}
        <div className="absolute bottom-2 inset-x-2 flex items-center justify-between">
           <div className="flex items-center gap-1 text-[10px] text-white font-medium">
             <IoStar className="text-accent-yellow" /> {data.rating}
           </div>
           <Button iconOnly size="xs" variant="inverse" shape="circle" className="opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0">
             <IoAdd />
           </Button>
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-col gap-1 px-1">
        <h3 className="text-sm font-bold text-foreground-strong truncate" title={data.title}>
          {data.title}
        </h3>
        <div className="flex items-center gap-2 text-[11px] text-foreground-muted">
           <span>{data.year}</span>
           <span className="h-1 w-1 rounded-full bg-border-strong" />
           <span>{data.status}</span>
           <span className="h-1 w-1 rounded-full bg-border-strong" />
           <span className="truncate max-w-[80px]">{data.tags[0]}</span>
        </div>
      </div>
    </motion.div>
  );
};

// --- B. القسم الرئيسي (Hero Slider) ---
const HeroSlider = () => {
  const [current, setCurrent] = useState(0);
  const total = HERO_SLIDES.length;

  // Auto-play
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % total);
    }, 8000);
    return () => clearInterval(timer);
  }, [total]);

  const slide = HERO_SLIDES[current];
  const nextSlide = HERO_SLIDES[(current + 1) % total];

  return (
    <section className="relative w-full h-[70vh] min-h-[500px] max-h-[800px] overflow-hidden bg-background-elevated group" dir="rtl">
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.id}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0"
        >
          {/* Background Image */}
          <div className="absolute inset-0">
            <Image 
              src={slide.image} 
              alt={slide.title} 
              fill 
              priority
              className="object-cover object-top"
            />
          </div>

          {/* Complex Gradient Overlays (Corner to Corner) */}
          {/* 1. Base Darkening */}
          <div className="absolute inset-0 bg-black/20" />
          
          {/* 2. Linear Gradient from Bottom-Start to Top-End */}
          <div 
            className="absolute inset-0 bg-gradient-to-tr from-background-page via-background-page/60 to-transparent" 
            style={{ 
              background: `linear-gradient(to top left, var(--bg-page) 10%, rgba(11, 18, 32, 0.7) 50%, transparent 100%)` 
            }}
          />
          
          {/* 3. Side Vignette for Text Readability */}
          <div className="absolute inset-y-0 right-0 w-full md:w-2/3 bg-gradient-to-l from-background-page via-background-page/40 to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Main Content Layer */}
      <div className="absolute inset-0 z-10 flex flex-col justify-end pb-12 md:pb-16 px-4 md:px-12 lg:px-20">
        <div className="relative w-full max-w-4xl flex flex-col gap-4 md:gap-6 items-start">
          
          {/* 1. Top Details: Name + Season + Tags */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            key={`meta-${slide.id}`}
            className="flex flex-col gap-2 items-start"
          >
             <div className="flex flex-wrap items-center gap-2 mb-1">
               {slide.tags.map((tag, idx) => (
                 <span key={idx} className="px-2 py-0.5 rounded text-[10px] md:text-xs font-medium bg-white/10 text-white backdrop-blur-md border border-white/5">
                   {tag}
                 </span>
               ))}
               <span className="px-2 py-0.5 rounded text-[10px] md:text-xs font-bold bg-brand-600 text-white">
                 {slide.season}
               </span>
             </div>

             <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white leading-tight drop-shadow-lg max-w-2xl">
               {slide.title}
             </h1>
          </motion.div>

          {/* 2. Direct Info Line */}
          <motion.div 
             initial={{ opacity: 0, x: 20 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ delay: 0.1 }}
             className="flex flex-wrap items-center gap-3 md:gap-6 text-xs md:text-sm text-gray-200 font-medium"
          >
            <div className="flex items-center gap-1">
               <IoStar className="text-accent-yellow text-lg" />
               <span className="text-white text-base font-bold">{slide.rating}</span>
            </div>
            <span className="w-1 h-1 rounded-full bg-gray-500" />
            <span>{slide.year}</span>
            <span className="w-1 h-1 rounded-full bg-gray-500" />
            <span>{slide.type}</span>
            <span className="w-1 h-1 rounded-full bg-gray-500" />
            <span>{slide.episodes}</span>
            <span className="w-1 h-1 rounded-full bg-gray-500" />
            <span className="px-1.5 py-0.5 border border-white/30 rounded text-[10px]">{slide.ageRating}</span>
          </motion.div>

          {/* 3. Description */}
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-sm md:text-base text-gray-300 max-w-xl line-clamp-2 md:line-clamp-2 leading-relaxed"
          >
            {slide.description}
          </motion.p>

          {/* 4. Action Buttons */}
          <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.3 }}
             className="flex flex-wrap items-center gap-3 pt-2"
          >
            <Button 
              size="lg" 
              tone="brand" 
              variant="solid" 
              className="px-8 font-bold text-white shadow-glow-brand"
              leftIcon={<IoPlay className="text-xl" />}
            >
              شاهد الآن
            </Button>
            
            <Button 
              size="lg" 
              tone="neutral" 
              variant="inverse"
              leftIcon={<IoAdd className="text-xl" />}
            >
              قائمة الانتظار
            </Button>

            <Button size="lg" variant="plain" tone="neutral" className="text-gray-300 hover:text-white">
              المزيد من التفاصيل
            </Button>
          </motion.div>

          {/* 5. Extra Metadata Buttons (Non-clickable/Info) */}
          <div className="hidden md:flex items-center gap-4 text-xs text-gray-400 mt-2">
             <span className="flex items-center gap-1 hover:text-brand-400 transition-colors cursor-pointer">
               <span className="font-semibold text-gray-300">الاستوديو:</span> {slide.studio}
             </span>
             <span className="flex items-center gap-1">
               <IoEyeOutline /> {slide.views}
             </span>
             <span className="flex items-center gap-1">
               <IoTrendingUpOutline /> {slide.rank}
             </span>
          </div>

          {/* Social Proof & Warnings */}
          <div className="flex flex-col md:flex-row md:items-center gap-4 mt-4">
             {/* Followed By */}
             <div className="flex items-center gap-2">
                <div className="flex -space-x-2 space-x-reverse">
                  {slide.socialProof.map((src, i) => (
                    <Avatar key={i} src={src} size="xs" className="border-2 border-background-page" />
                  ))}
                </div>
                <span className="text-[10px] text-gray-400">
                  يتابعه 3 من أصدقائك
                </span>
             </div>

             {/* Warnings */}
             {slide.warnings.length > 0 && (
               <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/30 border border-white/5 backdrop-blur-sm">
                 <IoWarningOutline className="text-warning-500" />
                 <div className="flex gap-1 text-[10px] text-gray-300">
                   {slide.warnings.map((w, i) => (
                     <span key={i}>{w}{i < slide.warnings.length -1 && ","}</span>
                   ))}
                 </div>
               </div>
             )}
          </div>

        </div>
      </div>

      {/* --- Added By Card (Distinctive) --- */}
      <div className="absolute top-24 left-4 md:left-12 z-20 hidden md:block">
        <motion.div 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="flex items-center gap-3 p-2 pr-4 rounded-full bg-surface-default/10 backdrop-blur-md border border-white/10 shadow-lg"
        >
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-gray-300">تمت الإضافة بواسطة</span>
            <span className="text-xs font-bold text-white">{slide.addedBy.name}</span>
          </div>
          <Avatar src={slide.addedBy.avatar} size="md" />
        </motion.div>
      </div>

      {/* --- Mini Slider (Desktop Only) --- */}
      <div className="absolute top-1/2 -translate-y-1/2 left-4 md:left-12 z-20 hidden lg:flex flex-col gap-3 w-48">
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 text-right">التالي</div>
          <motion.div 
            whileHover={{ scale: 1.05 }}
            onClick={() => setCurrent((current + 1) % total)}
            className="relative h-28 w-full rounded-xl overflow-hidden cursor-pointer border-2 border-transparent hover:border-brand-400 transition-colors shadow-2xl"
          >
            <Image src={nextSlide.image} alt="Next" fill className="object-cover" />
            <div className="absolute inset-0 bg-black/40 hover:bg-transparent transition-colors duration-300" />
            <div className="absolute bottom-2 right-2 text-white font-bold text-xs shadow-black drop-shadow-md">
              {nextSlide.title}
            </div>
          </motion.div>
          {/* Controls */}
          <div className="flex gap-2 justify-end">
            <button 
              onClick={() => setCurrent((current - 1 + total) % total)}
              className="p-2 rounded-full bg-black/40 text-white hover:bg-brand-500 transition-colors"
            >
              <IoChevronForward />
            </button>
            <button 
              onClick={() => setCurrent((current + 1) % total)}
              className="p-2 rounded-full bg-black/40 text-white hover:bg-brand-500 transition-colors"
            >
              <IoChevronBack />
            </button>
          </div>
      </div>
    </section>
  );
};

// ==========================================
// 3. Main Page Logic
// ==========================================

export default function AnimeHomePage() {
  const [activeTab, setActiveTab] = useState("latest");
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Fake Tab Change Effect
  const handleTabChange = (id: string) => {
    setActiveTab(id);
    // Logic to fetch new data would go here
  };

  return (
    <main className="min-h-screen bg-background-page text-foreground pb-20">
      
      {/* 1. Hero Section */}
      <HeroSlider />

      {/* 2. Filter / Navigation Bar (Sticky) */}
      <div className="sticky top-0 z-40 bg-background-page/95 backdrop-blur-xl border-b border-border-subtle py-3 shadow-sm transition-all">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between gap-4">
            
            {/* Scrollable Tabs */}
            <div 
              className="flex-1 overflow-x-auto no-scrollbar scroll-smooth"
              ref={scrollRef}
            >
              <div className="flex items-center gap-2 min-w-max pb-1" dir="rtl">
                {CATEGORIES.map((cat) => (
                  <Button
                    key={cat.id}
                    size="sm"
                    variant={activeTab === cat.id ? "solid" : "ghost"}
                    tone={activeTab === cat.id ? "brand" : "neutral"}
                    onClick={() => handleTabChange(cat.id)}
                    className={`rounded-full px-4 transition-all duration-300 ${activeTab === cat.id ? "shadow-glow-brand" : "text-foreground-muted hover:bg-surface-soft"}`}
                  >
                    {cat.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Extra Action */}
            <div className="hidden md:flex items-center gap-2 border-r border-border-subtle pr-4 mr-2">
               <Button size="sm" variant="ghost" leftIcon={<IoCalendarOutline />}>
                 جدول العرض
               </Button>
               <Button size="sm" variant="soft" tone="brand">
                 عرض الكل
               </Button>
            </div>

          </div>
        </div>
      </div>

      {/* 3. Dynamic Content Section */}
      <div className="container mx-auto px-4 md:px-6 py-8" dir="rtl">
        
        {/* Section Header */}
        <div className="flex items-center justify-between mb-6">
           <div className="flex flex-col gap-1">
             <h2 className="text-2xl font-bold text-foreground-strong flex items-center gap-2">
               {CATEGORIES.find(c => c.id === activeTab)?.label}
               <span className="text-xs font-normal text-foreground-muted bg-surface-soft px-2 py-0.5 rounded-full">
                 124 عمل
               </span>
             </h2>
             <p className="text-sm text-foreground-muted">
               تصفح أحدث الحلقات المضافة بجودة عالية
             </p>
           </div>
           
           <div className="flex gap-2">
             <Button iconOnly size="sm" variant="outline" title="تصفية">
               <IoFilter />
             </Button>
             <Button size="sm" variant="plain" rightIcon={<IoChevronBack />}>
               المزيد
             </Button>
           </div>
        </div>

        {/* Content Grid */}
        <motion.div 
          layout
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6"
        >
          <AnimatePresence mode="popLayout">
            {ANIME_LIST.map((anime) => (
              <AnimeCard key={`${activeTab}-${anime.id}`} data={anime} />
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Pagination / Load More */}
        <div className="mt-12 flex justify-center">
          <Button size="lg" variant="outline" tone="neutral" className="w-full md:w-auto px-12">
            تحميل المزيد من الأعمال
          </Button>
        </div>

      </div>

      {/* --- Footer Hint (Optional) --- */}
      <div className="text-center py-8 text-foreground-muted text-xs">
        Fanaara &copy; 2026 - جميع الحقوق محفوظة
      </div>
    </main>
  );
}