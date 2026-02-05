"use client";

import AddPost from "@/components/AddPost";
import { useSelectedLayoutSegments } from "next/navigation";

const HIDE_ROOT_SEGMENTS = new Set(["chat"]); // يخفي /chat و /chat/*

export default function AddPostGate() {
  const segments = useSelectedLayoutSegments();
  const root = segments[0]; // أول segment بعد الـ layout
  const hide = root && HIDE_ROOT_SEGMENTS.has(root);

  if (hide) return null;
  return <AddPost mode="desktop" />;
}
