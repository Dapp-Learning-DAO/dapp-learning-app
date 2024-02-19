import { Suspense } from "react";
import PostFeed from "./PostFeed";
import Loading from "./loading";
import Link from "next/link";

export default function DashboardPage() {
  return (
    <section>
      <Link href="/login">
        <button className="btn">Open Login Modal</button>
      </Link>
      <Suspense fallback={<Loading />}>
        <PostFeed />
      </Suspense>
      <div className="h-16"></div>
    </section>
  );
}
