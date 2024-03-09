"use client";

import { MoonIcon, SunIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";

export default function ThemeSelector() {
  const handleThemeToggle = () => {
    let theme = document.documentElement.getAttribute("data-theme");
    theme = theme == "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  };

  useEffect(() => {
    const _theme = localStorage.getItem("theme") || "light";
    if (_theme) {
      document.documentElement.setAttribute("data-theme", _theme);
    } else {
      document.documentElement.setAttribute("data-theme", "light");
    }
  }, []);

  return (
    <div>
      <button
        className="btn btn-sm btn-ghost font-normal"
        // data-toggle-theme="light,dark"
        onClick={() => handleThemeToggle()}
      >
        <SunIcon className="w-4" />
        <span className="text-sm">/</span>
        <MoonIcon className="w-4" />
      </button>
    </div>
  );
}
