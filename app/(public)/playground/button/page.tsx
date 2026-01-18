"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  FiArrowLeft,
  FiArrowRight,
  FiCheck,
  FiDownload,
  FiLogIn,
  FiPlus,
  FiTrash2,
} from "react-icons/fi";

import { Button } from "@/design";
import type {
  ButtonElevation,
  ButtonGradient,
  ButtonShape,
  ButtonSize,
  ButtonTone,
  ButtonVariant,
} from "@/design";

// ✅ as requested for direction
import { useAppSelector } from "@/store/hooks";

const VARIANTS = ["solid", "soft", "outline", "ghost", "glass", "gradient"] as const;
const TONES = ["brand", "neutral", "success", "danger", "warning", "info"] as const;
const SIZES = ["xs", "sm", "md", "lg", "xl"] as const;
const SHAPES = ["rounded", "pill", "square"] as const;
const ELEVATIONS = ["none", "soft", "medium", "strong", "glow", "cta"] as const;
const GRADIENTS = ["sunset", "aurora", "ocean", "violet"] as const;

/** ===== Small UI Helpers ===== */
function Card({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.section
      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
      animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 320, damping: 28, mass: 0.8 }}
      className="space-y-3 rounded-3xl border border-border-subtle bg-surface p-5 shadow-[var(--shadow-sm)]"
    >
      <div>
        <h2 className="text-sm font-semibold text-foreground-strong">{title}</h2>
        {subtitle && <p className="mt-1 text-xs text-foreground-muted">{subtitle}</p>}
      </div>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </motion.section>
  );
}

function Select<T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: T;
  onChange: (v: T) => void;
  options: readonly T[];
}) {
  return (
    <label className="flex items-center gap-2 text-xs text-foreground-muted">
      <span className="min-w-16">{label}</span>
      <select
        className="h-9 rounded-xl border border-border-subtle bg-background px-3 text-sm text-foreground outline-none"
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
      >
        {options.map((opt) => (
          <option value={opt} key={opt}>
            {opt}
          </option>
        ))}
      </select>
    </label>
  );
}

async function copyToClipboard(text: string): Promise<boolean> {
  // Primary
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fall through to legacy approach
  }

  // Fallback (legacy)
  try {
    const el = document.createElement("textarea");
    el.value = text;
    el.setAttribute("readonly", "true");
    el.style.position = "fixed";
    el.style.left = "-9999px";
    document.body.appendChild(el);
    el.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(el);
    return ok;
  } catch {
    return false;
  }
}

function Toast({ text }: { text: string }) {
  const reduceMotion = useReducedMotion();

  return (
    <AnimatePresence>
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 8, scale: 0.98 }}
        animate={reduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
        exit={reduceMotion ? undefined : { opacity: 0, y: 8, scale: 0.98 }}
        transition={{ type: "spring", stiffness: 380, damping: 30, mass: 0.7 }}
        className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-full border border-border-subtle bg-background-elevated/95 px-4 py-2 text-xs text-foreground shadow-[var(--shadow-md)]"
      >
        {text}
      </motion.div>
    </AnimatePresence>
  );
}

function CopyItem({
  code,
  onCopied,
  children,
}: {
  code: string;
  onCopied: (ok: boolean) => void;
  children: ReactNode;
}) {
  return (
    <span
      role="button"
      tabIndex={0}
      aria-label="Copy JSX"
      title="Click to copy JSX"
      className="inline-flex"
      onClick={async (e) => {
        e.preventDefault();
        e.stopPropagation();
        onCopied(await copyToClipboard(code));
      }}
      onKeyDown={async (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onCopied(await copyToClipboard(code));
        }
      }}
    >
      {children}
    </span>
  );
}

/** ===== Main Page ===== */
export default function ButtonsPlaygroundPage() {
  const { isRTL } = useAppSelector(({ state }) => state);
  const dir: "rtl" | "ltr" = isRTL ? "rtl" : "ltr";

  // Direction-aware arrows (important for Arabic/English UX)
  const ArrowStart = isRTL ? FiArrowRight : FiArrowLeft;
  const ArrowEnd = isRTL ? FiArrowLeft : FiArrowRight;

  // Playground state (build ANY combination)
  const [variant, setVariant] = useState<ButtonVariant>("solid");
  const [tone, setTone] = useState<ButtonTone>("brand");
  const [size, setSize] = useState<ButtonSize>("md");
  const [shape, setShape] = useState<ButtonShape>("rounded");
  const [elevation, setElevation] = useState<ButtonElevation>("soft");
  const [gradient, setGradient] = useState<ButtonGradient>("sunset");
  const [loading, setLoading] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [fullWidth, setFullWidth] = useState(false);
  const [withLeftIcon, setWithLeftIcon] = useState(true);
  const [withRightIcon, setWithRightIcon] = useState(true);
  const [loadingText, setLoadingText] = useState("جاري التنفيذ...");

  const [toast, setToast] = useState<string | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  const showToast = useCallback((ok: boolean) => {
    setToast(ok ? "✅ Copied JSX" : "❌ Copy failed");

    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setToast(null), 1300);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    };
  }, []);

  const playgroundCode = useMemo(() => {
    const attrs: string[] = [
      `variant="${variant}"`,
      `tone="${tone}"`,
      `size="${size}"`,
      `shape="${shape}"`,
      `elevation="${elevation}"`,
    ];

    if (variant === "gradient") attrs.push(`gradient="${gradient}"`);
    if (loading) attrs.push("isLoading");
    if (loading && loadingText) attrs.push(`loadingText="${loadingText}"`);
    if (disabled) attrs.push("disabled");
    if (fullWidth) attrs.push("fullWidth");

    if (withLeftIcon) attrs.push(`leftIcon={<FiLogIn />}`);
    if (withRightIcon) attrs.push(`rightIcon={<${isRTL ? "FiArrowLeft" : "FiArrowRight"} />}`);

    return `<Button ${attrs.join(" ")}>زر تجريبي</Button>`;
  }, [
    variant,
    tone,
    size,
    shape,
    elevation,
    gradient,
    loading,
    loadingText,
    disabled,
    fullWidth,
    withLeftIcon,
    withRightIcon,
    isRTL,
  ]);

  const ex = (code: string, node: ReactNode) => (
    <CopyItem code={code} onCopied={showToast}>
      {node}
    </CopyItem>
  );

  const gradientShowcase = useMemo(() => {
    // “A lot of cases” inside All Gradients (as requested)
    // Keep each gradient represented + common states, icons, shapes, sizes, elevations.
    return GRADIENTS.flatMap((g) => {
      const base = { variant: "gradient" as const, gradient: g };

      return [
        {
          key: `${g}-default`,
          code: `<Button variant="gradient" gradient="${g}">${g}</Button>`,
          node: <Button {...base}>{g}</Button>,
        },
        {
          key: `${g}-cta`,
          code: `<Button variant="gradient" gradient="${g}" elevation="cta">CTA</Button>`,
          node: (
            <Button {...base} elevation="cta">
              CTA
            </Button>
          ),
        },
        {
          key: `${g}-pill`,
          code: `<Button variant="gradient" gradient="${g}" shape="pill">Pill</Button>`,
          node: (
            <Button {...base} shape="pill">
              Pill
            </Button>
          ),
        },
        {
          key: `${g}-icons`,
          code: `<Button variant="gradient" gradient="${g}" leftIcon={<FiPlus />} rightIcon={<${isRTL ? "FiArrowLeft" : "FiArrowRight"} />}>جرّب الآن</Button>`,
          node: (
            <Button
              {...base}
              leftIcon={<FiPlus />}
              rightIcon={<ArrowEnd />}
            >
              جرّب الآن
            </Button>
          ),
        },
        {
          key: `${g}-loading`,
          code: `<Button variant="gradient" gradient="${g}" isLoading loadingText="Loading...">Download</Button>`,
          node: (
            <Button {...base} isLoading loadingText="Loading...">
              Download
            </Button>
          ),
        },
        {
          key: `${g}-disabled`,
          code: `<Button variant="gradient" gradient="${g}" disabled>Disabled</Button>`,
          node: (
            <Button {...base} disabled>
              Disabled
            </Button>
          ),
        },
        {
          key: `${g}-size-xl`,
          code: `<Button variant="gradient" gradient="${g}" size="xl">XL</Button>`,
          node: (
            <Button {...base} size="xl">
              XL
            </Button>
          ),
        },
      ];
    });
  }, [ArrowEnd, isRTL]);

  return (
    <main dir={dir} className="min-h-screen bg-background text-foreground p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="space-y-2">
          <h1 className="text-lg font-semibold text-foreground-strong">
            Button Playground
          </h1>
          <p className="text-sm text-foreground-muted">
            Click any example to copy its JSX مباشرة ✅
          </p>
        </header>

        {/* ===== Full Combination Builder (covers ALL possibilities) ===== */}
        <Card title="Builder" subtitle={`dir=${dir} (RTL/LTR) + any combination`}>
          <div className="flex w-full flex-wrap gap-3">
            <Select label="variant" value={variant} onChange={setVariant} options={VARIANTS} />
            <Select label="tone" value={tone} onChange={setTone} options={TONES} />
            <Select label="size" value={size} onChange={setSize} options={SIZES} />
            <Select label="shape" value={shape} onChange={setShape} options={SHAPES} />
            <Select label="elevation" value={elevation} onChange={setElevation} options={ELEVATIONS} />
            {variant === "gradient" && (
              <Select label="gradient" value={gradient} onChange={setGradient} options={GRADIENTS} />
            )}

            <label className="flex items-center gap-2 text-xs text-foreground-muted">
              <input
                type="checkbox"
                checked={withLeftIcon}
                onChange={(e) => setWithLeftIcon(e.target.checked)}
                className="h-4 w-4"
              />
              leftIcon
            </label>

            <label className="flex items-center gap-2 text-xs text-foreground-muted">
              <input
                type="checkbox"
                checked={withRightIcon}
                onChange={(e) => setWithRightIcon(e.target.checked)}
                className="h-4 w-4"
              />
              rightIcon
            </label>

            <label className="flex items-center gap-2 text-xs text-foreground-muted">
              <input
                type="checkbox"
                checked={loading}
                onChange={(e) => setLoading(e.target.checked)}
                className="h-4 w-4"
              />
              loading
            </label>

            <label className="flex items-center gap-2 text-xs text-foreground-muted">
              <input
                type="checkbox"
                checked={disabled}
                onChange={(e) => setDisabled(e.target.checked)}
                className="h-4 w-4"
              />
              disabled
            </label>

            <label className="flex items-center gap-2 text-xs text-foreground-muted">
              <input
                type="checkbox"
                checked={fullWidth}
                onChange={(e) => setFullWidth(e.target.checked)}
                className="h-4 w-4"
              />
              fullWidth
            </label>

            {loading && (
              <label className="flex items-center gap-2 text-xs text-foreground-muted">
                <span className="min-w-16">loadingText</span>
                <input
                  className="h-9 w-60 rounded-xl border border-border-subtle bg-background px-3 text-sm text-foreground outline-none"
                  value={loadingText}
                  onChange={(e) => setLoadingText(e.target.value)}
                />
              </label>
            )}
          </div>

          <div className={fullWidth ? "w-full" : ""}>
            {ex(
              playgroundCode,
              <Button
                variant={variant}
                tone={tone}
                size={size}
                shape={shape}
                elevation={elevation}
                gradient={gradient}
                isLoading={loading}
                loadingText={loadingText}
                disabled={disabled}
                fullWidth={fullWidth}
                leftIcon={withLeftIcon ? <FiLogIn /> : undefined}
                rightIcon={withRightIcon ? <ArrowEnd /> : undefined}
              >
                زر تجريبي 🙂✨
              </Button>
            )}
          </div>

          <pre className="w-full whitespace-pre-wrap rounded-2xl border border-border-subtle bg-background p-4 text-xs text-foreground-muted">
            {playgroundCode}
          </pre>
        </Card>

        {/* ===== Variants ===== */}
        <Card title="All Variants" subtitle="كل variants على نفس tone (brand)">
          {VARIANTS.map((v) => {
            const code =
              v === "gradient"
                ? `<Button variant="gradient" gradient="violet" tone="brand">gradient</Button>`
                : `<Button variant="${v}" tone="brand">${v}</Button>`;

            return ex(
              code,
              <Button variant={v} tone="brand" gradient="violet">
                {v}
              </Button>
            );
          })}
        </Card>

        {/* ===== Gradients (a lot of cases) ===== */}
        <Card title="All Gradients" subtitle="كثير حالات لكل gradient (icons / cta / pill / loading / disabled / sizes)">
          {gradientShowcase.map((item) => ex(item.code, <span key={item.key}>{item.node}</span>))}
        </Card>

        {/* ===== Tones ===== */}
        <Card title="All Tones" subtitle="solid + leftIcon لكل tone">
          {TONES.map((t) => {
            const code = `<Button variant="solid" tone="${t}" leftIcon={<FiPlus />}>${t}</Button>`;
            return ex(
              code,
              <Button variant="solid" tone={t} leftIcon={<FiPlus />}>
                {t}
              </Button>
            );
          })}
        </Card>

        {/* ===== Sizes ===== */}
        <Card title="All Sizes" subtitle="soft + نفس tone (neutral)">
          {SIZES.map((s) => {
            const code = `<Button variant="soft" tone="neutral" size="${s}">${s}</Button>`;
            return ex(
              code,
              <Button variant="soft" tone="neutral" size={s}>
                {s}
              </Button>
            );
          })}
        </Card>

        {/* ===== Shapes ===== */}
        <Card title="All Shapes" subtitle="outline + نفس size (md)">
          {SHAPES.map((sh) => {
            const code = `<Button variant="outline" tone="brand" shape="${sh}">${sh}</Button>`;
            return ex(
              code,
              <Button variant="outline" tone="brand" shape={sh}>
                {sh}
              </Button>
            );
          })}
        </Card>

        {/* ===== Elevations ===== */}
        <Card title="All Elevations" subtitle="solid + نفس tone (brand)">
          {ELEVATIONS.map((el) => {
            const code = `<Button variant="solid" tone="brand" elevation="${el}">${el}</Button>`;
            return ex(
              code,
              <Button variant="solid" tone="brand" elevation={el}>
                {el}
              </Button>
            );
          })}
        </Card>

        {/* ===== Icons Cases (direction-aware arrows) ===== */}
        <Card title="Icons Cases" subtitle="start / end / both (direction-aware arrows)">
          {ex(
            `<Button tone="brand" variant="solid" leftIcon={<FiLogIn />}>تسجيل الدخول</Button>`,
            <Button tone="brand" variant="solid" leftIcon={<FiLogIn />}>
              تسجيل الدخول
            </Button>
          )}

          {ex(
            `<Button tone="brand" variant="solid" rightIcon={<${isRTL ? "FiArrowLeft" : "FiArrowRight"} />}>التالي</Button>`,
            <Button tone="brand" variant="solid" rightIcon={<ArrowEnd />}>
              التالي
            </Button>
          )}

          {ex(
            `<Button tone="success" variant="solid" leftIcon={<FiCheck />} rightIcon={<${isRTL ? "FiArrowLeft" : "FiArrowRight"} />}>حفظ</Button>`,
            <Button
              tone="success"
              variant="solid"
              leftIcon={<FiCheck />}
              rightIcon={<ArrowEnd />}
            >
              حفظ
            </Button>
          )}

          {ex(
            `<Button tone="neutral" variant="ghost" leftIcon={<${isRTL ? "FiArrowRight" : "FiArrowLeft"} />}>رجوع</Button>`,
            <Button tone="neutral" variant="ghost" leftIcon={<ArrowStart />}>
              رجوع
            </Button>
          )}
        </Card>

        {/* ===== States ===== */}
        <Card title="States" subtitle="disabled / loading / fullWidth / long content">
          {ex(
            `<Button tone="neutral" variant="outline" disabled>Disabled</Button>`,
            <Button tone="neutral" variant="outline" disabled>
              Disabled
            </Button>
          )}

          {ex(
            `<Button tone="brand" variant="solid" isLoading loadingText="جاري التنزيل..." leftIcon={<FiDownload />}>تنزيل</Button>`,
            <Button
              tone="brand"
              variant="solid"
              isLoading
              loadingText="جاري التنزيل..."
              leftIcon={<FiDownload />}
            >
              تنزيل
            </Button>
          )}

          {ex(
            `<Button tone="danger" variant="solid" leftIcon={<FiTrash2 />}>حذف</Button>`,
            <Button tone="danger" variant="solid" leftIcon={<FiTrash2 />}>
              حذف
            </Button>
          )}

          {ex(
            `<Button variant="gradient" gradient="aurora" elevation="cta" fullWidth>CTA Full width</Button>`,
            <div className="w-full max-w-sm">
              <Button variant="gradient" gradient="aurora" elevation="cta" fullWidth>
                CTA Full width
              </Button>
            </div>
          )}

          {ex(
            `<Button tone="brand" variant="soft" size="xl">زر طويل جداً لتجربة المساحات والـ layout داخل التصميم</Button>`,
            <Button tone="brand" variant="soft" size="xl">
              زر طويل جداً لتجربة المساحات والـ layout داخل التصميم
            </Button>
          )}
        </Card>

        {toast && <Toast text={toast} />}
      </div>
    </main>
  );
}
