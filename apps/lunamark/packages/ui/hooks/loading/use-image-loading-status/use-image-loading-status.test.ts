import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useImageLoadingStatus } from "./use-image-loading-status";

describe("useImageLoadingStatus", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("initial state", () => {
    it("returns idle status when no src provided", () => {
      const { result } = renderHook(() => useImageLoadingStatus({}));

      expect(result.current.status).toBe("idle");
      expect(result.current.showImage).toBe(false);
      expect(result.current.showFallback).toBe(true);
    });

    it("returns loading status when src is provided", () => {
      const { result } = renderHook(() =>
        useImageLoadingStatus({ src: "https://example.com/image.jpg" })
      );

      expect(result.current.status).toBe("loading");
      expect(result.current.showImage).toBe(true);
      expect(result.current.showFallback).toBe(false);
    });

    it("works with no arguments", () => {
      const { result } = renderHook(() => useImageLoadingStatus());

      expect(result.current.status).toBe("idle");
    });
  });

  describe("load/error handlers", () => {
    it("transitions to loaded status on handleLoad", () => {
      const { result } = renderHook(() =>
        useImageLoadingStatus({ src: "https://example.com/image.jpg" })
      );

      act(() => {
        result.current.handleLoad();
      });

      expect(result.current.status).toBe("loaded");
      expect(result.current.showImage).toBe(true);
    });

    it("transitions to error status on handleError", () => {
      const { result } = renderHook(() =>
        useImageLoadingStatus({ src: "https://example.com/image.jpg" })
      );

      act(() => {
        result.current.handleError();
      });

      expect(result.current.status).toBe("error");
      expect(result.current.showImage).toBe(false);
      expect(result.current.showFallback).toBe(true);
    });
  });

  describe("onLoadingStatusChange callback", () => {
    it("calls callback on initial load with src", () => {
      const onStatusChange = vi.fn();
      renderHook(() =>
        useImageLoadingStatus({
          src: "https://example.com/image.jpg",
          onLoadingStatusChange: onStatusChange,
        })
      );

      expect(onStatusChange).toHaveBeenCalledWith("loading");
    });

    it("calls callback when handleLoad is invoked", () => {
      const onStatusChange = vi.fn();
      const { result } = renderHook(() =>
        useImageLoadingStatus({
          src: "https://example.com/image.jpg",
          onLoadingStatusChange: onStatusChange,
        })
      );

      act(() => {
        result.current.handleLoad();
      });

      expect(onStatusChange).toHaveBeenCalledWith("loaded");
    });

    it("calls callback with idle when src becomes null", () => {
      const onStatusChange = vi.fn();
      const { rerender } = renderHook(
        ({ src }) =>
          useImageLoadingStatus({
            src,
            onLoadingStatusChange: onStatusChange,
          }),
        {
          initialProps: {
            src: "https://example.com/image.jpg" as string | null,
          },
        }
      );

      onStatusChange.mockClear();
      rerender({ src: null });

      expect(onStatusChange).toHaveBeenCalledWith("idle");
    });
  });

  describe("fallback delay (delayMs)", () => {
    it("shows fallback immediately when delayMs is 0", () => {
      const { result } = renderHook(() => useImageLoadingStatus({}));

      expect(result.current.canShowFallback).toBe(true);
    });

    it("delays fallback when loading with delayMs", () => {
      const { result } = renderHook(() =>
        useImageLoadingStatus({
          src: "https://example.com/image.jpg",
          delayMs: 500,
        })
      );

      expect(result.current.canShowFallback).toBe(false);

      act(() => {
        vi.advanceTimersByTime(500);
      });

      expect(result.current.canShowFallback).toBe(true);
    });

    it("clears timeout on unmount", () => {
      const { unmount } = renderHook(() =>
        useImageLoadingStatus({
          src: "https://example.com/image.jpg",
          delayMs: 500,
        })
      );

      unmount();
      act(() => {
        vi.advanceTimersByTime(500);
      });
    });
  });

  describe("src changes", () => {
    it("resets to loading when src changes", () => {
      const { result, rerender } = renderHook(
        ({ src }) => useImageLoadingStatus({ src }),
        { initialProps: { src: "https://example.com/image1.jpg" } }
      );

      act(() => {
        result.current.handleLoad();
      });
      expect(result.current.status).toBe("loaded");

      rerender({ src: "https://example.com/image2.jpg" });
      expect(result.current.status).toBe("loading");
    });
  });
});
