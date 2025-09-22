"use client";

import React, { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';

const TestCanvas: React.FC = () => {
  const [value, setValue] = useState('');

  console.log('TestCanvas render');

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Test Canvas</h2>
      <Textarea
        value={value}
        onChange={(e) => {
          console.log('onChange called:', e.target.value);
          setValue(e.target.value);
        }}
        placeholder="Type here to test focus..."
        className="min-h-[100px]"
      />
    </div>
  );
};

export default TestCanvas;
