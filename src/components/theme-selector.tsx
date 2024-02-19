"use client";

import { MoonIcon, SunIcon } from "@heroicons/react/24/outline";
import { useEffect } from "react";
import { themeChange } from "theme-change";

export default function ThemeSelector() {
  useEffect(() => {
    themeChange(false);
    // 👆 false parameter is required for react project
    return () => {
      themeChange(false);
    };
  }, []);

  return (
    <div>
      <button
        className="btn btn-sm btn-ghost font-normal"
        data-toggle-theme="dark,light"
      >
        <SunIcon className="w-4" />
        <span className="text-sm">/</span>
        <MoonIcon className="w-4" />
      </button>
    </div>
  );
}
