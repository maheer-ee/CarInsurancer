import { useState } from "react";

export default function VehiclePreview({ vehicle, imageUrl }: { vehicle: string; imageUrl: string }) {
  const [status, setStatus] = useState<"loading" | "ready" | "unavailable">("loading");

  return (
    <figure className="vehicle-preview">
      {status !== "unavailable" && (
        <img className="vehicle-photo" src={imageUrl} alt={vehicle}
          hidden={status !== "ready"} onLoad={() => setStatus("ready")}
          onError={() => setStatus("unavailable")} />
      )}
      <figcaption className="vehicle-caption">
        <p className="vehicle-name">{vehicle}</p>
        {status !== "ready" && (
          <p className="vehicle-note" role="status">
            {status === "loading" ? "Loading vehicle image…" : "No image available for this vehicle."}
          </p>
        )}
      </figcaption>
    </figure>
  );
}
