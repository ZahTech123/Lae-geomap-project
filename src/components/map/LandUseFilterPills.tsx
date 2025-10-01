import React from 'react';
import { Building2, Home, Landmark, TreePine, Factory } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LandUseFilterPillsProps {
  selectedLandUses: string[];
  onToggleLandUse: (landUse: string) => void;
}

const landUseConfig = [
  {
    value: 'Commercial',
    label: 'Commercial',
    icon: Building2,
    color: 'bg-blue-500',
    hoverColor: 'hover:bg-blue-600',
    activeColor: 'bg-blue-600',
  },
  {
    value: 'Residential',
    label: 'Residential',
    icon: Home,
    color: 'bg-green-500',
    hoverColor: 'hover:bg-green-600',
    activeColor: 'bg-green-600',
  },
  {
    value: 'Public Institutional',
    label: 'Public',
    icon: Landmark,
    color: 'bg-purple-500',
    hoverColor: 'hover:bg-purple-600',
    activeColor: 'bg-purple-600',
  },
  {
    value: 'Industrial',
    label: 'Industrial',
    icon: Factory,
    color: 'bg-orange-500',
    hoverColor: 'hover:bg-orange-600',
    activeColor: 'bg-orange-600',
  },
  {
    value: 'reserved',
    label: 'Reserved',
    icon: TreePine,
    color: 'bg-amber-500',
    hoverColor: 'hover:bg-amber-600',
    activeColor: 'bg-amber-600',
  },
];

const LandUseFilterPills: React.FC<LandUseFilterPillsProps> = ({
  selectedLandUses,
  onToggleLandUse,
}) => {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {landUseConfig.map((landUse) => {
        const isActive = selectedLandUses.includes(landUse.value);
        const Icon = landUse.icon;

        return (
          <Button
            key={landUse.value}
            onClick={() => onToggleLandUse(landUse.value)}
            variant={isActive ? 'default' : 'outline'}
            className={`
              rounded-full px-4 py-2 h-auto shadow-md flex items-center justify-center
              transition-all duration-200
              ${
                isActive
                  ? `${landUse.activeColor} text-white border-0 hover:${landUse.activeColor}`
                  : `bg-white text-gray-700 border border-border ${landUse.hoverColor} hover:text-white`
              }
            `}
          >
            <div className="flex items-center">
              <Icon className="h-4 w-4 mr-2" />
              <span className="text-sm font-medium">{landUse.label}</span>
            </div>
          </Button>
        );
      })}
    </div>
  );
};

export default LandUseFilterPills;
