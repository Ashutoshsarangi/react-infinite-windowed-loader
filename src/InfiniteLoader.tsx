import React, { useState, useRef, useEffect, useCallback } from 'react';
import './InfiniteLoader.css';

export interface InfiniteLoaderItem {
  id: string | number;
  content: React.ReactNode;
}

export interface InfiniteLoaderProps {
  /** Function to generate item content by index */
  generateItem: (index: number) => InfiniteLoaderItem;
  /** Height of each item in pixels */
  itemHeight?: number;
  /** Number of items to maintain in the DOM window */
  windowSize?: number;
  /** Number of items to load/unload at once */
  batchSize?: number;
  /** Container height in pixels or CSS value */
  height?: number | string;
  /** Optional CSS class name for the container */
  className?: string;
  /** Optional inline styles for the container */
  style?: React.CSSProperties;
  /** Callback when scrolling down loads more items */
  onLoadMore?: (direction: 'up' | 'down', startIndex: number, endIndex: number) => void;
  /** Show debug information */
  showDebug?: boolean;
  /** Loading delay in milliseconds */
  loadingDelay?: number;
  /** Debounce delay in milliseconds */
  debounceDelay?: number;
  /** Initial start index */
  initialStartIndex?: number;
  /** Disable scroll position management (useful for testing) */
  disableScrollManagement?: boolean;
}

export interface InfiniteLoaderRef {
  scrollToIndex: (index: number) => void;
  getCurrentRange: () => { startIndex: number; endIndex: number };
  reset: () => void;
}

export const InfiniteLoader = React.forwardRef<InfiniteLoaderRef, InfiniteLoaderProps>(({
  generateItem,
  itemHeight = 50,
  windowSize = 30,
  batchSize = 10,
  height = 400,
  className = '',
  style = {},
  onLoadMore,
  showDebug = false,
  loadingDelay = 50,
  debounceDelay = 150,
  initialStartIndex = 0,
  disableScrollManagement = false
}, ref) => {
  const [startIndex, setStartIndex] = useState(initialStartIndex);
  const [endIndex, setEndIndex] = useState(initialStartIndex + windowSize - 1);
  const [isLoading, setIsLoading] = useState(false);
  const [scrollInfo, setScrollInfo] = useState({ scrollTop: 0, scrollHeight: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const topSentinelRef = useRef<HTMLDivElement>(null);
  const bottomSentinelRef = useRef<HTMLDivElement>(null);

  // Use refs to avoid stale closures in intersection observers
  const loadingRef = useRef(false);
  const startIndexRef = useRef(startIndex);
  const debounceRef = useRef<number | null>(null);
  const loadMoreDownRef = useRef<(() => void) | null>(null);
  const loadMoreUpRef = useRef<(() => void) | null>(null);

  // Update refs when state changes
  useEffect(() => {
    loadingRef.current = isLoading;
    startIndexRef.current = startIndex;
  }, [isLoading, startIndex]);

  // Get the currently visible items
  const visibleItems = Array.from({ length: windowSize }, (_, i) => {
    const itemIndex = startIndex + i;
    return generateItem(itemIndex);
  });

  // Handle loading more items when scrolling down
  const loadMoreDown = useCallback(() => {
    if (showDebug) {
      console.log('🔽 loadMoreDown called', { loading: loadingRef.current });
    }

    if (loadingRef.current) return;

    // Clear any pending debounced calls
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Debounce the loading to prevent rapid fire
    debounceRef.current = setTimeout(() => {
      if (showDebug) {
        console.log('🔽 Executing loadMoreDown');
      }
      setIsLoading(true);

      const container = containerRef.current;
      if (container && !disableScrollManagement) {
        // For windowed scrolling down: we add items at bottom and remove from top
        // We need to adjust scroll position to account for removed top items
        const scrollTop = container.scrollTop;
        const itemsToRemove = batchSize;
        const heightToAdjust = itemsToRemove * itemHeight;

        if (showDebug) {
          console.log('📏 Before down load:', {
            scrollTop,
            itemsToRemove,
            heightToAdjust,
            currentStart: startIndexRef.current
          });
        }

        // Simulate async loading
        setTimeout(() => {
          const newStartIndex = startIndexRef.current + batchSize;
          const newEndIndex = newStartIndex + windowSize - 1;
          
          setStartIndex(newStartIndex);
          setEndIndex(newEndIndex);
          setIsLoading(false);

          onLoadMore?.('down', newStartIndex, newEndIndex);

          // After DOM update, adjust scroll position for removed top items
          requestAnimationFrame(() => {
            if (container) {
              const newScrollTop = Math.max(0, scrollTop - heightToAdjust);
              container.scrollTop = newScrollTop;

              if (showDebug) {
                console.log('📏 After down load:', {
                  oldScrollTop: scrollTop,
                  newScrollTop,
                  adjustment: -heightToAdjust
                });
                console.log('🔽 Bottom load complete, scroll position adjusted');
              }
            }
          });
        }, loadingDelay);
      } else {
        // No scroll management version
        setTimeout(() => {
          const newStartIndex = startIndexRef.current + batchSize;
          const newEndIndex = newStartIndex + windowSize - 1;
          
          setStartIndex(newStartIndex);
          setEndIndex(newEndIndex);
          setIsLoading(false);

          onLoadMore?.('down', newStartIndex, newEndIndex);
        }, loadingDelay);
      }
    }, debounceDelay);
  }, [batchSize, itemHeight, showDebug, loadingDelay, debounceDelay, windowSize, onLoadMore, disableScrollManagement]);

  // Handle loading more items when scrolling up
  const loadMoreUp = useCallback(() => {
    if (showDebug) {
      console.log('🔼 loadMoreUp called', { loading: loadingRef.current, startIndex: startIndexRef.current });
    }

    if (loadingRef.current || startIndexRef.current <= 0) return;

    // Clear any pending debounced calls
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Debounce the loading to prevent rapid fire
    debounceRef.current = setTimeout(() => {
      if (showDebug) {
        console.log('🔼 Executing loadMoreUp');
      }
      setIsLoading(true);

      const container = containerRef.current;
      if (container && !disableScrollManagement) {
        // For windowed scrolling up: we add items at top and remove from bottom
        // We need to adjust scroll position to account for added top items
        const scrollTop = container.scrollTop;
        const itemsToAdd = batchSize;
        const heightToAdd = itemsToAdd * itemHeight;

        if (showDebug) {
          console.log('📏 Before up load:', {
            scrollTop,
            itemsToAdd,
            heightToAdd,
            currentStart: startIndexRef.current
          });
        }

        // Simulate async loading
        setTimeout(() => {
          const newStartIndex = Math.max(0, startIndexRef.current - batchSize);
          const newEndIndex = newStartIndex + windowSize - 1;
          
          setStartIndex(newStartIndex);
          setEndIndex(newEndIndex);
          setIsLoading(false);

          onLoadMore?.('up', newStartIndex, newEndIndex);

          // After DOM update, adjust scroll position for added top items
          requestAnimationFrame(() => {
            if (container) {
              const newScrollTop = scrollTop + heightToAdd;
              container.scrollTop = newScrollTop;

              if (showDebug) {
                console.log('📏 After up load:', {
                  oldScrollTop: scrollTop,
                  newScrollTop,
                  adjustment: +heightToAdd
                });
                console.log('🔼 Top load complete, scroll position adjusted');
              }
            }
          });
        }, loadingDelay);
      } else {
        // No scroll management version
        setTimeout(() => {
          const newStartIndex = Math.max(0, startIndexRef.current - batchSize);
          const newEndIndex = newStartIndex + windowSize - 1;
          
          setStartIndex(newStartIndex);
          setEndIndex(newEndIndex);
          setIsLoading(false);

          onLoadMore?.('up', newStartIndex, newEndIndex);
        }, loadingDelay);
      }
    }, debounceDelay);
  }, [batchSize, itemHeight, showDebug, loadingDelay, debounceDelay, windowSize, onLoadMore, disableScrollManagement]);

  // Update function refs
  useEffect(() => {
    loadMoreDownRef.current = loadMoreDown;
    loadMoreUpRef.current = loadMoreUp;
  }, [loadMoreDown, loadMoreUp]);

  // Track scroll position for debugging
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !showDebug) return;

    const handleScroll = () => {
      setScrollInfo({
        scrollTop: Math.round(container.scrollTop),
        scrollHeight: container.scrollHeight
      });
    };

    container.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial call

    return () => container.removeEventListener('scroll', handleScroll);
  }, [showDebug]);

  // Setup intersection observers - once per mount
  useEffect(() => {
    if (showDebug) {
      console.log('🔧 Setting up intersection observers');
    }

    // Bottom observer - triggers when user scrolls down
    const bottomObserver = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (showDebug) {
          console.log('👁️ Bottom sentinel intersection:', entry.isIntersecting);
        }
        if (entry.isIntersecting && loadMoreDownRef.current) {
          loadMoreDownRef.current();
        }
      },
      {
        root: containerRef.current,
        rootMargin: '50px',
        threshold: 0.1
      }
    );

    // Top observer - triggers when user scrolls up
    const topObserver = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (showDebug) {
          console.log('👁️ Top sentinel intersection:', entry.isIntersecting);
        }
        if (entry.isIntersecting && loadMoreUpRef.current) {
          loadMoreUpRef.current();
        }
      },
      {
        root: containerRef.current,
        rootMargin: '50px',
        threshold: 0.1
      }
    );

    // Function to set up observations
    const setupObservers = () => {
      // Always observe bottom sentinel
      if (bottomSentinelRef.current) {
        bottomObserver.observe(bottomSentinelRef.current);
        if (showDebug) {
          console.log('👁️ Observing bottom sentinel');
        }
      }

      // Only observe top sentinel when it exists
      if (topSentinelRef.current) {
        topObserver.observe(topSentinelRef.current);
        if (showDebug) {
          console.log('👁️ Observing top sentinel');
        }
      }
    };

    // Setup observers initially
    setupObservers();

    // Use a mutation observer to watch for when sentinels are added/removed from DOM
    const mutationObserver = new MutationObserver(() => {
      setupObservers();
    });

    if (containerRef.current) {
      mutationObserver.observe(containerRef.current, { childList: true, subtree: true });
    }

    return () => {
      if (showDebug) {
        console.log('🧹 Cleaning up intersection observers');
      }
      bottomObserver.disconnect();
      topObserver.disconnect();
      mutationObserver.disconnect();
      // Clean up debounce timeout
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [showDebug]);

  // Imperative API via ref
  React.useImperativeHandle(ref, () => ({
    scrollToIndex: (index: number) => {
      const container = containerRef.current;
      if (container) {
        const targetScrollTop = index * itemHeight;
        container.scrollTop = targetScrollTop;
        
        // Update window to show the target index
        const newStartIndex = Math.max(0, index - Math.floor(windowSize / 2));
        const newEndIndex = newStartIndex + windowSize - 1;
        setStartIndex(newStartIndex);
        setEndIndex(newEndIndex);
      }
    },
    getCurrentRange: () => ({ startIndex, endIndex }),
    reset: () => {
      setStartIndex(initialStartIndex);
      setEndIndex(initialStartIndex + windowSize - 1);
      if (containerRef.current) {
        containerRef.current.scrollTop = 0;
      }
    }
  }), [startIndex, endIndex, itemHeight, windowSize, initialStartIndex]);

  const containerHeight = typeof height === 'number' ? `${height}px` : height;

  return (
    <div className={`infinite-loader ${className}`} style={style}>
      {showDebug && (
        <div className="infinite-loader__debug-stats">
          <p>Currently showing items {startIndex + 1} - {endIndex + 1}</p>
          <p>DOM Elements: {windowSize}</p>
          <p>Start Index: {startIndex} | End Index: {endIndex}</p>
          <p>Is Loading: {isLoading ? '✅' : '❌'}</p>
          <p>Show Top Sentinel: {startIndex > 0 ? '✅' : '❌'}</p>
          <p>Scroll Position: {scrollInfo.scrollTop} / {scrollInfo.scrollHeight}</p>
          <p>Scroll %: {scrollInfo.scrollHeight > 0 ? Math.round((scrollInfo.scrollTop / scrollInfo.scrollHeight) * 100) : 0}%</p>
          {isLoading && <p>🔄 Loading...</p>}
        </div>
      )}

      <div
        ref={containerRef}
        className="infinite-loader__container"
        style={{
          height: containerHeight,
          overflowY: 'auto',
          position: 'relative'
        }}
      >
        {/* Loading overlay */}
        {isLoading && (
          <div className="infinite-loader__loading-overlay">
            ⏳ Loading...
          </div>
        )}

        {/* Top sentinel for upward scrolling */}
        {startIndex > 0 && (
          <div
            ref={topSentinelRef}
            className="infinite-loader__sentinel infinite-loader__sentinel--top"
            aria-label="Top sentinel"
          >
            {showDebug && '⬆️ TOP SENTINEL'}
          </div>
        )}

        {/* Visible items */}
        {visibleItems.map((item, index) => (
          <div
            key={item.id}
            className="infinite-loader__item"
            style={{
              height: `${itemHeight}px`,
              display: 'flex',
              alignItems: 'center'
            }}
          >
            {item.content}
          </div>
        ))}

        {/* Bottom sentinel for downward scrolling */}
        <div
          ref={bottomSentinelRef}
          className="infinite-loader__sentinel infinite-loader__sentinel--bottom"
          aria-label="Bottom sentinel"
        >
          {showDebug && '⬇️ BOTTOM SENTINEL'}
        </div>
      </div>
    </div>
  );
});

InfiniteLoader.displayName = 'InfiniteLoader';

export default InfiniteLoader;
