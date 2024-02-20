import { Suspense } from "react";
import Loading from "./loading";
import RewardList from "./reward-list";

export default function RewardListPage() {
  return (
    <section>
      <Suspense fallback={<Loading />}>
        <RewardList />
      </Suspense>
    </section>
  );
}
