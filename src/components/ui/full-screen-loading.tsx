
import React from 'react';
import LoadingSpinner from './loading-spinner';

const FullScreenLoading: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>
  );
};

export default FullScreenLoading;
