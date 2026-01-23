"use client";

import CountriesList from "@/constants/CountriesList";
import { countryCodeToFlagEmoji } from "@/utils/countryCodeToFlagEmoji";
import { useTranslations } from "next-intl";
import { useMemo } from "react";

type CountryOption = {
  value: string;
  label: string;
  icon: any;
};


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
