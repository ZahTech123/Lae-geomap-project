import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Eye, 
  EyeOff, 
  Settings, 
  Plus, 
  Layers,
  Map as MapIcon,
  Satellite,
  Mountain
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface Layer {
  id: string;
  name: string;
  type: 'raster' | 'vector' | 'fill' | 'line' | 'circle';
  visible: boolean;
  opacity: number;
  source?: string;
  description?: string;
}

const LayerPanel: React.FC = () => {
  const [layers, setLayers] = useState<Layer[]>([
    {
      id: 'satellite',
      name: 'Satellite Imagery',
      type: 'raster',
      visible: true,
      opacity: 100,
      description: 'High-resolution satellite imagery'
    },
    {
      id: 'roads',
      name: 'Road Network',
      type: 'line',
      visible: true,
      opacity: 85,
      description: 'Street and highway network'
    },
    {
      id: 'buildings',
      name: '3D Buildings',
      type: 'fill',
      visible: true,
      opacity: 70,
      description: 'Building footprints with height data'
    },
    {
      id: 'poi',
      name: 'Points of Interest',
      type: 'circle',
      visible: false,
      opacity: 90,
      description: 'Restaurants, shops, and landmarks'
    }
  ]);

  const [selectedLayer, setSelectedLayer] = useState<string | null>(null);

  const toggleLayerVisibility = (layerId: string) => {
    setLayers(prev => prev.map(layer => 
      layer.id === layerId 
        ? { ...layer, visible: !layer.visible }
        : layer
    ));
  };

  const updateLayerOpacity = (layerId: string, opacity: number) => {
    setLayers(prev => prev.map(layer => 
      layer.id === layerId 
        ? { ...layer, opacity }
        : layer
    ));
  };

  const getLayerIcon = (type: Layer['type']) => {
    switch (type) {
      case 'raster': return <Satellite className="h-4 w-4" />;
      case 'vector': return <MapIcon className="h-4 w-4" />;
      case 'fill': return <Mountain className="h-4 w-4" />;
      case 'line': return <MapIcon className="h-4 w-4" />;
      case 'circle': return <MapIcon className="h-4 w-4" />;
      default: return <Layers className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: Layer['type']) => {
    switch (type) {
      case 'raster': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'vector': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'fill': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'line': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'circle': return 'bg-pink-500/20 text-pink-400 border-pink-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <Card className="w-80 bg-gis-panel border-border shadow-panel">
      <CardHeader className="pb-3 bg-gis-panel-header">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Layers className="h-5 w-5 text-gis-accent" />
            Layers
          </CardTitle>
          <Button size="sm" variant="outline" className="h-8 w-8 p-0">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="space-y-1 p-4">
          {layers.map((layer, index) => (
            <div key={layer.id} className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gis-panel-header/50 transition-colors group">
                <div className="flex items-center space-x-3 flex-1">
                  <div className="flex items-center gap-2">
                    {getLayerIcon(layer.type)}
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-foreground">
                          {layer.name}
                        </span>
                        <Badge variant="secondary" className={`text-xs px-2 py-0.5 ${getTypeColor(layer.type)}`}>
                          {layer.type}
                        </Badge>
                      </div>
                      {layer.description && (
                        <span className="text-xs text-muted-foreground">
                          {layer.description}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => setSelectedLayer(selectedLayer === layer.id ? null : layer.id)}
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                  
                  <Switch
                    checked={layer.visible}
                    onCheckedChange={() => toggleLayerVisibility(layer.id)}
                    className="data-[state=checked]:bg-gis-accent"
                  />
                </div>
              </div>

              {selectedLayer === layer.id && (
                <div className="ml-6 mr-3 pb-2 space-y-3 border-l border-border pl-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Opacity</span>
                      <span className="text-sm font-medium text-foreground">{layer.opacity}%</span>
                    </div>
                    <Slider
                      value={[layer.opacity]}
                      onValueChange={(value) => updateLayerOpacity(layer.id, value[0])}
                      max={100}
                      step={1}
                      className="w-full"
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="text-xs h-7">
                      Zoom to Layer
                    </Button>
                    <Button size="sm" variant="outline" className="text-xs h-7">
                      Remove
                    </Button>
                  </div>
                </div>
              )}

              {index < layers.length - 1 && <Separator className="bg-border" />}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default LayerPanel;