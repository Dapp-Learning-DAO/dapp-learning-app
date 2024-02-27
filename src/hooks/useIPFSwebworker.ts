"use client";
import * as Comlink from "comlink";
import { useEffect, useState } from "react";

export default function useIPFSwebworker({ cids }: { cids: string[] }) {
  const [progress, setProgress] = useState<number>(0);
  const [fetching, setFetching] = useState(false);
  const [data, setData] = useState<{[key: string]: `0x${string}`[]}>({});

  useEffect(() => {
    if (cids.length === 0) return;
    const runWorker = async () => {
      setFetching(true);
      const worker = new Worker(
        new URL("../workers/ipfsFetcher.worker.ts", import.meta.url),
        { type: "module" }
      );

      const { fetchData } =
        Comlink.wrap<import("../workers/ipfsFetcher.worker.ts").API>(worker);

      const updateProgress = Comlink.proxy((newProgress: number) => {
        setProgress(newProgress);
      });

      const results = await fetchData(cids, updateProgress);
      let _data: {[key: string]: `0x${string}`[]} = {};
      for (let i = 0; i < cids.length; i++) {
        _data[cids[i]] = results[i];
      }
      setData(_data);

      worker.terminate();
      setFetching(false);
    };

    runWorker();
  }, [cids]);

  return {
    progress,
    fetching,
    data,
  };
}
