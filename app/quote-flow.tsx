"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";

const steps = ["Your car", "Your coverage", "Compare quotes"];
const descriptions = [
  "Start with the vehicle you want to insure.",
  "Choose the coverage settings you want to compare.",
  "Review premiums, policy terms, and coverage side by side.",
];
const liabilityOptions = ["50/100/50", "100/300/100", "250/500/100"];
const deductibleOptions = ["250", "500", "1000", "2000"];

export default function QuoteFlow() {
  const [step, setStep] = useState(0);
  const [car, setCar] = useState({ zip: "", year: "", make: "", model: "" });
  const [coverage, setCoverage] = useState({ liability: "", collision: "", comprehensive: "" });
  const heading = useRef<HTMLHeadingElement>(null);
  const moved = useRef(false);

  useEffect(() => {
    if (moved.current) heading.current?.focus();
  }, [step]);

  function goTo(next: number) {
    moved.current = true;
    setStep(next);
  }

  function advance(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    goTo(step + 1);
  }

  return (
    <div className="flow">
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
            <div className="fields grid gap-5 sm:grid-cols-2">
              <label>ZIP code<input autoComplete="postal-code" inputMode="numeric" pattern="[0-9]{5}" title="Enter a five-digit ZIP code" required value={car.zip} onChange={(e) => setCar({ ...car, zip: e.target.value })} /></label>
              <label>Model year<input inputMode="numeric" pattern="[0-9]{4}" title="Enter a four-digit model year" required value={car.year} onChange={(e) => setCar({ ...car, year: e.target.value })} /></label>
              <label>Make<input required pattern=".*\S.*" value={car.make} onChange={(e) => setCar({ ...car, make: e.target.value })} /></label>
              <label>Model<input required pattern=".*\S.*" value={car.model} onChange={(e) => setCar({ ...car, model: e.target.value })} /></label>
            </div>
            <div className="actions"><button className="primary" type="submit">Continue to coverage</button></div>
          </form>
        )}
        {step === 1 && (
          <form onSubmit={advance}>
            <div className="fields grid gap-5 sm:grid-cols-2">
              <label className="sm:col-span-2">Liability limits
                <select required aria-describedby="limit-help" value={coverage.liability} onChange={(e) => setCoverage({ ...coverage, liability: e.target.value })}>
                  <option value="">Choose limits</option>
                  {liabilityOptions.map((option) => <option key={option}>{option}</option>)}
                </select>
                <small id="limit-help">In thousands of dollars: injury per person, injury per accident, and property damage.</small>
              </label>
              <Deductible label="Collision deductible" value={coverage.collision} change={(collision) => setCoverage({ ...coverage, collision })} />
              <Deductible label="Comprehensive deductible" value={coverage.comprehensive} change={(comprehensive) => setCoverage({ ...coverage, comprehensive })} />
            </div>
            <div className="actions">
              <button type="button" className="secondary" onClick={() => goTo(0)}>Back</button>
              <button type="submit" className="primary">View comparison</button>
            </div>
          </form>
        )}
        {step === 2 && (
          <>
            <p className="selection">{car.year} {car.make.trim()} {car.model.trim()} <span>· ZIP {car.zip}</span></p>
            <dl className="comparison">
              <div><dt>Liability limits</dt><dd>{coverage.liability}</dd></div>
              <div><dt>Collision deductible</dt><dd>{formatDeductible(coverage.collision)}</dd></div>
              <div><dt>Comprehensive deductible</dt><dd>{formatDeductible(coverage.comprehensive)}</dd></div>
            </dl>
            <div className="empty">
              <h2>No quotes available</h2>
              <p>A live quote provider needs to be connected before prices and policy terms can appear here.</p>
            </div>
            <div className="actions"><button type="button" className="secondary" onClick={() => goTo(1)}>Edit coverage</button></div>
          </>
        )}
      </section>
    </div>
  );
}

function formatDeductible(value: string) {
  return value === "none" ? "No coverage" : `$${Number(value).toLocaleString("en-US")}`;
}

function Deductible({ label, value, change }: { label: string; value: string; change: (value: string) => void }) {
  return (
    <label>{label}
      <select required value={value} onChange={(e) => change(e.target.value)}>
        <option value="">Choose a deductible</option>
        {deductibleOptions.map((option) => <option key={option} value={option}>{formatDeductible(option)}</option>)}
        <option value="none">No coverage</option>
      </select>
    </label>
  );
}
