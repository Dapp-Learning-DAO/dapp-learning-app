export default function RwardPageLoading() {
  // You can add any UI inside Loading, including a Skeleton.
  return (
    <div className="max-w-xl m-auto">
      {[1, 2, 3, 4].map((item) => (
        <div key={item}>
          <div className="card border rounded-xl w-40 p12">
            <div className="rounded-full mx-auto my-12 skeleton"></div>
            <div className="skeleton h-4 my-4"></div>
          </div>
          <div className="skeleton h-4 w-40 my-8"></div>
        </div>
      ))}
    </div>
  );
}
