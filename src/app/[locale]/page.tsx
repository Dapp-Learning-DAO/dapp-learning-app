"use client";
import { useI18n, useScopedI18n } from "locales/client";

// `app/page.tsx` is the UI for the `/` URL
export default function Page() {
  const t = useI18n();
  const scopedT = useScopedI18n("hello");

  return (
    <div className="container m-auto p-16">
      <p>{t("hello")}</p>

      <p>{t("hello.world")}</p>
      <p>{scopedT("world")}</p>

      <p>{t("welcome", { name: "DL" })}</p>
      <p>{t("welcome", { name: <strong>DL</strong> })}</p>
    </div>
  );
}
