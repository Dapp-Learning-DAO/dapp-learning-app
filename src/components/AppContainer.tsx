"use client";

import SideNav, { SIDE_NAV_WIDTH } from "components/SideNav";
import Footer from "components/Footer";
import HeaderNav from "./HeaderNav";
import { useRef, useState } from "react";
import { useDebounce, useWindowSize } from "react-use";

export default function AppContainer({
  children,
  isBlur,
}: Readonly<{
  children: React.ReactNode;
  isBlur?: boolean | undefined;
}>) {
  const sideRef = useRef(null);
  const headerRef = useRef(null);
  const { width } = useWindowSize();
  const [isModal, setIsModal] = useState(false);

  useDebounce(
    () => {
      setIsModal(width < 450);
    },
    200,
    [width],
  );

  return (
    <div
      className={`flex min-h-screen md:pl-[220px] ${isBlur ? "blur" : ""}`}
      // style={{ paddingLeft: SIDE_NAV_WIDTH }}
    >
      <SideNav ref={sideRef} />
      <main className="flex-1 max-w-full">
        <HeaderNav ref={headerRef} />
        <div
          style={{
            minHeight: `calc(100vh - ${isModal ? 84 : 112}px)`,
            paddingTop: 72,
          }}
        >
          {children}
        </div>
        <Footer />
      </main>
    </div>
  );
}
