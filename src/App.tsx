import { useEffect, useState } from "react";
import { GeoJSON, MapContainer, TileLayer } from "react-leaflet";

import "leaflet/dist/leaflet.css";
import "./styles.css";

export default function App() {
  const [geoData, setGeoData] = useState(null);

  const cleanFeature = (feature) => {
    const p = feature.properties;
    const total = p.total_population || 1;

    return {
      ...feature,
      properties: {
        ...p,
        college_rate: p.pct_college_or_higher, // just aliasing
        poverty_rate: (p.poverty_count / total) * 100,
        doctorate_rate: (p.doctorate / total) * 100,
        professional_rate: (p.professional / total) * 100,
        insured_rate: p.total_insured
          ? (p.insured / p.total_insured) * 100
          : null,
      },
    };
  };

  const cleanGeoData = ({ features, ...rest }) => ({
    ...rest,
    features: features.map(cleanFeature),
  });

  useEffect(() => {
    fetch("/duval.json")
      .then((res) => res.json())
      .then((data) => setGeoData(cleanGeoData(data)));
  }, []);

  // Simple styling for the neighborhood outline
  const style = {
    color: "blue",
    weight: 2,
    fillColor: "lightblue",
    fillOpacity: 0.2,
  };

  // Called for each feature
  const onEachFeature = (feature, layer) => {
    const {
      median_income,
      college_rate,
      professional_rate,
      insured_rate,
      poverty_rate,
      doctorate_rate,
      neighborhoods,
    } = feature.properties;

    // Use the first neighborhood as the name
    const name = neighborhoods[0].neighborhood;

    const tooltipContent = `
      <div>
        <b>${name}</b><br/>
        Median Household Income: $${median_income.toLocaleString()}<br/>
        Education (College+): ${college_rate.toFixed(1)}%<br/>
        Professional Degrees: ${professional_rate.toFixed(2)}%<br/>
        Percent Insured: ${insured_rate.toFixed(1) ?? "N/A"}%<br/>
        Poverty Rate: ${poverty_rate.toFixed(1)}%<br/>
        Doctorate Holders: ${doctorate_rate.toFixed(2)}%
      </div>
    `;

    layer.bindTooltip(tooltipContent);
  };

  return (
    <MapContainer
      center={[30.33, -81.66]} // Jacksonville-ish center
      zoom={11}
      style={{ height: "100vh", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/">OSM</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {geoData && (
        <GeoJSON data={geoData} style={style} onEachFeature={onEachFeature} />
      )}
    </MapContainer>
  );
}
