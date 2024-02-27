"use client";

import moment from "moment";
import RedpacketIcon from "./RedpacketIcons/RedpacketIcon";
import SuccessIcon from "./RedpacketIcons/RedpacketSuccessIcon";
import CoinIcon from "./RedpacketIcons/CoinIcon";
import RedpacketZKIcon from "./RedpacketIcons/RedpacketZkIcon";
import { numAutoToFixed } from "utils/index";

export default function RedPacketItem({ item }: { item: any }) {
  const ResState = () => {
    // @remind only show in created tab
    if (item.isCreator) {
      let redpacketState = "";

      if (item?.allClaimed) {
        redpacketState = "Clear 🎉";
      } else if (item?.isExpired) {
        if (item?.isRefunded) {
          redpacketState = "Refunded";
        } else {
          redpacketState = "Can Refund";
        }
      }

      if (redpacketState)
        return (
          <div className="absolute flex w-full h-full left-0 top-[90px] rounded-lg justify-center">
            <span
              className={`p-[2px] rounded pl-2 pr-2 h-fit ${
                item?.allClaimed
                  ? "text-green-400 flex opacity-90 items-center bg-white"
                  : !item?.isRefunded
                  ? "text-yellow-500 flex opacity-90 items-center bg-white"
                  : "opacity-80 text-gray-800 bg-slate-400"
              }`}
            >
              {redpacketState}
            </span>
          </div>
        );
    }

    return (
      (item?.isExpired || item?.isClaimed) && (
        <div className="absolute flex w-full h-full left-0 top-[90px] rounded-lg justify-center">
          <span
            className={`p-[2px] rounded pl-2 pr-2 h-fit ${
              item?.isClaimed
                ? "text-yellow-500 flex opacity-90 items-center bg-white"
                : "opacity-80 text-gray-800 bg-slate-400"
            }`}
          >
            {item?.isClaimed ? (
              <>
                <span className=" bg-white rounded-full inline-block text-yellow-500 mr-1">
                  <CoinIcon className="w-5 h-5" />
                </span>
                <span className=" truncate mr-1 max-w-[100px]">
                  {item?.claimedValueParsed > 0
                    ? numAutoToFixed(item?.claimedValueParsed, 4)
                    : ""}
                </span>{" "}
                {item?.symbol || ""}
              </>
            ) : (
              "Expired"
            )}
          </span>
        </div>
      )
    );
  };

  return (
    <>
      <div className="w-full duration-150 transition-all rounded-lg p-3 cursor-pointer hover:scale-105 active:scale-95 flex-col justify-center items-center font-bold relative">
        {!!item?.hashLock ? <RedpacketZKIcon /> : <RedpacketIcon />}
        {item?.isClaimed && (
          <SuccessIcon className="absolute top-[46px] left-1/2 -translate-x-[50%] justify-center text-green-400 bg-white rounded-full font-bold w-10 h-10" />
        )}
        <div className={`text-center items-center text-xs text-gray-500`}>
          {moment(item?.createTime).format("MM-DD \u00A0 HH:mm")}
        </div>
        {/*  truncate max-w-[300px] */}
        <div className="text-center">{item?.name}</div>
        <ResState />
      </div>
    </>
  );
}
