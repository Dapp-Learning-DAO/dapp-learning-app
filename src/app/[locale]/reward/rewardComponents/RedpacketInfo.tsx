"use client";

import moment from "moment";
import { IRewardClaimer, IRewardItem } from "types/rewardTypes";
import { numAutoToFixed, shortAddress, shortRewardId } from "utils/index";
import { isAddressEqual } from "viem";
import { useAccount } from "wagmi";

export default function RedPacketInfo({ item }: { item: IRewardItem }) {
  const { address } = useAccount();

  return (
    <>
      <div className="w-full max-w-full md:min-w-[60wh]">
        <p className="mb-2">
          {item?.isExpired && (
            <span className="badge badge-neutral mr-2">Expired</span>
          )}
          {item?.isRefunded && (
            <span className="badge badge-accent mr-2">Refunded</span>
          )}
          {item?.allClaimed && (
            <span className="badge badge-success mr-2">All Claimed</span>
          )}
          {item?.isClaimed && (
            <span className="badge badge-success mr-2">Claimed</span>
          )}
        </p>
        <p className="text-lg leading-8 text-left">
          Name: <span className="font-bold">{item?.name}</span>
        </p>
        <p className="text-base leading-8">
          Id:{" "}
          <span style={{ fontSize: 13, wordBreak: "break-all" }}>
            {item?.id}
          </span>
        </p>
        <p className="text-lg leading-8 text-left">
          Claim Type: <span>{item?.ifRandom ? "Random" : "Fixed"}</span>
        </p>
        <p
          className={`text-base leading-8 ${
            address && isAddressEqual(address, item?.creator)
              ? "font-bold text-primary"
              : ""
          }`}
        >
          <span className="hidden md:block">Creator: {item?.creator}</span>
          <span className="block md:hidden">
            Creator: {shortAddress(item?.creator)}
          </span>
        </p>
        {item?.totalParsed && (
          <p className="text-base leading-8">
            Total Amount:
            <span className="font-bold ml-2">
              {item.totalParsed} {item?.symbol}
            </span>
          </p>
        )}
        {/* {item?.token && (
        <div className="tooltip w-full text-left" data-tip={item?.token}>
          <p className="text-base leading-8 hidden md:block">
            Token: {item?.token}
          </p>
          <p className="text-base leading-8 block md:hidden">
            Token: {shortAddress(item?.token)}
          </p>
        </div>
      )} */}

        {!isNaN(item?.number) && (
          <p className="text-base leading-8">
            Redpacket Number:{" "}
            <span className="font-bold">
              {item?.claimedNumber} / {item?.number}
            </span>
          </p>
        )}
        <p className="text-base leading-8">
          Expire Time:{" "}
          {moment(Number(item?.expireTimestamp) * 1000).format(
            "YYYY-MM-DD \u00A0 HH:mm",
          )}
        </p>
        <div className="text-bas leading-8 py-4">
          Claimers: <br />
          <div className="w-full md:max-h-[30vh]">
            {item?.claimers &&
              item?.claimers.map((row: IRewardClaimer) => (
                <div
                  className={`flex leading-7 ${
                    address && isAddressEqual(address, row?.address)
                      ? "font-bold text-primary"
                      : ""
                  }`}
                  key={row?.address}
                >
                  <div className="flex-1 text-sm hidden md:block">
                    {row?.address}
                  </div>
                  <div className="flex-1 text-base block md:hidden">
                    {shortAddress(row?.address)}
                  </div>
                  <div className="font-bold text-base md:text-sm pl-4">
                    {row.claimedValueParsed && row.claimedValueParsed > 0
                      ? `${numAutoToFixed(row.claimedValueParsed, 4)} ${
                          item?.symbol ? item?.symbol : ""
                        }`
                      : `--`}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </>
  );
}
