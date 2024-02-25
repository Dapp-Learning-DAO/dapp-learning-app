import { useQuery } from "@apollo/client";
import { RedPacketByIdGraph } from "../gql/RedpacketGraph";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import localforage from "localforage";
import Validate from "utils/validate";
import { getExpTime, processRedpacketItem } from "./useRedpacketsLists";

export default function useRedpacket({ id }: { id: string }) {
  const { address } = useAccount();
  const [item, setItem] = useState<any | null>(null);
  const { data, loading, refetch } = useQuery(RedPacketByIdGraph, {
    variables: {
      redpacketID: id,
    },
    // pollInterval: 30 * 1000,
    context: { clientName: "RedPacket" },
  });

  const fetchData = async () => {
    if (!address || !data || !data.redpacket) return;
    let _ipfsData: { [cid: string]: `0x${string}`[] } = {};
    if (Validate.isCidMsgValid(data.redpacket.message)) {
      const cid = data.redpacket.message.split("_")[1];
      if (cid) {
        const _addrList = await localforage.getItem(cid);
        if (_addrList) _ipfsData[cid] = _addrList as `0x${string}`[];
      }
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
