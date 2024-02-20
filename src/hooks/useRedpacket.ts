import { useQuery } from "@apollo/client";
import { RedPacketByIdGraph } from "../gql/RedpacketGraph";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
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

  useEffect(() => {
    if (!address || !data || !data.redpacket) return;
    setItem(processRedpacketItem(data.redpacket, address, getExpTime()));
  }, [data, address]);

  return {
    data: item,
    loading,
    refetch,
  };
}
