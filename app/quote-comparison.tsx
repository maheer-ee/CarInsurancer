import { useState, type FormEvent } from "react";

const providers = [
  { name: "Progressive", url: "https://www.progressive.com/auto/" },
  { name: "GEICO", url: "https://www.geico.com/auto-insurance/" },
  { name: "State Farm", url: "https://www.statefarm.com/insurance/auto" },
];

type Quote = { provider: string; premium: number; term: string; matches: boolean; selectionKey: string };
const dollars = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

export default function QuoteComparison({ selectionKey, reviewVisit }: { selectionKey: string; reviewVisit: number }) {
  const [quotes, setQuotes] = useState<Quote[]>([]);

  const [provider, setProvider] = useState("");
  const [feedback, setFeedback] = useState<{ visit: number; message: string }>();
  const [rechecking, setRechecking] = useState<{ provider: string; visit: number }>();

  function announce(message: string) {
    setFeedback({ visit: reviewVisit, message });
  }

  function confirmCoverage(provider: string) {
    setQuotes((current) => current.map((quote) =>
      quote.provider === provider ? { ...quote, selectionKey, matches: true } : quote,
    ));
    setRechecking(undefined);
    announce(provider + " coverage confirmed.");
  }
  const replacing = quotes.some((entry) => entry.provider === provider);

  function addQuote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const provider = String(data.get("provider"));
    const premium = Number(data.get("premium"));
    const term = String(data.get("term"));
    if (!providers.some(({ name }) => name === provider) ||
        !Number.isFinite(premium) || premium <= 0 || !["6", "12"].includes(term)) return;

    const quote = { provider, premium, term, matches: data.has("matches"), selectionKey };
    setQuotes((current) => [...current.filter((entry) => entry.provider !== provider), quote]);
    form.reset();
    setProvider("");
    announce(provider + (replacing ? " quote replaced." : " quote added."));
  }

  return (
    <section className="empty" aria-labelledby="provider-title">
      <h2 id="provider-title">Compare insurer quotes</h2>
      <p role="status">{feedback?.visit === reviewVisit ? feedback.message : ""}</p>
      {quotes.length > 0 && (
        <ul className="mt-5 divide-y divide-[var(--line)] border-t border-[var(--line)]" aria-label="Entered quotes">
          {quotes.map(({ provider, premium, term, matches, selectionKey: quoteSelection }) => (
            <li key={provider} className="flex flex-wrap items-center justify-between gap-2 py-3">
              <div>
                <strong>{provider}</strong>
                <p>{dollars.format(premium)} for {term} months · {dollars.format(premium / Number(term))}/mo equivalent</p>
                <small>{quoteSelection !== selectionKey ? "Needs recheck · Your selections changed" :
                  matches ? "Matches requested coverage" : "Coverage match unconfirmed"}</small>
              </div>
              {quoteSelection !== selectionKey && (
                rechecking?.provider === provider && rechecking.visit === reviewVisit ? (
                  <div className="basis-full rounded-lg border border-[var(--line)] p-3">
                    <p>Confirm that this quote covers the current vehicle and matches the coverage settings above. If the insurer changed the price or term, replace the quote below.</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <button className="primary" type="button" onClick={() => confirmCoverage(provider)}>Confirm coverage</button>
                      <button className="secondary" type="button" onClick={() => setRechecking(undefined)}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <button className="secondary" type="button" onClick={() => setRechecking({ provider, visit: reviewVisit })}>Recheck quote</button>
                )
              )}
              <button className="secondary" type="button" aria-label={"Remove " + provider + " quote"}
                onClick={() => {
                  setQuotes((current) => current.filter((entry) => entry.provider !== provider));
                  announce(provider + " quote removed.");
                }}>Remove</button>
            </li>
          ))}
        </ul>
      )}
      <h3 className="mt-4 font-semibold">Get a quote</h3>
      <p>Request a quote using the coverage settings above.</p>
      <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
        {providers.map(({ name, url }) => (
          <li key={name}><a className="font-semibold underline underline-offset-4" href={url} target="_blank" rel="noopener noreferrer">{name}<span className="sr-only"> (opens in a new tab)</span></a></li>
        ))}
      </ul>
      <form className="mt-5 grid gap-4 border-t border-[var(--line)] pt-4" onSubmit={addQuote}>
        <h3 className="font-semibold">Enter a quote you already have</h3>
        <label>Insurer
          <select name="provider" required value={provider} onChange={(event) => setProvider(event.target.value)}>
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
        <small>Quotes are kept until you reload or close this page. Adding a quote for the same insurer replaces its previous entry.</small>
        <button className="primary justify-self-start" type="submit">{replacing ? "Replace quote" : "Add quote"}</button>
      </form>
    </section>
  );
}
