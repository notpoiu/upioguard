"use client";

import { useEffect, useState } from "react";
import { delete_cookie_turnstile } from "../key_server";

export default function RemoveTurnstileCookie() {
  const [confirm, setConfirm] = useState(false);

  useEffect(() => {
    delete_cookie_turnstile().then(() => {
      setConfirm(true);
    });
  }, []);

  return null;
}