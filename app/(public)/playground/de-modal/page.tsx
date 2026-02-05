// app\(public)\playground\modal\page.tsx

"use client";

import React, { useMemo, useState } from "react";
import Modal from "@/design/DeModal";
import { IoClose } from "react-icons/io5";

type Key =
  | "profileCenter"
  | "commentsBinary"
  | "peekBinary"
  | "startFullBinary"
  | "fixedSheetNoDrag"
  | "legacyMultiSnap"
  | "noBackdropNoEsc"
  | "overlayNoneForcedClose"
  | "ltrSheet"
  | "galleryNoPadding"
  | "mountAfterOpenHeavy"
  | "stackA"
  | "stackB"
  | "confirmCenter";

function Button({
  children,
  onClick,
  variant = "ghost",
  full = false,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "ghost" | "primary" | "danger";
  full?: boolean;
}) {
  const cls =
    variant === "primary"
      ? "bg-accent text-accent-foreground shadow-[var(--shadow-md)] hover:-translate-y-[1px] hover:shadow-[var(--shadow-xl)] hover:brightness-110"
      : variant === "danger"
        ? "bg-red-600 text-white hover:brightness-110"
        : "border border-border-subtle bg-background-elevated/70 hover:bg-accent-subtle hover:border-accent-border hover:-translate-y-[1px]";
  return (
    <button
      onClick={onClick}
      className={[
        full ? "w-full" : "",
        "rounded-xl px-4 py-2 transition duration-300",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        cls,
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function Card({
  title,
  desc,
  onOpen,
}: {
  title: string;
  desc: string;
  onOpen: () => void;
}) {
  return (
    <button
      onClick={onOpen}
      className="
        rounded-2xl border border-border-subtle bg-background-elevated/70 p-4
        shadow-[var(--shadow-sm)] text-start
        transition duration-300
        hover:-translate-y-[1px] hover:bg-accent-subtle hover:border-accent-border hover:shadow-[var(--shadow-lg)]
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-ring
        focus-visible:ring-offset-2 focus-visible:ring-offset-background
      "
    >
      <div className="font-semibold text-foreground-strong">{title}</div>
      <div className="mt-1 text-sm text-foreground-muted">{desc}</div>
    </button>
  );
}

function InfoBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border-subtle bg-surface-soft/60 p-4 text-sm text-foreground-muted">
      {children}
    </div>
  );
}

function LongFeed({ n = 34, label = "عنصر" }: { n?: number; label?: string }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: n }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl border border-border-subtle bg-surface-soft/60 p-4"
        >
          <div className="font-semibold text-foreground-strong">
            {label} #{i + 1}
          </div>
          <div className="mt-1 text-sm text-foreground-muted">
            سكرول داخلي للتأكد أن كل العناصر تظهر بدون إخفاء أسفل.
          </div>
        </div>
      ))}
    </div>
  );
}

function CommentsList() {
  return (
    <div className="px-4 py-3 space-y-3">
      {Array.from({ length: 44 }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl border border-border-subtle bg-surface-soft/60 p-4"
        >
          <div className="font-semibold text-foreground-strong">
            user_{i + 1}
          </div>
          <div className="mt-1 text-sm text-foreground-muted">
            تعليق تجريبي رقم {i + 1}
          </div>
        </div>
      ))}
    </div>
  );
}

function Gallery() {
  return (
    <div className="grid grid-cols-3 gap-2 p-3">
      {Array.from({ length: 30 }).map((_, i) => (
        <div
          key={i}
          className="aspect-square rounded-xl border border-border-subtle bg-surface-soft/60"
          title={`img_${i + 1}`}
        />
      ))}
    </div>
  );
}

export default function ModalPlaygroundPage() {
  const [open, setOpen] = useState<Record<Key, boolean>>({
    profileCenter: false,
    commentsBinary: false,
    peekBinary: false,
    startFullBinary: false,
    fixedSheetNoDrag: false,
    legacyMultiSnap: false,
    noBackdropNoEsc: false,
    overlayNoneForcedClose: false,
    ltrSheet: false,
    galleryNoPadding: false,
    mountAfterOpenHeavy: false,
    stackA: false,
    stackB: false,
    confirmCenter: false,
  });

  const openOne = (k: Key) => setOpen((s) => ({ ...s, [k]: true }));
  const closeOne = (k: Key) => setOpen((s) => ({ ...s, [k]: false }));

  const cards = useMemo(
    () => [
      {
        k: "profileCenter" as const,
        t: "1) Center: Profile Editor (Desktop-first)",
        d: "Center دائم + blur overlay + maxWidth كبير + footer actions.",
      },
      {
        k: "commentsBinary" as const,
        t: "2) Sheet Binary: Comments (TopBar + scroll)",
        d: "موبايل: 50% افتراضي + سحب لأعلى Full + أي سحب لأسفل Close + Back يغلق فقط.",
      },
      {
        k: "peekBinary" as const,
        t: "3) Sheet Binary: Peek صغير",
        d: "Collapsed=38% Full=92% (اختبار نسب مختلفة بدون تكرار).",
      },
      {
        k: "startFullBinary" as const,
        t: "4) Sheet Binary: يبدأ Full",
        d: "sheetInitialState=full + محتوى طويل للتأكد من ظهور الأسفل.",
      },
      {
        k: "fixedSheetNoDrag" as const,
        t: "5) Fixed Sheet (No Drag)",
        d: "sheetDragMode=none + ارتفاع ثابت (مناسب لقائمة سريعة).",
      },
      {
        k: "legacyMultiSnap" as const,
        t: "6) Legacy Multi-Snap (اختياري)",
        d: "sheetDragMode=legacy + نقاط متعددة + يبدأ من snap وسط.",
      },
      {
        k: "noBackdropNoEsc" as const,
        t: "7) Strict: No Backdrop + No ESC",
        d: "سلوك صارم: لا يغلق بخارج المودل ولا بـ ESC.",
      },
      {
        k: "overlayNoneForcedClose" as const,
        t: "8) Overlay None + Forced Close Button",
        d: "Overlay شفاف + closeOnBackdrop=false + زر إغلاق واضح.",
      },
      {
        k: "ltrSheet" as const,
        t: "9) LTR Sheet داخل تطبيق RTL",
        d: "dir=ltr + sheet + topbar (فحص محاذاة).",
      },
      {
        k: "galleryNoPadding" as const,
        t: "10) No Padding: Gallery",
        d: "contentPadding=none + بدون footer (اختبار safe-area أسفل).",
      },
      {
        k: "mountAfterOpenHeavy" as const,
        t: "11) Mount After Open: Heavy Feed",
        d: "mountChildren=after-open + loadingFallback (إحساس أسرع).",
      },
      {
        k: "stackA" as const,
        t: "12) Stack: Modal فوق Modal",
        d: "فتح مودل B من A + تأكيد أن Back/ESC يغلق الأعلى فقط.",
      },
      {
        k: "confirmCenter" as const,
        t: "13) Confirm Dialog (Center صغير)",
        d: "Confirm بسيط بتركيز عالي + trapFocus مضبوط.",
      },
    ],
    [],
  );

  return (
    <div className="min-h-[calc(100vh-80px)] p-4 sm:p-8">
      <div className="mx-auto max-w-4xl space-y-5">
        <div className="rounded-2xl border border-border-subtle bg-background-elevated p-4 shadow-[var(--shadow-md)]">
          <div className="text-lg font-semibold text-foreground-strong">
            Modal Playground (Distinct Examples)
          </div>
          <div className="mt-1 text-sm text-foreground-muted">
            كل مثال مختلف عن الآخر: خصائص/أوضاع/نِسَب/إغلاق/اتجاه/تحميل… بدون
            تكرار سلوك نفس المثال.
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((c) => (
            <Card
              key={c.k}
              title={c.t}
              desc={c.d}
              onOpen={() => openOne(c.k)}
            />
          ))}
        </div>

        {/* ───────────────────────────────────────────────────────────── */}
        {/* 1) Center: Profile Editor */}
        <Modal
          open={open.profileCenter}
          onOpenChange={(v) => setOpen((s) => ({ ...s, profileCenter: v }))}
          mode={{ desktop: "center", mobile: "center" }}
          overlay="blur"
          maxWidthClass="max-w-2xl"
          title="تعديل الملف الشخصي"
          subtitle="Center modal (مناسب للـ Desktop) + Footer actions"
          footer={
            <div className="flex justify-end gap-2">
              <Button onClick={() => closeOne("profileCenter")}>إلغاء</Button>
              <Button variant="primary" onClick={() => alert("Saved (demo)")}>
                حفظ
              </Button>
            </div>
          }
        >
          <div className="space-y-3">
            <InfoBox>
              هذا المثال Center دائم على كل الأجهزة. جرّب Tab للتنقل داخل
              العناصر.
            </InfoBox>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block space-y-1">
                <div className="text-sm text-foreground-muted">الاسم</div>
                <input
                  className="h-11 w-full rounded-xl border border-border-subtle bg-surface-soft/60 px-3 focus:outline-none focus:ring-2 focus:ring-accent-ring"
                  placeholder="اسمك..."
                />
              </label>
              <label className="block space-y-1">
                <div className="text-sm text-foreground-muted">المدينة</div>
                <input
                  className="h-11 w-full rounded-xl border border-border-subtle bg-surface-soft/60 px-3 focus:outline-none focus:ring-2 focus:ring-accent-ring"
                  placeholder="مثال: جدة"
                />
              </label>
            </div>

            <label className="block space-y-1">
              <div className="text-sm text-foreground-muted">نبذة</div>
              <textarea
                className="min-h-28 w-full rounded-xl border border-border-subtle bg-surface-soft/60 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-ring"
                placeholder="اكتب نبذة قصيرة..."
              />
            </label>
          </div>
        </Modal>

        {/* ───────────────────────────────────────────────────────────── */}
        {/* 2) Sheet Binary: Comments */}
        <Modal
          open={open.commentsBinary}
          onOpenChange={(v) => setOpen((s) => ({ ...s, commentsBinary: v }))}
          mode={{ desktop: "center", mobile: "sheet" }}
          overlay="dim"
          preset="comments"
          contentPadding="none"
          mountChildren="after-open"
          sheetDragMode="binary"
          sheetCollapsedFraction={0.5}
          sheetFullFraction={0.98}
          sheetInitialState="collapsed"
          sheetTopBar={
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-foreground-strong">
                  التعليقات • 1,284
                </div>
                <div className="text-xs text-foreground-muted">
                  اسحب لأعلى = Full • أي سحب لأسفل = Close • زر الرجوع Back يغلق
                  فقط
                </div>
              </div>
              <button
                onClick={() => closeOne("commentsBinary")}
                className="grid size-9 place-items-center rounded-full border border-border-subtle bg-surface-soft/70"
                aria-label="Close"
              >
                <IoClose className="size-5" />
              </button>
            </div>
          }
          footer={
            <div className="flex items-center gap-2">
              <input
                className="h-11 flex-1 rounded-xl border border-border-subtle bg-surface-soft/60 px-3 focus:outline-none focus:ring-2 focus:ring-accent-ring"
                placeholder="اكتب تعليق..."
              />
              <Button variant="primary" onClick={() => alert("Sent (demo)")}>
                إرسال
              </Button>
            </div>
          }
        >
          <CommentsList />
        </Modal>

        {/* ───────────────────────────────────────────────────────────── */}
        {/* 3) Sheet Binary: Peek small */}
        <Modal
          open={open.peekBinary}
          onOpenChange={(v) => setOpen((s) => ({ ...s, peekBinary: v }))}
          mode={{ desktop: "center", mobile: "sheet" }}
          overlay="dim"
          title="Peek Sheet"
          subtitle="Collapsed=38% • Full=92% (Binary)"
          sheetDragMode="binary"
          sheetCollapsedFraction={0.38}
          sheetFullFraction={0.92}
          sheetInitialState="collapsed"
          footer={
            <div className="flex justify-between gap-2">
              <Button onClick={() => closeOne("peekBinary")}>إغلاق</Button>
              <Button variant="primary" onClick={() => alert("Done (demo)")}>
                تم
              </Button>
            </div>
          }
        >
          <div className="space-y-3">
            <InfoBox>
              هنا collapsed صغير جدًا (Peek). ما زال السكرول يجب أن يُظهر آخر
              عنصر بدون أن “يختفي” أسفل.
            </InfoBox>
            <LongFeed n={22} label="بطاقة" />
          </div>
        </Modal>

        {/* ───────────────────────────────────────────────────────────── */}
        {/* 4) Sheet Binary: start full */}
        <Modal
          open={open.startFullBinary}
          onOpenChange={(v) => setOpen((s) => ({ ...s, startFullBinary: v }))}
          mode={{ desktop: "center", mobile: "sheet" }}
          overlay="blur"
          title="يبدأ Full"
          subtitle="sheetInitialState=full + Scroll check"
          sheetDragMode="binary"
          sheetCollapsedFraction={0.5}
          sheetFullFraction={0.98}
          sheetInitialState="full"
          contentPadding="default"
        >
          <div className="space-y-3">
            <InfoBox>
              هذا يبدأ Full مباشرة. جرّب سحب بسيط لأسفل من المقبض/الـTopBar
              لإغلاقه.
            </InfoBox>
            <LongFeed n={36} label="سطر" />
          </div>
        </Modal>

        {/* ───────────────────────────────────────────────────────────── */}
        {/* 5) Fixed sheet no drag (quick menu) */}
        <Modal
          open={open.fixedSheetNoDrag}
          onOpenChange={(v) => setOpen((s) => ({ ...s, fixedSheetNoDrag: v }))}
          mode={{ desktop: "center", mobile: "sheet" }}
          overlay="dim"
          contentPadding="none"
          // No drag
          sheetDragMode="none"
          sheetDragEnabled={false}
          // Use legacy fixed height with one snap
          sheetSnapPoints={[0.42]}
          title="قائمة سريعة"
          subtitle="No Drag + height ثابت"
          footer={
            <div className="flex justify-end">
              <Button
                variant="primary"
                onClick={() => closeOne("fixedSheetNoDrag")}
              >
                إغلاق
              </Button>
            </div>
          }
        >
          <div className="p-3 space-y-2">
            <div className="rounded-2xl border border-border-subtle bg-background-elevated p-3">
              <div className="text-sm font-semibold text-foreground-strong">
                Quick Actions
              </div>
              <div className="mt-3 grid gap-2">
                <Button full onClick={() => alert("Share (demo)")}>
                  مشاركة
                </Button>
                <Button full onClick={() => alert("Copy (demo)")}>
                  نسخ رابط
                </Button>
                <Button
                  full
                  variant="danger"
                  onClick={() => alert("Report (demo)")}
                >
                  إبلاغ
                </Button>
              </div>
            </div>
          </div>
        </Modal>

        {/* ───────────────────────────────────────────────────────────── */}
        {/* 6) Legacy multi-snap */}
        <Modal
          open={open.legacyMultiSnap}
          onOpenChange={(v) => setOpen((s) => ({ ...s, legacyMultiSnap: v }))}
          mode={{ desktop: "center", mobile: "sheet" }}
          overlay="blur"
          sheetDragMode="legacy"
          sheetSnapPoints={[0.3, 0.6, 0.9]}
          sheetInitialSnap={1}
          title="Legacy Multi-Snap"
          subtitle="اختبار نقاط متعددة (اختياري)"
          footer={
            <Button onClick={() => closeOne("legacyMultiSnap")}>إغلاق</Button>
          }
        >
          <div className="space-y-3">
            <InfoBox>
              هذا مثال legacy فقط (لو لسه تحتاجه لبعض الحالات). بدأ على 60%.
            </InfoBox>
            <LongFeed n={20} label="عنصر" />
          </div>
        </Modal>

        {/* ───────────────────────────────────────────────────────────── */}
        {/* 7) Strict: no backdrop + no esc */}
        <Modal
          open={open.noBackdropNoEsc}
          onOpenChange={(v) => setOpen((s) => ({ ...s, noBackdropNoEsc: v }))}
          mode={{ desktop: "center", mobile: "sheet" }}
          overlay="dim"
          title="سلوك صارم"
          subtitle="لا يغلق بالخارج ولا بـ ESC"
          closeOnBackdrop={false}
          closeOnEsc={false}
          footer={
            <div className="flex gap-2">
              <Button onClick={() => closeOne("noBackdropNoEsc")}>إغلاق</Button>
              <Button
                variant="primary"
                onClick={() => alert("Confirmed (demo)")}
              >
                تأكيد
              </Button>
            </div>
          }
        >
          <div className="space-y-3">
            <InfoBox>
              جرّب الضغط خارج المودل أو زر ESC — لن يغلق. لازم أزرار المودل.
            </InfoBox>
            <InfoBox>
              على الموبايل: زر الرجوع Back سيغلق (لأنه خاص بالموبايل فقط).
            </InfoBox>
          </div>
        </Modal>

        {/* ───────────────────────────────────────────────────────────── */}
        {/* 8) Overlay none + forced close */}
        <Modal
          open={open.overlayNoneForcedClose}
          onOpenChange={(v) =>
            setOpen((s) => ({ ...s, overlayNoneForcedClose: v }))
          }
          mode={{ desktop: "center", mobile: "center" }}
          overlay="none"
          closeOnBackdrop={false}
          title="Overlay شفاف"
          subtitle="لا يوجد backdrop… زر الإغلاق إلزامي"
          footer={
            <div className="flex justify-end">
              <Button
                variant="primary"
                onClick={() => closeOne("overlayNoneForcedClose")}
              >
                فهمت
              </Button>
            </div>
          }
        >
          <div className="space-y-3">
            <InfoBox>
              هذا لتجربة overlay none بدون إغلاق بالضغط خارج المودل.
            </InfoBox>
            <div className="rounded-2xl border border-border-subtle p-4">
              <div className="text-sm font-semibold">ملاحظة</div>
              <div className="mt-1 text-sm opacity-75">
                هذا النوع مناسب في حالات قليلة جدًا.
              </div>
            </div>
          </div>
        </Modal>

        {/* ───────────────────────────────────────────────────────────── */}
        {/* 9) LTR sheet inside RTL app */}
        <Modal
          open={open.ltrSheet}
          onOpenChange={(v) => setOpen((s) => ({ ...s, ltrSheet: v }))}
          mode={{ desktop: "center", mobile: "sheet" }}
          overlay="dim"
          dir="ltr"
          sheetDragMode="binary"
          sheetCollapsedFraction={0.46}
          sheetFullFraction={0.95}
          sheetTopBar={
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold">LTR Sheet</div>
                <div className="text-xs opacity-70">
                  Alignment test + drag from topbar
                </div>
              </div>
              <button
                onClick={() => closeOne("ltrSheet")}
                className="grid size-9 place-items-center rounded-full border"
                aria-label="Close"
              >
                <IoClose className="size-5" />
              </button>
            </div>
          }
        >
          <div className="space-y-3">
            <InfoBox>
              This modal is LTR. Check header alignment + inputs.
            </InfoBox>
            <label className="block space-y-1">
              <div className="text-sm opacity-70">Email</div>
              <input
                className="h-11 w-full rounded-xl border border-border-subtle bg-surface-soft/60 px-3 focus:outline-none focus:ring-2 focus:ring-accent-ring"
                placeholder="name@domain.com"
              />
            </label>
            <LongFeed n={14} label="Row" />
          </div>
        </Modal>

        {/* ───────────────────────────────────────────────────────────── */}
        {/* 10) Gallery no padding (safe-area check) */}
        <Modal
          open={open.galleryNoPadding}
          onOpenChange={(v) => setOpen((s) => ({ ...s, galleryNoPadding: v }))}
          mode={{ desktop: "center", mobile: "sheet" }}
          overlay="blur"
          preset="comments"
          contentPadding="none"
          sheetDragMode="binary"
          sheetCollapsedFraction={0.52}
          sheetFullFraction={0.98}
          sheetTopBar={
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold">Gallery</div>
                <div className="text-xs opacity-70">
                  contentPadding=none • بدون footer (safe-area)
                </div>
              </div>
              <button
                onClick={() => closeOne("galleryNoPadding")}
                className="grid size-9 place-items-center rounded-full border"
                aria-label="Close"
              >
                <IoClose className="size-5" />
              </button>
            </div>
          }
        >
          <Gallery />
        </Modal>

        {/* ───────────────────────────────────────────────────────────── */}
        {/* 11) Mount after open heavy */}
        <Modal
          open={open.mountAfterOpenHeavy}
          onOpenChange={(v) =>
            setOpen((s) => ({ ...s, mountAfterOpenHeavy: v }))
          }
          mode={{ desktop: "center", mobile: "sheet" }}
          overlay="dim"
          title="Heavy Feed"
          subtitle="mountChildren=after-open + loadingFallback"
          mountChildren="after-open"
          loadingFallback={
            <div className="p-4 space-y-3">
              <div className="h-6 w-44 rounded-xl bg-surface-soft/80 animate-pulse" />
              <div className="h-20 rounded-2xl bg-surface-soft/80 animate-pulse" />
              <div className="h-20 rounded-2xl bg-surface-soft/80 animate-pulse" />
              <div className="h-20 rounded-2xl bg-surface-soft/80 animate-pulse" />
            </div>
          }
          sheetDragMode="binary"
          sheetCollapsedFraction={0.5}
          sheetFullFraction={0.96}
          footer={
            <div className="flex justify-end gap-2">
              <Button onClick={() => closeOne("mountAfterOpenHeavy")}>
                إغلاق
              </Button>
              <Button variant="primary" onClick={() => alert("Refresh (demo)")}>
                تحديث
              </Button>
            </div>
          }
        >
          <LongFeed n={46} label="منشور" />
        </Modal>

        {/* ───────────────────────────────────────────────────────────── */}
        {/* 12) Stack A */}
        <Modal
          open={open.stackA}
          onOpenChange={(v) => setOpen((s) => ({ ...s, stackA: v }))}
          mode={{ desktop: "center", mobile: "sheet" }}
          overlay="blur"
          title="Stack A"
          subtitle="افتح Stack B — Back/ESC يغلق الأعلى فقط"
          sheetDragMode="binary"
          sheetCollapsedFraction={0.5}
          sheetFullFraction={0.96}
          footer={
            <div className="flex gap-2">
              <Button onClick={() => closeOne("stackA")}>إغلاق A</Button>
              <Button variant="primary" onClick={() => openOne("stackB")}>
                فتح B
              </Button>
            </div>
          }
        >
          <div className="space-y-3">
            <InfoBox>
              افتح B، ثم جرّب زر الرجوع Back على الهاتف: يجب يغلق B فقط.
            </InfoBox>
            <LongFeed n={18} label="تفصيل" />
          </div>
        </Modal>

        {/* 12) Stack B */}
        <Modal
          open={open.stackB}
          onOpenChange={(v) => setOpen((s) => ({ ...s, stackB: v }))}
          mode={{ desktop: "center", mobile: "sheet" }}
          overlay="dim"
          title="Stack B (Top)"
          subtitle="هذا فوق A"
          sheetDragMode="binary"
          sheetCollapsedFraction={0.46}
          sheetFullFraction={0.98}
          sheetTopBar={
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold">Top Modal</div>
                <div className="text-xs opacity-70">
                  Back/ESC يغلق هذا أولاً
                </div>
              </div>
              <button
                onClick={() => closeOne("stackB")}
                className="grid size-9 place-items-center rounded-full border"
                aria-label="Close"
              >
                <IoClose className="size-5" />
              </button>
            </div>
          }
          footer={
            <div className="flex justify-end gap-2">
              <Button onClick={() => closeOne("stackB")}>إغلاق</Button>
              <Button variant="primary" onClick={() => alert("OK (demo)")}>
                موافق
              </Button>
            </div>
          }
        >
          <LongFeed n={24} label="عنصر B" />
        </Modal>

        {/* ───────────────────────────────────────────────────────────── */}
        {/* 13) Confirm center */}
        <Modal
          open={open.confirmCenter}
          onOpenChange={(v) => setOpen((s) => ({ ...s, confirmCenter: v }))}
          mode={{ desktop: "center", mobile: "center" }}
          overlay="dim"
          maxWidthClass="max-w-md"
          title="تأكيد"
          subtitle="Confirm صغير ومباشر"
          footer={
            <div className="flex justify-end gap-2">
              <Button onClick={() => closeOne("confirmCenter")}>إلغاء</Button>
              <Button
                variant="danger"
                onClick={() => {
                  alert("Deleted (demo)");
                  closeOne("confirmCenter");
                }}
              >
                حذف
              </Button>
            </div>
          }
        >
          <div className="space-y-3">
            <InfoBox>
              هل تريد حذف هذا العنصر؟ هذا المثال لا يعتمد على sheet إطلاقًا.
            </InfoBox>
            <div className="rounded-2xl border border-border-subtle bg-surface-soft/60 p-4">
              <div className="text-sm font-semibold text-foreground-strong">
                العنصر: Episode #12
              </div>
              <div className="mt-1 text-sm text-foreground-muted">
                سيتم حذف العنصر نهائيًا.
              </div>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}
