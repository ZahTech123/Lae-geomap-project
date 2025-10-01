import React from 'react';
import { BarChart3, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AnalyticsToggleButtonProps {
  isVisible: boolean;
  onToggle: () => void;
}

const AnalyticsToggleButton: React.FC<AnalyticsToggleButtonProps> = ({
  isVisible,
  onToggle,
}) => {
  return (
    <Button
      onClick={onToggle}
      className="rounded-lg w-10 h-10 p-0 shadow-lg bg-white hover:bg-gray-100 border border-gray-200 flex items-center justify-center"
      variant="outline"
      title={isVisible ? 'Hide Analytics Cards' : 'Show Analytics Cards'}
    >
      {isVisible ? (
        <X className="h-5 w-5 text-gray-700" />
      ) : (
        <BarChart3 className="h-5 w-5 text-gray-700" />
      )}
    </Button>
  );
};

export default AnalyticsToggleButton;
