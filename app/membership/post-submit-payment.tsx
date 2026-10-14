"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePreview } from "./portal-shell";

// Local draft flags are not proof of submission. Redirect only after the
// authenticated Registry status confirms that an application exists.
export default function PostSubmitPayment() {
  const { draft } = usePreview();
  const router = useRouter();

  useEffect(() => {
    if (!draft.reviewedPreview) return;
    const controller = new AbortController();
    fetch("/api/membership/status", { cache: "no-store", signal: controller.signal })
      .then(response => {
        if (!response.ok) throw new Error("Registry status unavailable");
        return response.json() as Promise<{ hasApplication?: boolean }>;
      })
      .then(state => {
        if (!controller.signal.aborted && state?.hasApplication) {
          router.replace("/membership/payments");
        }
      })
      .catch(() => {});
    return () => controller.abort();
  }, [draft.reviewedPreview, router]);

  return null;
}
