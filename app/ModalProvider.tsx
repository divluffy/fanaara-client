// app\ModalProvider.tsx
"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type Ctx = {
  openIds: string[];
  open: (id: string) => number; // returns index
  close: (id: string) => void;
  isTop: (id: string) => boolean;
  getIndex: (id: string) => number;
};

const ModalStackContext = createContext<Ctx | null>(null);

export function ModalStackProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [openIds, setOpenIds] = useState<string[]>([]);

  // scroll lock when ANY modal open
  useEffect(() => {
    if (openIds.length === 0) return;

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [openIds.length]);

  const value = useMemo<Ctx>(() => {
    return {
      openIds,
      open: (id) => {
        let index = -1;
        setOpenIds((prev) => {
          // move to top if exists
          const next = prev.filter((x) => x !== id).concat(id);
          index = next.indexOf(id);
          return next;
        });
        // NOTE: index is not reliable immediately, but we also expose getIndex
        return index;
      },
      close: (id) => setOpenIds((prev) => prev.filter((x) => x !== id)),
      isTop: (id) => openIds[openIds.length - 1] === id,
      getIndex: (id) => openIds.indexOf(id),
    };
  }, [openIds]);

  return (
    <ModalStackContext.Provider value={value}>
      {children}
    </ModalStackContext.Provider>
  );
}

export function useModalStack() {
  const ctx = useContext(ModalStackContext);
  return ctx;
}
