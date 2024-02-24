"use server"
import { API_pinJSONToIPFS } from "src/config/IPFS";

export const pinJSONToIPFS = async ({
  dataBody,
  filename,
}: {
  dataBody: any;
  filename: string;
}) => {
  const data = {
    pinataContent: dataBody,
    pinataMetadata: { name: `${filename}.json` },
    pinataOptions: { cidVersion: 1 },
  };
  const options = {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.PINATA_JWT}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  };

  return fetch(API_pinJSONToIPFS, options).then((response) =>
    response.json()
  );
};