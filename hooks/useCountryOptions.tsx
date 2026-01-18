"use client";

import CountriesList from "@/constants/CountriesList";
import { useTranslations } from "next-intl";
import { useMemo } from "react";

type CountryOption = {
  value: string;
  label: string;
  icon: any;
};

export function countryCodeToFlagEmoji(code: string) {
  if (!code) return "";
  const cc = code.trim().toUpperCase();

  // لازم يكون حرفين A-Z
  if (!/^[A-Z]{2}$/.test(cc)) return "";

  const OFFSET = 0x1f1e6 - "A".charCodeAt(0); 
  const first = cc.charCodeAt(0) + OFFSET;
  const second = cc.charCodeAt(1) + OFFSET;

  return String.fromCodePoint(first, second);
}

const useCountryOptions = () => {
  const t = useTranslations("countries");

  const options = useMemo<CountryOption[]>(
    () =>
      CountriesList.map((countryCode) => {
        const flag = countryCodeToFlagEmoji(countryCode);
        return {
          value: countryCode,
          icon: <span>{flag}</span>,
          label: t(countryCode),
        };
      }),
    [t],
  );

  return options;
};

export default useCountryOptions;
