"use client";
import { PlusIcon } from "@heroicons/react/24/outline";
import AutoSwitchNetwork from "components/AutoSwitchNetwork";
import useRedpacketsLists from "hooks/useRedpacketsLists";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import RedPacketItem from "./rewardComponents/RewardItem";
import { useChainId } from "wagmi";

const tabList = ["Claimable", "Claimed", "Expired", "Created"];

export default function RewardListPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const chainId = useChainId();

  const [curTab, setCurTab] = useState(0);
  const {
    unclaimList,
    claimedList,
    expiredList,
    createdList,
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
      <div className="flex items-center pt-6 justify-center text-center pl-6 md:px-2">
        <div className="text-center inline-flex md:mx-8 relative">
          {loading && (
            <span className="absolute loading loading-spinner loading-sm m-auto top-[50%] -translate-y-1/2 left-[-28px] "></span>
          )}
          <div role="tablist" className="tabs tabs-boxed m-auto">
            {tabList.map((item: any, index: number) => (
              <a
                role="tab"
                key={index}
                className={`tab tab-sm md:tab-md ${
                  index == curTab ? "tab-active" : ""
                }`}
                onClick={() => {
                  setCurTab(index);
                  let url: string;
                  if (searchParams.has("tab")) {
                    url = `${pathname}?${searchParams
                      .toString()
                      .replace(
                        `tab=${searchParams.get("tab")}`,
                        `tab=${index}`,
                      )}`;
                  } else {
                    url = `${pathname}?${searchParams}&tab=${index}`;
                  }
                  router.replace(url, { scroll: false });
                }}
              >
                {item}
              </a>
            ))}
          </div>
        </div>
        <Link href="/reward/create" prefetch>
          <button className="btn btn-primary btn-sm my-4 md:my-0 ml-2 md:ml-0 px-1 md:px-2 normal-case ">
            <PlusIcon className="w-4" />
            <span className="hidden md:inline">Create</span>
          </button>
        </Link>
      </div>
      <div className="pb-10">
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
            {claimedList.length == 0 && !loading && (
              <div className="w-full p-8 text-center text-slate-500">
                no more redpacket
              </div>
            )}
            <div className="grid grid-cols-2 md:grid-cols-4">
              {claimedList.map((item, index) => {
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
            {expiredList.length == 0 && !loading && (
              <div className="w-full p-8 text-center text-slate-500">
                no more redpacket
              </div>
            )}
            <div className="grid grid-cols-2 md:grid-cols-4">
              {expiredList.map((item, index) => {
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
        {curTab == 3 && (
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
    </div>
  );
}
