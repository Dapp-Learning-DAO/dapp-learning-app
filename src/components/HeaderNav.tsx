"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { forwardRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Bars3Icon } from "@heroicons/react/24/outline";
import { BOTTOM_LINKS, NAV_LINKS } from "config/ui";
import { usePathname, useRouter } from "next/navigation";
import useTheme from "hooks/useTheme";

const HIDDEN_CONNECT_BTN_ROUTE = ["/bridge"];

const HeaderNav = forwardRef((props, ref: any) => {
  const pathname = usePathname();
  const theme = useTheme();
  const router = useRouter();

  return (
    <nav
      ref={ref}
      className="fixed z-10 top-0 right-0 left-0 px-2 sm:px-8 py-4 flex justify-between sm:justify-end items-center bg-base-100 sm:left-[220px]"
      // style={{ left: SIDE_NAV_WIDTH }}
    >
      <div className="block sm:hidden pr-4" style={{ maxWidth: `50%` }}>
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
      <div
        className={`flex-1 flex justify-end px-2 ${HIDDEN_CONNECT_BTN_ROUTE.includes(pathname.replace(/^\/(\w+)/, "")) ? "hidden" : ""}`}
      >
        <ConnectButton
          accountStatus={{
            smallScreen: "avatar",
            largeScreen: "full",
          }}
        />
      </div>
      <div className="block sm:hidden">
        <div className="drawer drawer-end">
          <input id="mobile_menu" type="checkbox" className="drawer-toggle" />
          <div className="drawer-content">
            <label className="btn-ghost block" htmlFor="mobile_menu">
              <span className="sr-only">Open menu</span>
              <Bars3Icon className="h-6 w-6" aria-hidden="true" />
            </label>
          </div>
          <div className="drawer-side">
            <label
              htmlFor="mobile_menu"
              aria-label="close sidebar"
              className="drawer-overlay"
            ></label>
            <div className="px-5 pt-5 pb-6 bg-base-100 p-8 min-h-full flex flex-col">
              <div className="flex items-center justify-between max-w-40 mb-10">
                <Link href="/">
                  <Image
                    className="w-full"
                    src={`/images/nav-logo-${theme ? theme : "light"}.png`}
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
                    <div className="text-slate-500 py-1 mr-3 mb-1">
                      {navs.name}
                    </div>
                    {navs.navs.map((item, index) => (
                      <li key={item.link} className="mb-1">
                        <label
                          className="block py-1 p-2 hover:bg-neutral-content rounded hover:text-primary relative cursor-pointer"
                          htmlFor="mobile_menu"
                          aria-label="close sidebar"
                          onClick={() => {
                            router.push(item.link);
                          }}
                        >
                          {pathname === item.link && (
                            <span className="absolute right-0 top-1/2 -translate-y-1/2 block w-2 h-6 bg-primary"></span>
                          )}
                          {item.name}
                        </label>
                      </li>
                    ))}
                    <div className="border-b my-5 mr-5"></div>
                  </div>
                ))}
              </ul>
              <div className="py-2 px-6">
                <div className="grid grid-cols-2 gap-y-2 gap-x-8">
                  {BOTTOM_LINKS.map((item) => (
                    <Link
                      key={item.name}
                      href={item.link}
                      className="text-sm text-slate-500"
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
});
HeaderNav.displayName = "HeaderNav";
export default HeaderNav;
