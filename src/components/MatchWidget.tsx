import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { markVisited, track } from "@/lib/analytics";
import { CheckoutForm, type DeliveryDetails } from "@/components/CheckoutForm";
import {
  CITIES,
  CURRENT_APPS,
  NEEDS,
  buildMatch,
  type Answers,
  type CityKey,
  type NeedKey,
} from "@/lib/match-data";

const TOTAL_STEPS = 4;

export function MatchWidget() {
  const [step, setStep] = useState(0);
  const [stage, setStage] = useState<"quiz" | "added" | "checkout" | "placed">("quiz");
  const [details, setDetails] = useState<DeliveryDetails | null>(null);
  const added = stage !== "quiz";
  const [answers, setAnswers] = useState<Answers>({
    city: null,
    app: null,
    needs: [],
    tripsPerWeek: 3,
  });

  const result = useMemo(() => buildMatch(answers), [answers]);
  const progress = Math.min(step, TOTAL_STEPS) / TOTAL_STEPS;

  const startedAt = useRef<number>(Date.now());

  useEffect(() => {
    startedAt.current = Date.now();
    track("widget_start", { entry_step: "city" });
    markVisited();
  }, []);

  useEffect(() => {
    if (step !== 4) return;
    track("widget_estimate_shown", {
      city: answers.city,
      current_app: answers.app,
      needs: answers.needs.join(","),
      trips_per_week: answers.tripsPerWeek,
      eta_minutes: result.eta,
      basket_items: result.items.length,
      basket_total: result.total,
      payable: result.payable,
      seconds_to_estimate: Math.round((Date.now() - startedAt.current) / 1000),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const toggleNeed = (key: NeedKey) =>
    setAnswers((a) => ({
      ...a,
      needs: a.needs.includes(key)
        ? a.needs.filter((n) => n !== key)
        : a.needs.length < 3
          ? [...a.needs, key]
          : a.needs,
    }));

  return (
    <div className="mx-auto w-full max-w-md px-4 pb-10 sm:max-w-2xl sm:px-6 lg:max-w-5xl lg:px-8">
      <div className="sticky top-0 z-10 -mx-4 bg-background/85 px-4 pb-3 pt-4 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="flex items-center justify-between">
          <span className="font-display text-lg font-extrabold tracking-tight text-primary sm:text-xl">
            zepto
          </span>
          <span className="rounded-full bg-secondary px-3 py-1 text-[11px] font-semibold text-secondary-foreground">
            10-min match · 60 sec
          </span>
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.max(progress, 0.06) * 100}%`, background: "var(--gradient-cta)" }}
          />
        </div>
      </div>

      {step === 0 && (
        <StepShell
          eyebrow="Question 1 of 4"
          title="Where are you ordering from?"
          sub="We only show what's actually stocked near you."
        >
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {CITIES.map((c) => (
              <Choice
                key={c.key}
                selected={answers.city === c.key}
                onClick={() => {
                  setAnswers((a) => ({ ...a, city: c.key as CityKey }));
                  track("widget_city_selected", { city: c.key, eta_minutes: c.eta, stores: c.stores });
                  setStep(1);
                }}
              >
                <span className="font-semibold">{c.label}</span>
                <span className="mt-0.5 block text-[11px] text-muted-foreground">
                  ~{c.eta} min · {c.stores} stores
                </span>
              </Choice>
            ))}
          </div>
        </StepShell>
      )}

      {step === 1 && (
        <StepShell
          eyebrow="Question 2 of 4"
          title="How do you shop for groceries today?"
          sub="So we can compare like for like."
        >
          <div className="grid gap-2 sm:grid-cols-2">
            {CURRENT_APPS.map((app) => (
              <Choice
                key={app.key}
                selected={answers.app === app.key}
                onClick={() => {
                  setAnswers((a) => ({ ...a, app: app.key }));
                  track("widget_current_app_selected", { current_app: app.key });
                  setStep(2);
                }}
              >
                <span className="font-semibold">{app.label}</span>
              </Choice>
            ))}
          </div>
          <BackLink onClick={() => setStep(0)} />
        </StepShell>
      )}

      {step === 2 && (
        <StepShell
          eyebrow="Question 3 of 4"
          title="What do you run out of most?"
          sub="Pick up to 3. This builds your basket."
        >
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {NEEDS.map((n) => (
              <Choice
                key={n.key}
                selected={answers.needs.includes(n.key)}
                onClick={() => toggleNeed(n.key)}
              >
                <span className="text-lg">{n.emoji}</span>
                <span className="mt-1 block text-[13px] font-semibold leading-tight">{n.label}</span>
              </Choice>
            ))}
          </div>
          <PrimaryButton
            disabled={answers.needs.length === 0}
            onClick={() => {
              track("widget_needs_captured", {
                needs: answers.needs.join(","),
                needs_count: answers.needs.length,
              });
              setStep(3);
            }}
          >
            {answers.needs.length === 0
              ? "Pick at least one"
              : `Continue with ${answers.needs.length} pick${answers.needs.length > 1 ? "s" : ""}`}
          </PrimaryButton>
          <BackLink onClick={() => setStep(1)} />
        </StepShell>
      )}

      {step === 3 && (
        <StepShell
          eyebrow="Question 4 of 4"
          title="How many top-up trips a week?"
          sub="Quick store or app runs for one or two things."
        >
          <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
            <div className="text-center font-display text-4xl font-extrabold text-primary">
              {answers.tripsPerWeek}
              <span className="ml-1 text-sm font-semibold text-muted-foreground">/ week</span>
            </div>
            <input
              type="range"
              min={1}
              max={10}
              value={answers.tripsPerWeek}
              onChange={(e) =>
                setAnswers((a) => ({ ...a, tripsPerWeek: Number(e.target.value) }))
              }
              className="mt-4 h-2 w-full cursor-pointer appearance-none rounded-full bg-muted accent-accent"
              aria-label="Top-up trips per week"
            />
            <div className="mt-2 flex justify-between text-[11px] text-muted-foreground">
              <span>1</span>
              <span>10+</span>
            </div>
          </div>
          <PrimaryButton
            onClick={() => {
              track("widget_trips_captured", { trips_per_week: answers.tripsPerWeek });
              setStep(4);
            }}
          >
            See my 10-minute match
          </PrimaryButton>
          <BackLink onClick={() => setStep(2)} />
        </StepShell>
      )}

      {step === 4 && !added && (
        <div className="animate-in fade-in slide-in-from-bottom-2 pt-5 duration-300">
          <div
            className="rounded-3xl p-5 text-primary-foreground shadow-[var(--shadow-lift)]"
            style={{ background: "var(--gradient-hero)" }}
          >
            <p className="text-[11px] font-semibold uppercase tracking-widest opacity-80">
              Your match
            </p>
            <h2 className="mt-1 font-display text-2xl font-extrabold leading-tight">
              {result.eta} min to your door, {result.minutesSavedPerMonth} min saved a month
            </h2>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <Stat top={`${result.eta}m`} label="delivery ETA" />
              <Stat top={`₹${result.saved}`} label="under MRP" />
              <Stat top={`${result.stores}`} label="stores near you" />
            </div>
          </div>

          <div className="mt-4 rounded-3xl border border-border bg-card p-4 shadow-[var(--shadow-card)]">
            <div className="flex items-baseline justify-between">
              <h3 className="font-display text-base font-extrabold">Your starter basket</h3>
              <span className="text-[11px] text-muted-foreground">
                {result.items.length} items · in stock
              </span>
            </div>
            <ul className="mt-3 divide-y divide-border">
              {result.items.map((i) => (
                <li key={i.name} className="flex items-center gap-3 py-2.5">
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-secondary text-base">
                    {i.emoji}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-semibold">{i.name}</span>
                    <span className="block text-[11px] text-muted-foreground">{i.pack}</span>
                  </span>
                  <span className="text-right">
                    <span className="block text-[13px] font-bold">₹{i.price}</span>
                    <span className="block text-[11px] text-muted-foreground line-through">
                      ₹{i.mrp}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-3 space-y-1 rounded-2xl bg-muted p-3 text-[13px]">
              <Row label="Basket total" value={`₹${result.total}`} />
              <Row label="First-order discount" value={`− ₹${result.firstOrderOff}`} accent />
              <Row label="Delivery" value="FREE" accent />
              <div className="flex justify-between border-t border-border pt-2 font-bold">
                <span>You pay</span>
                <span>₹{result.payable}</span>
              </div>
            </div>
          </div>

          <div className="sticky bottom-3 mt-4">
            <PrimaryButton
              onClick={() => {
                track("widget_cta_clicked", {
                  city: answers.city,
                  basket_items: result.items.length,
                  payable: result.payable,
                  discount: result.firstOrderOff,
                });
                track("widget_cart_confirmed", {
                  city: answers.city,
                  basket_items: result.items.length,
                  basket_total: result.total,
                  payable: result.payable,
                  eta_minutes: result.eta,
                  seconds_to_cart: Math.round((Date.now() - startedAt.current) / 1000),
                });
                setStage("added");
              }}
            >
              Add basket to cart · pay ₹{result.payable}
            </PrimaryButton>
            <p className="mt-2 text-center text-[11px] text-muted-foreground">
              No app download. Checkout on this page.
            </p>
          </div>
          <button
            onClick={() => {
              track("widget_restarted", { from_step: step });
              setStep(0);
              setAnswers({ city: null, app: null, needs: [], tripsPerWeek: 3 });
              startedAt.current = Date.now();
            }}
            className="mx-auto mt-3 block text-[12px] font-semibold text-muted-foreground underline"
          >
            Start over
          </button>
        </div>
      )}

      {stage === "added" && (
        <div className="animate-in fade-in zoom-in-95 mx-auto max-w-md pt-10 text-center duration-300">
          <div className="mx-auto grid size-16 place-items-center rounded-full bg-success text-2xl text-success-foreground">
            ✓
          </div>
          <h2 className="mt-4 font-display text-2xl font-extrabold">
            {result.items.length} items in your cart
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            ₹{result.firstOrderOff} off applied. Arriving in about {result.eta} minutes once you
            confirm your address.
          </p>
          <div className="mt-6 space-y-2">
            <PrimaryButton onClick={() => setStage("checkout")}>
              Add address &amp; checkout · ₹{result.payable}
            </PrimaryButton>
            <button
              onClick={() => setStage("quiz")}
              className="w-full rounded-2xl border border-border bg-card px-5 py-3 text-sm font-semibold"
            >
              Back to basket
            </button>
          </div>
        </div>
      )}

      {stage === "checkout" && (
        <CheckoutForm
          eta={result.eta}
          payable={result.payable}
          city={answers.city}
          onBack={() => setStage("added")}
          onConfirmed={(d) => {
            setDetails(d);
            setStage("placed");
          }}
        />
      )}

      {stage === "placed" && (
        <div className="animate-in fade-in zoom-in-95 mx-auto max-w-md pt-10 text-center duration-300">
          <div className="mx-auto grid size-16 place-items-center rounded-full bg-success text-2xl text-success-foreground">
            ✓
          </div>
          <h2 className="mt-4 font-display text-2xl font-extrabold">
            Order placed · arriving in {result.eta} min
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            ₹{result.payable} paid on delivery. We&apos;ll text +91 {details?.phone} with live
            tracking.
          </p>
          <div className="mt-4 rounded-2xl border border-border bg-card p-4 text-left text-[13px]">
            <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
              {details?.label} address
            </p>
            <p className="mt-1 font-semibold">{details?.name}</p>
            <p className="text-muted-foreground">
              {details?.flat}, {details?.area}
              {details?.landmark ? `, ${details.landmark}` : ""} — {details?.pincode}
            </p>
          </div>
          <button
            onClick={() => setStage("added")}
            className="mt-4 w-full rounded-2xl border border-border bg-card px-5 py-3 text-sm font-semibold"
          >
            Edit address
          </button>
          <Link
            to="/strategy"
            className="mt-6 inline-block text-[12px] font-semibold text-accent underline"
          >
            Read the strategy behind this widget
          </Link>
        </div>
      )}

      {step < 4 && (
        <Link
          to="/strategy"
          className="mx-auto mt-8 block text-center text-[12px] font-semibold text-muted-foreground underline"
        >
          Strategy one-pager
        </Link>
      )}
    </div>
  );
}

function StepShell({
  eyebrow,
  title,
  sub,
  children,
}: {
  eyebrow: string;
  title: string;
  sub: string;
  children: React.ReactNode;
}) {
  return (
    <div className="animate-in fade-in slide-in-from-right-2 pt-6 duration-300">
      <p className="text-[11px] font-bold uppercase tracking-widest text-accent">{eyebrow}</p>
      <h1 className="mt-1 font-display text-[26px] font-extrabold leading-tight text-foreground">
        {title}
      </h1>
      <p className="mt-1.5 text-sm text-muted-foreground">{sub}</p>
      <div className="mt-5 space-y-3">{children}</div>
    </div>
  );
}

function Choice({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={selected}
      className={`rounded-2xl border px-4 py-3 text-left text-sm transition active:scale-[0.98] ${
        selected
          ? "border-accent bg-secondary text-secondary-foreground shadow-[var(--shadow-card)]"
          : "border-border bg-card text-card-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function PrimaryButton({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full rounded-2xl px-5 py-4 text-sm font-bold text-primary-foreground shadow-[var(--shadow-lift)] transition active:scale-[0.98] disabled:opacity-45"
      style={{ background: "var(--gradient-cta)" }}
    >
      {children}
    </button>
  );
}

function BackLink({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="mx-auto block text-[12px] font-semibold text-muted-foreground underline"
    >
      Back
    </button>
  );
}

function Stat({ top, label }: { top: string; label: string }) {
  return (
    <div className="rounded-2xl bg-primary-foreground/12 px-2 py-2.5">
      <div className="font-display text-lg font-extrabold">{top}</div>
      <div className="text-[10px] uppercase tracking-wide opacity-80">{label}</div>
    </div>
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={accent ? "font-semibold text-success" : "font-semibold"}>{value}</span>
    </div>
  );
}