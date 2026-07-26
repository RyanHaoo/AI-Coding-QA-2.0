"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { RouteLoadingOverlay } from "@/components/app-shell/route-loading-overlay";

export function RouteTransitionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const routeKey = `${pathname}?${searchParams.toString()}`;
  const [pendingRouteKey, setPendingRouteKey] = useState<string | null>(null);
  const pending = pendingRouteKey === routeKey;

  useEffect(() => {
    function handleNavigationClick(event: MouseEvent) {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey ||
        !(event.target instanceof Element)
      ) {
        return;
      }

      const anchor = event.target.closest<HTMLAnchorElement>("a[href]");

      if (
        !anchor ||
        anchor.hasAttribute("download") ||
        (anchor.target && anchor.target !== "_self")
      ) {
        return;
      }

      const destination = new URL(anchor.href, window.location.href);
      const current = new URL(window.location.href);
      const sameDocument =
        destination.origin === current.origin &&
        destination.pathname === current.pathname &&
        destination.search === current.search;

      if (
        destination.origin !== current.origin ||
        sameDocument ||
        (destination.protocol !== "http:" && destination.protocol !== "https:")
      ) {
        return;
      }

      setPendingRouteKey(
        `${current.pathname}?${current.searchParams.toString()}`,
      );
    }

    document.addEventListener("click", handleNavigationClick, true);
    return () =>
      document.removeEventListener("click", handleNavigationClick, true);
  }, []);

  return (
    <>
      {children}
      {pending ? <RouteLoadingOverlay /> : null}
    </>
  );
}
