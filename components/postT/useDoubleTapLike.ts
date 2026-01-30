// postT/media/useDoubleTapLike.ts
import { useCallback, useRef } from "react";

type UseDoubleTapLikeOptions = {
  onDoubleLike?: () => void;
  thresholdMs?: number; // time between taps
};

export function useDoubleTapLike({
  onDoubleLike,
  thresholdMs = 260,
}: UseDoubleTapLikeOptions) {
  const lastTapRef = useRef<number>(0);

  const onTouchEnd = useCallback(() => {
    const now = Date.now();
    const delta = now - lastTapRef.current;
    lastTapRef.current = now;

    if (delta > 0 && delta < thresholdMs) {
      onDoubleLike?.();
    }
  }, [onDoubleLike, thresholdMs]);

  const onDoubleClick = useCallback(() => {
    onDoubleLike?.();
  }, [onDoubleLike]);

  return { onTouchEnd, onDoubleClick };
}
