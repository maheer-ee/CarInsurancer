import { useState } from "react";

export default function VehiclePreview({ vehicle, imageUrl, compact }: { vehicle: string; imageUrl: string; compact: boolean }) {
  const [status, setStatus] = useState<"loading" | "ready" | "unavailable">("loading");

  return (
    <figure className="vehicle-preview" data-compact={compact}>
      {status !== "unavailable" && (
        <img className="vehicle-photo" src={imageUrl} alt=""
          data-loading={status === "loading"} onLoad={() => setStatus("ready")}
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
