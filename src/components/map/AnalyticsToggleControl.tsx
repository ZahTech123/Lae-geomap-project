import React from 'react';
import ReactDOM from 'react-dom/client';
import mapboxgl from 'mapbox-gl';
import AnalyticsToggleButton from './AnalyticsToggleButton';

interface AnalyticsToggleControlProps {
  isVisible: boolean;
  onToggle: () => void;
}

class AnalyticsToggleControl implements mapboxgl.IControl {
  private container: HTMLDivElement;
  private root: ReactDOM.Root | null = null;
  private props: AnalyticsToggleControlProps;

  constructor(props: AnalyticsToggleControlProps) {
    this.props = props;
    this.container = document.createElement('div');
    this.container.className = 'mapboxgl-ctrl mapboxgl-ctrl-group';
  }

  onAdd(map: mapboxgl.Map): HTMLElement {
    this.root = ReactDOM.createRoot(this.container);
    this.render();
    return this.container;
  }

  onRemove(map: mapboxgl.Map): void {
    if (this.root) {
      this.root.unmount();
      this.root = null;
    }
    if (this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
  }

  updateProps(newProps: AnalyticsToggleControlProps) {
    this.props = newProps;
    this.render();
  }

  private render() {
    if (this.root) {
      this.root.render(
        <AnalyticsToggleButton
          isVisible={this.props.isVisible}
          onToggle={this.props.onToggle}
        />
      );
    }
  }
}

export default AnalyticsToggleControl;
