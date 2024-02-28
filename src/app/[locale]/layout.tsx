"use client";
import { Inter } from "next/font/google";

// style
import "./globals.css";
import "@rainbow-me/rainbowkit/styles.css";

// config
import { metadata as metadataConf } from "config/seo";

// provider
import { I18nProvider } from "provider/I18nProvider";
import { Web3Providers } from "provider/Web3Providers";

// components
import AppLayout from "components/AppContainer";
import { useSelectedLayoutSegment } from "next/navigation";

const inter = Inter({ subsets: ["latin"] });

const metadata = metadataConf;
export default function RootLayout({
  children,
  modal,
  params: { locale },
}: Readonly<{
  children: React.ReactNode;
  modal: React.ReactNode;
  params: { locale: string };
}>) {
  const modalSigments = useSelectedLayoutSegment("modal");
  const isModalActivate = !!modalSigments && modalSigments !== "__DEFAULT__";

  return (
    <html lang="en">
      <body className={inter.className}>
        <SkipLink />
        <Web3Providers>
          <I18nProvider locale={locale}>
            <AppLayout isBlur={isModalActivate}>{children}</AppLayout>
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
