import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/strategy")({
  head: () => ({
    meta: [
      { title: "Strategy: Zepto 10-Minute Match widget | First-time visitor to buyer" },
      {
        name: "description",
        content:
          "One-page strategy for the Zepto 10-Minute Match widget: the widget chosen, the tradeoff against a homepage banner, the user journey, and expected impact on first-time add-to-cart rate.",
      },
      { property: "og:title", content: "Strategy: Zepto 10-Minute Match widget" },
      {
        property: "og:description",
        content:
          "Why a 60-second personalised basket builder beats a generic homepage banner for lifting first-time add-to-cart rate by 15%.",
      },
    ],
  }),
  component: Strategy,
});

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-7">
      <h2 className="font-display text-lg font-extrabold text-foreground">{title}</h2>
      <div className="mt-2 space-y-2 text-[13.5px] leading-relaxed text-muted-foreground">
        {children}
      </div>
    </section>
  );
}

function Strategy() {
  return (
    <main className="min-h-screen bg-background font-sans">
      <div className="mx-auto w-full max-w-md px-4 pb-14 pt-6">
        <Link to="/" className="text-[12px] font-semibold text-accent underline">
          ← Back to the widget
        </Link>
        <p className="mt-5 text-[11px] font-bold uppercase tracking-widest text-accent">
          Strategy one-pager
        </p>
        <h1 className="mt-1 font-display text-[27px] font-extrabold leading-tight text-foreground">
          Zepto 10-Minute Match
        </h1>
        <p className="mt-2 text-[13.5px] text-muted-foreground">
          A 60-second, 4-question widget on mobile web that ends in a pre-filled basket and a single
          add-to-cart tap.
        </p>

        <Section title="1. The widget chosen">
          <p>
            Four taps: city, how you shop today, what you run out of most (up to 3), and top-up trips
            per week. Output is a personalised starter basket with real pack sizes, prices under MRP,
            the city's actual ETA, and the time saved per month versus store trips.
          </p>
          <p>
            <strong className="text-foreground">CTA:</strong> "Add basket to cart · pay ₹X". The exact
            action: all matched SKUs are written to the mobile-web cart, the first-order discount and
            free delivery are applied, and the visitor lands on the cart-confirmed screen with
            checkout as the only next step. No app download, no login before value.
          </p>
        </Section>

        <Section title="2. Why this widget">
          <p>
            The drop-off is not awareness, it is relevance: a new visitor cannot tell if a 10-minute
            service fits their own habits, and an empty category grid asks them to do the work of
            proving it. The widget does that work in four taps and hands back a basket instead of a
            claim, so the first add-to-cart becomes an acceptance rather than a decision.
          </p>
        </Section>

        <Section title="3. Tradeoff: what we did not build">
          <p>
            <strong className="text-foreground">Option A — homepage "10 min or free" banner.</strong>{" "}
            Cheap, but it is a claim to a skeptical Instamart/BigBasket user, and it still drops them
            into an empty cart. No personalisation, no basket, no measurable intent signal.
          </p>
          <p>
            <strong className="text-foreground">Option B — speed/ETA comparison calculator.</strong>{" "}
            Interesting, but it argues about minutes rather than moving the visitor toward a purchase,
            and it ends in a stat, not a cart. Competitor-comparison framing also invites rebuttal.
          </p>
          <p>
            The Match widget wins because its output <em>is</em> the conversion event the objective
            measures. Every answer maps to SKUs, so finishing the widget and adding to cart are the
            same tap.
          </p>
        </Section>

        <Section title="4. Expected user journey">
          <p>
            Ad or search → mobile web landing → 4 questions (~45 s) → match screen with basket, ETA,
            savings → "Add basket to cart" → cart confirmed with ₹ off → address → first order.
          </p>
        </Section>

        <Section title="5. Feasibility">
          <p>
            Static-rendered React, no images or fonts blocking first paint, all basket logic computed
            client-side from a small local dataset, zero network calls after load. Interaction is
            instant and first render lands well inside 3 s on standard 4G. Live in the 6 full-coverage
            metros only; city options carry each metro's own ETA and store count.
          </p>
        </Section>

        <Section title="6. Outcome and measurement">
          <p>
            Target: +15% add-to-cart rate among first-time visitors in one quarter. Tracked as widget
            start rate, completion rate, add-to-cart per completion, and first-order conversion, split
            against the current homepage as control. The answers double as a first-party habit profile
            for the next session's homepage and reorder prompts.
          </p>
        </Section>
      </div>
    </main>
  );
}