"use client";

import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import LocalesSelector from "./LocalesSelector";
import ThemeSelector from "./ThemeSelector";
import useTheme from "hooks/useTheme";
import { forwardRef } from "react";
import { BOTTOM_LINKS, NAV_LINKS, SIDE_NAV_WIDTH } from "config/ui";

const SideNav = forwardRef((props, ref: any) => {
  // const router = useRouter();
  const pathname = usePathname();
  // const searchParams = useSearchParams();

  const theme = useTheme();

  return (
    <nav
      ref={ref}
      className="fixed z-20 left-0 top-0 flex-col min-h-screen pl-5 pt-5 bg-base-100 shadow hidden sm:flex"
      style={{ width: SIDE_NAV_WIDTH }}
    >
      <div className="pr-5 mb-12">
        <Link href="/">
          <Image
            className="w-full"
            // src={`/images/nav-logo-${theme ? theme : "light"}.png`}
            src={`${theme && theme === "dark" ? "/images/nav-logo-dark.svg" : "/images/nav-logo-light.png"}`}
            style={{ objectFit: "contain" }}
            width={784}
            height={192}
            alt="DappLearning logo"
            priority
          />
        </Link>
      </div>
      <ul className="flex-1">
        {NAV_LINKS.map((navs) => (
          <div key={navs.name}>
            <div className="text-slate-500 py-2 mr-5 mb-2">{navs.name}</div>
            {navs.navs.map((item, index) => (
              <li key={item.link} className="mb-2">
                <Link
                  href={item.link}
                  className="block p-2 hover:bg-neutral-content rounded hover:text-primary relative cursor-pointer"
                >
                  {pathname === item.link && (
                    <span className="absolute right-0 top-1/2 -translate-y-1/2 block w-2 h-6 bg-primary"></span>
                  )}
                  {item.name}
                </Link>
              </li>
            ))}
            <div className="border-b my-5 mr-5"></div>
          </div>
        ))}
      </ul>
      <div className="border-b my-5 mr-5"></div>
      <ul>
        <li className="">
          <Link
            href={"https://dapplearnig.org"}
            className="px-2 py-1 text-sm hover:underline rounded hover:text-primary relative cursor-pointer"
            target="_blank"
          >
            <span className="flex-1">About DappLearning</span>
            <ArrowTopRightOnSquareIcon className="w-4 inline-block ml-2" />
          </Link>
        </li>
        <div className="grid grid-cols-2">
          {BOTTOM_LINKS.map((item) => (
            <li key={item.link} className="">
              <Link
                href={item.link}
                className="flex px-2 py-1 text-sm hover:underline rounded hover:text-primary relative cursor-pointer"
                target="_blank"
              >
                <span className="flex-1">{item.name}</span>
              </Link>
            </li>
          ))}
        </div>
      </ul>
      <div className="flex justify-between">
        <ThemeSelector />
        {/* <LocalesSelector /> */}
      </div>
    </nav>
  );
});

SideNav.displayName = "SideNav";

export default SideNav;
