"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { SIDE_NAV_WIDTH } from "./SideNav";
import { forwardRef } from "react";

const HeaderNav = forwardRef((props, ref: any) => {
  return (
    <nav
      ref={ref}
      className="fixed z-10 top-0 right-0 px-8 py-4 flex justify-end items-center bg-base-100"
      style={{ left: SIDE_NAV_WIDTH }}
    >
      <ConnectButton />
    </nav>
  );
});
HeaderNav.displayName = "HeaderNav";
export default HeaderNav;
