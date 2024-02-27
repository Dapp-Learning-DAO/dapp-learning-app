"use client";

import SideNav, { SIDE_NAV_WIDTH } from "components/SideNav";
import Footer from "components/Footer";
import HeaderNav from "./HeaderNav";
import { useRef } from "react";

export default function AppContainer({
  children,
  isBlur,
}: Readonly<{
  children: React.ReactNode;
  isBlur?: boolean | undefined;
}>) {
  const sideRef = useRef(null);
  const headerRef = useRef(null);

  return (
    <div
      className={`flex min-h-screen ${isBlur ? "blur" : ""}`}
      style={{ paddingLeft: SIDE_NAV_WIDTH }}
    >
      <SideNav ref={sideRef} />
      <main className="flex-1">
        <HeaderNav ref={headerRef} />
        <div style={{ minHeight: `calc(100vh - ${112}px)`, paddingTop: 72 }}>
          {children}
        </div>
        <Footer />
      </main>
    </div>
  );
}
