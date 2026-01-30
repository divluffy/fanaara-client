// components/OptionsSheet.tsx
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Modal from "@/components/Modal";
import {
  IoAlbumsOutline,
  IoArchiveOutline,
  IoBanOutline,
  IoBookmark,
  IoBookmarkOutline,
  IoChatbubbleEllipsesOutline,
  IoCloseCircleOutline,
  IoCopyOutline,
  IoEyeOffOutline,
  IoFlagOutline,
  IoHeartDislikeOutline,
  IoHeartOutline,
  IoLinkOutline,
  IoListOutline,
  IoMailOpenOutline,
  IoMailUnreadOutline,
  IoNotificationsOffOutline,
  IoNotificationsOutline,
  IoPeopleOutline,
  IoPersonAddOutline,
  IoPersonRemoveOutline,
  IoPencilOutline,
  IoPinOutline,
  IoTextOutline,
  IoTrashOutline,
  IoVolumeHighOutline,
  IoVolumeMuteOutline,
} from "react-icons/io5";

/** ===== Types ===== */

export type ActionId =
  | "copy_id"
  | "copy_link"
  | "copy_text"
  | "toggle_save"
  | "toggle_notifications"
  | "not_interested"
  | "show_less_like_this"
  | "show_more_like_this"
  | "hide"
  | "report"
  | "edit"
  | "delete"
  | "follow_toggle"
  | "message"
  | "mute_toggle"
  | "block_toggle"
  | "pin_toggle"
  | "archive_toggle"
  | "mark_read_toggle"
  | "join_toggle"
  | "favorite_toggle"
  | "add_to_list"
  | "remove_from_list";

export type OptionsSheetOption = {
  id: ActionId;
  /** boolean للتوغل — string للنسخ */
  value?: boolean | string;
  disabled?: boolean;
  hidden?: boolean;
};

export type OptionsSheetOptionInput = ActionId | OptionsSheetOption;

export type OptionsSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  options: OptionsSheetOptionInput[];
  onAction?: (
    id: ActionId,
    nextValue?: boolean | string,
  ) => void | Promise<void>;
};

/** ===== Utils ===== */

const cx = (...x: Array<string | false | null | undefined>) =>
  x.filter(Boolean).join(" ");

type Tone =
  | "blue"
  | "green"
  | "red"
  | "amber"
  | "purple"
  | "pink"
  | "teal"
  | "slate";

const TONE: Record<Tone, string> = {
  blue: "bg-blue-500/10 border-blue-500/20 text-blue-600",
  green: "bg-emerald-500/10 border-emerald-500/20 text-emerald-600",
  red: "bg-rose-500/10 border-rose-500/20 text-rose-600",
  amber: "bg-amber-500/10 border-amber-500/20 text-amber-700",
  purple: "bg-purple-500/10 border-purple-500/20 text-purple-600",
  pink: "bg-pink-500/10 border-pink-500/20 text-pink-600",
  teal: "bg-teal-500/10 border-teal-500/20 text-teal-600",
  slate: "bg-slate-500/10 border-slate-500/20 text-slate-600",
};

async function safeCopy(text: string) {
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {}
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    ta.style.top = "0";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

/** ===== Registry (ثابت + مختصر) ===== */

type Meta = {
  tone: Tone;
  danger?: boolean;
  kind: "toggle" | "copy" | "action";
  label: string | ((v: boolean) => string);
  icon: React.ReactNode | ((v: boolean) => React.ReactNode);
};

const REG: Record<ActionId, Meta> = {
  copy_link: {
    kind: "copy",
    tone: "blue",
    label: "نسخ الرابط",
    icon: <IoLinkOutline className="size-4" />,
  },
  copy_id: {
    kind: "copy",
    tone: "teal",
    label: "نسخ المعرّف",
    icon: <IoCopyOutline className="size-4" />,
  },
  copy_text: {
    kind: "copy",
    tone: "teal",
    label: "نسخ النص",
    icon: <IoTextOutline className="size-4" />,
  },

  toggle_save: {
    kind: "toggle",
    tone: "green",
    label: (v) => (v ? "إزالة من المحفوظات" : "حفظ"),
    icon: (v) =>
      v ? (
        <IoBookmark className="size-4" />
      ) : (
        <IoBookmarkOutline className="size-4" />
      ),
  },
  toggle_notifications: {
    kind: "toggle",
    tone: "blue",
    label: (v) => (v ? "إيقاف الإشعارات" : "تفعيل الإشعارات"),
    icon: (v) =>
      v ? (
        <IoNotificationsOutline className="size-4" />
      ) : (
        <IoNotificationsOffOutline className="size-4" />
      ),
  },
  follow_toggle: {
    kind: "toggle",
    tone: "green",
    label: (v) => (v ? "إلغاء المتابعة" : "متابعة"),
    icon: (v) =>
      v ? (
        <IoPersonRemoveOutline className="size-4" />
      ) : (
        <IoPersonAddOutline className="size-4" />
      ),
  },
  mute_toggle: {
    kind: "toggle",
    tone: "amber",
    label: (v) => (v ? "إلغاء الكتم" : "كتم"),
    icon: (v) =>
      v ? (
        <IoVolumeHighOutline className="size-4" />
      ) : (
        <IoVolumeMuteOutline className="size-4" />
      ),
  },
  block_toggle: {
    kind: "toggle",
    tone: "red",
    danger: true,
    label: (v) => (v ? "إلغاء الحظر" : "حظر"),
    icon: (v) =>
      v ? (
        <IoCloseCircleOutline className="size-4" />
      ) : (
        <IoBanOutline className="size-4" />
      ),
  },
  pin_toggle: {
    kind: "toggle",
    tone: "purple",
    label: (v) => (v ? "إلغاء التثبيت" : "تثبيت"),
    icon: () => <IoPinOutline className="size-4" />,
  },
  archive_toggle: {
    kind: "toggle",
    tone: "slate",
    label: (v) => (v ? "إلغاء الأرشفة" : "أرشفة"),
    icon: () => <IoArchiveOutline className="size-4" />,
  },
  mark_read_toggle: {
    kind: "toggle",
    tone: "blue",
    label: (v) => (v ? "وضع كغير مقروء" : "وضع كمقروء"),
    icon: (v) =>
      v ? (
        <IoMailOpenOutline className="size-4" />
      ) : (
        <IoMailUnreadOutline className="size-4" />
      ),
  },
  join_toggle: {
    kind: "toggle",
    tone: "green",
    label: (v) => (v ? "مغادرة المجتمع" : "انضمام للمجتمع"),
    icon: () => <IoPeopleOutline className="size-4" />,
  },
  favorite_toggle: {
    kind: "toggle",
    tone: "pink",
    label: (v) => (v ? "إزالة من المفضلة" : "إضافة للمفضلة"),
    icon: (v) =>
      v ? (
        <IoHeartDislikeOutline className="size-4" />
      ) : (
        <IoHeartOutline className="size-4" />
      ),
  },

  message: {
    kind: "action",
    tone: "blue",
    label: "مراسلة",
    icon: <IoChatbubbleEllipsesOutline className="size-4" />,
  },
  hide: {
    kind: "action",
    tone: "slate",
    label: "إخفاء",
    icon: <IoEyeOffOutline className="size-4" />,
  },
  report: {
    kind: "action",
    tone: "red",
    danger: true,
    label: "إبلاغ…",
    icon: <IoFlagOutline className="size-4" />,
  },
  edit: {
    kind: "action",
    tone: "purple",
    label: "تعديل",
    icon: <IoPencilOutline className="size-4" />,
  },
  delete: {
    kind: "action",
    tone: "red",
    danger: true,
    label: "حذف",
    icon: <IoTrashOutline className="size-4" />,
  },

  not_interested: {
    kind: "action",
    tone: "amber",
    label: "غير مهتم",
    icon: <IoHeartDislikeOutline className="size-4" />,
  },
  show_less_like_this: {
    kind: "action",
    tone: "slate",
    label: "عرض أقل مثل هذا",
    icon: <IoHeartDislikeOutline className="size-4" />,
  },
  show_more_like_this: {
    kind: "action",
    tone: "pink",
    label: "عرض المزيد مثل هذا",
    icon: <IoHeartOutline className="size-4" />,
  },

  add_to_list: {
    kind: "action",
    tone: "purple",
    label: "إضافة لقائمة",
    icon: <IoListOutline className="size-4" />,
  },
  remove_from_list: {
    kind: "action",
    tone: "slate",
    label: "إزالة من قائمة",
    icon: <IoAlbumsOutline className="size-4" />,
  },
};

/** ===== Component ===== */

export default function OptionsSheet({
  open,
  onOpenChange,
  options,
  onAction,
}: OptionsSheetProps) {
  const normalized = useMemo<OptionsSheetOption[]>(
    () =>
      options
        .map((o) =>
          typeof o === "string" ? ({ id: o } as OptionsSheetOption) : o,
        )
        .filter((o) => !o.hidden),
    [options],
  );

  // optimistic values (toggles + copy strings)
  const [values, setValues] = useState<
    Record<string, boolean | string | undefined>
  >({});
  useEffect(() => {
    const next: Record<string, boolean | string | undefined> = {};
    for (const o of normalized) if (o.value !== undefined) next[o.id] = o.value;
    setValues(next);
  }, [open, normalized]);

  // micro toast (للنسخ فقط)
  const [toast, setToast] = useState<string | null>(null);
  const toastT = useRef<number | null>(null);
  const pop = (t: string) => {
    if (toastT.current) window.clearTimeout(toastT.current);
    setToast(t);
    toastT.current = window.setTimeout(() => setToast(null), 800);
  };

  const press = async (opt: OptionsSheetOption) => {
    const meta = REG[opt.id];
    const cur = values[opt.id] ?? opt.value;

    try {
      if (meta.kind === "toggle") {
        const next = !Boolean(cur);
        setValues((s) => ({ ...s, [opt.id]: next }));
        await onAction?.(opt.id, next);
        return;
      }

      if (meta.kind === "copy") {
        const text = typeof cur === "string" ? cur : "";
        const ok = await safeCopy(text);
        pop(ok ? "تم النسخ" : "تعذّر النسخ");
        await onAction?.(opt.id, text);
        return;
      }

      await onAction?.(opt.id, cur);
      onOpenChange(false);
    } catch {
      // لو صار فشل API، لا نكسر UI
      pop("حدث خطأ");
    }
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      dir="rtl"
      mode={{ desktop: "center", mobile: "sheet" }}
      maxWidthClass="max-w-sm"
      preset="comments"
      contentPadding="none"
      sheetDragMode="none"
      sheetSnapPoints={[0.62]}
      sheetInitialSnap={0}
      closeOnBackdrop
      closeOnEsc
      trapFocus
      panelClassName="bg-background-elevated"
    >
      {/* ✅ الخيارات فقط (بدون أي نص فوق/تحت) */}
      <ul className="m-2 overflow-hidden rounded-2xl border border-border-subtle bg-background-elevated">
        {normalized.map((opt) => {
          const meta = REG[opt.id];
          if (!meta) return null;

          const v = values[opt.id] ?? opt.value;
          const label =
            typeof meta.label === "function"
              ? meta.label(Boolean(v))
              : meta.label;
          const icon =
            typeof meta.icon === "function" ? meta.icon(Boolean(v)) : meta.icon;

          return (
            <li
              key={opt.id}
              className="border-b border-border-subtle/70 last:border-b-0"
            >
              <button
                type="button"
                disabled={opt.disabled}
                onClick={() => press(opt)}
                className={cx(
                  "group w-full select-none",
                  "flex flex-row-reverse items-center justify-between gap-2",
                  "px-3 py-2.5",
                  "text-right",
                  "bg-transparent",
                  "hover:bg-surface-soft/70 active:bg-surface-soft/90",
                  "focus-visible:ring-2 focus-visible:ring-accent/50",
                  opt.disabled
                    ? "cursor-not-allowed opacity-50"
                    : "cursor-pointer",
                )}
              >
                <div
                  className={cx(
                    "min-w-0 flex-1 truncate text-[13px] font-semibold",
                    meta.danger && "text-rose-600",
                  )}
                >
                  {label}
                </div>

                <div
                  className={cx(
                    "grid size-9 shrink-0 place-items-center rounded-xl border",
                    TONE[meta.tone],
                    "group-active:scale-[0.99] transition-transform",
                  )}
                  aria-hidden="true"
                >
                  {icon}
                </div>
              </button>
            </li>
          );
        })}
      </ul>

      {/* Toast overlay (لا يعتبر نص فوق/تحت داخل الحاوية) */}
      <div
        className={cx(
          "pointer-events-none fixed inset-x-0 bottom-6 z-[9999] flex justify-center",
          toast ? "opacity-100" : "opacity-0",
          "transition-opacity duration-150",
        )}
      >
        <div className="rounded-full border border-border-subtle bg-background-elevated/95 px-3 py-1.5 text-xs font-semibold text-foreground-strong shadow-[var(--shadow-elevated)]">
          {toast ?? ""}
        </div>
      </div>
    </Modal>
  );
}
