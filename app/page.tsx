import QuoteFlow from "./quote-flow";

export default function Home() {
  return (
    <div className="shell">
      <header className="masthead">
        <span className="brand-mark" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" width="24" height="24">
            <path d="M4 17h16M5 12h10m-9-5h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </span>
        <span>CarInsurancer</span>
      </header>
      <main><QuoteFlow /></main>
    </div>
  );
}
