import { LanguageMenuToggle, ThemeToggle } from "@/components";
import Link from "next/link";
import React from "react";

const LoggedLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="mt-8">
      <ThemeToggle />
      <LanguageMenuToggle />
      layout playground
      <Link className="px-2 mx-2 bg-amber-100" href="/playground/button">
        button
      </Link>{" "}
      <Link className="px-2 mx-2 bg-amber-100" href="/playground/icon-buttons">
        icon-buttons
      </Link>
      <Link className="px-2 mx-2 bg-amber-100" href="/playground/image">
        image
      </Link>{" "}
      <Link className="px-2 mx-2 bg-amber-100" href="/playground/avatar">
        avatar
      </Link>
      <Link className="px-2 mx-2 bg-amber-100" href="/playground/input">
        input
      </Link>
      <Link className="px-2 mx-2 bg-amber-100" href="/playground/dater">
        dater
      </Link>{" "}
      <Link className="px-2 mx-2 bg-amber-100" href="/playground/select">
        select
      </Link>      <Link className="px-2 mx-2 bg-amber-100" href="/playground/components">
        components
      </Link>
      <Link className="px-2 mx-2 bg-amber-100" href="/playground/modal">
        modal
      </Link>
      <hr />
      {children}
    </div>
  );
};

export default LoggedLayout;
