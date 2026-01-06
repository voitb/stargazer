import { useLayoutEffect, useState } from "react";

export type ImageLoadingStatus = "idle" | "loading" | "loaded" | "error";

type UseImageLoadingStatusProps = {
  src?: string | null;
  delayMs?: number;
  onLoadingStatusChange?: (status: ImageLoadingStatus) => void;
};

type UseImageLoadingStatusReturn = {
  status: ImageLoadingStatus;
  canShowFallback: boolean;
  showImage: boolean;
  showFallback: boolean;
  handleLoad: () => void;
  handleError: () => void;
};

export function useImageLoadingStatus({
  src,
  delayMs = 0,
  onLoadingStatusChange,
}: UseImageLoadingStatusProps = {}): UseImageLoadingStatusReturn {
  const [status, setStatus] = useState<ImageLoadingStatus>(
    src ? "loading" : "idle"
  );
  const [canShowFallback, setCanShowFallback] = useState(delayMs === 0);

  const updateStatus = (newStatus: ImageLoadingStatus) => {
    setStatus(newStatus);
    onLoadingStatusChange?.(newStatus);
  };

  useLayoutEffect(() => {
    if (!src) {
      updateStatus("idle");
      setCanShowFallback(true);
      return;
    }

    updateStatus("loading");

    if (delayMs === 0) {
      setCanShowFallback(true);
    } else {
      setCanShowFallback(false);
      const timer = setTimeout(() => setCanShowFallback(true), delayMs);
      return () => clearTimeout(timer);
    }
  }, [src, delayMs, onLoadingStatusChange]);

  const handleLoad = () => updateStatus("loaded");
  const handleError = () => updateStatus("error");

  const showImage = Boolean(src && status !== "error");
  const showFallback = !showImage && canShowFallback;

  return {
    status,
    canShowFallback,
    showImage,
    showFallback,
    handleLoad,
    handleError,
  };
}
