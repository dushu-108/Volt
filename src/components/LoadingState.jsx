import React from 'react';

const LoadingState = ({ message = 'Generating code...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-4 space-y-4">
      <div className="relative w-16 h-16">
        <div className="absolute top-0 left-0 w-full h-full border-4 border-gray-200 rounded-full"></div>
        <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-500 rounded-full animate-spin border-t-transparent"></div>
      </div>
      <p className="text-lg text-gray-600 animate-pulse">{message}</p>
      <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div className="h-full bg-blue-500 rounded-full animate-progress"></div>
      </div>
    </div>
  );
};

export default LoadingState;
