"use client";

import { useFormStatus } from "react-dom";

import { RouteLoadingOverlay } from "@/components/app-shell/route-loading-overlay";

export function FormPendingOverlay() {
  const { pending } = useFormStatus();

  return pending ? <RouteLoadingOverlay /> : null;
}
