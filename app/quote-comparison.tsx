import { useState, type FormEvent } from "react";

const providers = [
  { name: "Progressive", url: "https://www.progressive.com/auto/" },
  { name: "GEICO", url: "https://www.geico.com/auto-insurance/" },
  { name: "State Farm", url: "https://www.statefarm.com/insurance/auto" },
];

type Quote = { provider: string; premium: number; term: string; matches: boolean };
const dollars = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

export default function QuoteComparison() {
  const [quotes, setQuotes] = useState<Quote[]>([]);

  function addQuote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const provider = String(data.get("provider"));
    const premium = Number(data.get("premium"));
    const term = String(data.get("term"));
    if (!providers.some(({ name }) => name === provider) ||
        !Number.isFinite(premium) || premium <= 0 || !["6", "12"].includes(term)) return;

    const quote = { provider, premium, term, matches: data.has("matches") };
    setQuotes((current) => [...current.filter((entry) => entry.provider !== provider), quote]);
    form.reset();
  }

  return (
    <section className="empty" aria-labelledby="provider-title">
      <h2 id="provider-title">Compare insurer quotes</h2>
      <p>Get a quote from an insurer, then enter the total premium for the full policy term. Use the same coverage when you can.</p>
      <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
        {providers.map(({ name, url }) => (
          <li key={name}><a className="font-semibold underline underline-offset-4" href={url} target="_blank" rel="noopener noreferrer">{name}<span className="sr-only"> (opens in a new tab)</span></a></li>
        ))}
      </ul>
      <form className="mt-5 grid gap-4" onSubmit={addQuote}>
        <label>Insurer
          <select name="provider" required defaultValue="">
            <option value="">Choose an insurer</option>
            {providers.map(({ name }) => <option key={name}>{name}</option>)}
          </select>
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label>Total premium (USD)<input name="premium" type="number" min="0.01" step="0.01" inputMode="decimal" required /></label>
          <label>Policy term
            <select name="term" required defaultValue="">
              <option value="">Choose a term</option>
              <option value="6">6 months</option>
              <option value="12">12 months</option>
            </select>
          </label>
        </div>
        <label className="!flex items-start gap-2">
          <input className="!mt-1 !h-4 !min-h-0 !w-4 shrink-0" type="checkbox" name="matches" />
          The quote matches the coverage settings above
        </label>
        <small>Adding another quote for the same insurer replaces its previous entry.</small>
        <button className="primary justify-self-start" type="submit">Add quote</button>
      </form>
      {quotes.length > 0 && (
        <ul className="mt-5 divide-y divide-[var(--line)] border-t border-[var(--line)]" aria-label="Entered quotes">
          {quotes.map(({ provider, premium, term, matches }) => (
            <li key={provider} className="flex flex-wrap items-center justify-between gap-2 py-3">
              <div>
                <strong>{provider}</strong>
                <p>{dollars.format(premium)} for {term} months · {dollars.format(premium / Number(term))}/mo equivalent</p>
                <small>{matches ? "Matches requested coverage" : "Coverage match unconfirmed"}</small>
              </div>
              <button className="secondary" type="button" aria-label={"Remove " + provider + " quote"}
                onClick={() => setQuotes((current) => current.filter((entry) => entry.provider !== provider))}>Remove</button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
