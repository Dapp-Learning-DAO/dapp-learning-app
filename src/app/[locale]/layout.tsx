import type { Metadata } from "next";
import { Inter } from "next/font/google";

// style
import "./globals.css";
import "@rainbow-me/rainbowkit/styles.css";

// provider
import { I18nProvider } from "provider/I18nProvider";
import { Web3Providers } from "provider/Web3Providers";

// components
import AppLayout from "components/AppContainer";

const inter = Inter({ subsets: ["latin"] });
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

export default function RootLayout({
  children,
  modal,
  params: { locale },
}: Readonly<{
  children: React.ReactNode;
  modal: React.ReactNode;
  params: { locale: string };
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SkipLink />
        <Web3Providers>
          <I18nProvider locale={locale}>
            <AppLayout>{children}</AppLayout>
            {modal}
            {/* modal slot */}
            <div id="modal-root"></div>
          </I18nProvider>
        </Web3Providers>
      </body>
    </html>
  );
}

function SkipLink() {
  return (
    <a
      href="#main"
      className="focus:fixed focus:top-1.5 focus:left-1 sr-only focus:not-sr-only"
    >
      skip to content
    </a>
  );
}
