import { Suspense } from "react";
import Loading from "./loading";
import RewardList from "./rewardComponents/RewardList";

export default function RewardListPage() {
  return (
    <section>
      <Suspense fallback={<Loading />}>
        <RewardList />
      </Suspense>
    </section>
  );
}
