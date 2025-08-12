"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * We only use this page to trigger the logout call.
 * Nothing is returned
 */

export default function Page() {
  const { push } = useRouter();
  const { signOut } = useAuth();

  useEffect(() => {
    signOut().then(() => push(`/auth/login`));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
