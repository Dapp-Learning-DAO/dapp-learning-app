"use client";
import { PlusIcon } from "@heroicons/react/24/outline";
import AutoSwitchNetwork from "components/AutoSwitchNetwork";
import useRedpacketsLists from "hooks/useRedpacketsLists";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import RedPacketItem from "./rewardComponents/RewardItem";
import { useChainId } from "wagmi";
import useRouteParams from "hooks/useRouteParams";

// const tabList = ["Claimable", "Claimed", "Expired", "Created"];
const tabList = ["Claimable", "Claimed/Expired", "Created"];

export default function RewardListPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { setRouteParams, removeRouteParam } = useRouteParams();

  const chainId = useChainId();

  const [curTab, setCurTab] = useState(0);
  const {
    unclaimList,
    claimedList,
    expiredList,
    createdList,
    claimedExpiredList,
    ipfsData,
    loading,
  } = useRedpacketsLists({ enabled: true });

  useEffect(() => {
    if (searchParams.get("tab")) {
      setCurTab(Number(searchParams.get("tab")));
    }
  }, []);

  return (
    <div>
      <AutoSwitchNetwork forceSwitch={false} />
      <div className="py-6 text-center">
        <div className="m-auto relative inline-flex items-center justify-center">
          <div className="hidden sm:block">
            {loading && (
              <span className="absolute loading loading-spinner loading-sm m-auto top-[50%] -translate-y-1/2 left-[-28px] "></span>
            )}
          </div>
          <div
            role="tablist"
            className="tabs tabs-boxed m-auto overflow-x-auto"
          >
            {tabList.map((item: any, index: number) => (
              <a
                role="tab"
                key={index}
                className={`tab tab-sm md:tab-md ${
                  index == curTab ? "tab-active" : ""
                }`}
                onClick={() => {
                  setCurTab(index);
                  setRouteParams({ tab: `${index}` });
                }}
              >
                {item}
              </a>
            ))}
          </div>
          <div className="hidden md:block absolute top-[50%] -translate-y-1/2 -right-28">
            <Link href="/reward/create" prefetch>
              <button className="btn btn-primary btn-sm my-4 normal-case md:my-0 ml-2 md:ml-0 px-1 md:px-2">
                <PlusIcon className="w-4" />
                <span className="hidden md:inline">Create</span>
              </button>
            </Link>
          </div>
        </div>
      </div>
      <div className="pb-10 sm:pb-20 max-w-4xl mx-auto">
        {curTab == 0 && (
          <>
            {unclaimList.length == 0 && !loading && (
              <div className="w-full p-8 text-center text-slate-500">
                no more redpacket
              </div>
            )}
            <div className="grid grid-cols-2 md:grid-cols-4">
              {unclaimList.map((item, index) => {
                return (
                  <Link
                    key={index}
                    href={`/reward/detail/${item.id}?chainId=${chainId}`}
                  >
                    <RedPacketItem item={item} />
                  </Link>
                );
              })}
            </div>
          </>
        )}
        {curTab == 1 && (
          <>
            {claimedExpiredList.length == 0 && !loading && (
              <div className="w-full p-8 text-center text-slate-500">
                no more redpacket
              </div>
            )}
            <div className="grid grid-cols-2 md:grid-cols-4">
              {claimedExpiredList.map((item, index) => {
                return (
                  <Link
                    key={index}
                    href={`/reward/detail/${item.id}?chainId=${chainId}`}
                  >
                    <RedPacketItem item={item} />
                  </Link>
                );
              })}
            </div>
          </>
        )}
        {curTab == 2 && (
          <>
            {createdList.length == 0 && !loading && (
              <div className="w-full p-8 text-center text-slate-500">
                no more redpacket
              </div>
            )}
            <div className="grid grid-cols-2 md:grid-cols-4">
              {createdList.map((item, index) => {
                return (
                  <Link
                    key={index}
                    href={`/reward/detail/${item.id}?chainId=${chainId}`}
                  >
                    <RedPacketItem item={item} />
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </div>
      <div className="block md:hidden fixed bottom-20 right-6 z-50">
        {loading ? (
          <button
            className="btn btn-disable rounded-full shadow-xl w-12 h-12"
            disabled
          >
            <span className="loading loading-spinner loading-xl w-6 h-6"></span>
          </button>
        ) : (
          <Link href="/reward/create" prefetch>
            <button className="btn btn-primary rounded-full shadow-xl w-12 h-12">
              <PlusIcon className="w-8 text-white" />
            </button>
          </Link>
        )}
      </div>
    </div>
  );
}
