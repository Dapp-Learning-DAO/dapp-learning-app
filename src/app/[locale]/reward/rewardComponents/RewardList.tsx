"use client";
import { PlusIcon } from "@heroicons/react/24/outline";
import AutoSwitchNetwork from "components/AutoSwitchNetwork";
import useRedpacketsLists from "hooks/useRedpacketsLists";
import Link from "next/link";
import { useState } from "react";
import { useDebounce } from "react-use";
import RedPacketItem from "./RewardItem";
import { useRouter } from "next/navigation";

const tabList = ["Claimable", "Claimed", "Expired", "Created"];

export default function RewardList() {
  const router = useRouter();
  const [curTab, setCurTab] = useState(0);
  const [refetchCount, setRefetchCount] = useState(0);
  const { unclaimList, claimedList, expiredList, createdList, loading } =
    useRedpacketsLists({ enabled: true, refetchCount });
  console.warn({ unclaimList, claimedList, expiredList, createdList });

  // @todo no need to refetch when click tab
  useDebounce(
    () => {
      setRefetchCount((curCount) => curCount + 1);
    },
    500,
    [curTab]
  );

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
                onClick={() => setCurTab(index)}
              >
                {item}
              </a>
            ))}
          </div>
        </div>
        <Link href="/reward/create" className="max-w-fit">
          <button className="btn btn-primary btn-sm md:btn-md my-4 md:my-0 ml-2 md:ml-0 px-1 md:px-4 normal-case ">
            <PlusIcon className="w-6" />
            <span className="hidden md:inline">Create Red Packet</span>
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
                  <RedPacketItem
                    key={index}
                    item={item}
                    onClick={() => {
                      router.push(`/reward/claim/${item.id}`);
                    }}
                  />
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
                  <RedPacketItem
                    key={index}
                    item={item}
                    onClick={() => {
                      router.push(`/reward/claimed_expired/${item.id}`);
                    }}
                  />
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
                  <RedPacketItem
                    key={index}
                    item={item}
                    onClick={() => {
                      router.push(`/reward/claimed_expired/${item.id}`);
                    }}
                  />
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
                  <RedPacketItem
                    key={index}
                    item={item}
                    isCreator
                    onClick={() => {
                      router.push(`/reward/created/${item.id}`);
                    }}
                  />
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
