# Usage Examples

This document provides comprehensive examples of how to use the `react-infinite-windowed-loader` package in different scenarios.

## 🚀 Installation

```bash
npm install react-infinite-windowed-loader
```

## 📋 Basic Examples

### 1. Simple Text List

```tsx
import React from 'react';
import { InfiniteLoader } from 'react-infinite-windowed-loader';

const SimpleTextList = () => {
  const generateItem = (index: number) => ({
    id: index,
    content: `Item ${index + 1} - Generated at ${new Date().toLocaleTimeString()}`
  });

  return (
    <InfiniteLoader
      generateItem={generateItem}
      height={400}
    />
  );
};
```

### 2. Custom Styled Items

```tsx
import React from 'react';
import { InfiniteLoader } from 'react-infinite-windowed-loader';

const StyledItemsList = () => {
  const generateItem = (index: number) => ({
    id: `item-${index}`,
    content: (
      <div style={{ 
        padding: '20px', 
        background: index % 2 ? '#f8f9fa' : '#ffffff',
        borderLeft: '4px solid #007bff'
      }}>
        <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>
          Item #{index + 1}
        </h4>
        <p style={{ margin: 0, color: '#666' }}>
          This is item number {index + 1} with custom styling.
        </p>
      </div>
    )
  });

  return (
    <InfiniteLoader
      generateItem={generateItem}
      height={500}
      itemHeight={100}
      className="custom-loader"
      style={{ borderRadius: '12px', overflow: 'hidden' }}
    />
  );
};
```

## 🔄 Advanced Examples

### 1. With Real API Data

```tsx
import React, { useState, useCallback, useEffect } from 'react';
import { InfiniteLoader } from 'react-infinite-windowed-loader';

interface User {
  id: number;
  name: string;
  email: string;
  avatar: string;
}

const UserList = () => {
  const [users, setUsers] = useState<Map<number, User>>(new Map());
  const [loading, setLoading] = useState<Set<number>>(new Set());

  const fetchUser = async (index: number): Promise<User> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      id: index,
      name: `User ${index + 1}`,
      email: `user${index + 1}@example.com`,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${index}`
    };
  };

  const generateItem = useCallback((index: number) => {
    const user = users.get(index);
    const isLoading = loading.has(index);

    return {
      id: index,
      content: isLoading ? (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <div>Loading user {index + 1}...</div>
        </div>
      ) : user ? (
        <div style={{ 
          padding: '15px',
          display: 'flex',
          alignItems: 'center',
          gap: '15px'
        }}>
          <img 
            src={user.avatar}
            alt={user.name}
            style={{ width: '50px', height: '50px', borderRadius: '50%' }}
          />
          <div>
            <h4 style={{ margin: '0 0 5px 0' }}>{user.name}</h4>
            <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
              {user.email}
            </p>
          </div>
        </div>
      ) : (
        <div style={{ padding: '20px', color: '#999' }}>
          User data not available
        </div>
      )
    };
  }, [users, loading]);

  const handleLoadMore = useCallback(async (
    direction: 'up' | 'down',
    startIndex: number,
    endIndex: number
  ) => {
    const indicesToLoad = [];
    for (let i = startIndex; i <= endIndex; i++) {
      if (!users.has(i) && !loading.has(i)) {
        indicesToLoad.push(i);
      }
    }

    if (indicesToLoad.length === 0) return;

    // Mark as loading
    setLoading(prev => new Set([...prev, ...indicesToLoad]));

    // Fetch users
    const promises = indicesToLoad.map(async (index) => {
      try {
        const user = await fetchUser(index);
        return { index, user };
      } catch (error) {
        console.error(`Failed to load user ${index}:`, error);
        return { index, user: null };
      }
    });

    const results = await Promise.all(promises);

    // Update state
    setUsers(prev => {
      const newUsers = new Map(prev);
      results.forEach(({ index, user }) => {
        if (user) newUsers.set(index, user);
      });
      return newUsers;
    });

    setLoading(prev => {
      const newLoading = new Set(prev);
      indicesToLoad.forEach(index => newLoading.delete(index));
      return newLoading;
    });
  }, [users, loading]);

  return (
    <InfiniteLoader
      generateItem={generateItem}
      onLoadMore={handleLoadMore}
      height={600}
      itemHeight={80}
      windowSize={20}
      batchSize={5}
    />
  );
};
```

### 2. With Search and Filtering

```tsx
import React, { useState, useMemo } from 'react';
import { InfiniteLoader } from 'react-infinite-windowed-loader';

const SearchableList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Mock data
  const allItems = useMemo(() => {
    return Array.from({ length: 10000 }, (_, i) => ({
      id: i,
      title: `Item ${i + 1}`,
      description: `Description for item ${i + 1}`,
      category: ['Tech', 'Design', 'Business', 'Science'][i % 4],
      tags: [`tag${i % 5}`, `category${i % 3}`]
    }));
  }, []);

  const filteredItems = useMemo(() => {
    if (!searchTerm) return allItems;
    return allItems.filter(item =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allItems, searchTerm]);

  const generateItem = (index: number) => {
    const item = filteredItems[index];
    if (!item) {
      return {
        id: `empty-${index}`,
        content: <div style={{ padding: '20px', color: '#999' }}>No more items</div>
      };
    }

    return {
      id: item.id,
      content: (
        <div style={{ padding: '15px', borderLeft: '3px solid #007bff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <div style={{ flex: 1 }}>
              <h4 style={{ margin: '0 0 8px 0' }}>{item.title}</h4>
              <p style={{ margin: '0 0 10px 0', color: '#666' }}>{item.description}</p>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <span style={{ 
                  background: '#e9ecef', 
                  padding: '2px 8px', 
                  borderRadius: '12px',
                  fontSize: '12px'
                }}>
                  {item.category}
                </span>
                {item.tags.map(tag => (
                  <span key={tag} style={{ 
                    background: '#f8f9fa',
                    padding: '2px 6px',
                    borderRadius: '8px',
                    fontSize: '11px',
                    color: '#666'
                  }}>
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )
    };
  };

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Search items..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            padding: '12px',
            fontSize: '16px',
            border: '1px solid #ddd',
            borderRadius: '8px'
          }}
        />
        <p style={{ margin: '10px 0', color: '#666' }}>
          {filteredItems.length.toLocaleString()} items found
        </p>
      </div>

      <InfiniteLoader
        generateItem={generateItem}
        height={500}
        itemHeight={100}
        windowSize={15}
        key={searchTerm} // Reset component when search changes
      />
    </div>
  );
};
```

### 3. With Imperative Controls

```tsx
import React, { useRef, useState } from 'react';
import { InfiniteLoader, InfiniteLoaderRef } from 'react-infinite-windowed-loader';

const ControlledInfiniteLoader = () => {
  const loaderRef = useRef<InfiniteLoaderRef>(null);
  const [currentRange, setCurrentRange] = useState({ startIndex: 0, endIndex: 29 });
  const [jumpToIndex, setJumpToIndex] = useState('');

  const generateItem = (index: number) => ({
    id: index,
    content: (
      <div style={{ padding: '15px' }}>
        <h4>Item {index + 1}</h4>
        <p>Index: {index}</p>
        <p>Timestamp: {new Date(Date.now() + index * 1000).toLocaleString()}</p>
      </div>
    )
  });

  const handleGetRange = () => {
    const range = loaderRef.current?.getCurrentRange();
    if (range) {
      setCurrentRange(range);
      alert(`Current range: ${range.startIndex + 1} - ${range.endIndex + 1}`);
    }
  };

  const handleJumpTo = () => {
    const index = parseInt(jumpToIndex);
    if (!isNaN(index) && index >= 0) {
      loaderRef.current?.scrollToIndex(index);
      setJumpToIndex('');
    }
  };

  const handleReset = () => {
    loaderRef.current?.reset();
    setCurrentRange({ startIndex: 0, endIndex: 29 });
  };

  return (
    <div>
      <div style={{ 
        display: 'flex', 
        gap: '10px', 
        marginBottom: '20px',
        flexWrap: 'wrap',
        alignItems: 'center'
      }}>
        <button onClick={handleGetRange} style={{ padding: '8px 16px' }}>
          Get Current Range
        </button>
        <button onClick={handleReset} style={{ padding: '8px 16px' }}>
          Reset to Top
        </button>
        <input
          type="number"
          placeholder="Jump to index..."
          value={jumpToIndex}
          onChange={(e) => setJumpToIndex(e.target.value)}
          style={{ padding: '8px', width: '150px' }}
        />
        <button onClick={handleJumpTo} style={{ padding: '8px 16px' }}>
          Jump
        </button>
      </div>

      <div style={{ marginBottom: '10px', fontSize: '14px', color: '#666' }}>
        Current visible range: {currentRange.startIndex + 1} - {currentRange.endIndex + 1}
      </div>

      <InfiniteLoader
        ref={loaderRef}
        generateItem={generateItem}
        height={400}
        itemHeight={90}
        showDebug={true}
        onLoadMore={(direction, start, end) => {
          setCurrentRange({ startIndex: start, endIndex: end });
        }}
      />
    </div>
  );
};
```

## 🎨 Styling Examples

### 1. Custom CSS Classes

```css
/* Custom styles */
.my-infinite-loader .infinite-loader__container {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  border: none;
}

.my-infinite-loader .infinite-loader__item {
  background: rgba(255, 255, 255, 0.9);
  margin: 8px;
  border-radius: 8px;
  backdrop-filter: blur(10px);
}

.my-infinite-loader .infinite-loader__item:hover {
  background: rgba(255, 255, 255, 1);
  transform: translateX(4px);
  transition: all 0.2s ease;
}
```

```tsx
const StyledLoader = () => {
  const generateItem = (index: number) => ({
    id: index,
    content: (
      <div style={{ padding: '16px' }}>
        <h4 style={{ color: '#333', margin: '0 0 8px 0' }}>
          Styled Item {index + 1}
        </h4>
        <p style={{ color: '#666', margin: 0 }}>
          Custom styled content with glassmorphism effect
        </p>
      </div>
    )
  });

  return (
    <InfiniteLoader
      generateItem={generateItem}
      height={500}
      className="my-infinite-loader"
      itemHeight={80}
    />
  );
};
```

### 2. Dark Theme

```tsx
const DarkThemeLoader = () => {
  const generateItem = (index: number) => ({
    id: index,
    content: (
      <div style={{ 
        padding: '15px',
        color: '#e0e0e0',
        background: index % 2 ? '#2d2d2d' : '#363636'
      }}>
        <h4 style={{ color: '#fff', margin: '0 0 8px 0' }}>
          Dark Item {index + 1}
        </h4>
        <p style={{ color: '#b0b0b0', margin: 0 }}>
          Dark theme optimized content
        </p>
      </div>
    )
  });

  return (
    <InfiniteLoader
      generateItem={generateItem}
      height={400}
      style={{
        background: '#1a1a1a',
        border: '1px solid #333'
      }}
    />
  );
};
```

## 🔧 Configuration Examples

### Performance Optimized

```tsx
// For large datasets with heavy items
<InfiniteLoader
  generateItem={generateItem}
  height={600}
  windowSize={20}        // Smaller window
  batchSize={5}          // Smaller batches
  debounceDelay={200}    // Longer debounce
  loadingDelay={0}       // No artificial delay
/>
```

### Memory Optimized

```tsx
// For memory-constrained environments
<InfiniteLoader
  generateItem={generateItem}
  height={400}
  windowSize={15}        // Minimal DOM elements
  batchSize={3}          // Very small batches
  debounceDelay={300}    // Conservative loading
/>
```

### Smooth Scrolling

```tsx
// For the smoothest experience
<InfiniteLoader
  generateItem={generateItem}
  height={500}
  windowSize={40}        // Larger window
  batchSize={15}         // Bigger batches
  debounceDelay={50}     // Quick response
  loadingDelay={20}      // Minimal delay
/>
```

## 📱 Mobile Optimization

```tsx
const MobileOptimizedLoader = () => {
  const isMobile = window.innerWidth <= 768;

  return (
    <InfiniteLoader
      generateItem={generateItem}
      height={isMobile ? '70vh' : 500}
      windowSize={isMobile ? 15 : 30}
      batchSize={isMobile ? 5 : 10}
      debounceDelay={isMobile ? 200 : 150}
      itemHeight={isMobile ? 60 : 80}
    />
  );
};
```

These examples demonstrate the flexibility and power of the `react-infinite-windowed-loader` package. Start with basic examples and gradually incorporate advanced features based on your needs.
