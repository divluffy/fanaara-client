// app\StoreProvider.tsx
"use client";

import { useEffect, useRef } from "react";
import { Provider } from "react-redux";
import type { ReactNode } from "react";
import { makeStore, type AppStore } from "@/store/store";
import { initializeDirection, setDirection } from "@/store/state";
import { Directions } from "@/i18n/config";

export default function StoreProvider({
  children,
  initialDirection,
}: {
  children: ReactNode;
  initialDirection: Directions;
}) {
  const storeRef = useRef<AppStore | null>(null);

  if (!storeRef.current) {
    storeRef.current = makeStore();
    storeRef.current.dispatch(initializeDirection(initialDirection));
  }

  useEffect(() => {
    storeRef.current!.dispatch(setDirection(initialDirection));
  }, [initialDirection]);

  return <Provider store={storeRef.current}>{children}</Provider>;
}
