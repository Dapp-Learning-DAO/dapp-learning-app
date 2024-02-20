"use client";

import { type ElementRef, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";

export function Modal({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const dialogRef = useRef<ElementRef<"dialog"> & { onDismiss?: () => void }>(
    null
  );

  useEffect(() => {
    if (!dialogRef.current?.open) {
      dialogRef.current?.showModal();
    }
  }, []);

  const onDismiss = useCallback(() => {
    router.back();
  }, [router]);

  useEffect(() => {
    if (dialogRef.current) {
      if (!dialogRef.current?.onDismiss)
        dialogRef.current.onDismiss = onDismiss;
    }
  }, [dialogRef, onDismiss]);

  return createPortal(
    <div className="modal-backdrop">
      <dialog ref={dialogRef} className="modal modal-open text-base-content" onClose={onDismiss}>
        {children}
      </dialog>
    </div>,
    document.getElementById("modal-root")!
  );
}
