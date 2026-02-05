// design\DeOptions.tsx
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Modal from "@/design/DeModal";
import {
  IoArchiveOutline,
  IoBanOutline,
  IoBookmark,
  IoBookmarkOutline,
  IoChatbubbleEllipsesOutline,
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoCopyOutline,
  IoDownloadOutline,
  IoEyeOffOutline,
  IoFlagOutline,
  IoHeartDislikeOutline,
  IoHeartOutline,
  IoLinkOutline,
  IoListOutline,
  IoLockClosedOutline,
  IoLockOpenOutline,
  IoMailOpenOutline,
  IoMailUnreadOutline,
  IoNotificationsOffOutline,
  IoNotificationsOutline,
  IoPauseOutline,
  IoPeopleOutline,
  IoPersonAddOutline,
  IoPersonRemoveOutline,
  IoPencilOutline,
  IoPinOutline,
  IoPlayOutline,
  IoShareSocialOutline,
  IoStarOutline,
  IoTextOutline,
  IoTimeOutline,
  IoTrashOutline,
  IoVolumeHighOutline,
  IoVolumeMuteOutline,
  IoWarningOutline,
  IoAlertCircleOutline,
} from "react-icons/io5";

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

type Variant = "default" | "warning" | "danger";

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

/** ===== i18n helpers ===== */

export type TFn = (key: string) => string;

function tr(t: TFn | undefined, key: string, fallback: string) {
  const out = t?.(key);
  // كثير من مكتبات i18n ترجع key نفسه لو مفقود
  if (!out || out === key) return fallback;
  return out;
}

type LabelSpec = { key: string; fallback: string };
const L = (key: string, fallback: string): LabelSpec => ({ key, fallback });

/** ===== Domain-ish helpers (Anime/Manga/Comics Library status) ===== */

type LibraryKind = "anime" | "manga" | "comic";
type LibraryStatus =
  | "planned"
  | "in_progress"
  | "completed"
  | "on_hold"
  | "dropped";
export type LibraryStatusValue = `${LibraryKind}:${LibraryStatus}`;

function parseLibraryStatus(value: string) {
  const [kind, status] = value.split(":") as [LibraryKind, LibraryStatus];
  const okKind = kind === "anime" || kind === "manga" || kind === "comic";
  const okStatus =
    status === "planned" ||
    status === "in_progress" ||
    status === "completed" ||
    status === "on_hold" ||
    status === "dropped";
  if (!okKind || !okStatus) return null;
  return { kind, status };
}

/** ===== Registry ===== */

type ActionKind = "toggle" | "copy" | "action";

type ToneResolver = Tone | ((v: boolean | string | undefined) => Tone);
type VariantResolver = Variant | ((v: boolean | string | undefined) => Variant);

type Meta = {
  kind: ActionKind;
  tone: ToneResolver;
  variant?: VariantResolver;
  label: (v: boolean | string | undefined) => LabelSpec;
  icon: (v: boolean | string | undefined) => React.ReactNode;
  /** default close behavior (can be overridden per option) */
  closeOnPress?: boolean;
};

const REG = {
  /** share / copy */
  share: {
    kind: "action",
    tone: "blue",
    label: () => L("optionsSheet.actions.share", "Share"),
    icon: () => <IoShareSocialOutline className="size-4" />,
    closeOnPress: true,
  },

  copy_link: {
    kind: "copy",
    tone: "blue",
    label: () => L("optionsSheet.actions.copyLink", "Copy link"),
    icon: () => <IoLinkOutline className="size-4" />,
    closeOnPress: false,
  },
  copy_id: {
    kind: "copy",
    tone: "teal",
    label: () => L("optionsSheet.actions.copyId", "Copy ID"),
    icon: () => <IoCopyOutline className="size-4" />,
    closeOnPress: false,
  },
  copy_text: {
    kind: "copy",
    tone: "teal",
    label: () => L("optionsSheet.actions.copyText", "Copy text"),
    icon: () => <IoTextOutline className="size-4" />,
    closeOnPress: false,
  },

  /** generic content toggles */
  toggle_save: {
    kind: "toggle",
    tone: "green",
    label: (v) =>
      Boolean(v)
        ? L("optionsSheet.actions.unsave", "Remove from saved")
        : L("optionsSheet.actions.save", "Save"),
    icon: (v) =>
      Boolean(v) ? (
        <IoBookmark className="size-4" />
      ) : (
        <IoBookmarkOutline className="size-4" />
      ),
    closeOnPress: false,
  },

  /** video-specific (watch later) */
  toggle_watch_later: {
    kind: "toggle",
    tone: "green",
    label: (v) =>
      Boolean(v)
        ? L(
            "optionsSheet.actions.removeFromWatchLater",
            "Remove from Watch Later",
          )
        : L("optionsSheet.actions.watchLater", "Watch later"),
    icon: (v) =>
      Boolean(v) ? (
        <IoBookmark className="size-4" />
      ) : (
        <IoBookmarkOutline className="size-4" />
      ),
    closeOnPress: false,
  },

  toggle_notifications: {
    kind: "toggle",
    tone: "blue",
    label: (v) =>
      Boolean(v)
        ? L(
            "optionsSheet.actions.disableNotifications",
            "Disable notifications",
          )
        : L("optionsSheet.actions.enableNotifications", "Enable notifications"),
    icon: (v) =>
      Boolean(v) ? (
        <IoNotificationsOutline className="size-4" />
      ) : (
        <IoNotificationsOffOutline className="size-4" />
      ),
    closeOnPress: false,
  },

  /** user / social toggles */
  follow_toggle: {
    kind: "toggle",
    tone: "green",
    label: (v) =>
      Boolean(v)
        ? L("optionsSheet.actions.unfollow", "Unfollow")
        : L("optionsSheet.actions.follow", "Follow"),
    icon: (v) =>
      Boolean(v) ? (
        <IoPersonRemoveOutline className="size-4" />
      ) : (
        <IoPersonAddOutline className="size-4" />
      ),
    closeOnPress: false,
  },
  mute_toggle: {
    kind: "toggle",
    tone: "amber",
    label: (v) =>
      Boolean(v)
        ? L("optionsSheet.actions.unmute", "Unmute")
        : L("optionsSheet.actions.mute", "Mute"),
    icon: (v) =>
      Boolean(v) ? (
        <IoVolumeHighOutline className="size-4" />
      ) : (
        <IoVolumeMuteOutline className="size-4" />
      ),
    closeOnPress: false,
  },
  block_toggle: {
    kind: "toggle",
    tone: "red",
    variant: "danger",
    label: (v) =>
      Boolean(v)
        ? L("optionsSheet.actions.unblock", "Unblock")
        : L("optionsSheet.actions.block", "Block"),
    icon: (v) =>
      Boolean(v) ? (
        <IoCloseCircleOutline className="size-4" />
      ) : (
        <IoBanOutline className="size-4" />
      ),
    closeOnPress: false,
  },

  /** owner/management */
  pin_toggle: {
    kind: "toggle",
    tone: "purple",
    label: (v) =>
      Boolean(v)
        ? L("optionsSheet.actions.unpin", "Unpin")
        : L("optionsSheet.actions.pin", "Pin"),
    icon: () => <IoPinOutline className="size-4" />,
    closeOnPress: false,
  },
  archive_toggle: {
    kind: "toggle",
    tone: "slate",
    label: (v) =>
      Boolean(v)
        ? L("optionsSheet.actions.unarchive", "Unarchive")
        : L("optionsSheet.actions.archive", "Archive"),
    icon: () => <IoArchiveOutline className="size-4" />,
    closeOnPress: false,
  },

  mark_read_toggle: {
    kind: "toggle",
    tone: "blue",
    label: (v) =>
      Boolean(v)
        ? L("optionsSheet.actions.markAsUnread", "Mark as unread")
        : L("optionsSheet.actions.markAsRead", "Mark as read"),
    icon: (v) =>
      Boolean(v) ? (
        <IoMailOpenOutline className="size-4" />
      ) : (
        <IoMailUnreadOutline className="size-4" />
      ),
    closeOnPress: false,
  },

  join_toggle: {
    kind: "toggle",
    tone: "green",
    label: (v) =>
      Boolean(v)
        ? L("optionsSheet.actions.leaveCommunity", "Leave community")
        : L("optionsSheet.actions.joinCommunity", "Join community"),
    icon: () => <IoPeopleOutline className="size-4" />,
    closeOnPress: false,
  },

  favorite_toggle: {
    kind: "toggle",
    tone: "pink",
    label: (v) =>
      Boolean(v)
        ? L("optionsSheet.actions.removeFromFavorites", "Remove from favorites")
        : L("optionsSheet.actions.addToFavorites", "Add to favorites"),
    icon: (v) =>
      Boolean(v) ? (
        <IoHeartDislikeOutline className="size-4" />
      ) : (
        <IoHeartOutline className="size-4" />
      ),
    closeOnPress: false,
  },

  /** content moderation / discovery */
  not_interested: {
    kind: "action",
    tone: "amber",
    label: () => L("optionsSheet.actions.notInterested", "Not interested"),
    icon: () => <IoHeartDislikeOutline className="size-4" />,
    closeOnPress: true,
  },
  show_less_like_this: {
    kind: "action",
    tone: "slate",
    label: () =>
      L("optionsSheet.actions.showLessLikeThis", "Show less like this"),
    icon: () => <IoHeartDislikeOutline className="size-4" />,
    closeOnPress: true,
  },
  show_more_like_this: {
    kind: "action",
    tone: "pink",
    label: () =>
      L("optionsSheet.actions.showMoreLikeThis", "Show more like this"),
    icon: () => <IoHeartOutline className="size-4" />,
    closeOnPress: true,
  },

  hide: {
    kind: "action",
    tone: "slate",
    label: () => L("optionsSheet.actions.hide", "Hide"),
    icon: () => <IoEyeOffOutline className="size-4" />,
    closeOnPress: true,
  },

  report: {
    kind: "action",
    tone: "amber",
    variant: "warning",
    label: () => L("optionsSheet.actions.report", "Report…"),
    icon: () => <IoFlagOutline className="size-4" />,
    closeOnPress: true,
  },

  /** edit/delete */
  edit: {
    kind: "action",
    tone: "purple",
    label: () => L("optionsSheet.actions.edit", "Edit"),
    icon: () => <IoPencilOutline className="size-4" />,
    closeOnPress: true,
  },
  delete: {
    kind: "action",
    tone: "red",
    variant: "danger",
    label: () => L("optionsSheet.actions.delete", "Delete"),
    icon: () => <IoTrashOutline className="size-4" />,
    closeOnPress: true,
  },

  /** list management */
  add_to_list: {
    kind: "action",
    tone: "purple",
    label: () => L("optionsSheet.actions.addToList", "Add to list"),
    icon: () => <IoListOutline className="size-4" />,
    closeOnPress: true,
  },
  remove_from_list: {
    kind: "action",
    tone: "slate",
    label: () => L("optionsSheet.actions.removeFromList", "Remove from list"),
    icon: () => <IoCloseCircleOutline className="size-4" />,
    closeOnPress: true,
  },

  /** anime/manga/comic: quick status actions */
  set_library_status: {
    kind: "action",
    tone: (v) => {
      const p = typeof v === "string" ? parseLibraryStatus(v) : null;
      if (!p) return "purple";
      switch (p.status) {
        case "planned":
          return "teal";
        case "in_progress":
          return "blue";
        case "completed":
          return "green";
        case "on_hold":
          return "amber";
        case "dropped":
          return "red";
      }
    },
    label: (v) => {
      const p = typeof v === "string" ? parseLibraryStatus(v) : null;
      if (!p) return L("optionsSheet.libraryStatus.generic", "Update status");

      const base = `optionsSheet.libraryStatus.${p.kind}.`;
      // keys: planned, inProgress, completed, onHold, dropped
      switch (p.status) {
        case "planned":
          return L(
            `${base}planned`,
            p.kind === "anime" ? "Plan to watch" : "Plan to read",
          );
        case "in_progress":
          return L(
            `${base}inProgress`,
            p.kind === "anime" ? "Watching" : "Reading",
          );
        case "completed":
          return L(`${base}completed`, "Completed");
        case "on_hold":
          return L(`${base}onHold`, "On hold");
        case "dropped":
          return L(`${base}dropped`, "Dropped");
      }
    },
    icon: (v) => {
      const p = typeof v === "string" ? parseLibraryStatus(v) : null;
      const status = p?.status;

      switch (status) {
        case "planned":
          return <IoTimeOutline className="size-4" />;
        case "in_progress":
          return <IoPlayOutline className="size-4" />;
        case "completed":
          return <IoCheckmarkCircleOutline className="size-4" />;
        case "on_hold":
          return <IoPauseOutline className="size-4" />;
        case "dropped":
          return <IoCloseCircleOutline className="size-4" />;
        default:
          return <IoListOutline className="size-4" />;
      }
    },
    closeOnPress: true,
  },

  /** creator tools */
  toggle_spoiler: {
    kind: "toggle",
    tone: "amber",
    variant: "warning",
    label: (v) =>
      Boolean(v)
        ? L("optionsSheet.actions.unmarkSpoiler", "Remove spoiler tag")
        : L("optionsSheet.actions.markSpoiler", "Mark as spoiler"),
    icon: () => <IoAlertCircleOutline className="size-4" />,
    closeOnPress: false,
  },

  toggle_nsfw: {
    kind: "toggle",
    tone: "red",
    variant: "warning",
    label: (v) =>
      Boolean(v)
        ? L("optionsSheet.actions.unmarkMature", "Remove mature tag")
        : L("optionsSheet.actions.markMature", "Mark as mature"),
    icon: () => <IoWarningOutline className="size-4" />,
    closeOnPress: false,
  },

  toggle_private: {
    kind: "toggle",
    tone: "slate",
    label: (v) =>
      Boolean(v)
        ? L("optionsSheet.actions.makePublic", "Make public")
        : L("optionsSheet.actions.makePrivate", "Make private"),
    icon: (v) =>
      Boolean(v) ? (
        <IoLockClosedOutline className="size-4" />
      ) : (
        <IoLockOpenOutline className="size-4" />
      ),
    closeOnPress: false,
  },

  /** extras */
  rate: {
    kind: "action",
    tone: "pink",
    label: () => L("optionsSheet.actions.rate", "Rate"),
    icon: () => <IoStarOutline className="size-4" />,
    closeOnPress: true,
  },
  review: {
    kind: "action",
    tone: "purple",
    label: () => L("optionsSheet.actions.review", "Write a review"),
    icon: () => <IoTextOutline className="size-4" />,
    closeOnPress: true,
  },
  message: {
    kind: "action",
    tone: "blue",
    label: () => L("optionsSheet.actions.message", "Message"),
    icon: () => <IoChatbubbleEllipsesOutline className="size-4" />,
    closeOnPress: true,
  },

  download_media: {
    kind: "action",
    tone: "teal",
    label: () => L("optionsSheet.actions.download", "Download"),
    icon: () => <IoDownloadOutline className="size-4" />,
    closeOnPress: true,
  },
} as const satisfies Record<string, Meta>;

export type ActionId = keyof typeof REG;

/** ===== Types ===== */

export type OptionsSheetOption = {
  /** مفيد لو عندك نفس id مكرر (مثال: set_library_status عدة مرات) */
  key?: string;

  id: ActionId;
  /** boolean للتوغل — string للنسخ أو للـpayload البسيط */
  value?: boolean | string;

  disabled?: boolean;
  hidden?: boolean;

  /** overrides per-option */
  tone?: Tone;
  variant?: Variant;
  label?: string;
  labelKey?: string;
  icon?: React.ReactNode;

  /** behavior */
  closeOnPress?: boolean;
  separatorBefore?: boolean;
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

  /** i18n + direction */
  t?: TFn;
  dir?: "rtl" | "ltr";
};

/** ===== Component ===== */

export default function OptionsSheet({
  open,
  onOpenChange,
  options,
  onAction,
  t,
  dir = "rtl",
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
    if (!open) return;
    const next: Record<string, boolean | string | undefined> = {};
    for (const o of normalized) {
      if (o.value !== undefined) next[o.key ?? o.id] = o.value;
    }
    setValues(next);
  }, [open, normalized]);

  // micro toast (للنسخ + errors)
  const [toast, setToast] = useState<string | null>(null);
  const toastT = useRef<number | null>(null);
  const pop = (msg: string) => {
    if (toastT.current) window.clearTimeout(toastT.current);
    setToast(msg);
    toastT.current = window.setTimeout(() => setToast(null), 900);
  };

  const [busyKey, setBusyKey] = useState<string | null>(null);
  const isBusy = Boolean(busyKey);

  const resolveTone = (meta: Meta, v: boolean | string | undefined): Tone => {
    const tone = meta.tone;
    return typeof tone === "function" ? tone(v) : tone;
  };

  const resolveVariant = (
    meta: Meta,
    v: boolean | string | undefined,
  ): Variant => {
    const vr = meta.variant;
    if (!vr) return "default";
    return typeof vr === "function" ? vr(v) : vr;
  };

  const press = async (opt: OptionsSheetOption) => {
    if (isBusy || opt.disabled) return;

    const meta = REG[opt.id];
    if (!meta) return;

    const k = opt.key ?? opt.id;
    const cur = values[k] ?? opt.value;

    const shouldClose =
      typeof opt.closeOnPress === "boolean"
        ? opt.closeOnPress
        : typeof meta.closeOnPress === "boolean"
          ? meta.closeOnPress
          : meta.kind === "action";

    // (1) close early for actions (better UX) — keep open for toggles/copy
    if (shouldClose && meta.kind === "action") onOpenChange(false);

    setBusyKey(k);

    try {
      if (meta.kind === "toggle") {
        const prev = Boolean(cur);
        const next = !prev;

        setValues((s) => ({ ...s, [k]: next }));
        await onAction?.(opt.id, next);

        return;
      }

      if (meta.kind === "copy") {
        const text = typeof cur === "string" ? cur : "";
        const ok = await safeCopy(text);

        pop(
          ok
            ? tr(t, "optionsSheet.toast.copied", "Copied")
            : tr(t, "optionsSheet.toast.copyFailed", "Couldn't copy"),
        );

        await onAction?.(opt.id, text);
        return;
      }

      // action
      await onAction?.(opt.id, cur);

      // if action is "non-close" (rare), handle it
      if (shouldClose && meta.kind !== "action") onOpenChange(false);
    } catch {
      // rollback toggle on failure
      if (meta.kind === "toggle") {
        const prev = Boolean(cur);
        setValues((s) => ({ ...s, [k]: prev }));
      }
      pop(tr(t, "optionsSheet.toast.error", "Something went wrong"));
    } finally {
      setBusyKey(null);
    }
  };

  const rtl = dir === "rtl";

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      dir={dir}
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
      <ul className="m-2 overflow-hidden rounded-2xl border border-border-subtle bg-background-elevated">
        {normalized.map((opt) => {
          const meta = REG[opt.id];
          if (!meta) return null;

          const k = opt.key ?? opt.id;
          const v = values[k] ?? opt.value;

          const tone = opt.tone ?? resolveTone(meta, v);
          const variant = opt.variant ?? resolveVariant(meta, v);

          const label = (() => {
            if (opt.label) return opt.label;
            if (opt.labelKey) return tr(t, opt.labelKey, opt.labelKey);
            const spec = meta.label(v);
            return tr(t, spec.key, spec.fallback);
          })();

          const icon = opt.icon ?? meta.icon(v);

          const rowBg =
            variant === "danger"
              ? "hover:bg-rose-500/10 active:bg-rose-500/20"
              : variant === "warning"
                ? "hover:bg-amber-500/10 active:bg-amber-500/20"
                : "hover:bg-surface-soft/70 active:bg-surface-soft/90";

          const labelColor =
            variant === "danger"
              ? "text-rose-600"
              : variant === "warning"
                ? "text-amber-700"
                : "text-foreground-strong";

          const disabled = opt.disabled || isBusy;

          return (
            <li
              key={k}
              className={cx(
                "last:border-b-0",
                "border-b border-border-subtle/70",
              )}
            >
              {opt.separatorBefore && (
                <div className="h-px w-full bg-border-subtle/70" />
              )}

              <button
                type="button"
                disabled={disabled}
                onClick={() => press(opt)}
                className={cx(
                  "group w-full select-none",
                  "flex items-center justify-between gap-2",
                  rtl ? "flex-row-reverse text-right" : "flex-row text-left",
                  "px-3 py-2.5",
                  "bg-transparent",
                  rowBg,
                  "focus-visible:ring-2 focus-visible:ring-accent/50",
                  disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
                )}
              >
                <div
                  className={cx(
                    "min-w-0 flex-1 truncate text-[13px] font-semibold",
                    labelColor,
                  )}
                >
                  {label}
                </div>

                <div
                  className={cx(
                    "grid size-9 shrink-0 place-items-center rounded-xl border",
                    TONE[tone],
                    "group-active:scale-[0.99] transition-transform",
                  )}
                  aria-hidden="true"
                >
                  {busyKey === k ? (
                    <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : (
                    icon
                  )}
                </div>
              </button>
            </li>
          );
        })}
      </ul>

      {/* Toast overlay */}
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
