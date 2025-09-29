import React from "react";
import mapboxgl from "mapbox-gl";
import { fetchBuildingFootprints } from "../../integrations/supabase/services";

// Helper to toggle layer visibility
function toggleLayerVisibility(map: mapboxgl.Map, layerId: string, visible: boolean) {
  if (map.getLayer(layerId)) {
    map.setLayoutProperty(layerId, "visibility", visible ? "visible" : "none");
  }
}

export class ToolbarControl {
  map: mapboxgl.Map;
  container: HTMLDivElement;

  // Method to add all custom layers, ensuring state is preserved
  addCustomLayers() {
    const map = this.map;
    if (!map) return;

    // Helper to get checkbox state
    const isChecked = (id: string) => (this.container.querySelector(`#${id}`) as HTMLInputElement)?.checked;

    // Roads
    if (!map.getSource("roads")) {
      map.addSource("roads", {
        type: "vector",
        url: "mapbox://heju05.0h0tk8bz", // Tileset URL
      });
    }
    if (!map.getLayer("roads")) {
      map.addLayer({
        id: "roads",
        type: "line",
        source: "roads",
        "source-layer": "ROAD-4xhaei",
        paint: { "line-color": "#681010", "line-width": 3 },
        layout: { visibility: isChecked("roads") ? "visible" : "none" },
      });
    }

   
    // Cadastre
    if (!map.getSource("cadastre")) {
      map.addSource("cadastre", {
        type: "vector",
        url: "mapbox://heju05.3lyba8b2", // Tileset URL
      });
    }
    if (!map.getLayer("cadastre")) {
      map.addLayer({
        id: "cadastre",
        type: "fill",
        source: "cadastre",
        "source-layer": "LAECITY2004_P_REGION-2r50wx",
        paint: { "fill-color": "#00ff00", "fill-opacity": 0.3 },
        layout: { visibility: isChecked("cadastre") ? "visible" : "none" },
      });
    }

    // Wards
    [1, 2, 3, 4, 5, 6].forEach(i => {
      const sourceId = `ward${i}`;
      const sourceLayer = i === 1 ? "LU_WARD-90v1fw" : `LU_WARD${i}-90v1fw`; // Handle Ward 1 as a special case

      if (!map.getSource(sourceId)) {
        map.addSource(sourceId, {
          type: "vector",
          url: "mapbox://heju05.3nf7d7kc", // Tileset URL
        });
      }
      if (!map.getLayer(sourceId)) {
        map.addLayer({
          id: sourceId,
          type: "fill",
          source: sourceId,
          "source-layer": sourceLayer, // Use the corrected source layer name
          paint: { "fill-color": "#ff0000", "fill-opacity": 0.4 },
          layout: { visibility: "none" }, // Wards are handled by dropdown
        });
      }
    });

  }

  onAdd(map: mapboxgl.Map) {
    this.map = map;
    this.container = document.createElement("div");
    this.container.className = "mapboxgl-ctrl mapboxgl-ctrl-group";
    this.container.style.background = "hsl(var(--accent-foreground))";
    this.container.style.color = "#fff";
    this.container.style.padding = "6px";
    this.container.style.borderRadius = "6px";
    this.container.style.width = "150px";

    // Collapsible UI
    this.container.innerHTML = `
      <details>
        <summary style="cursor:pointer;font-weight:600">Layers</summary>
        <div style="margin-top:6px;font-size:14px;border-radius:6px">
          
          <label>Basemap:</label><br/>
          <select id="basemap-select" style="width:100%;margin-top:4px;color:black;background:white">
            <option value="">Select BaseMap</option>
            <option value="mapbox://styles/mapbox/streets-v11">Streets</option>
            <option value="mapbox://styles/mapbox/satellite-v9">Satellite</option>
            <option value="mapbox://styles/mapbox/light-v10">Light</option>
            <option value="mapbox://styles/mapbox/dark-v10">Dark</option>
          </select>

          <hr style="margin:6px 0"/>

          <label>Ward:</label><br/>
          <select id="ward-select" style="width:100%;margin-top:4px;color:black;background:white">
            <option value="all">All Wards</option>
            ${[1, 2, 3, 4, 5, 6].map(i => `<option value="ward${i}">Ward ${i}</option>`).join("")}
          </select>

          <hr style="margin:6px 0"/>

          <div style="margin-top:6px;">
            <input type="checkbox" id="roads" />
            <label for="roads"  style="color:white">Roads</label>
          </div>

          <div style="margin-top:6px">
            <input type="checkbox" id="cadastre" />
            <label for="cadastre" style="color:white">Cadastre</label>
          </div>
          <div style="margin-top:6px">
            <input type="checkbox" id="building-footprints" />
            <label for="building-footprints" style="color:white">Building Footprints</label>
          </div>
        </div>
      </details>

    `;

    // Initialize layers on load
    map.on("load", () => {
      this.addCustomLayers();
    });

    // Re-add layers after any basemap/style change
    map.on("styledata", () => this.addCustomLayers());

    // Event listeners
    const basemapSelect = this.container.querySelector("#basemap-select");
    basemapSelect?.addEventListener("change", (e) => {
      const style = (e.target as HTMLSelectElement).value;
      if (style) map.setStyle(style);
    });

    const wardSelect = this.container.querySelector("#ward-select");
    wardSelect?.addEventListener("change", (e) => {
      const ward = (e.target as HTMLSelectElement).value;
      console.log(`Selected Ward: ${ward}`); // Log the selected ward

      // Hide all ward layers first
      [1, 2, 3, 4, 5, 6].forEach(i => {
        toggleLayerVisibility(map, `ward${i}`, false)
      });

      // Show the selected ward layer
      if (ward !== "all") {
        if (map.getLayer(ward)) {
          toggleLayerVisibility(map, ward, true);
          console.log(`Layer ${ward} visibility set to visible.`);
        } else {
          console.error(`Error: Layer ${ward} not found on the map.`);
        }
      }
    });

    const roads = this.container.querySelector("#roads");
    roads?.addEventListener("change", (e) => {
      toggleLayerVisibility(map, "roads", (e.target as HTMLInputElement).checked);
    });

    const cadastre = this.container.querySelector("#cadastre");
    cadastre?.addEventListener("change", (e) => {
      toggleLayerVisibility(map, "cadastre", (e.target as HTMLInputElement).checked);
    });

    const buildingFootprints = this.container.querySelector("#building-footprints");
    buildingFootprints?.addEventListener("change", async (e) => {
      const checked = (e.target as HTMLInputElement).checked;
      const layerId = "building-footprints-layer";

      if (checked) {
        if (!map.getSource("building-footprints")) {
          const geojsonData = await fetchBuildingFootprints();
          if (geojsonData) {
            map.addSource("building-footprints", {
              type: "geojson",
              data: geojsonData,
            });
            map.addLayer({
              id: layerId,
              type: 'fill-extrusion',
              source: 'building-footprints',
              paint: {
                'fill-extrusion-color': '#088',
                'fill-extrusion-height': 20,
                'fill-extrusion-base': 0,
                'fill-extrusion-opacity': 0.8,
              },
            });
          }
        } else {
          toggleLayerVisibility(map, layerId, true);
        }
      } else {
        toggleLayerVisibility(map, layerId, false);
      }
    });

    return this.container;
  }


  onRemove() {
    this.container.remove();
    this.map = undefined!;
  }
}

export default ToolbarControl;
