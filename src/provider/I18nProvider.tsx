"use client";

import type { ReactNode } from "react";
import { I18nProviderClient } from "locales/client";
import AppLayout from "components/app-layout";

type ProviderProps = {
  locale: string;
  children: ReactNode;
};

export function I18nProvider({ locale, children }: ProviderProps) {
  return (
    <I18nProviderClient
      locale={locale}
      fallback={
        <AppLayout>
          <div className="flex items-center w-full">
            {/* <div className="text-center p-12 w-full">
              <span className="loading loading-sm loading-spin"></span>
              Loading...
            </div> */}
          </div>
        </AppLayout>
      }
    >
      {children}
    </I18nProviderClient>
  );
}
