import { Metadata } from "next";

const title =
  "Dapp-Learning - An open-sourced developer community focusing on Ethereum. dapp-learing|dapp|blockchain|ehtereum|Defi|NFT|DAO|zero knowledge|ZK";
const description =
  "Dapp Learning is an open-sourced developer community focusing on Ethereum, for developers at all stages. Becoming and cultivating sovereign individuals. Nonprofit organization.";

export const metadata: Metadata = {
  metadataBase: new URL("https://dapplearning.org"),
  title,
  description,
  applicationName: "DappLearning",
  authors: {
    name: "Dapp-Learning-DAO",
    url: "https://dapplearning.org",
  },
  keywords:
    "dapp-learing|dapp|blockchain|ehtereum|Defi|NFT|DAO|zero knowledge|ZK".split(
      "|"
    ),
  openGraph: {
    type: "website",
    url: "https://dapplearning.org",
    title,
    description,
    siteName: "Dapp-Learning-Dapp",
    images: `/images/DappLearning-cover.png`,
  },
};