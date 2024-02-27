// public/workers/ipfsWorker.js
// dataFetcher.worker.ts
import * as Comlink from "comlink";
import localforage from "localforage";

export type IfetchData = (
  cids: string[],
  progressCallback?: ((newProgress: number) => void) & Comlink.ProxyMarked
) => Promise<any[]>;

export type API = {
  fetchData: IfetchData;
};

const fetchData: IfetchData = async (cids, progressCallback) => {
  const results = [];
  for (let i = 0; i < cids.length; i++) {
    const cachedResult = await localforage.getItem(cids[i]);
    if (cachedResult) {
      results.push(cachedResult);
    } else {
      const url = `${process.env.NEXT_PUBLIC_GATEWAY_URL}/ipfs/${cids[i]}`;
      console.log(url)
      const response = await fetch(url);
      const data = await response.json();
      await localforage.setItem(cids[i], data);
      results.push(data);
    }
    if (progressCallback) progressCallback(((i + 1) / cids.length) * 100);
  }
  return results;
};

Comlink.expose({ fetchData });
