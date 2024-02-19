import { Suspense } from "react";
import Loading from "./loading";
import AppLayout from "components/app-layout";

export default function TxBuilderPage() {
  return (
    <AppLayout>
      <section>
        <Suspense fallback={<Loading />}>
          <h1 className="text-center text-xl">TxBuilderPage</h1>
        </Suspense>
        <div className="h-16"></div>
      </section>
    </AppLayout>
  );
}
