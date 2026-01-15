"use client";

import { useMemo } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function useFullPath() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return useMemo(() => {
    const qs = searchParams.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  }, [pathname, searchParams]);
}
