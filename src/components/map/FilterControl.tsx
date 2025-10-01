import React from 'react';
import { Button } from '@/components/ui/button';
import { Filter } from 'lucide-react';

interface FilterControlProps {
  onToggle: () => void;
}

class FilterControl {
  private container: HTMLDivElement;
  private button: HTMLButtonElement;
  private onToggle: () => void;

  constructor(onToggle: () => void) {
    this.onToggle = onToggle;
    this.container = document.createElement('div');
    this.container.className = 'mapboxgl-ctrl mapboxgl-ctrl-group';
    
    this.button = document.createElement('button');
    this.button.className = 'mapboxgl-ctrl-icon';
    this.button.style.display = 'grid';
    this.button.style.placeItems = 'center';
    this.button.type = 'button';
    this.button.title = 'Toggle Filter Panel';
    this.button.setAttribute('aria-label', 'Toggle Filter Panel');
    
    // Create the filter icon using SVG
    this.button.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
      </svg>
    `;
    
    this.button.addEventListener('click', () => {
      this.onToggle();
    });
    
    this.container.appendChild(this.button);
  }

  onAdd() {
    return this.container;
  }

  onRemove() {
    if (this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
  }
}

export default FilterControl;
