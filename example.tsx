import React from 'react';
import { InfiniteLoader } from './src';

// Example usage of the InfiniteLoader component
const ExampleApp = () => {
  const generateItem = (index: number) => ({
    id: index,
    content: (
      <div style={{ padding: '10px' }}>
        <strong>Item #{index + 1}</strong>
        <p>Generated at {new Date(Date.now() + index * 1000).toLocaleTimeString()}</p>
      </div>
    )
  });

  const handleLoadMore = (direction: 'up' | 'down', startIndex: number, endIndex: number) => {
    console.log(`🔄 Loading more ${direction}: items ${startIndex + 1} to ${endIndex + 1}`);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>React Infinite Windowed Loader Demo</h1>
      <p>This example shows the infinite loader in action with debug mode enabled.</p>
      
      <InfiniteLoader
        generateItem={generateItem}
        height={500}
        itemHeight={80}
        windowSize={25}
        batchSize={8}
        showDebug={true}
        onLoadMore={handleLoadMore}
        style={{ border: '2px solid #007bff', borderRadius: '8px' }}
      />
    </div>
  );
};

export default ExampleApp;
