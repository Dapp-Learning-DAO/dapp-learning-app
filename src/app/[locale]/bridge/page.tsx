"use client";
/* eslint-disable import/no-default-export */
import type { NextPage } from "next";
import dynamic from "next/dynamic";

export const LiFiWidgetNext = dynamic(
  () => import("components/LiFiWidget").then((module) => module.default) as any,
  {
    ssr: false,
    loading: () => (
      <div className="max-w-xl mx-auto p-16">
        <div className="skeleton h-4 w-full my-8"></div>
        <div className="skeleton h-4 w-full my-8"></div>
        <div className="skeleton h-4 w-full my-8"></div>
        <div className="skeleton h-4 w-full my-8"></div>
      </div>
    ),
  },
);

const LiFiWidgetPage: NextPage = () => {
  return <LiFiWidgetNext />;
};

export default LiFiWidgetPage;
