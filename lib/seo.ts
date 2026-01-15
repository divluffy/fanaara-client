// lib/seo.ts
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function createTranslatedMetadata(ns: string): Promise<Metadata> {
  const t = await getTranslations(`Metadata.${ns}`);

  return {
    title: t("title"),
    description: t("description"),
  };
}
