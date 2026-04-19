import { RefObject, useLayoutEffect, useState } from "react";

type Size = Pick<DOMRect, "height" | "width">;

export const useResizeObserver = (ref: RefObject<HTMLElement | null>) => {
  const [size, setSize] = useState<Size>({ height: 0, width: 0 });

  useLayoutEffect(() => {
    const element = ref.current;

    if (!element || !window?.ResizeObserver) return;

    const updateSize = () => {
      const { height, width } = element.getBoundingClientRect();
      setSize({ height, width });
    };

    updateSize();

    const observer = new ResizeObserver(updateSize);
    observer.observe(element);

    return () => observer.disconnect();
  }, [ref]);

  return size;
};
