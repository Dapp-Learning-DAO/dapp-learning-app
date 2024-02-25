"use client";
import { useQuery } from "@apollo/client";
import { RedPacketsListsGraph } from "../gql/RedpacketGraph";
import { useAccount } from "wagmi";
import { useEffect, useMemo, useState } from "react";
import { useDebounce } from "react-use";
import { formatUnits } from "viem";
import { ZERO_BYTES32 } from "../constant";
import { IRewardClaimer } from "types/rewardTypes";
import Validate from "utils/validate";
import * as Comlink from "comlink";

export function getExpTime() {
  return Math.floor(new Date().getTime() / 1000);
}

export default function useRedpacketsLists({
  enabled,
  refetchCount,
}: {
  enabled: boolean;
  refetchCount?: number;
}) {
  const { address } = useAccount();
  const [expiredTime, setExpiredTime] = useState(getExpTime());
  const [unclaimList, setUnclaimList] = useState<any[]>([]);
  const [claimedList, setClaimedList] = useState<any[]>([]);
  const [expiredList, setExpiredList] = useState<any[]>([]);
  const [createdList, setCreatedList] = useState<any[]>([]);
  const [ipfsProgress, setIpfsProgress] = useState<number>(0);
  const [ipfsData, setIpfsData] = useState<{ [cid: string]: `0x${string}`[] }>(
    {}
  );

  const {
    data: RedPacketsGqlData,
    loading: queryGqlLoading,
    refetch: refetchGql,
  } = useQuery(RedPacketsListsGraph, {
    variables: {
      claimerAddress: address,
      expiredTime,
      creator: address,
      creationTime_gt: 1708793830,
    },
    // pollInterval: 30 * 1000,
    context: { clientName: "RedPacket" },
    skip: !enabled || !address,
    // skip: true,
  });

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
        ...RedPacketsGqlData.Expired,
      ]
        .map((item) => item.message)
        .filter((msg) => Validate.isCidMsgValid(msg))
        .map((msg) => msg.split("_")[1]);
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
          processRedpacketItem(item, address, _blockts, _ipfsData)
        );
      };

      let _unclaimList = [];
      let _claimedList = [];
      let _expiredList = [];
      let _createdList = [];

      if (data.Claimable) {
        _unclaimList = processGqlData(data.Claimable);
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
    },
    500,
    [enabled, RedPacketsGqlData]
  );

  useEffect(() => {
    if (!refetchGql || !refetchCount || queryGqlLoading) return;
    refetchGql();
  }, [queryGqlLoading, refetchCount, refetchGql]);

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
  _ipfsData: { [cid: string]: `0x${string}`[] }
) {
  const isExpired = _blockts > Number(item?.expireTimestamp);

  let tokenAddress: string | null = null;
  let decimals: number | null = null;
  let symbol: string | null = null;
  let addressList: IRewardClaimer[] = [];

  if (item.token) {
    tokenAddress = item.token.address;
    decimals = Number(item.token.decimals);
    symbol = item.token.symbol;
  }

  if (item.message) {
    if (Validate.isCidMsgValid(item.message)) {
      const _cid = item.message.split("_")[1];
      if (_ipfsData[_cid]) {
        addressList = _ipfsData[_cid].map((_addr: `0x${string}`) => ({
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
  // @todo map from addressList
  let claimers: IRewardClaimer[] = addressList.map((rowItem) => {
    let findRes;
    findRes =
      item.claimers &&
      item.claimers.find(
        (claimerItem: { id: string; claimer: string; claimedValue: string }) =>
          claimerItem.claimer.toLowerCase() == rowItem.address.toLowerCase()
      );
    if (findRes) {
      claimedValueParsed = decimals
        ? Number(formatUnits(BigInt(findRes.claimedValue), decimals).toString())
        : null;
      debugger;
      return {
        address: findRes.claimer,
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
      claimerItem.isClaimed
  );
  const hashLock =
    item?.lock && item?.lock !== ZERO_BYTES32 ? item?.lock : null;
  const ifRandom = item?.ifrandom;
  const claimedNumber = item?.claimers.length;
  const allClaimed = item?.allClaimed;
  const isRefunded = item?.refunded;
  const userClaimedValue = claimers.find(
    (claimerItem: IRewardClaimer) =>
      claimerItem.address.toLowerCase() === address?.toLowerCase()
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
  updateProgress?: ((newProgress: number) => void) & Comlink.ProxyMarked
) => {
  const worker = new Worker(
    new URL("../workers/ipfsFetcher.worker.ts", import.meta.url),
    { type: "module" }
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
