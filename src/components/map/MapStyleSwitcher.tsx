import React from 'react';
import { Layers, Map } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MapStyleSwitcherProps {
  currentStyle: 'streets' | 'satellite';
  onToggleStyle: () => void;
}

const MapStyleSwitcher: React.FC<MapStyleSwitcherProps> = ({
  currentStyle,
  onToggleStyle,
}) => {
  return (
    <Button
      onClick={onToggleStyle}
      className="rounded-full w-10 h-10 p-0 shadow-lg bg-white hover:bg-gray-100 border border-gray-200 flex items-center justify-center"
      variant="outline"
      title={currentStyle === 'streets' ? 'Switch to Satellite View' : 'Switch to Streets View'}
    >
      {currentStyle === 'streets' ? (
        <Layers className="h-5 w-5 text-gray-700" />
      ) : (
        <Map className="h-5 w-5 text-gray-700" />
      )}
    </Button>
  );
};

export default MapStyleSwitcher;
