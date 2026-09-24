"use client";

import * as React from "react";

import { getToken } from "@/lib/auth/token";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * `<img src>` can't carry an Authorization header, so protected photos
 * (site diary uploads, owner-only) can't be loaded directly. This fetches
 * the image with the bearer token and renders it from a blob URL instead —
 * same underlying pattern as the "download PDF via fetch" flow elsewhere
 * in this app, just kept on-page instead of triggering a download.
 */
export function AuthedImage({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const [blobUrl, setBlobUrl] = React.useState<string | null>(null);
  const [failed, setFailed] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    let objectUrl: string | null = null;
    // Resetting failure state when `src` changes — synchronizes with the
    // upcoming fetch, not derivable render state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFailed(false);

    const token = getToken();
    fetch(src, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      .then((res) => (res.ok ? res.blob() : Promise.reject(new Error("fetch failed"))))
      .then((blob) => {
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setBlobUrl(objectUrl);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [src]);

  if (failed) return null;
  if (!blobUrl) return <Skeleton className={className} />;
  // eslint-disable-next-line @next/next/no-img-element -- blob: URLs aren't compatible with next/image's optimizer
  return <img src={blobUrl} alt={alt} className={className} />;
}
