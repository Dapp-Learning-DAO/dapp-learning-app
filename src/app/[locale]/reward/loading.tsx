import RewardDetailSkeleton from "./rewardComponents/RewardItemSkeleton";

export default function RwardPageLoading() {
  // You can add any UI inside Loading, including a Skeleton.
  return (
    <div className="max-w-xl m-auto">
      <div className="w-40 h-6 my-10 mx-auto skeleton"></div>
      {[1, 2, 3, 4].map((item) => (
        <RewardDetailSkeleton key={item} isModal={false} />
      ))}
    </div>
  );
}
