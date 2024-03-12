export default function RewardDetailSkeleton({
  isModal,
}: {
  isModal?: boolean | undefined;
}) {
  return (
    <div
      className={`m-auto ${
        !isModal ? "card border rounded-xl p-16 max-w-2xl" : ""
      }`}
      style={{ maxHeight: isModal ? "calc(100vh - 3em)" : "auto" }}
    >
      <h3 className="h-4 skeleton w-32 m-auto my-2"></h3>
      <p className="my-2">
        <span className="skeleton w-8 h-4 mr-2"></span>
        <span className="skeleton w-8 h-4"></span>
      </p>
      <p className="skeleton h-4 w-full my-4"></p>
      <p className="skeleton h-4 w-full my-4"></p>
      <p className="skeleton h-4 w-full my-4"></p>
      <p className="skeleton h-4 w-full my-4"></p>
      <p className="skeleton h-4 w-full my-4"></p>

      <div className="text-bas leading-8 py-4">
        <br />
        <div className="w-full md:max-h-[30vh]">
          <div className="skeleton h-4 w-full my-4"></div>
          <div className="skeleton h-4 w-full my-4"></div>
          <div className="skeleton h-4 w-full my-4"></div>
        </div>
      </div>
    </div>
  );
}
