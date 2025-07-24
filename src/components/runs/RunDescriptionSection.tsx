
import React from 'react';
import { RunEvent } from '@/types';

interface RunDescriptionSectionProps {
  run: RunEvent;
}

const RunDescriptionSection: React.FC<RunDescriptionSectionProps> = ({ run }) => {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-2">About this run</h2>
      <div className="bg-gray-50 p-4 rounded-lg">
        <p>{run.description}</p>
        
        {/* Tags */}
        {run.tags && run.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-4">
            {run.tags.map((tag, index) => (
              <span 
                key={index} 
                className="text-xs px-2 py-0.5 bg-gray-200 rounded-full text-gray-700"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RunDescriptionSection;
