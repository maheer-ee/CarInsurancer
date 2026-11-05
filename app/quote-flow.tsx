"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";

import QuoteComparison from "./quote-comparison";
import VehiclePreview from "./vehicle-preview";
import VehicleSelect from "./vehicle-select";

const steps = ["Your car", "Your coverage", "Review selections"];
const descriptions = [
  "Start with the vehicle you want to insure.",
  "Choose the coverage settings you want to compare.",
  "Check the vehicle and coverage settings you entered.",
];
const liabilityOptions = ["50/100/50", "100/300/100", "250/500/100"];
const liabilityLabels = ["injuries per person", "injuries per accident", "property damage per accident"];
const deductibleOptions = ["250", "500", "1000", "2000"];

export default function QuoteFlow() {
  const [step, setStep] = useState(0);
  const [car, setCar] = useState({ zip: "", year: "", make: "", model: "" });
  const [coverage, setCoverage] = useState({ liability: "", collision: "", comprehensive: "" });
  const [reviewVisit, setReviewVisit] = useState(0);
  const [editingCar, setEditingCar] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const moved = useRef(false);
  const makesUrl = car.year ? "/api/vehicles?year=" + encodeURIComponent(car.year) : undefined;
  const vehicle = car.model ? [car.year, car.make, car.model].join(" ") : "";
  const imageUrl = car.model ? "/api/vehicle-image?" + new URLSearchParams({
    year: car.year, make: car.make, model: car.model,
  }) : undefined;
  const modelsUrl = makesUrl && car.make ? makesUrl + "&make=" + encodeURIComponent(car.make) : undefined;

  useEffect(() => {
    if (moved.current) heading.current?.focus();
  }, [step]);

  function goTo(next: number) {
    moved.current = true;
    if (next === 2) setReviewVisit((visit) => visit + 1);
    setStep(next);
  }

  function advance(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (step === 0 && !car.model) return;
    goTo(editingCar ? 2 : step + 1);
    setEditingCar(false);
  }

  return (
    <div className="flow">
      {imageUrl && <VehiclePreview key={imageUrl} vehicle={vehicle} imageUrl={imageUrl} compact={step !== 0} />}
      <ol className="steps" aria-label="Comparison progress">
        {steps.map((label, index) => (
          <li key={label} aria-current={index === step ? "step" : undefined}>
            <span aria-hidden="true">{index + 1}</span>{label}
          </li>
        ))}
      </ol>
      <section className="panel" aria-labelledby="step-title">
        <h1 id="step-title" ref={heading} tabIndex={-1}>{steps[step]}</h1>
        <p className="intro">{descriptions[step]}</p>
        {step === 0 && (
          <form onSubmit={advance}>
            <p className="empty mb-6">Review your coverage selections, then get quotes directly from insurers.</p>
            <div className="fields grid gap-5 sm:grid-cols-2">
              <label>ZIP code<input autoComplete="postal-code" inputMode="numeric" pattern="[0-9]{5}" title="Enter a five-digit ZIP code" required value={car.zip} onChange={(e) => setCar({ ...car, zip: e.target.value })} /></label>
              <VehicleSelect label="Year" url="/api/vehicles" value={car.year}
                onChange={(year) => setCar({ ...car, year, make: "", model: "" })} />
              <VehicleSelect key={car.year} label="Make" url={makesUrl} value={car.make}
                prerequisite="Choose a year first" onChange={(make) => setCar({ ...car, make, model: "" })} />
              <VehicleSelect key={modelsUrl ?? "no-model"} label="Model" url={modelsUrl} value={car.model}
                prerequisite="Choose a make first" onChange={(model) => setCar({ ...car, model })} />
            </div>
            <div className="actions"><button className="primary disabled:opacity-60" type="submit" disabled={!car.model}>{editingCar ? "Review selections" : "Continue to coverage"}</button></div>
          </form>
        )}
        {step === 1 && (
          <form onSubmit={advance}>
            <div className="fields grid gap-5 sm:grid-cols-2">
              <div className="grid content-start gap-1.5 sm:col-span-2">
                <label htmlFor="liability">Liability limits</label>
                <select id="liability" required aria-describedby="limit-help" value={coverage.liability} onChange={(e) => setCoverage({ ...coverage, liability: e.target.value })}>
                  <option value="">Choose limits</option>
                  {liabilityOptions.map((option) => <option key={option} value={option}>{liabilityAmounts(option).join(" / ")}</option>)}
                </select>
                <small id="limit-help">In order: injuries per person, injuries per accident, and property damage per accident.</small>
              </div>
              <Deductible kind="collision" label="Collision deductible" help="What you pay toward covered damage to your car after a collision." value={coverage.collision} change={(collision) => setCoverage({ ...coverage, collision })} />
              <Deductible kind="comprehensive" label="Comprehensive deductible" help="What you pay toward covered losses such as theft, hail, or vandalism." value={coverage.comprehensive} change={(comprehensive) => setCoverage({ ...coverage, comprehensive })} />
            </div>
            <div className="actions">
              <button type="button" className="secondary" onClick={() => goTo(0)}>Back</button>
              <button type="submit" className="primary">Review selections</button>
            </div>
          </form>
        )}
        {step === 2 && (
          <>
            <p className="selection">{car.year} {car.make.trim()} {car.model.trim()} <span>· ZIP {car.zip}</span></p>
            <dl className="comparison">
              <div className="liability-summary">
                <dt>Liability limits</dt>
                <dd>{liabilityAmounts(coverage.liability).map((amount, index) => (
                  <span className="block" key={index}>{amount} {liabilityLabels[index]}</span>
                ))}</dd>
              </div>
              <div><dt>Collision deductible</dt><dd className="whitespace-nowrap">{formatDeductible(coverage.collision)}</dd></div>
              <div><dt>Comprehensive deductible</dt><dd className="whitespace-nowrap">{formatDeductible(coverage.comprehensive)}</dd></div>
            </dl>

            <div className="actions">
              <button type="button" className="secondary" onClick={() => { setEditingCar(true); goTo(0); }}>Edit car</button>
              <button type="button" className="secondary" onClick={() => goTo(1)}>Edit coverage</button>
            </div>
          </>
        )}
        <div hidden={step !== 2} className="mt-5">
          <QuoteComparison reviewVisit={reviewVisit} selectionKey={JSON.stringify([car, coverage])} />
        </div>
      </section>
    </div>
  );
}

function liabilityAmounts(limits: string) {
  return limits.split("/").map((limit) => "$" + (Number(limit) * 1000).toLocaleString("en-US"));
}

function formatDeductible(value: string) {
  return value === "none" ? "No coverage" : `$${Number(value).toLocaleString("en-US")}`;
}

function Deductible({ kind, label, help, value, change }: {
  kind: "collision" | "comprehensive";
  label: string;
  help: string;
  value: string;
  change: (value: string) => void;
}) {
  return (
    <div className="grid content-start gap-1.5">
      <label htmlFor={kind}>{label}</label>
      <select id={kind} required aria-describedby={kind + "-help"} value={value} onChange={(e) => change(e.target.value)}>
        <option value="">Choose a deductible</option>
        {deductibleOptions.map((option) => <option key={option} value={option}>{formatDeductible(option)}</option>)}
        <option value="none">Skip {kind} coverage</option>
      </select>
      <small id={kind + "-help"}>{help}</small>
    </div>
  );
}
