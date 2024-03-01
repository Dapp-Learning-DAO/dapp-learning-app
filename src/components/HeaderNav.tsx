"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { SIDE_NAV_WIDTH } from "./SideNav";
import { forwardRef } from "react";
import Link from "next/link";
import Image from "next/image";

const HeaderNav = forwardRef((props, ref: any) => {
  return (
    <nav
      ref={ref}
      className="fixed z-10 top-0 right-0 left-0 px-8 py-4 flex justify-between sm:justify-end items-center bg-base-100 sm:left-[220px]"
      // style={{ left: SIDE_NAV_WIDTH }}
    >
      <div className="block sm:hidden">
        <Link href="/">
          <Image
            className="h-8 w-auto"
            src="/images/icon/192x192.png"
            alt="Dapp-Learning"
            height={56}
            width={56}
          />
        </Link>
      </div>
      <ConnectButton />
    </nav>
  );
});
HeaderNav.displayName = "HeaderNav";
export default HeaderNav;
