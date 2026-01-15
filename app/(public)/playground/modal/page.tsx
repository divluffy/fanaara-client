"use client";

import React, { useMemo, useState } from "react";
import Modal from "@/components/Modal";

function FooterActions({
  onClose,
  onOpenNext,
}: {
  onClose: () => void;
  onOpenNext?: () => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {onOpenNext && (
        <button
          className="
            rounded-xl border border-border-subtle px-4 py-2
            bg-background-elevated/70
            transition duration-300
            hover:bg-accent-subtle hover:border-accent-border hover:-translate-y-[1px]
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-ring
            focus-visible:ring-offset-2 focus-visible:ring-offset-background
          "
          onClick={onOpenNext}
        >
          فتح مودال ثاني (Layer)
        </button>
      )}

      <button
        className="
          rounded-xl bg-accent px-4 py-2 text-accent-foreground
          shadow-[var(--shadow-md)]
          transition duration-300
          hover:-translate-y-[1px] hover:shadow-[var(--shadow-xl)] hover:brightness-110
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-ring
          focus-visible:ring-offset-2 focus-visible:ring-offset-background
        "
        onClick={onClose}
      >
        إغلاق
      </button>
    </div>
  );
}

function CommentsList() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 14 }).map((_, i) => (
        <div
          key={i}
          className="
            rounded-2xl border border-border-subtle
            bg-surface-soft/60 p-4
            transition duration-300
            hover:bg-accent-subtle hover:border-accent-border hover:-translate-y-[1px]
          "
        >
          <div className="font-semibold text-foreground-strong">
            تعليق #{i + 1}
          </div>
          <div className="mt-1 text-sm text-foreground-muted">
            مثال لتعليقات كثيرة (Scroll).
          </div>
        </div>
      ))}
    </div>
  );
}

function SimpleContent() {
  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-border-subtle bg-surface-soft/70 p-4">
        <div className="text-sm text-foreground-muted">هذا محتوى بسيط.</div>
      </div>
      <div className="text-sm text-foreground-muted">
        جرّب: ESC — الضغط خارج المودال — فتح Layer — تغيير overlay.
      </div>
    </div>
  );
}

type Preset = {
  id: string;
  label: string;
  open: () => void;
};

export default function ModalPlaygroundClient() {
  const [openDefault, setOpenDefault] = useState(false);
  const [openComments, setOpenComments] = useState(false);
  const [openNoBackdrop, setOpenNoBackdrop] = useState(false);
  const [openOverlayNone, setOpenOverlayNone] = useState(false);
  const [openLayer1, setOpenLayer1] = useState(false);
  const [openLayer2, setOpenLayer2] = useState(false);

  const presets = useMemo<Preset[]>(
    () => [
      {
        id: "default",
        label: "الافتراضي: (Desktop Center) + (Mobile Sheet) + Blur",
        open: () => setOpenDefault(true),
      },
      {
        id: "comments",
        label: "تعليقات: Desktop عنوان+إغلاق / Mobile محتوى فقط (Sheet)",
        open: () => setOpenComments(true),
      },
      {
        id: "no-backdrop",
        label: "بدون إغلاق بالضغط خارج المودال",
        open: () => setOpenNoBackdrop(true),
      },
      {
        id: "overlay-none",
        label: "Overlay شفاف (none)",
        open: () => setOpenOverlayNone(true),
      },
      {
        id: "layers",
        label: "Layers: مودال فوق مودال (Stacking)",
        open: () => setOpenLayer1(true),
      },
    ],
    []
  );

  return (
    <div className="min-h-[calc(100vh-80px)] p-4 sm:p-8">
      <div className="mx-auto max-w-3xl space-y-4">
        <div className="rounded-2xl border border-border-subtle bg-background-elevated p-4 shadow-[var(--shadow-md)]">
          <div className="text-lg font-semibold text-foreground-strong">
            ملعب المودال
          </div>
          <div className="mt-1 text-sm text-foreground-muted">
            نفس المودال يتحول تلقائيًا: Desktop = Center / Mobile = Bottom Sheet
            (Full width).
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {presets.map((p) => (
            <button
              key={p.id}
              onClick={p.open}
              className="
                rounded-2xl border border-border-subtle bg-background-elevated/70 p-4
                shadow-[var(--shadow-sm)]
                transition duration-300
                hover:-translate-y-[1px] hover:bg-accent-subtle hover:border-accent-border hover:shadow-[var(--shadow-lg)]
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-ring
                focus-visible:ring-offset-2 focus-visible:ring-offset-background
              "
            >
              <div className="font-semibold text-foreground-strong">
                {p.label}
              </div>
              <div className="mt-1 text-xs text-foreground-muted">
                id: {p.id}
              </div>
            </button>
          ))}
        </div>

        {/* 1) Default responsive */}
        <Modal
          open={openDefault}
          onOpenChange={setOpenDefault}
          overlay="blur"
          mode={{ desktop: "center", mobile: "sheet" }}
          title="مودال افتراضي"
          subtitle="Desktop: وسط — Mobile: Sheet بعرض كامل"
          footer={<FooterActions onClose={() => setOpenDefault(false)} />}
        >
          <SimpleContent />
        </Modal>

        {/* 2) Comments preset: desktop header, mobile content only */}
        <Modal
          open={openComments}
          onOpenChange={setOpenComments}
          overlay="blur"
          mode={{ desktop: "center", mobile: "sheet" }}
          preset="comments"
          title="التعليقات"
          subtitle="على الجوال: بدون هيدر (محتوى فقط)"
          sheetMaxHeight={0.66}
          closeOnBackdrop
        >
          <CommentsList />
        </Modal>

        {/* 3) No backdrop close */}
        <Modal
          open={openNoBackdrop}
          onOpenChange={setOpenNoBackdrop}
          overlay="blur"
          mode={{ desktop: "center", mobile: "sheet" }}
          title="بدون إغلاق بالخارج"
          subtitle="closeOnBackdrop = false"
          closeOnBackdrop={false}
          footer={<FooterActions onClose={() => setOpenNoBackdrop(false)} />}
        >
          <SimpleContent />
        </Modal>

        {/* 4) Overlay none */}
        <Modal
          open={openOverlayNone}
          onOpenChange={setOpenOverlayNone}
          overlay="none"
          mode={{ desktop: "center", mobile: "sheet" }}
          title="Overlay شفاف"
          subtitle="overlay = none (لكن ما زال فيه click outside لو فعلته)"
          footer={<FooterActions onClose={() => setOpenOverlayNone(false)} />}
        >
          <SimpleContent />
        </Modal>

        {/* 5) Layers stacking */}
        <Modal
          open={openLayer1}
          onOpenChange={setOpenLayer1}
          overlay="blur"
          mode={{ desktop: "center", mobile: "sheet" }}
          title="Layer 1"
          subtitle="اضغط زر فتح مودال ثاني"
          footer={
            <FooterActions
              onClose={() => setOpenLayer1(false)}
              onOpenNext={() => setOpenLayer2(true)}
            />
          }
        >
          <SimpleContent />
        </Modal>

        <Modal
          open={openLayer2}
          onOpenChange={setOpenLayer2}
          overlay="dim"
          mode={{ desktop: "center", mobile: "sheet" }}
          title="Layer 2 (فوق Layer 1)"
          subtitle="ESC أو click outside يغلق هذا فقط لأنه Top"
          footer={<FooterActions onClose={() => setOpenLayer2(false)} />}
        >
          <div className="space-y-3">
            <div className="rounded-2xl border border-border-subtle bg-surface-soft/70 p-4">
              <div className="text-sm text-foreground-muted">
                هذا مودال فوق مودال. الإغلاق بالـ ESC يغلق الأعلى فقط.
              </div>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}
