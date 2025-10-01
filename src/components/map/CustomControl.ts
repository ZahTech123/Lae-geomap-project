import { IControl } from 'mapbox-gl';
import { render } from 'react-dom';
import React from 'react';
import MapOrientationControl from './MapOrientationControl';
import mapboxgl from 'mapbox-gl';

class CustomControl implements IControl {
  private container: HTMLDivElement;
  private map: mapboxgl.Map | null = null;

  constructor(private reactComponent: React.ComponentType<{ map: mapboxgl.Map | null }>) {
    this.container = document.createElement('div');
    this.container.className = 'mapboxgl-ctrl mapboxgl-ctrl-group';
  }

  onAdd(map: mapboxgl.Map) {
    this.map = map;
    render(React.createElement(this.reactComponent, { map: this.map }), this.container);
    return this.container;
  }

  onRemove() {
    this.container.parentNode?.removeChild(this.container);
    this.map = null;
  }
}

export default CustomControl;
