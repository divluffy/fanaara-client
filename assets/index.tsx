/** ✅ Official-ish brand icons (multi-color where needed) */
export function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303C33.651 32.657 29.173 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.963 3.037l5.657-5.657C34.047 6.053 29.227 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.651-.389-3.917z"
      />
      <path
        fill="#FF3D00"
        d="M6.306 14.691l6.571 4.819C14.654 16.108 19.01 12 24 12c3.059 0 5.842 1.154 7.963 3.037l5.657-5.657C34.047 6.053 29.227 4 24 4 16.317 4 9.656 8.337 6.306 14.691z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.072 0 9.797-1.945 13.327-5.102l-6.157-5.205C29.154 35.216 26.715 36 24 36c-5.152 0-9.616-3.317-11.292-7.946l-6.52 5.02C9.505 39.556 16.227 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.611 20.083H42V20H24v8h11.303a11.99 11.99 0 0 1-4.133 5.693l.003-.002 6.157 5.205C36.893 39.297 44 34 44 24c0-1.341-.138-2.651-.389-3.917z"
      />
    </svg>
  );
}

export function MicrosoftIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path fill="#F25022" d="M2 2h9v9H2z" />
      <path fill="#7FBA00" d="M13 2h9v9h-9z" />
      <path fill="#00A4EF" d="M2 13h9v9H2z" />
      <path fill="#FFB900" d="M13 13h9v9h-9z" />
    </svg>
  );
}

/** ✅ Apple icon (theme-aware via currentColor) */
export function AppleIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="currentColor"
        d="M16.365 1.43c0 1.14-.46 2.2-1.21 3.01-.78.84-2.06 1.48-3.17 1.39-.14-1.08.44-2.22 1.15-3.02.78-.9 2.12-1.53 3.23-1.38ZM20.5 17.03c-.54 1.25-.8 1.8-1.5 2.9-.97 1.5-2.33 3.37-4.03 3.39-1.52.02-1.91-.98-3.96-.97-2.04.01-2.48.99-4 .97-1.7-.02-3-1.72-3.97-3.22C1.3 17.33.2 12.29 2.1 9.08c.98-1.66 2.53-2.63 4-2.66 1.55-.03 3 .99 3.95.99.93 0 2.66-1.23 4.49-1.05.77.03 2.94.31 4.33 2.33-3.78 2.07-3.17 7.54.63 9.34Z"
      />
    </svg>
  );
}
