"use client";

/**
 * Canvas editor (Konva)
 * - Renders background image
 * - Renders elements (shape + text)
 * - Supports select, drag, resize (Transformer)
 */

import React, { useEffect, useMemo, useRef, useState } from "react";
import Konva from "konva";
import { Stage, Layer, Image as KonvaImage, Group, Rect, Ellipse, Text, Transformer } from "react-konva";
import { ElementDoc, PageDoc, ViewMode, LangMode } from "./types";
import { TEMPLATE_CATALOG } from "./templates";
import {
  computeFitTransform,
  displayToNormalizedBBox,
  mockTranslate,
  normalizedToDisplayBBox,
  ViewTransform,
} from "./utils";

export default function CanvasEditor({
  page,
  selectedId,
  viewMode,
  langMode,
  onSelect,
  onUpdateElementBBox,
}: {
  page: PageDoc | null;
  selectedId: string | null;
  viewMode: ViewMode;
  langMode: LangMode;
  onSelect: (id: string | null) => void;
  onUpdateElementBBox: (id: string, nextBBox: ElementDoc["bbox"]) => void;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [containerSize, setContainerSize] = useState({ w: 0, h: 0 });

  const [bgImage, setBgImage] = useState<HTMLImageElement | null>(null);

  // ResizeObserver
  useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    const ro = new ResizeObserver(() => {
      const rect = el.getBoundingClientRect();
      setContainerSize({ w: Math.floor(rect.width), h: Math.floor(rect.height) });
    });
    ro.observe(el);
    const rect = el.getBoundingClientRect();
    setContainerSize({ w: Math.floor(rect.width), h: Math.floor(rect.height) });
    return () => ro.disconnect();
  }, []);

  // Load image for Konva
  useEffect(() => {
    if (!page) {
      setBgImage(null);
      return;
    }
    const img = new Image();
    img.src = page.image.url;
    img.onload = () => setBgImage(img);
  }, [page?.image.url]);

  const t: ViewTransform = useMemo(() => {
    if (!page) return { scale: 1, offsetX: 0, offsetY: 0 };
    return computeFitTransform(containerSize.w, containerSize.h, page.image.width, page.image.height);
  }, [containerSize, page]);

  const selectedNodeRef = useRef<Konva.Group | null>(null);
  const trRef = useRef<Konva.Transformer | null>(null);

  useEffect(() => {
    if (!trRef.current) return;
    if (selectedNodeRef.current) {
      trRef.current.nodes([selectedNodeRef.current]);
    } else {
      trRef.current.nodes([]);
    }
    trRef.current.getLayer()?.batchDraw();
  }, [selectedId, page?.elements.length]);

  if (!page) {
    return (
      <div className="flex-1 flex items-center justify-center text-sm text-gray-500">
        Upload images to start.
      </div>
    );
  }

  const stageW = containerSize.w || 800;
  const stageH = containerSize.h || 600;

  return (
    <div ref={containerRef} className="flex-1 bg-neutral-950/5 relative">
      <Stage
        width={stageW}
        height={stageH}
        onMouseDown={(e) => {
          // click empty => deselect
          const clickedOnEmpty = e.target === e.target.getStage();
          if (clickedOnEmpty) onSelect(null);
        }}
      >
        <Layer>
          {/* Background image */}
          {bgImage && (
            <KonvaImage
              image={bgImage}
              x={t.offsetX}
              y={t.offsetY}
              width={page.image.width * t.scale}
              height={page.image.height * t.scale}
              listening={false}
            />
          )}

          {/* Elements */}
          {page.elements.map((el) => {
            const d = normalizedToDisplayBBox(el.bbox, page.image.width, page.image.height, t);
            const isSelected = el.id === selectedId;

            return (
              <Group
                key={el.id}
                x={d.x}
                y={d.y}
                draggable={viewMode === "edit"}
                ref={(node) => {
                  if (isSelected && node) selectedNodeRef.current = node;
                }}
                onClick={() => onSelect(el.id)}
                onTap={() => onSelect(el.id)}
                onDragEnd={(e) => {
                  const node = e.target as Konva.Group;
                  const nextDisplay = { x: node.x(), y: node.y(), w: d.w, h: d.h };
                  const next = displayToNormalizedBBox(nextDisplay, page.image.width, page.image.height, t);
                  onUpdateElementBBox(el.id, next);
                }}
                onTransformEnd={(e) => {
                  const node = e.target as Konva.Group;
                  const scaleX = node.scaleX();
                  const scaleY = node.scaleY();

                  const minSize = 24;
                  const newW = Math.max(minSize, d.w * scaleX);
                  const newH = Math.max(minSize, d.h * scaleY);

                  node.scaleX(1);
                  node.scaleY(1);

                  const nextDisplay = { x: node.x(), y: node.y(), w: newW, h: newH };
                  const next = displayToNormalizedBBox(nextDisplay, page.image.width, page.image.height, t);
                  onUpdateElementBBox(el.id, next);
                }}
              >
                <ElementShape el={el} w={d.w} h={d.h} viewMode={viewMode} langMode={langMode} />

                {/* Selection outline */}
                {isSelected && viewMode === "edit" && (
                  <Rect
                    x={0}
                    y={0}
                    width={d.w}
                    height={d.h}
                    stroke="#000000"
                    strokeWidth={1}
                    dash={[6, 4]}
                    fillEnabled={false}
                    listening={false}
                  />
                )}
              </Group>
            );
          })}

          {/* Transformer */}
          {viewMode === "edit" && (
            <Transformer
              ref={trRef}
              rotateEnabled={false}
              keepRatio={false}
              enabledAnchors={["top-left", "top-right", "bottom-left", "bottom-right"]}
              boundBoxFunc={(oldBox, newBox) => {
                // min size
                if (newBox.width < 24 || newBox.height < 24) return oldBox;
                return newBox;
              }}
            />
          )}
        </Layer>
      </Stage>
    </div>
  );
}

function ElementShape({
  el,
  w,
  h,
  viewMode,
  langMode,
}: {
  el: ElementDoc;
  w: number;
  h: number;
  viewMode: ViewMode;
  langMode: LangMode;
}) {
  const template = TEMPLATE_CATALOG[el.templateId];
  const padding = Number(el.templateParams?.padding ?? 12);

  const displayText =
    langMode === "translated"
      ? el.text.translated || mockTranslate(el.text.original, el.text.lang)
      : el.text.original;

  // Basic shapes only (prototype)
  const commonStroke = el.style.stroke;
  const commonFill = el.style.fill;
  const sw = el.style.strokeWidth;
  const opacity = el.style.opacity;

  const textX = padding;
  const textY = padding;
  const textW = Math.max(0, w - padding * 2);
  const textH = Math.max(0, h - padding * 2);

  const isSfx = el.type === "SFX";

  // render based on templateId
  if (el.templateId === "bubble_ellipse") {
    return (
      <>
        <Ellipse
          x={w / 2}
          y={h / 2}
          radiusX={w / 2}
          radiusY={h / 2}
          fill={commonFill}
          stroke={commonStroke}
          strokeWidth={sw}
          opacity={opacity}
        />
        <Text
          x={textX}
          y={textY}
          width={textW}
          height={textH}
          text={displayText}
          fontSize={el.style.fontSize}
          align={el.style.align}
          verticalAlign="middle"
          listening={false}
        />
      </>
    );
  }

  if (el.templateId === "bubble_roundrect" || el.templateId === "box_roundrect") {
    const cornerRadius = Number(el.templateParams?.cornerRadius ?? 16);
    return (
      <>
        <Rect
          x={0}
          y={0}
          width={w}
          height={h}
          cornerRadius={cornerRadius}
          fill={commonFill}
          stroke={commonStroke}
          strokeWidth={sw}
          opacity={opacity}
        />
        <Text
          x={textX}
          y={textY}
          width={textW}
          height={textH}
          text={displayText}
          fontSize={el.style.fontSize}
          align={el.style.align}
          verticalAlign="middle"
          listening={false}
        />
      </>
    );
  }

  if (el.templateId === "box_rect" || el.templateId === "scene_label") {
    return (
      <>
        <Rect
          x={0}
          y={0}
          width={w}
          height={h}
          fill={commonFill}
          stroke={commonStroke}
          strokeWidth={sw}
          opacity={opacity}
        />
        <Text
          x={textX}
          y={textY}
          width={textW}
          height={textH}
          text={displayText}
          fontSize={el.style.fontSize}
          align={el.style.align}
          verticalAlign="middle"
          listening={false}
        />
      </>
    );
  }

  // Cloud / Shout (basic as roundrect for now)
  if (el.templateId === "bubble_cloud" || el.templateId === "bubble_shout") {
    return (
      <>
        <Rect
          x={0}
          y={0}
          width={w}
          height={h}
          cornerRadius={18}
          fill={commonFill}
          stroke={commonStroke}
          strokeWidth={sw}
          opacity={opacity}
        />
        <Text
          x={textX}
          y={textY}
          width={textW}
          height={textH}
          text={displayText}
          fontSize={el.style.fontSize}
          align={el.style.align}
          verticalAlign="middle"
          listening={false}
        />
      </>
    );
  }

  // SFX tooltip: just dashed box + label (prototype)
  if (el.templateId === "sfx_tooltip" || el.templateId === "sfx_side_label") {
    return (
      <>
        <Rect
          x={0}
          y={0}
          width={w}
          height={h}
          fill={"#00000000"}
          stroke={commonStroke}
          strokeWidth={2}
          dash={[8, 6]}
          opacity={1}
        />
        <Text
          x={8}
          y={8}
          width={Math.max(0, w - 16)}
          height={Math.max(0, h - 16)}
          text={displayText || "SFX"}
          fontSize={el.style.fontSize}
          align={"center"}
          verticalAlign="middle"
          listening={false}
        />
      </>
    );
  }

  // fallback
  return (
    <>
      <Rect x={0} y={0} width={w} height={h} stroke={commonStroke} strokeWidth={sw} fill={commonFill} />
      <Text x={textX} y={textY} width={textW} height={textH} text={displayText} fontSize={el.style.fontSize} />
    </>
  );
}
