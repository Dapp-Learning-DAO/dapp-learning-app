"use client";
import { useQuery } from "@apollo/client";
import { RedPacketsListsGraph } from "../gql/RedpacketGraph";
import { useAccount } from "wagmi";
import { useEffect, useState } from "react";
import { useDebounce } from "react-use";
import useTokensData from "./useTokensData";
import { formatUnits } from "viem";
import { ZERO_BYTES32 } from "../constant";
import { IclaimerItem } from "types/rewardTypes";

const mockIds: string[] = [
  "0x88d2ca1b5c34678b71b453645ff1c6e9b5ce8ddf8ae821c84d7d817c5ac01c05",
];

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

  const {
    data: RedPacketsGqlData,
    loading: queryGqlLoading,
    refetch: refetchGql,
  } = useQuery(RedPacketsListsGraph, {
    variables: {
      claimableIDs: mockIds,
      claimerAddress: address,
      expiredTime,
      creator: address,
    },
    // pollInterval: 30 * 1000,
    context: { clientName: "RedPacket" },
    skip: !enabled || !address || mockIds.length == 0,
    // skip: true,
  });

  useDebounce(
    () => {
      if (!enabled || !address || !RedPacketsGqlData || queryGqlLoading) {
        return;
      }

      // const _blockts = blockTimestamp
      //   ? blockTimestamp
      //   : new Date().getTime() / 1000;
      const _blockts = expiredTime;

      const processGqlData = (arr: any[]) => {
        return arr.map((item: any) =>
          processRedpacketItem(item, address, _blockts)
        );
      };

      const data = RedPacketsGqlData;
      if (RedPacketsGqlData) {
        if (RedPacketsGqlData.Claimable)
          setUnclaimList(processGqlData(data.Claimable));
        if (RedPacketsGqlData.Claimed)
          setClaimedList(processGqlData(data.Claimed));
        if (RedPacketsGqlData.Expired)
          setExpiredList(processGqlData(data.Expired));
        if (data.Created) setCreatedList(processGqlData(data.Created));
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
    loading: queryGqlLoading,
  };
}

export function processRedpacketItem(
  item: any,
  address: `0x${string}`,
  _blockts: number
) {
  const isExpired = _blockts > Number(item?.expireTimestamp);

  let tokenAddress: string | null = null;
  let decimals: number | null = null;
  let symbol: string | null = null;

  if (item.token) {
    tokenAddress = item.token.address;
    decimals = Number(item.token.decimals);
    symbol = item.token.symbol;
  }

  let claimedValueParsed = null;
  // @todo map from addressList
  let claimers: IclaimerItem[] = item.claimers.map(
    (claimerItem: { id: string; claimer: string; claimedValue: string }) => {
      let findRes;
      findRes = claimerItem;
      if (findRes) {
        claimedValueParsed = decimals
          ? Number(
              formatUnits(BigInt(findRes.claimedValue), decimals).toString()
            )
          : null;
        return {
          address: claimerItem.claimer,
          isClaimed: true,
          tokenAddress: tokenAddress,
          claimedValue: findRes.claimedValue,
          claimedValueParsed,
        };
      } else {
        return {
          address: claimerItem.claimer,
          isClaimed: false,
          tokenAddress: tokenAddress,
          claimedValue: 0,
          claimedValueParsed: 0,
        };
      }
    }
  );

  const isClaimed = claimers.some(
    (claimerItem: IclaimerItem) =>
      claimerItem.address.toLowerCase() == address?.toLowerCase()
  );
  const hashLock =
    item?.lock && item?.lock !== ZERO_BYTES32 ? item?.lock : null;
  const ifRandom = item?.ifrandom;
  const claimedNumber = item?.claimers.length;
  const allClaimed = item?.allClaimed;
  const isRefunded = item?.refunded;
  const userClaimedValue = claimers.find(
    (claimerItem: IclaimerItem) =>
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
