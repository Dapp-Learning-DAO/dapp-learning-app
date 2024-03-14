"use client";
import { useI18n, useScopedI18n } from "locales/client";
import Link from "next/link";

// `app/page.tsx` is the UI for the `/` URL
export default function Page() {
  const t = useI18n();
  const scopedT = useScopedI18n("hello");

  return (
    <div className="container m-auto p-8 sm:p-16">
      <div className="grid sm:grid-cols-3 gap-y-4 gap-4">
        <div className="card w-full bg-base-100 border shadow-sm m-auto max-w-md">
          <div className="card-body">
            <h2 className="card-title">Redpacket</h2>
            <p className="min-h-20">
              Ready to use a fully decentralized, ZK encryption Redpacket?
            </p>
            <div className="card-actions justify-end">
              <Link href="/reward">
                <button className="btn btn-primary">Go</button>
              </Link>
            </div>
          </div>
        </div>
        <div className="card w-full bg-base-100 border shadow-sm m-auto max-w-md">
          <div className="card-body">
            <h2 className="card-title">Bridge</h2>
            <p className="min-h-20">
              Flexible, lightweight and heavily customizable interface for
              swapping, bridging or crypto-native checkout experiences.
            </p>
            <div className="card-actions justify-end">
              <Link href="/reward">
                <button className="btn btn-primary">Go</button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
