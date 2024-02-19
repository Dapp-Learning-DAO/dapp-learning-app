"use client";

import LoginModal from "components/login-modal";
import { Modal } from "components/modal";

export default function LoginModalPage() {
  return (
    <Modal>
      <LoginModal onClose={() => {}} />
    </Modal>
  );
}
