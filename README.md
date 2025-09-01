# React Infinite Windowed Loader

A high-performance React infinite scroll component with windowing and dual intersection observers. Perfect for handling large datasets while maintaining smooth performance and minimal DOM footprint.

## ✨ Features

- **🔄 Bidirectional Infinite Scrolling** - Load content when scrolling up or down
- **🪟 Windowing/Virtualization** - Maintains a fixed number of DOM elements (default: 30)
- **👁️ Dual Intersection Observers** - Efficient scroll detection without scroll event listeners
- **📏 Scroll Position Management** - Prevents scroll jumps when adding/removing elements
- **🎯 TypeScript Support** - Fully typed with comprehensive interfaces
- **🎨 Customizable Styling** - CSS variables and className support
- **♿ Accessible** - ARIA labels and keyboard navigation support
- **🌙 Dark Mode Support** - Automatic dark theme detection
- **📱 Responsive** - Mobile-friendly design
- **🔧 Imperative API** - Methods to control scrolling programmatically

## 📦 Installation

```bash
npm install react-infinite-windowed-loader
# or
yarn add react-infinite-windowed-loader
# or
pnpm add react-infinite-windowed-loader
```

**⚠️ Important: Don't forget to import the CSS file:**

```tsx
import 'react-infinite-windowed-loader/lib/InfiniteLoader.css';
```

## 🚀 Quick Start

```tsx
import React from 'react';
import { InfiniteLoader } from 'react-infinite-windowed-loader';

const MyComponent = () => {
  const generateItem = (index: number) => ({
    id: index,
    content: <div>Item {index + 1} - {new Date().toLocaleTimeString()}</div>
  });

  return (
    <InfiniteLoader
      generateItem={generateItem}
      height={400}
      onLoadMore={(direction, startIndex, endIndex) => {
        console.log(`Loaded ${direction}: ${startIndex}-${endIndex}`);
      }}
    />
  );
};

export default MyComponent;
```

## 📖 Advanced Usage

### With Custom Styling

```tsx
import React from 'react';
import { InfiniteLoader } from 'react-infinite-windowed-loader';

const StyledInfiniteLoader = () => {
  const generateItem = (index: number) => ({
    id: `item-${index}`,
    content: (
      <div style={{ padding: '20px', background: index % 2 ? '#f0f0f0' : '#fff' }}>
        <h3>Custom Item {index + 1}</h3>
        <p>This is a custom styled item with more content.</p>
      </div>
    )
  });

  return (
    <InfiniteLoader
      generateItem={generateItem}
      itemHeight={80}
      height="60vh"
      windowSize={20}
      batchSize={5}
      className="my-custom-loader"
      style={{ border: '2px solid #007bff' }}
      onLoadMore={(direction, start, end) => {
        console.log(`${direction} scroll: items ${start}-${end}`);
      }}
    />
  );
};
```

### With Ref API

```tsx
import React, { useRef } from 'react';
import { InfiniteLoader, InfiniteLoaderRef } from 'react-infinite-windowed-loader';

const InfiniteLoaderWithControls = () => {
  const loaderRef = useRef<InfiniteLoaderRef>(null);

  const generateItem = (index: number) => ({
    id: index,
    content: <div>Item {index + 1}</div>
  });

  const handleScrollToIndex = (index: number) => {
    loaderRef.current?.scrollToIndex(index);
  };

  const handleReset = () => {
    loaderRef.current?.reset();
  };

  const handleGetRange = () => {
    const range = loaderRef.current?.getCurrentRange();
    console.log('Current range:', range);
  };

  return (
    <div>
      <div style={{ marginBottom: '10px' }}>
        <button onClick={() => handleScrollToIndex(100)}>Go to Item 100</button>
        <button onClick={handleReset}>Reset to Top</button>
        <button onClick={handleGetRange}>Get Current Range</button>
      </div>
      
      <InfiniteLoader
        ref={loaderRef}
        generateItem={generateItem}
        height={400}
        showDebug={true}
      />
    </div>
  );
};
```

### With Async Data Loading

```tsx
import React, { useState, useCallback } from 'react';
import { InfiniteLoader } from 'react-infinite-windowed-loader';

interface DataItem {
  id: number;
  title: string;
  description: string;
}

const AsyncInfiniteLoader = () => {
  const [data, setData] = useState<Map<number, DataItem>>(new Map());

  const generateItem = useCallback((index: number) => {
    const item = data.get(index);
    
    return {
      id: index,
      content: item ? (
        <div>
          <h4>{item.title}</h4>
          <p>{item.description}</p>
        </div>
      ) : (
        <div>Loading item {index + 1}...</div>
      )
    };
  }, [data]);

  const handleLoadMore = useCallback(async (direction: 'up' | 'down', startIndex: number, endIndex: number) => {
    // Simulate API call
    const newItems = new Map<number, DataItem>();
    
    for (let i = startIndex; i <= endIndex; i++) {
      if (!data.has(i)) {
        newItems.set(i, {
          id: i,
          title: `Item ${i + 1}`,
          description: `Description for item ${i + 1} loaded at ${new Date().toLocaleTimeString()}`
        });
      }
    }

    if (newItems.size > 0) {
      setData(prev => new Map([...prev, ...newItems]));
    }
  }, [data]);

  return (
    <InfiniteLoader
      generateItem={generateItem}
      onLoadMore={handleLoadMore}
      height={500}
      itemHeight={60}
    />
  );
};
```

## 🔧 API Reference

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `generateItem` | `(index: number) => InfiniteLoaderItem` | **Required** | Function to generate item content by index |
| `itemHeight` | `number` | `50` | Height of each item in pixels |
| `windowSize` | `number` | `30` | Number of items to maintain in DOM |
| `batchSize` | `number` | `10` | Items to load/unload at once |
| `height` | `number \| string` | `400` | Container height |
| `className` | `string` | `''` | CSS class for container |
| `style` | `React.CSSProperties` | `{}` | Inline styles for container |
| `onLoadMore` | `(direction, startIndex, endIndex) => void` | `undefined` | Load more callback |
| `showDebug` | `boolean` | `false` | Show debug information |
| `loadingDelay` | `number` | `50` | Loading delay in milliseconds |
| `debounceDelay` | `number` | `150` | Debounce delay in milliseconds |
| `initialStartIndex` | `number` | `0` | Initial start index |
| `disableScrollManagement` | `boolean` | `false` | Disable scroll position management |

### Types

#### `InfiniteLoaderItem`
```tsx
interface InfiniteLoaderItem {
  id: string | number;
  content: React.ReactNode;
}
```

#### `InfiniteLoaderRef`
```tsx
interface InfiniteLoaderRef {
  scrollToIndex: (index: number) => void;
  getCurrentRange: () => { startIndex: number; endIndex: number };
  reset: () => void;
}
```

### Ref Methods

| Method | Parameters | Description |
|--------|------------|-------------|
| `scrollToIndex` | `(index: number)` | Scroll to specific item index |
| `getCurrentRange` | `()` | Get current visible range |
| `reset` | `()` | Reset to initial state |

## 🎨 Styling

The component comes with default styles but can be fully customized:

```css
/* Override default styles */
.infinite-loader__container {
  background-color: #ffffff;
  border: 1px solid #e0e0e0;
}

.infinite-loader__item {
  padding: 15px;
  border-bottom: 1px solid #f0f0f0;
}

.infinite-loader__item:hover {
  background-color: #f8f9fa;
}

/* Debug panel styling */
.infinite-loader__debug-stats {
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
}
```

https://github.com/user-attachments/assets/e71c5220-e6ee-49b5-b040-9773917e261d


## 🔄 How It Works

1. **Windowing**: Maintains exactly `windowSize` items in the DOM
2. **Intersection Observers**: Two sentinels detect when user reaches top/bottom
3. **Scroll Management**: Automatically adjusts scroll position when items are added/removed
4. **Debouncing**: Prevents rapid-fire loading during fast scrolling
5. **Bidirectional**: Supports infinite scrolling in both directions

## ⚡ Performance

- **Minimal DOM**: Only renders visible items + small buffer
- **No Scroll Listeners**: Uses Intersection Observer API
- **Optimized Updates**: RequestAnimationFrame for smooth transitions
- **Memory Efficient**: Constant memory usage regardless of dataset size

## 🌟 Browser Support

- Chrome/Edge 58+
- Firefox 55+
- Safari 12.1+
- Mobile browsers with Intersection Observer support

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by modern virtualization techniques
- Built with performance and accessibility in mind
- Uses the Intersection Observer API for efficient scroll detection

---

Made with ❤️ for the React community
