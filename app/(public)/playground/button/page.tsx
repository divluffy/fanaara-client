// app/(public)/playground/button/page.tsx
"use client";

import type { ReactNode } from "react";
import {
  FiArrowLeft,
  FiArrowRight,
  FiCheck,
  FiDownload,
  FiLogIn,
  FiPlus,
  FiTrash2,
  FiHeart,
  FiStar,
} from "react-icons/fi";

import { Button } from "@/design/Button";
import { CopyWrap, Toast, useCopyToast } from "../_shared/copy";

// لو عندك RTL store اتركه، لو لا احذفه وخلي dir ثابت
import { useAppSelector } from "@/store/hooks";

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-3 rounded-3xl border border-border-subtle bg-surface p-5 shadow-[var(--shadow-sm)]">
      <div>
        <h2 className="text-sm font-semibold text-foreground-strong">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-1 text-xs text-foreground-muted">{subtitle}</p>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </section>
  );
}

function C({
  code,
  onCopied,
  children,
}: {
  code: string;
  onCopied: (ok: boolean) => void;
  children: ReactNode;
}) {
  return (
    <CopyWrap code={code} onCopied={onCopied}>
      {children}
    </CopyWrap>
  );
}

export default function ButtonsExamplesPage() {
  const { isRTL } = useAppSelector(({ state }) => state);
  const dir: "rtl" | "ltr" = isRTL ? "rtl" : "ltr";

  const ArrowEnd = isRTL ? FiArrowLeft : FiArrowRight;
  const ArrowStart = isRTL ? FiArrowRight : FiArrowLeft;

  const { toast, show } = useCopyToast(1300);

  return (
    <main dir={dir} className="min-h-screen bg-background text-foreground p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="space-y-2">
          <h1 className="text-lg font-semibold text-foreground-strong">
            Button Examples
          </h1>
          <p className="text-sm text-foreground-muted">
            اضغط على أي زر لنسخ JSX مباشرة ✅
          </p>
        </header>

        <div className="grid gap-6">
          {/* ================= Variants ================= */}
          <Section
            title="All Variants"
            subtitle="نفس tone (brand) — كل variant"
          >
            <C
              onCopied={show}
              code={`<Button variant="solid" tone="brand">solid</Button>`}
            >
              <Button variant="solid" tone="brand">
                solid
              </Button>
            </C>

            <C
              onCopied={show}
              code={`<Button variant="soft" tone="brand">soft</Button>`}
            >
              <Button variant="soft" tone="brand">
                soft
              </Button>
            </C>

            <C
              onCopied={show}
              code={`<Button variant="outline" tone="brand">outline</Button>`}
            >
              <Button variant="outline" tone="brand">
                outline
              </Button>
            </C>

            <C
              onCopied={show}
              code={`<Button variant="ghost" tone="brand">ghost</Button>`}
            >
              <Button variant="ghost" tone="brand">
                ghost
              </Button>
            </C>

            <C
              onCopied={show}
              code={`<Button variant="glass" tone="brand">glass</Button>`}
            >
              <Button variant="glass" tone="brand">
                glass
              </Button>
            </C>

            <C
              onCopied={show}
              code={`<Button variant="gradient" gradient="violet" tone="brand">gradient</Button>`}
            >
              <Button variant="gradient" gradient="violet" tone="brand">
                gradient
              </Button>
            </C>
          </Section>

          {/* ================= Gradients (many cases) ================= */}
          <Section
            title="Gradients (Many Cases)"
            subtitle="لكل gradient: default / cta / pill / icons / loading / disabled / xl"
          >
            <C
              onCopied={show}
              code={`<Button variant="gradient" gradient="sunset">sunset</Button>`}
            >
              <Button variant="gradient" gradient="sunset">
                sunset
              </Button>
            </C>

            <C
              onCopied={show}
              code={`<Button variant="gradient" gradient="sunset" elevation="cta">CTA</Button>`}
            >
              <Button variant="gradient" gradient="sunset" elevation="cta">
                CTA
              </Button>
            </C>

            <C
              onCopied={show}
              code={`<Button variant="gradient" gradient="sunset" shape="pill">Pill</Button>`}
            >
              <Button variant="gradient" gradient="sunset" shape="pill">
                Pill
              </Button>
            </C>

            <C
              onCopied={show}
              code={`<Button variant="gradient" gradient="sunset" leftIcon={<FiPlus />} rightIcon={<FiArrowRight />}>جرّب الآن</Button>`}
            >
              <Button
                variant="gradient"
                gradient="sunset"
                leftIcon={<FiPlus />}
                rightIcon={<ArrowEnd />}
              >
                جرّب الآن
              </Button>
            </C>

            <C
              onCopied={show}
              code={`<Button variant="gradient" gradient="sunset" isLoading loadingText="Loading...">Download</Button>`}
            >
              <Button
                variant="gradient"
                gradient="sunset"
                isLoading
                loadingText="Loading..."
              >
                Download
              </Button>
            </C>

            <C
              onCopied={show}
              code={`<Button variant="gradient" gradient="sunset" disabled>Disabled</Button>`}
            >
              <Button variant="gradient" gradient="sunset" disabled>
                Disabled
              </Button>
            </C>

            <C
              onCopied={show}
              code={`<Button variant="gradient" gradient="sunset" size="xl">XL</Button>`}
            >
              <Button variant="gradient" gradient="sunset" size="xl">
                XL
              </Button>
            </C>

            {/* extra gradients */}
            <C
              onCopied={show}
              code={`<Button variant="gradient" gradient="aurora">aurora</Button>`}
            >
              <Button variant="gradient" gradient="aurora">
                aurora
              </Button>
            </C>

            <C
              onCopied={show}
              code={`<Button variant="gradient" gradient="ocean" elevation="cta">ocean cta</Button>`}
            >
              <Button variant="gradient" gradient="ocean" elevation="cta">
                ocean cta
              </Button>
            </C>

            <C
              onCopied={show}
              code={`<Button variant="gradient" gradient="violet" leftIcon={<FiStar />}>violet</Button>`}
            >
              <Button
                variant="gradient"
                gradient="violet"
                leftIcon={<FiStar />}
              >
                violet
              </Button>
            </C>

            <C
              onCopied={show}
              code={`<Button variant="gradient" gradient="mango">mango</Button>`}
            >
              <Button variant="gradient" gradient="mango">
                mango
              </Button>
            </C>

            <C
              onCopied={show}
              code={`<Button variant="gradient" gradient="rose" elevation="cta">rose cta</Button>`}
            >
              <Button variant="gradient" gradient="rose" elevation="cta">
                rose cta
              </Button>
            </C>

            <C
              onCopied={show}
              code={`<Button variant="gradient" gradient="neon" tone="neutral">neon</Button>`}
            >
              <Button variant="gradient" gradient="neon" tone="neutral">
                neon
              </Button>
            </C>

            <C
              onCopied={show}
              code={`<Button variant="gradient" gradient="midnight" elevation="strong">midnight</Button>`}
            >
              <Button variant="gradient" gradient="midnight" elevation="strong">
                midnight
              </Button>
            </C>
          </Section>

          {/* ================= Tones ================= */}
          <Section
            title="All Tones"
            subtitle="solid + leftIcon لكل tone (ألوان إضافية)"
          >
            <C
              onCopied={show}
              code={`<Button variant="solid" tone="brand" leftIcon={<FiPlus />}>brand</Button>`}
            >
              <Button variant="solid" tone="brand" leftIcon={<FiPlus />}>
                brand
              </Button>
            </C>

            <C
              onCopied={show}
              code={`<Button variant="solid" tone="neutral" leftIcon={<FiPlus />}>neutral</Button>`}
            >
              <Button variant="solid" tone="neutral" leftIcon={<FiPlus />}>
                neutral
              </Button>
            </C>

            <C
              onCopied={show}
              code={`<Button variant="solid" tone="success" leftIcon={<FiCheck />}>success</Button>`}
            >
              <Button variant="solid" tone="success" leftIcon={<FiCheck />}>
                success
              </Button>
            </C>

            <C
              onCopied={show}
              code={`<Button variant="solid" tone="danger" leftIcon={<FiTrash2 />}>danger</Button>`}
            >
              <Button variant="solid" tone="danger" leftIcon={<FiTrash2 />}>
                danger
              </Button>
            </C>

            <C
              onCopied={show}
              code={`<Button variant="solid" tone="warning" leftIcon={<FiStar />}>warning</Button>`}
            >
              <Button variant="solid" tone="warning" leftIcon={<FiStar />}>
                warning
              </Button>
            </C>

            <C
              onCopied={show}
              code={`<Button variant="solid" tone="info" leftIcon={<FiDownload />}>info</Button>`}
            >
              <Button variant="solid" tone="info" leftIcon={<FiDownload />}>
                info
              </Button>
            </C>

            <C
              onCopied={show}
              code={`<Button variant="solid" tone="purple" leftIcon={<FiHeart />}>purple</Button>`}
            >
              <Button variant="solid" tone="purple" leftIcon={<FiHeart />}>
                purple
              </Button>
            </C>

            <C
              onCopied={show}
              code={`<Button variant="solid" tone="pink" leftIcon={<FiHeart />}>pink</Button>`}
            >
              <Button variant="solid" tone="pink" leftIcon={<FiHeart />}>
                pink
              </Button>
            </C>

            <C
              onCopied={show}
              code={`<Button variant="solid" tone="lime" leftIcon={<FiPlus />}>lime</Button>`}
            >
              <Button variant="solid" tone="lime" leftIcon={<FiPlus />}>
                lime
              </Button>
            </C>

            <C
              onCopied={show}
              code={`<Button variant="solid" tone="cyan" leftIcon={<FiCamera />}>cyan</Button>`}
            >
              <Button variant="solid" tone="cyan" leftIcon={<FiDownload />}>
                cyan
              </Button>
            </C>
          </Section>

          {/* ================= Sizes ================= */}
          <Section title="All Sizes" subtitle="soft + tone=neutral">
            <C
              onCopied={show}
              code={`<Button variant="soft" tone="neutral" size="xs">xs</Button>`}
            >
              <Button variant="soft" tone="neutral" size="xs">
                xs
              </Button>
            </C>

            <C
              onCopied={show}
              code={`<Button variant="soft" tone="neutral" size="sm">sm</Button>`}
            >
              <Button variant="soft" tone="neutral" size="sm">
                sm
              </Button>
            </C>

            <C
              onCopied={show}
              code={`<Button variant="soft" tone="neutral" size="md">md</Button>`}
            >
              <Button variant="soft" tone="neutral" size="md">
                md
              </Button>
            </C>

            <C
              onCopied={show}
              code={`<Button variant="soft" tone="neutral" size="lg">lg</Button>`}
            >
              <Button variant="soft" tone="neutral" size="lg">
                lg
              </Button>
            </C>

            <C
              onCopied={show}
              code={`<Button variant="soft" tone="neutral" size="xl">xl</Button>`}
            >
              <Button variant="soft" tone="neutral" size="xl">
                xl
              </Button>
            </C>
          </Section>

          {/* ================= Shapes ================= */}
          <Section title="All Shapes" subtitle="outline + tone=brand + size=md">
            <C
              onCopied={show}
              code={`<Button variant="outline" tone="brand" shape="rounded">rounded</Button>`}
            >
              <Button variant="outline" tone="brand" shape="rounded">
                rounded
              </Button>
            </C>

            <C
              onCopied={show}
              code={`<Button variant="outline" tone="brand" shape="pill">pill</Button>`}
            >
              <Button variant="outline" tone="brand" shape="pill">
                pill
              </Button>
            </C>

            <C
              onCopied={show}
              code={`<Button variant="outline" tone="brand" shape="square">square</Button>`}
            >
              <Button variant="outline" tone="brand" shape="square">
                square
              </Button>
            </C>
          </Section>

          {/* ================= Elevations ================= */}
          <Section title="All Elevations" subtitle="solid + tone=brand">
            <C
              onCopied={show}
              code={`<Button variant="solid" tone="brand" elevation="none">none</Button>`}
            >
              <Button variant="solid" tone="brand" elevation="none">
                none
              </Button>
            </C>

            <C
              onCopied={show}
              code={`<Button variant="solid" tone="brand" elevation="soft">soft</Button>`}
            >
              <Button variant="solid" tone="brand" elevation="soft">
                soft
              </Button>
            </C>

            <C
              onCopied={show}
              code={`<Button variant="solid" tone="brand" elevation="medium">medium</Button>`}
            >
              <Button variant="solid" tone="brand" elevation="medium">
                medium
              </Button>
            </C>

            <C
              onCopied={show}
              code={`<Button variant="solid" tone="brand" elevation="strong">strong</Button>`}
            >
              <Button variant="solid" tone="brand" elevation="strong">
                strong
              </Button>
            </C>

            <C
              onCopied={show}
              code={`<Button variant="solid" tone="brand" elevation="glow">glow</Button>`}
            >
              <Button variant="solid" tone="brand" elevation="glow">
                glow
              </Button>
            </C>

            <C
              onCopied={show}
              code={`<Button variant="solid" tone="brand" elevation="cta">cta</Button>`}
            >
              <Button variant="solid" tone="brand" elevation="cta">
                cta
              </Button>
            </C>
          </Section>

          {/* ================= Icon Cases ================= */}
          <Section
            title="Icons Cases"
            subtitle="start / end / both (RTL-aware arrows)"
          >
            <C
              onCopied={show}
              code={`<Button tone="brand" variant="solid" leftIcon={<FiLogIn />}>تسجيل الدخول</Button>`}
            >
              <Button tone="brand" variant="solid" leftIcon={<FiLogIn />}>
                تسجيل الدخول
              </Button>
            </C>

            <C
              onCopied={show}
              code={`<Button tone="brand" variant="solid" rightIcon={<${isRTL ? "FiArrowLeft" : "FiArrowRight"} />}>التالي</Button>`}
            >
              <Button tone="brand" variant="solid" rightIcon={<ArrowEnd />}>
                التالي
              </Button>
            </C>

            <C
              onCopied={show}
              code={`<Button tone="success" variant="solid" leftIcon={<FiCheck />} rightIcon={<${isRTL ? "FiArrowLeft" : "FiArrowRight"} />}>حفظ</Button>`}
            >
              <Button
                tone="success"
                variant="solid"
                leftIcon={<FiCheck />}
                rightIcon={<ArrowEnd />}
              >
                حفظ
              </Button>
            </C>

            <C
              onCopied={show}
              code={`<Button tone="neutral" variant="ghost" leftIcon={<${isRTL ? "FiArrowRight" : "FiArrowLeft"} />}>رجوع</Button>`}
            >
              <Button tone="neutral" variant="ghost" leftIcon={<ArrowStart />}>
                رجوع
              </Button>
            </C>
          </Section>

          {/* ================= States ================= */}
          <Section
            title="States"
            subtitle="disabled / loading / fullWidth / long content"
          >
            <C
              onCopied={show}
              code={`<Button tone="neutral" variant="outline" disabled>Disabled</Button>`}
            >
              <Button tone="neutral" variant="outline" disabled>
                Disabled
              </Button>
            </C>

            <C
              onCopied={show}
              code={`<Button tone="brand" variant="solid" isLoading loadingText="جاري التنزيل..." leftIcon={<FiDownload />}>تنزيل</Button>`}
            >
              <Button
                tone="brand"
                variant="solid"
                isLoading
                loadingText="جاري التنزيل..."
                leftIcon={<FiDownload />}
              >
                تنزيل
              </Button>
            </C>

            <C
              onCopied={show}
              code={`<Button tone="danger" variant="solid" leftIcon={<FiTrash2 />}>حذف</Button>`}
            >
              <Button tone="danger" variant="solid" leftIcon={<FiTrash2 />}>
                حذف
              </Button>
            </C>

            <C
              onCopied={show}
              code={`<Button variant="gradient" gradient="aurora" elevation="cta" fullWidth>CTA Full width</Button>`}
            >
              <div className="w-full max-w-sm">
                <Button
                  variant="gradient"
                  gradient="aurora"
                  elevation="cta"
                  fullWidth
                >
                  CTA Full width
                </Button>
              </div>
            </C>

            <C
              onCopied={show}
              code={`<Button tone="brand" variant="soft" size="xl">زر طويل جداً لتجربة المساحات والـ layout داخل التصميم</Button>`}
            >
              <Button tone="brand" variant="soft" size="xl">
                زر طويل جداً لتجربة المساحات والـ layout داخل التصميم
              </Button>
            </C>
          </Section>
        </div>

        {toast && <Toast text={toast} />}
      </div>
    </main>
  );
}
