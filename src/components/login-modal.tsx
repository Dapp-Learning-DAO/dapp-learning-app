"use client";

import { useRouter } from "next/navigation";

export default function LoginModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();

  const onConfirm = () => {
    console.log("Login onConfirm");
  };

  return (
    <div className="m-auto flex items-center justify-center w-full h-full">
      <div className="modal-box">
        <h1 className="font-bold text-center text-xl text-slate-900">
          Login Modal
        </h1>
        <div className="modal-action">
          <button className="btn btn-primary" onClick={onConfirm}>
            Login
          </button>
          <button
            className="btn"
            onClick={() => {
              onClose();
              router.back();
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
