import { useQuery } from "@apollo/client";
import { RedPacketByIdGraph } from "../gql/RedpacketGraph";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import localforage from "localforage";
import { getExpTime, processRedpacketItem } from "./useRedpacketsLists";
import { IRewardItem } from "types/rewardTypes";
import { getCidFromMsg } from "utils/index";

export default function useRedpacket({ id }: { id: string }) {
  const { address } = useAccount();
  const [item, setItem] = useState<IRewardItem | null>(null);
  const { data, loading, refetch } = useQuery(RedPacketByIdGraph, {
    variables: {
      redpacketID: id,
    },
    pollInterval: 30 * 1000,
    context: { clientName: "RedPacket" },
  });

  const fetchData = async () => {
    if (!address || !data || !data.redpacket) return;
    let _ipfsData: { [cid: string]: `0x${string}`[] } = {};
    const cid = getCidFromMsg(data.redpacket.message);
    if (cid) {
      const _addrList = await localforage.getItem(cid);
      if (_addrList) _ipfsData[cid] = _addrList as `0x${string}`[];
    }
    setItem(
      processRedpacketItem(data.redpacket, address, getExpTime(), _ipfsData)
    );
  };

  useEffect(() => {
    fetchData();
  }, [data, address]);

  return {
    data: item,
    loading,
    refetch,
  };
}
