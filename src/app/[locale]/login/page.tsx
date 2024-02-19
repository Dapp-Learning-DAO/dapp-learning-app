"use client";

import LoginModal from "components/login-modal";

export default function LoginPage() {
  const onClose = () => console.log("LoginPage onClose");

  return <LoginModal onClose={onClose} />;
}
