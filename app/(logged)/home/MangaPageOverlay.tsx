'use client';

import React, { CSSProperties, useEffect, useMemo, useRef, useState } from 'react';

type Rect = { x: number; y: number; w: number; h: number };

type MaskAsset = {
  format: 'png_rgba_alpha';
  assetKey?: string;
  url: string; // can be S3/CloudFront URL in prod
};

type FillStyle = { color: string; opacity: number };
type StrokeStyle = { color: string; width: number };

type Container =
  | { kind: 'none'; bbox: Rect }
  | { kind: 'mask'; bbox: Rect; mask: MaskAsset; fill?: FillStyle; stroke?: StrokeStyle }
  | { kind: 'group'; bbox: Rect; shapes: Array<{ kind: 'mask'; bbox: Rect; mask: MaskAsset; fill?: FillStyle; stroke?: StrokeStyle }> };

type TextStroke = { color: string; widthPx: number };

type TextStyle = {
  fontFamily?: string;
  fontSizePx: number;
  fontWeight?: number;
  fontStyle?: 'normal' | 'italic';
  color: string;
  align?: 'left' | 'center' | 'right';
  lineHeight?: number;
  letterSpacingPx?: number;
  textStroke?: TextStroke;
};

type OverlayText = { value: string; bbox: Rect; style: TextStyle; selectable?: boolean };

type HoverFx = {
  scale?: number;
  outline?: { color: string; widthPx: number };
  fill?: FillStyle;
};

type OverlayElement = {
  id: string;
  type: 'text';
  subtype: 'speechBubble' | 'caption' | 'sfx';
  zIndex?: number;
  container: Container;
  text: OverlayText;
  interaction?: { hover?: HoverFx };
};

type PageOverlay = {
  version: '1.0';
  image: { src: string; signedSrc?: string; naturalWidth: number; naturalHeight: number };
  elements: OverlayElement[];
};

type RenderMode = 'copyOnly' | 'replace' | 'debug';

function rectStyle(r: Rect): CSSProperties {
  return { left: r.x, top: r.y, width: r.w, height: r.h };
}

function maskCss(maskUrl: string): CSSProperties {
  return {
    WebkitMaskImage: `url(${maskUrl})`,
    WebkitMaskRepeat: 'no-repeat',
    WebkitMaskSize: '100% 100%',
    maskImage: `url(${maskUrl})`,
    maskRepeat: 'no-repeat',
    maskSize: '100% 100%',
  };
}

export function MangaPageOverlay({
  data,
  className,
  mode = 'copyOnly',
}: {
  data: PageOverlay;
  className?: string;
  mode?: RenderMode;
}) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    const ro = new ResizeObserver(() => {
      const w = el.clientWidth;
      if (!w) return;
      setScale(w / data.image.naturalWidth);
    });

    ro.observe(el);
    return () => ro.disconnect();
  }, [data.image.naturalWidth]);

  const imgSrc = data.image.signedSrc ?? data.image.src;

  return (
    <div
      ref={wrapperRef}
      className={className ?? 'w-full'}
      style={{ position: 'relative', aspectRatio: `${data.image.naturalWidth}/${data.image.naturalHeight}` }}
    >
      {/* Base image */}
      <img
        src={imgSrc}
        alt=""
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'fill',
          userSelect: 'none',
          pointerEvents: 'none',
        }}
      />

      {/* Overlay: fixed coordinate space (natural px), scaled to fit */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          width: data.image.naturalWidth,
          height: data.image.naturalHeight,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          pointerEvents: 'none', // important: enable events only on elements
        }}
      >
        {data.elements.map((el) => (
          <OverlayElementView key={el.id} el={el} mode={mode} />
        ))}
      </div>
    </div>
  );
}

function OverlayElementView({ el, mode }: { el: OverlayElement; mode: RenderMode }) {
  const hover = el.interaction?.hover ?? {};
  const hoverScale = hover.scale ?? 1.04;

  const zIndex = el.zIndex ?? 1;

  // In copyOnly: keep visuals invisible but selectable
  const textVisible = mode !== 'copyOnly';
  const baseFillOpacity = mode === 'replace' ? 1 : 0;
  const showDebug = mode === 'debug';

  const wrapperStyle: CSSProperties = {
    position: 'absolute',
    ...rectStyle(el.container.bbox),
    zIndex,
    pointerEvents: 'auto',
    transformOrigin: 'center center',
    transition: 'transform 140ms ease, filter 140ms ease',
  };

  const hoverFxStyle: CSSProperties = {
    // we apply hover scale via CSS :hover using inline style trick:
  };

  const textStyle: CSSProperties = {
    position: 'absolute',
    ...rectStyle(el.text.bbox),
    whiteSpace: 'pre-line',
    fontSize: el.text.style.fontSizePx,
    fontWeight: el.text.style.fontWeight ?? 600,
    fontStyle: el.text.style.fontStyle ?? 'normal',
    fontFamily: el.text.style.fontFamily ?? 'system-ui, -apple-system, Segoe UI, Roboto, Arial',
    lineHeight: el.text.style.lineHeight ?? 1.05,
    letterSpacing: el.text.style.letterSpacingPx ? `${el.text.style.letterSpacingPx}px` : undefined,
    textAlign: el.text.style.align ?? 'left',
    color: textVisible ? el.text.style.color : 'transparent',
    userSelect: el.text.selectable ? 'text' : 'none',
    cursor: el.text.selectable ? 'text' : 'default',
    // Optional stroke (works in WebKit; for others you'd need SVG/text-shadow fallback)
    WebkitTextStroke:
      el.text.style.textStroke && textVisible
        ? `${el.text.style.textStroke.widthPx}px ${el.text.style.textStroke.color}`
        : undefined,
  };

  const outlineOnHover = hover.outline;
  const hoverFill = hover.fill;

  return (
    <div
      style={wrapperStyle}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = `scale(${hoverScale})`;
        if (outlineOnHover) {
          (e.currentTarget as HTMLDivElement).style.outline = `${outlineOnHover.widthPx}px solid ${outlineOnHover.color}`;
          (e.currentTarget as HTMLDivElement).style.outlineOffset = '2px';
        }
        if (hoverFill) {
          // handled in container rendering via data-attr if needed; here we keep simple: add a filter glow
          (e.currentTarget as HTMLDivElement).style.filter = 'drop-shadow(0 0 6px rgba(0,0,0,0.12))';
        }
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = 'scale(1)';
        (e.currentTarget as HTMLDivElement).style.outline = '';
        (e.currentTarget as HTMLDivElement).style.outlineOffset = '';
        (e.currentTarget as HTMLDivElement).style.filter = '';
      }}
    >
      {/* Container shapes */}
      <ContainerView container={el.container} mode={mode} baseFillOpacity={baseFillOpacity} hoverFill={hoverFill} />

      {/* Text layer (selectable) */}
      <div style={textStyle}>{el.text.value}</div>

      {/* Debug */}
      {showDebug && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            border: '1px dashed rgba(255,0,0,0.6)',
            pointerEvents: 'none',
          }}
        />
      )}
    </div>
  );
}

function ContainerView({
  container,
  mode,
  baseFillOpacity,
  hoverFill,
}: {
  container: Container;
  mode: RenderMode;
  baseFillOpacity: number;
  hoverFill?: FillStyle;
}) {
  if (container.kind === 'none') {
    // optional hover highlight could be added here
    return null;
  }

  if (container.kind === 'mask') {
    const fill = container.fill ?? { color: '#ffffff', opacity: 1 };
    const style: CSSProperties = {
      position: 'absolute',
      ...rectStyle(container.bbox),
      background: fill.color,
      opacity: mode === 'replace' ? fill.opacity : baseFillOpacity,
      ...maskCss(container.mask.url),
      pointerEvents: 'none',
    };

    return <div style={style} />;
  }

  if (container.kind === 'group') {
    return (
      <>
        {container.shapes.map((s, idx) => {
          const fill = s.fill ?? { color: '#ffffff', opacity: 1 };
          const style: CSSProperties = {
            position: 'absolute',
            ...rectStyle(s.bbox),
            background: fill.color,
            opacity: mode === 'replace' ? fill.opacity : baseFillOpacity,
            ...maskCss(s.mask.url),
            pointerEvents: 'none',
          };
          return <div key={idx} style={style} />;
        })}
      </>
    );
  }

  return null;
}
