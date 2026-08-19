import { useState } from "react";
import { CITIES, type CityKey } from "@/lib/match-data";
import { track } from "@/lib/analytics";

export function SpeedCheck() {
  const [city, setCity] = useState<CityKey | null>(null);
  const picked = CITIES.find((c) => c.key === city);

  return (
    <div className="rounded-3xl border border-border bg-card p-5 shadow-[var(--shadow-card)] sm:p-6">
      <p className="text-[11px] font-bold uppercase tracking-widest text-accent">Speed check</p>
      <h3 className="mt-1 font-display text-xl font-extrabold leading-tight sm:text-2xl">
        Still waiting 45 minutes for your order?
      </h3>
      <p className="mt-1.5 text-sm text-muted-foreground">
        Pick your city and see how long the same order actually takes on Zepto.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {CITIES.map((c) => (
          <button
            key={c.key}
            onClick={() => {
              setCity(c.key);
              track("speedcheck_city_selected", { city: c.key, eta_minutes: c.eta });
            }}
            aria-pressed={city === c.key}
            className={`rounded-full border px-3.5 py-2 text-[13px] font-semibold transition active:scale-[0.97] ${
              city === c.key
                ? "border-accent bg-secondary text-secondary-foreground"
                : "border-border bg-background text-muted-foreground"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="mt-5 space-y-3">
        <Bar label="Usual grocery delivery" minutes={45} width="100%" tone="muted" />
        <Bar
          label={picked ? `Zepto in ${picked.label}` : "Zepto near you"}
          minutes={picked ? picked.eta : 10}
          width={`${((picked ? picked.eta : 10) / 45) * 100}%`}
          tone="cta"
        />
      </div>

      {picked && (
        <p className="mt-4 rounded-2xl bg-muted p-3 text-[13px] font-semibold text-secondary-foreground">
          {45 - picked.eta} minutes back in your day, from {picked.stores} dark stores stocked
          around {picked.label}.
        </p>
      )}
    </div>
  );
}

function Bar({
  label,
  minutes,
  width,
  tone,
}: {
  label: string;
  minutes: number;
  width: string;
  tone: "muted" | "cta";
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between text-[12px] font-semibold">
        <span className={tone === "cta" ? "text-foreground" : "text-muted-foreground"}>{label}</span>
        <span className={tone === "cta" ? "text-accent" : "text-muted-foreground"}>
          {minutes} min
        </span>
      </div>
      <div className="mt-1.5 h-3 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width,
            background: tone === "cta" ? "var(--gradient-cta)" : "var(--muted-foreground)",
            opacity: tone === "cta" ? 1 : 0.35,
          }}
        />
      </div>
    </div>
  );
}
