import React, { RefObject, useEffect, useMemo, useRef, useState } from 'react';

const GAP = 16;

const useColumnCount = (ref: RefObject<HTMLElement>, minColumnWidth: number, maxColumns: number, minColumns: number) => {
  const [count, setCount] = useState(minColumns);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () =>
      setCount(Math.min(maxColumns, Math.max(minColumns, Math.floor((el.clientWidth + GAP) / (minColumnWidth + GAP)))));
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, minColumnWidth, maxColumns, minColumns]);

  return count;
};

interface MasonryProps<T> {
  items: T[];
  getKey: (item: T) => string;
  /** Item height relative to column width. Must be a pure function of the item. */
  getHeight: (item: T) => number;
  renderItem: (item: T) => React.ReactNode;
  minColumnWidth?: number;
  maxColumns?: number;
  minColumns?: number;
}

// Pinterest-style columns. Items go into the currently shortest column; because heights are
// known up front, appending items never moves the ones already placed.
export function Masonry<T>({ items, getKey, getHeight, renderItem, minColumnWidth = 220, maxColumns = 6, minColumns = 2 }: MasonryProps<T>) {
  const ref = useRef<HTMLDivElement>(null);
  const columnCount = useColumnCount(ref, minColumnWidth, maxColumns, minColumns);

  const columns = useMemo(() => {
    // Never render more columns than there are items, otherwise the empty columns
    // still take their flex share and squeeze the cards into a narrow strip.
    const count = Math.max(1, Math.min(columnCount, items.length));
    const cols: T[][] = Array.from({ length: count }, () => []);
    const heights = new Array(count).fill(0);
    for (const item of items) {
      const shortest = heights.indexOf(Math.min(...heights));
      cols[shortest].push(item);
      heights[shortest] += getHeight(item);
    }
    return cols;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, columnCount]);

  return (
    <div ref={ref} className="flex items-start gap-3 sm:gap-4">
      {columns.map((column, i) => (
        <div key={i} className="flex flex-1 min-w-0 flex-col gap-5">
          {column.map((item) => (
            <React.Fragment key={getKey(item)}>{renderItem(item)}</React.Fragment>
          ))}
        </div>
      ))}
    </div>
  );
}
