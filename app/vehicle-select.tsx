import { useEffect, useState } from "react";

type Option = { text: string; value: string };

export default function VehicleSelect({ label, url, value, onChange, prerequisite }: {
  label: string;
  url?: string;
  value: string;
  onChange: (value: string) => void;
  prerequisite?: string;
}) {
  const [options, setOptions] = useState<Option[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const loading = Boolean(url && !options && !failed);

  useEffect(() => {
    if (!url) return;
    const controller = new AbortController();
    async function load(endpoint: string) {
      try {
        const response = await fetch(endpoint, { signal: controller.signal });
        if (!response.ok) throw new Error("Vehicle options unavailable");
        const items: Option[] = await response.json();
        if (!controller.signal.aborted) setOptions(items);
      } catch {
        if (!controller.signal.aborted) setFailed(true);
      }
    }
    void load(url);
    return () => controller.abort();
  }, [url, attempt]);

  const name = label.toLowerCase();
  const placeholder = !url ? prerequisite : loading ? "Loading…" :
    failed ? "Unavailable" : options?.length === 0 ? "No options found" : "Choose " + name;

  return (
    <div className="grid min-w-0 content-start gap-1.5">
      <label htmlFor={"vehicle-" + name}>{label}</label>
      <select id={"vehicle-" + name} required disabled={!options?.length} value={value}
        onChange={(event) => onChange(event.target.value)}>
        <option value="">{placeholder}</option>
        {value && !options?.some((option) => option.value === value) &&
          <option value={value}>{value}</option>}
        {options?.map((option) => <option key={option.value} value={option.value}>{option.text}</option>)}
      </select>
      {failed && (
        <div className="flex flex-wrap items-center gap-2">
          <small role="status">Couldn’t load {name} options.</small>
          <button type="button" className="secondary" onClick={() => {
            setFailed(false);
            setAttempt(attempt + 1);
          }}>Retry</button>
        </div>
      )}
    </div>
  );
}
