// app\creator\works\[workId]\chapters\[chapterId]\editor\_components\PropertiesPanel.tsx
"use client";

import React, { useMemo } from "react";
import type {
  PageAnnotationsDoc,
  PageElement,
  EditorPageItem,
  TemplateId,
  WritingDirection,
} from "./types";
import { Button as DeButton } from "@/design/DeButton";

import { TEMPLATE_DEFAULT_STYLE, TEMPLATE_LABELS } from "./templates";
import {
  autoFitFontSize,
  clamp,
  detectLang,
  dirForLang,
  normToPxBBox,
  bboxCenter,
  remapClipPathWithBBox,
} from "./utils";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  AlignCenter,
  AlignCenterVertical,
  AlignEndVertical,
  AlignLeft,
  AlignRight,
  AlignStartVertical,
  Eye,
  EyeOff,
  Lock,
  Trash2,
  Unlock,
} from "lucide-react";
import { FaAlignLeft, FaAlignCenter, FaAlignRight } from "react-icons/fa";
import {
  MdVerticalAlignTop,
  MdVerticalAlignCenter,
  MdVerticalAlignBottom,
  MdOutlineFormatLineSpacing,
} from "react-icons/md";
import {
  FiRefreshCcw,
  FiChevronDown,
  FiMinimize2,
  FiMaximize2,
  FiRotateCw,
  FiType,
  FiAlignCenter,
  FiBold,
  FiAlignRight,
  FiAlignLeft,
  FiItalic,
} from "react-icons/fi";
import { SmartSelect, type SelectOption } from "@/design/DeSelect";
import { FiCopy, FiTrash2 } from "react-icons/fi";
import {
  TbBorderRadius,
  TbSquareRounded,
  TbSparkles,
  TbBorderStyle2,
  TbPalette,
} from "react-icons/tb";
import { MdOpacity } from "react-icons/md";
import { FaFillDrip } from "react-icons/fa";
import { HiOutlineScissors } from "react-icons/hi2";
import { PiArrowBendDownRightBold } from "react-icons/pi";
import {
  RiColorFilterLine,
  RiFontFamily,
  RiLetterSpacing2,
} from "react-icons/ri";
import { HiOutlineSwitchHorizontal } from "react-icons/hi";

function safeNum(v: any, fallback: number) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function typeLabel(t: PageElement["elementType"]) {
  switch (t) {
    case "SPEECH":
      return "حوار";
    case "THOUGHT":
      return "تفكير";
    case "NARRATION":
      return "سرد";
    case "CAPTION":
      return "توضيح";
    case "SFX":
      return "مؤثر";
    case "SCENE_TEXT":
      return "نص مشهد";
    case "SIGNAGE":
      return "لافتة";
    default:
      return t;
  }
}

function dirLabel(v: WritingDirection) {
  switch (v) {
    case "RTL":
      return "يمين ← يسار";
    case "LTR":
      return "يسار → يمين";
    case "TTB":
      return "عمودي";
    default:
      return v;
  }
}

export default function PropertiesPanel({
  page,
  selected,
  onSelect,
  onChangeDoc,
}: {
  page: EditorPageItem | null;
  selected: PageElement | null;
  onSelect: (id: string | null) => void;
  onChangeDoc: (
    updater: (doc: PageAnnotationsDoc) => PageAnnotationsDoc,
  ) => void;
}) {
  if (!page?.annotations) {
    return (
      <aside
        className="w-[420px] border-l bg-white p-4 text-sm text-zinc-500"
        dir="rtl"
        lang="ar"
      >
        لا توجد صفحة
      </aside>
    );
  }

  if (!selected) {
    return (
      <aside
        className="w-[420px] border-l bg-white p-4 text-sm text-zinc-500"
        dir="rtl"
        lang="ar"
      >
        اختر عنصرًا
      </aside>
    );
  }

  const el = selected;
  const imgW = page.image.width;
  const imgH = page.image.height;

  function patchElement(id: string, fn: (x: PageElement) => PageElement) {
    onChangeDoc((doc) => ({
      ...doc,
      elements: doc.elements.map((x) => (x.id === id ? fn(x) : x)),
      updatedAt: new Date().toISOString(),
    }));
  }

  // content changes should mark edited
  function patchContent(p: Partial<PageElement>) {
    patchElement(el.id, (x) => ({
      ...x,
      ...p,
      status: x.status === "deleted" ? x.status : "edited",
    }));
  }

  // meta/UI changes shouldn't flip status
  function patchMeta(p: Partial<PageElement>) {
    patchElement(el.id, (x) => ({ ...x, ...p }));
  }

  const padding = safeNum(el.container.params?.padding, 12);
  const bboxPx = normToPxBBox(el.geometry.container_bbox, imgW, imgH);
  const innerW = Math.max(1, bboxPx.w - padding * 2);
  const innerH = Math.max(1, bboxPx.h - padding * 2);

  function autoFit(field: "original" | "translated") {
    const text =
      (field === "original" ? el.text.original : el.text.translated) ?? "";
    const nextFont = autoFitFontSize({
      text,
      widthPx: innerW,
      heightPx: innerH,
      fontFamily: el.style.fontFamily ?? "Arial",
      fontStyle: el.style.fontStyle ?? "normal",
      lineHeight: el.style.lineHeight ?? 1.2,
      maxFontSize: el.style.fontSize,
      minFontSize: 8,
      writingDirection: el.text.writingDirection,
    });

    patchContent({
      style: { ...el.style, fontSize: nextFont, fontSizeMode: "manual" },
    });
  }

  function setFontSize(fontSize: number) {
    patchContent({ style: { ...el.style, fontSize, fontSizeMode: "manual" } });
  }

  function setFontSizeMode(mode: "auto" | "manual") {
    patchContent({ style: { ...el.style, fontSizeMode: mode } });
  }

  // محاذاة بسيطة داخل الصفحة
  function align(
    kind: "left" | "right" | "hCenter" | "top" | "bottom" | "vCenter",
  ) {
    const oldB = el.geometry.container_bbox;

    const newB = (() => {
      const b = oldB;

      const nx =
        kind === "left"
          ? 0
          : kind === "right"
            ? Math.max(0, 1 - b.w)
            : kind === "hCenter"
              ? clamp(0.5 - b.w / 2, 0, 1 - b.w)
              : b.x;

      const ny =
        kind === "top"
          ? 0
          : kind === "bottom"
            ? Math.max(0, 1 - b.h)
            : kind === "vCenter"
              ? clamp(0.5 - b.h / 2, 0, 1 - b.h)
              : b.y;

      return { ...b, x: nx, y: ny };
    })();

    const prevClip = (el.container.params as any)?.clipPath ?? null;
    const nextClip = remapClipPathWithBBox({
      clipPath: prevClip,
      from: oldB,
      to: newB,
    });

    patchContent({
      container: {
        ...el.container,
        params: { ...(el.container.params ?? {}), clipPath: nextClip ?? null },
      },
      geometry: {
        ...el.geometry,
        container_bbox: newB,
        anchor: bboxCenter(newB),
      },
    });
  }

  const meta = useMemo(() => {
    return { px: bboxPx, lang: el.text.lang, dir: el.text.writingDirection };
  }, [bboxPx, el.text.lang, el.text.writingDirection]);

  const originalDir = detectLang(el.text.original) === "ar" ? "rtl" : "ltr";
  const translatedDir =
    detectLang(el.text.translated ?? "") === "ar" ? "rtl" : "ltr";

  // new added
  const options = useMemo<SelectOption[]>(
    () =>
      Object.entries(TEMPLATE_LABELS).map(([value, label]) => ({
        value,
        label,
      })),
    [TEMPLATE_LABELS],
  );

  const clipPointsLen =
    ((el.container.params as any)?.clipPath?.points?.length as
      | number
      | undefined) ?? 0;

  const dirOptions = useMemo<SelectOption[]>(
    () => [
      { value: "RTL", label: dirLabel("RTL") },
      { value: "LTR", label: dirLabel("LTR") },
      { value: "TTB", label: dirLabel("TTB") },
    ],
    [dirLabel],
  );

  const textColor = (
    el.style.textFill ??
    el.style.textColor ??
    "#111111"
  ).slice(0, 7);

  const strokeColor = (el.style.textStroke ?? "#000000").slice(0, 7);
  const alignOptions = useMemo<SelectOption[]>(
    () => [
      { value: "right", label: "يمين", icon: <FiAlignRight /> },
      { value: "center", label: "وسط", icon: <FiAlignCenter /> },
      { value: "left", label: "يسار", icon: <FiAlignLeft /> },
    ],
    [],
  );

  const styleOptions = useMemo<SelectOption[]>(
    () => [
      { value: "normal", label: "عادي", icon: <FiType /> },
      { value: "bold", label: "عريض", icon: <FiBold /> },
      { value: "italic", label: "مائل", icon: <FiItalic /> },
      { value: "bold italic", label: "عريض مائل", icon: <FiBold /> },
    ],
    [],
  );

  return (
    <aside className="w-90 border-l bg-white min-h-0 flex flex-col">
      <div className="p-4 border-b bg-background">
        {/* Top row: title + status chips */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              <div className="text-sm font-semibold text-foreground-strong truncate">
                #{el.readingOrder} • {typeLabel(el.elementType)}
              </div>

              {/* Status chips */}
              <div className="flex items-center gap-1.5 shrink-0">
                {el.locked && (
                  <span className="inline-flex items-center rounded-full border border-border-subtle bg-background-soft px-2 py-0.5 text-[11px] font-medium text-foreground">
                    مقفل
                  </span>
                )}
                {el.hidden && (
                  <span className="inline-flex items-center rounded-full border border-border-subtle bg-background-soft px-2 py-0.5 text-[11px] font-medium text-foreground">
                    مخفي
                  </span>
                )}
              </div>
            </div>

            {/* Optional secondary line */}
            <div className="mt-1 text-xs text-foreground-muted">
              إدارة العنصر والتحكم بالظهور والقفل
            </div>
          </div>
        </div>

        {/* Bottom actions bar */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <DeButton
            size="sm"
            variant="soft"
            tone="neutral"
            leftIcon={
              el.locked ? (
                <Unlock className="h-4 w-4" />
              ) : (
                <Lock className="h-4 w-4" />
              )
            }
            onClick={() => patchMeta({ locked: !el.locked })}
          >
            {el.locked ? "فتح" : "قفل"}
          </DeButton>

          <DeButton
            size="sm"
            variant="soft"
            tone="neutral"
            leftIcon={
              el.hidden ? (
                <Eye className="h-4 w-4" />
              ) : (
                <EyeOff className="h-4 w-4" />
              )
            }
            onClick={() => patchMeta({ hidden: !el.hidden })}
          >
            {el.hidden ? "إظهار" : "إخفاء"}
          </DeButton>

          <div className="flex-1" />

          <DeButton
            size="sm"
            variant="solid"
            tone="danger"
            leftIcon={<Trash2 className="h-4 w-4" />}
            onClick={() => {
              patchMeta({ status: "deleted" as any });
              onSelect(null);
            }}
          >
            حذف
          </DeButton>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-auto p-4 space-y-3">
{/* add here section tampletes  */}

        <SectionBox title="محاذاة سريعة">
          <div
            className="w-full rounded-2xl 
          border border-zinc-200/70 bg-zinc-50/70 p-2 
          shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]
          justify-between flex
          "
          >
            <DeButton
              iconOnly
              size="sm"
              variant="soft"
              tone="neutral"
              shape="circle"
              aria-label="محاذاة يمين"
              tooltip="يمين"
              onClick={() => align("right")}
            >
              <FaAlignRight />
            </DeButton>
            <DeButton
              iconOnly
              size="sm"
              variant="soft"
              tone="neutral"
              shape="circle"
              aria-label="محاذاة وسط أفقي"
              tooltip="وسط أفقي"
              onClick={() => align("hCenter")}
            >
              <FaAlignCenter />
            </DeButton>
            <DeButton
              iconOnly
              size="sm"
              variant="soft"
              tone="neutral"
              shape="circle"
              aria-label="محاذاة يسار"
              tooltip="يسار"
              onClick={() => align("left")}
            >
              <FaAlignLeft />
            </DeButton>

            <DeButton
              iconOnly
              size="sm"
              variant="soft"
              tone="neutral"
              shape="circle"
              aria-label="محاذاة أعلى"
              tooltip="أعلى"
              onClick={() => align("top")}
            >
              <MdVerticalAlignTop />
            </DeButton>

            <DeButton
              iconOnly
              size="sm"
              variant="soft"
              tone="neutral"
              shape="circle"
              aria-label="محاذاة وسط عمودي"
              tooltip="وسط عمودي"
              onClick={() => align("vCenter")}
            >
              <MdVerticalAlignCenter />
            </DeButton>

            <DeButton
              iconOnly
              size="sm"
              variant="soft"
              tone="neutral"
              shape="circle"
              aria-label="محاذاة أسفل"
              tooltip="أسفل"
              onClick={() => align("bottom")}
            >
              <MdVerticalAlignBottom />
            </DeButton>
          </div>
        </SectionBox>

        <SectionBox title="القالب">
          <div className="flex w-full max-w-full items-center gap-2 justify-between">
            <div className="flex-1">
              <SmartSelect
                options={options}
                value={el.container.template_id}
                onChange={(value) => {
                  const t = (value ?? el.container.template_id) as TemplateId;

                  patchContent({
                    container: { ...el.container, template_id: t },
                    style: { ...TEMPLATE_DEFAULT_STYLE[t], ...el.style },
                  });
                }}
                searchable
                size="md"
                variant="outline"
                className="w-full"
                placeholder="اختر قالبًا"
              />
            </div>

            <DeButton
              iconOnly
              size="md"
              variant="soft"
              tone="neutral"
              shape="circle"
              aria-label="إعادة ضبط القالب"
              tooltip="إعادة ضبط"
              onClick={() => {
                const t = el.container.template_id;
                patchContent({ style: { ...TEMPLATE_DEFAULT_STYLE[t] } });
              }}
            >
              <FiRefreshCcw />
            </DeButton>
          </div>
        </SectionBox>

        <SectionBox title="الحاوية">
          <div className="w-full rounded-2xl border border-zinc-200/70 bg-zinc-50/70 p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {/* ClipPath */}
              <Field
                icon={<HiOutlineScissors />}
                label="Clip-Path (AI)"
                right={
                  <div className="flex items-center gap-1.5">
                    <DeButton
                      iconOnly
                      size="sm"
                      variant="soft"
                      tone="neutral"
                      shape="circle"
                      aria-label="نسخ ClipPath"
                      tooltip="نسخ"
                      className="shrink-0"
                      onClick={() => {
                        const v =
                          (el.container.params as any)?.clipPath ?? null;
                        navigator.clipboard?.writeText(JSON.stringify(v));
                      }}
                    >
                      <FiCopy />
                    </DeButton>

                    <DeButton
                      iconOnly
                      size="sm"
                      variant="soft"
                      tone="danger"
                      shape="circle"
                      aria-label="إزالة ClipPath"
                      tooltip="إزالة"
                      className="shrink-0"
                      onClick={() =>
                        patchContent({
                          container: {
                            ...el.container,
                            params: {
                              ...(el.container.params ?? {}),
                              clipPath: null,
                              clipPathCss: null,
                            },
                          },
                        })
                      }
                    >
                      <FiTrash2 />
                    </DeButton>
                  </div>
                }
              >
                <div className="text-[11px] text-zinc-600">
                  {clipPointsLen > 0 ? `نقاط: ${clipPointsLen}` : "—"}
                </div>
              </Field>

              {/* Fill */}
              <Field icon={<FaFillDrip />} label="التعبئة">
                <ColorInput
                  value={(el.style.fill || "#ffffff").slice(0, 7)}
                  onChange={(v) =>
                    patchContent({ style: { ...el.style, fill: v } })
                  }
                />
              </Field>

              {/* Stroke */}
              <Field icon={<RiColorFilterLine />} label="الحدود">
                <ColorInput
                  value={(el.style.stroke || "#000000").slice(0, 7)}
                  onChange={(v) =>
                    patchContent({ style: { ...el.style, stroke: v } })
                  }
                />
              </Field>

              {/* Stroke width */}
              <Field icon={<TbSquareRounded />} label="سماكة الحدود">
                <RangeRow
                  min={0}
                  max={10}
                  step={0.5}
                  value={el.style.strokeWidth}
                  onChange={(n) =>
                    patchContent({
                      style: { ...el.style, strokeWidth: Number(n || 0) },
                    })
                  }
                  suffix={`${el.style.strokeWidth}px`}
                />
              </Field>

              {/* Opacity */}
              <Field icon={<MdOpacity />} label="الشفافية">
                <RangeRow
                  min={0}
                  max={1}
                  step={0.05}
                  value={el.style.opacity}
                  onChange={(n) =>
                    patchContent({
                      style: { ...el.style, opacity: Number(n || 1) },
                    })
                  }
                  suffix={`${el.style.opacity}`}
                />
              </Field>

              {/* Padding */}
              <Field icon={<TbBorderRadius />} label="الحاشية (Padding)">
                <NumberInput
                  min={0}
                  value={safeNum(el.container.params?.padding, 12)}
                  onChange={(n) => {
                    const v = Number(n || 0);
                    patchContent({
                      container: {
                        ...el.container,
                        params: { ...(el.container.params ?? {}), padding: v },
                      },
                    });
                  }}
                />
              </Field>

              {/* Corner radius */}
              <Field icon={<TbSquareRounded />} label="تدوير الزوايا">
                <NumberInput
                  min={0}
                  value={safeNum(el.container.params?.cornerRadius, 18)}
                  onChange={(n) => {
                    const v = Number(n || 0);
                    patchContent({
                      container: {
                        ...el.container,
                        params: {
                          ...(el.container.params ?? {}),
                          cornerRadius: v,
                        },
                      },
                    });
                  }}
                />
              </Field>

              {/* Spikes */}
              <Field icon={<TbSparkles />} label="عدد الأشواك (Burst)">
                <NumberInput
                  min={3}
                  max={32}
                  value={safeNum(el.container.params?.spikes, 10)}
                  onChange={(n) => {
                    const v = Number(n || 10);
                    patchContent({
                      container: {
                        ...el.container,
                        params: { ...(el.container.params ?? {}), spikes: v },
                      },
                    });
                  }}
                />
              </Field>

              {/* Tail */}
              <Field icon={<PiArrowBendDownRightBold />} label="تفعيل الذيل">
                <ToggleRow
                  checked={!!el.container.params?.tailEnabled}
                  onChange={(checked) =>
                    patchContent({
                      container: {
                        ...el.container,
                        params: {
                          ...(el.container.params ?? {}),
                          tailEnabled: checked,
                        },
                      },
                    })
                  }
                />
              </Field>
            </div>
          </div>
        </SectionBox>

        <SectionBox title="النص">
          <div className="w-full rounded-2xl border border-zinc-200/70 bg-zinc-50/70 p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {/* Font size */}
              <Field icon={<FiType />} label="حجم الخط">
                <RangeRow
                  min={8}
                  max={80}
                  step={1}
                  value={el.style.fontSize}
                  onChange={(n) => setFontSize(Number(n || 16))}
                  suffix={`${el.style.fontSize}px`}
                />
              </Field>

              {/* Align (SmartSelect) */}
              <Field icon={<FiAlignCenter />} label="محاذاة">
                <SmartSelect
                  options={alignOptions}
                  value={el.style.align ?? "right"}
                  onChange={(value) =>
                    patchContent({
                      style: { ...el.style, align: (value as any) ?? "right" },
                    })
                  }
                  searchable={false}
                  size="md"
                  variant="outline"
                  className="w-full"
                />
              </Field>

              {/* Font family */}
              <Field icon={<RiFontFamily />} label="نوع الخط">
                <TextInput
                  value={el.style.fontFamily ?? "Arial"}
                  onChange={(v) =>
                    patchContent({ style: { ...el.style, fontFamily: v } })
                  }
                />
              </Field>

              {/* Font style (SmartSelect) */}
              <Field icon={<FiBold />} label="نمط الخط">
                <SmartSelect
                  options={styleOptions}
                  value={el.style.fontStyle ?? "normal"}
                  onChange={(value) =>
                    patchContent({
                      style: {
                        ...el.style,
                        fontStyle: (value as any) ?? "normal",
                      },
                    })
                  }
                  searchable={false}
                  size="md"
                  variant="outline"
                  className="w-full"
                />
              </Field>

              {/* Line height */}
              <Field icon={<MdOutlineFormatLineSpacing />} label="ارتفاع السطر">
                <NumberInput
                  step={0.05}
                  value={el.style.lineHeight ?? 1.2}
                  onChange={(n) =>
                    patchContent({
                      style: { ...el.style, lineHeight: Number(n || 1.2) },
                    })
                  }
                />
              </Field>

              {/* Letter spacing */}
              <Field icon={<RiLetterSpacing2 />} label="تباعد الحروف">
                <NumberInput
                  step={0.5}
                  value={el.style.letterSpacing ?? 0}
                  onChange={(n) =>
                    patchContent({
                      style: { ...el.style, letterSpacing: Number(n || 0) },
                    })
                  }
                />
              </Field>

              {/* Text color */}
              <Field icon={<TbPalette />} label="لون النص">
                <ColorInput
                  value={textColor}
                  onChange={(v) =>
                    patchContent({
                      style: {
                        ...el.style,
                        textFill: v,
                        textColor: v,
                      },
                    })
                  }
                />
              </Field>

              {/* Text stroke color */}
              <Field icon={<TbBorderStyle2 />} label="حدود النص">
                <ColorInput
                  value={strokeColor}
                  onChange={(v) =>
                    patchContent({
                      style: { ...el.style, textStroke: v },
                    })
                  }
                />
              </Field>

              {/* Text stroke width */}
              <Field icon={<TbBorderStyle2 />} label="سماكة حدود النص">
                <NumberInput
                  min={0}
                  value={el.style.textStrokeWidth ?? 0}
                  onChange={(n) =>
                    patchContent({
                      style: {
                        ...el.style,
                        textStrokeWidth: Number(n || 0),
                      },
                    })
                  }
                />
              </Field>

              {/* Rotation */}
              <Field icon={<FiRotateCw />} label="تدوير النص (درجات)">
                <NumberInput
                  value={el.style.textRotation ?? 0}
                  onChange={(n) =>
                    patchContent({
                      style: {
                        ...el.style,
                        textRotation: Number(n || 0),
                      },
                    })
                  }
                />
              </Field>
            </div>

            {/* Bottom controls */}
            <div className="mt-3 grid gap-3">
              <div className="rounded-2xl border border-zinc-200/70 bg-white/70 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-zinc-200/70 bg-zinc-50 text-zinc-700">
                      <HiOutlineSwitchHorizontal />
                    </span>
                    <span className="text-xs font-semibold text-zinc-900">
                      اتجاه الكتابة
                    </span>
                  </div>
                </div>

                <SmartSelect
                  options={dirOptions}
                  value={el.text.writingDirection}
                  onChange={(value) =>
                    patchContent({
                      text: {
                        ...el.text,
                        writingDirection: (value as WritingDirection) ?? "RTL",
                      },
                    })
                  }
                  searchable={false}
                  size="md"
                  variant="outline"
                  className="w-full"
                />
              </div>

              <div className="rounded-2xl border border-zinc-200/70 bg-white/70 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-zinc-200/70 bg-zinc-50 text-zinc-700">
                      <MdOpacity />
                    </span>
                    <div className="text-xs font-semibold text-zinc-900">
                      تكبير/تصغير النص تلقائيًا مع الإطار
                    </div>
                  </div>

                  <label className="inline-flex items-center gap-2 text-xs text-zinc-700">
                    <input
                      type="checkbox"
                      checked={(el.style.fontSizeMode ?? "auto") === "auto"}
                      onChange={(e) =>
                        setFontSizeMode(e.target.checked ? "auto" : "manual")
                      }
                    />
                  </label>
                </div>

                <div className="mt-1 text-[11px] text-zinc-500">
                  إذا غيّرت حجم الخط من السلايدر يصبح “يدوي” تلقائيًا.
                </div>

                <div className="mt-3 flex items-center gap-2 flex-wrap">
                  <DeButton
                    leftIcon={<FiMaximize2 />}
                    size="sm"
                    variant="soft"
                    tone="neutral"
                    onClick={() => autoFit("original")}
                  >
                    ملاءمة للأصل
                  </DeButton>

                  <DeButton
                    leftIcon={<FiMinimize2 />}
                    size="sm"
                    variant="soft"
                    tone="neutral"
                    onClick={() => autoFit("translated")}
                  >
                    ملاءمة للترجمة
                  </DeButton>
                </div>
              </div>
            </div>
          </div>
        </SectionBox>

        <SectionBox title="ملاحظات">
          <textarea
            className="w-full border rounded-xl px-3 py-2 min-h-[80px] text-sm"
            value={el.notes ?? ""}
            onChange={(e) => patchMeta({ notes: e.target.value })}
          />
        </SectionBox>
      </div>
    </aside>
  );
}

function SectionBox({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <details
      className="group w-full max-w-full overflow-hidden rounded-2xl border border-zinc-200/70 bg-white/70 shadow-sm ring-1 ring-black/5 backdrop-blur supports-[backdrop-filter]:bg-white/50"
      open
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 border-b border-zinc-200/60 bg-gradient-to-b from-white to-zinc-50/70 px-4 py-3 select-none [&::-webkit-details-marker]:hidden">
        <span className="text-sm font-semibold text-zinc-900">{title}</span>
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-zinc-200/70 bg-white/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]">
          <FiChevronDown className="text-zinc-600 transition-transform duration-200 group-open:rotate-180" />
        </span>
      </summary>

      <div className="p-3">{children}</div>
    </details>
  );
}

function Field({
  icon,
  label,
  right,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200/70 bg-white/70 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]">
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-zinc-200/70 bg-zinc-50 text-zinc-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
            {icon}
          </span>
          <span className="truncate text-xs font-semibold text-zinc-900">
            {label}
          </span>
        </div>
        {right ? <div className="shrink-0">{right}</div> : null}
      </div>

      <div className="space-y-2">{children}</div>
    </div>
  );
}

function ColorInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex items-center gap-2 rounded-xl border border-zinc-200/70 bg-white px-2 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]">
      <input
        className="h-9 w-10 cursor-pointer rounded-lg border border-zinc-200"
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label="color"
      />
      <div className="flex-1 min-w-0 rounded-lg border border-zinc-200/70 bg-zinc-50 px-2 py-1.5 text-[11px] text-zinc-700 tabular-nums">
        {value.toUpperCase()}
      </div>
    </label>
  );
}

function NumberInput({
  value,
  onChange,
  min,
  max,
}: {
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <input
      className="w-full rounded-xl border border-zinc-200/70 bg-white px-3 py-2 text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.85)] focus:outline-none focus:ring-2 focus:ring-zinc-200"
      type="number"
      min={min}
      max={max}
      value={value}
      onChange={(e) => onChange(Number(e.target.value || 0))}
    />
  );
}

function RangeRow({
  min,
  max,
  step,
  value,
  onChange,
  suffix,
}: {
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (n: number) => void;
  suffix: string;
}) {
  return (
    <div className="space-y-2">
      <input
        className="w-full accent-black"
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <div className="text-[11px] text-zinc-500 tabular-nums">{suffix}</div>
    </div>
  );
}

function ToggleRow({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-3 rounded-xl border border-zinc-200/70 bg-white px-3 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]">
      <span className="text-sm text-zinc-800">ذيل</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4"
        aria-label="tail"
      />
    </label>
  );
}

function TextInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <input
      className="w-full rounded-xl border border-zinc-200/70 bg-white px-3 py-2 text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.85)] focus:outline-none focus:ring-2 focus:ring-zinc-200"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
