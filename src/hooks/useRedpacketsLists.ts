"use client";
import { useQuery } from "@apollo/client";
import { RedPacketsListsGraph } from "../gql/RedpacketGraph";
import { useAccount, useChainId } from "wagmi";
import { useEffect, useState } from "react";
import { useDebounce } from "react-use";
import { formatUnits } from "viem";
import { ZERO_BYTES32 } from "config/constants";
import {
  IRewardClaimer,
  IRewardIPFSData,
  IRewardItem,
} from "types/rewardTypes";
import * as Comlink from "comlink";
import { useCustomEvent } from "./useCustomEvent.ts";
import { REWARD_MSG_PRE } from "config/constants.ts";
import { getCidFromMsg, isCidMsgValid } from "utils/index";

export function getExpTime() {
  return Math.floor(new Date().getTime() / 1000);
}

export const REWARD_LIST_REFRESH_EVENT = "REWARD_LIST_REFRESH_EVENT";

export default function useRedpacketsLists({ enabled }: { enabled: boolean }) {
  const { address } = useAccount();
  const chainId = useChainId();
  const [expiredTime, setExpiredTime] = useState(getExpTime());
  const [refetchCount, setRefetchCount] = useState(0);
  const [unclaimList, setUnclaimList] = useState<IRewardItem[]>([]);
  const [claimedList, setClaimedList] = useState<IRewardItem[]>([]);
  const [expiredList, setExpiredList] = useState<IRewardItem[]>([]);
  const [createdList, setCreatedList] = useState<IRewardItem[]>([]);
  const [ipfsProgress, setIpfsProgress] = useState<number>(0);
  const [ipfsData, setIpfsData] = useState<IRewardIPFSData>({});
  const [refetchTriggered, setRefetchTriggered] = useState(false);

  const {
    data: RedPacketsGqlData,
    loading: queryGqlLoading,
    refetch: refetchGql,
  } = useQuery(RedPacketsListsGraph, {
    variables: {
      // claimableIDs: [],
      claimerAddress: address?.toLowerCase(),
      expiredTime,
      creator: address?.toLowerCase(),
      creationTime_gt: 1708793830,
      msg_pre: REWARD_MSG_PRE,
    },
    pollInterval: (refetchTriggered ? 5 : 30) * 1000,
    fetchPolicy: refetchTriggered ? "network-only" : "cache-first",
    context: { clientName: "RedPacket" },
    skip: !enabled || !address,
  });

  useCustomEvent({
    customEventName: REWARD_LIST_REFRESH_EVENT,
    onChange: (duration: number) => {
      if (refetchTriggered) return;
      setRefetchTriggered(true);
      setTimeout(() => {
        setRefetchTriggered(false);
      }, duration);
    },
  });

  useEffect(() => {
    if (refetchTriggered) return;
    const otherPageTrigger = sessionStorage.getItem(REWARD_LIST_REFRESH_EVENT);
    if (!isNaN(Number(otherPageTrigger))) {
      setRefetchTriggered(true);
      setTimeout(() => {
        setRefetchTriggered(false);
      }, Number(otherPageTrigger));
    }
    sessionStorage.removeItem(REWARD_LIST_REFRESH_EVENT);
  }, []);

  useDebounce(
    async () => {
      if (!enabled || !address || !RedPacketsGqlData || queryGqlLoading) {
        return;
      }
      // const _blockts = blockTimestamp
      //   ? blockTimestamp
      //   : new Date().getTime() / 1000;
      const _blockts = expiredTime;
      const data = RedPacketsGqlData;
      let _ipfsData = {};

      // get cids
      let cids = [
        ...RedPacketsGqlData.Claimable,
        ...RedPacketsGqlData.Claimed,
        ...RedPacketsGqlData.Expired,
        ...RedPacketsGqlData.Created,
      ]
        .map((item) => item.message)
        .map((msg) => getCidFromMsg(msg))
        .filter((msg) => !!msg);
      cids = Array.from(new Set(cids));
      if (cids.length > 0) {
        // const updateProgress = Comlink.proxy((newProgress: number) => {
        //   setIpfsProgress(newProgress);
        // });
        _ipfsData = await runIpfsWorker(cids);
        setIpfsData(_ipfsData);
      }

      const processGqlData = (arr: any[]) => {
        return arr.map((item: any) =>
          processRedpacketItem(item, address, _blockts, _ipfsData),
        );
      };

      let _unclaimList = [];
      let _claimedList = [];
      let _expiredList = [];
      let _createdList = [];

      if (data.Claimable) {
        _unclaimList = processGqlData(data.Claimable).filter(
          (_row) => _row.isClaimable,
        );
        setUnclaimList(_unclaimList);
      }
      if (data.Claimed) {
        _claimedList = processGqlData(data.Claimed);
        setClaimedList(_claimedList);
      }
      if (data.Expired) {
        _expiredList = processGqlData(data.Expired);
        setExpiredList(_expiredList);
      }
      if (data.Created) {
        _createdList = processGqlData(data.Created);
        setCreatedList(_createdList);
      }
      console.log("useRedpacketLists data", {
        unclaimList: _unclaimList,
        claimedList: _claimedList,
        expiredList: _expiredList,
        createdList: _createdList,
      });
    },
    500,
    [enabled, RedPacketsGqlData],
  );

  useDebounce(
    () => {
      if (!refetchGql || !refetchCount || queryGqlLoading) return;
      refetchGql();
    },
    500,
    [queryGqlLoading, refetchCount, refetchGql, chainId],
  );

  return {
    unclaimList,
    claimedList,
    expiredList,
    createdList,
    ipfsData,
    loading: queryGqlLoading,
  };
}

export function processRedpacketItem(
  item: any,
  address: `0x${string}`,
  _blockts: number,
  _ipfsData: IRewardIPFSData,
) {
  const isExpired = _blockts > Number(item?.expireTimestamp);

  let tokenAddress: string | null = null;
  let decimals: number | null = null;
  let symbol: string | null = null;
  let ipfsClaimers: IRewardClaimer[] = [];

  if (item.token) {
    tokenAddress = item.token.address;
    decimals = Number(item.token.decimals);
    symbol = item.token.symbol;
  }

  if (item.message) {
    if (isCidMsgValid(item.message)) {
      const _cid = item.message.split("_")[2];
      if (_ipfsData[_cid]) {
        ipfsClaimers = _ipfsData[_cid].map((_addr: `0x${string}`) => ({
          address: _addr,
          claimer: _addr,
          isClaimed: false,
          tokenAddress: tokenAddress,
          claimedValue: 0,
          claimedValueParsed: 0,
        }));
      }
    }
  }

  let claimedValueParsed = null;
  // @todo map from ipfsClaimers
  let claimers: IRewardClaimer[] = ipfsClaimers.map((rowItem) => {
    let findRes;
    findRes =
      item.claimers &&
      item.claimers.find(
        (claimerItem: IRewardClaimer) =>
          claimerItem.claimer.toLowerCase() == rowItem.address.toLowerCase(),
      );
    if (findRes) {
      claimedValueParsed = decimals
        ? Number(formatUnits(BigInt(findRes.claimedValue), decimals).toString())
        : null;
      return {
        address: findRes.claimer as `0x${string}`,
        claimer: findRes.claimer,
        isClaimed: true,
        tokenAddress: tokenAddress,
        claimedValue: findRes.claimedValue,
        claimedValueParsed,
      };
    } else {
      return rowItem;
    }
  });

  const isClaimed = claimers.some(
    (claimerItem: IRewardClaimer) =>
      claimerItem.address.toLowerCase() == address?.toLowerCase() &&
      claimerItem.isClaimed,
  );
  const hashLock =
    item?.lock && item?.lock !== ZERO_BYTES32 ? item?.lock : null;
  const ifRandom = item?.ifrandom;
  const claimedNumber = item?.claimers.length;
  const allClaimed = item?.allClaimed;
  const isRefunded = item?.refunded;
  const isCreator = item?.creator.toLowerCase() == address.toLowerCase();
  const isClaimable =
    !isClaimed &&
    !isExpired &&
    ipfsClaimers.some(
      (_row) => _row.address.toLowerCase() === address.toLowerCase(),
    );
  const userClaimedValue = claimers.find(
    (claimerItem: IRewardClaimer) =>
      claimerItem.address.toLowerCase() === address?.toLowerCase(),
  )?.claimedValueParsed;

  return {
    ...item,
    ifRandom,
    hashLock,
    isClaimed,
    isExpired,
    allClaimed,
    claimedNumber,
    isRefunded,
    isCreator,
    isClaimable,
    tokenAddress,
    decimals,
    symbol,
    claimers,
    claimedValueParsed: userClaimedValue,
    total: item?.total,
    totalParsed:
      decimals && item?.total
        ? Number(formatUnits(item?.total, decimals).toString())
        : null,
    number: Number(item?.number),
  };
}

export const runIpfsWorker = async (
  cids: string[],
  updateProgress?: ((newProgress: number) => void) & Comlink.ProxyMarked,
) => {
  const worker = new Worker(
    new URL("../workers/ipfsFetcher.worker.ts", import.meta.url),
    { type: "module" },
  );

  const { fetchData } =
    Comlink.wrap<import("../workers/ipfsFetcher.worker.ts").API>(worker);

  // const updateProgress = Comlink.proxy((newProgress: number) => {
  //   setProgress(newProgress);
  // });

  const results = await fetchData(cids, updateProgress);
  let _data: { [key: string]: `0x${string}`[] } = {};
  for (let i = 0; i < cids.length; i++) {
    _data[cids[i]] = results[i];
  }

  worker.terminate();
  return _data;
};
