import { useState } from "react";
import { z } from "zod";
import { track } from "@/lib/analytics";

const addressSchema = z.object({
  phone: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, { message: "Enter a valid 10-digit Indian mobile number" }),
  name: z.string().trim().min(2, { message: "Enter your name" }).max(60),
  flat: z.string().trim().min(2, { message: "Flat / house number is required" }).max(120),
  area: z.string().trim().min(3, { message: "Area / street is required" }).max(160),
  landmark: z.string().trim().max(120).optional(),
  pincode: z.string().trim().regex(/^\d{6}$/, { message: "Enter a valid 6-digit pincode" }),
  label: z.enum(["home", "work", "other"]),
});

export type DeliveryDetails = z.infer<typeof addressSchema>;

type Errors = { [K in keyof DeliveryDetails]?: string | undefined };

export function CheckoutForm({
  eta,
  payable,
  city,
  onConfirmed,
  onBack,
}: {
  eta: number;
  payable: number;
  city: string | null;
  onConfirmed: (details: DeliveryDetails) => void;
  onBack: () => void;
}) {
  const [phase, setPhase] = useState<"phone" | "otp" | "address">("phone");
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [form, setForm] = useState<DeliveryDetails>({
    phone: "",
    name: "",
    flat: "",
    area: "",
    landmark: "",
    pincode: "",
    label: "home",
  });

  const set = (key: keyof DeliveryDetails) => (value: string) =>
    setForm((f) => ({ ...f, [key]: value }) as DeliveryDetails);

  const sendOtp = () => {
    const parsed = addressSchema.shape.phone.safeParse(form.phone);
    if (!parsed.success) {
      setErrors({ phone: parsed.error.issues[0]?.message });
      return;
    }
    setErrors({});
    track("widget_cta_clicked", { step: "otp_requested", city });
    setPhase("otp");
  };

  const verifyOtp = () => {
    if (!/^\d{4}$/.test(otp.trim())) {
      setOtpError("Enter the 4-digit code");
      return;
    }
    setOtpError(null);
    track("widget_cta_clicked", { step: "phone_verified", city });
    setPhase("address");
  };

  const submit = () => {
    const parsed = addressSchema.safeParse(form);
    if (!parsed.success) {
      const next: Errors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof DeliveryDetails;
        if (!next[key]) next[key] = issue.message;
      }
      setErrors(next);
      return;
    }
    setErrors({});
    track("widget_cart_confirmed", { step: "address_saved", city, payable, eta_minutes: eta });
    onConfirmed(parsed.data);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 pt-6 duration-300">
      <p className="text-[11px] font-bold uppercase tracking-widest text-accent">
        {phase === "address" ? "Delivery address" : "Verify your number"}
      </p>
      <h2 className="mt-1 font-display text-[24px] font-extrabold leading-tight sm:text-[28px]">
        {phase === "address"
          ? `Where should we deliver in ${eta} minutes?`
          : "Login with your mobile number"}
      </h2>
      <p className="mt-1.5 text-sm text-muted-foreground">
        {phase === "address"
          ? "Saved for one-tap reorders. No app download needed."
          : "We use it to confirm the order and share live tracking."}
      </p>

      <div className="mt-5 rounded-3xl border border-border bg-card p-4 shadow-[var(--shadow-card)] sm:p-6">
        {phase === "phone" && (
          <>
            <Field label="Mobile number" error={errors.phone}>
              <div className="flex items-center gap-2">
                <span className="rounded-xl bg-muted px-3 py-3 text-sm font-semibold">+91</span>
                <input
                  inputMode="numeric"
                  maxLength={10}
                  value={form.phone}
                  onChange={(e) => set("phone")(e.target.value.replace(/\D/g, ""))}
                  placeholder="98765 43210"
                  className="min-w-0 flex-1 rounded-xl border border-border bg-background px-3 py-3 text-sm outline-none focus:border-accent"
                />
              </div>
            </Field>
            <Primary onClick={sendOtp}>Send OTP</Primary>
          </>
        )}

        {phase === "otp" && (
          <>
            <Field label={`4-digit code sent to +91 ${form.phone}`} error={otpError ?? undefined}>
              <input
                inputMode="numeric"
                maxLength={4}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="1234"
                className="w-full rounded-xl border border-border bg-background px-3 py-3 text-center font-display text-xl tracking-[0.5em] outline-none focus:border-accent"
              />
            </Field>
            <Primary onClick={verifyOtp}>Verify &amp; continue</Primary>
            <Ghost onClick={() => setPhase("phone")}>Change number</Ghost>
          </>
        )}

        {phase === "address" && (
          <>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Full name" error={errors.name}>
                <Input value={form.name} onChange={set("name")} placeholder="Aarav Sharma" />
              </Field>
              <Field label="Flat / house no." error={errors.flat}>
                <Input value={form.flat} onChange={set("flat")} placeholder="B-1204, Orchid Tower" />
              </Field>
              <Field label="Area / street" error={errors.area}>
                <Input value={form.area} onChange={set("area")} placeholder="Powai, Hiranandani" />
              </Field>
              <Field label="Landmark (optional)" error={errors.landmark}>
                <Input
                  value={form.landmark ?? ""}
                  onChange={set("landmark")}
                  placeholder="Near Galleria"
                />
              </Field>
              <Field label="Pincode" error={errors.pincode}>
                <Input
                  value={form.pincode}
                  onChange={(v) => set("pincode")(v.replace(/\D/g, ""))}
                  placeholder="400076"
                />
              </Field>
              <Field label="Save as">
                <div className="flex gap-2">
                  {(["home", "work", "other"] as const).map((l) => (
                    <button
                      key={l}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, label: l }))}
                      aria-pressed={form.label === l}
                      className={`flex-1 rounded-xl border px-3 py-3 text-[13px] font-semibold capitalize transition ${
                        form.label === l
                          ? "border-accent bg-secondary text-secondary-foreground"
                          : "border-border bg-background"
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </Field>
            </div>
            <Primary onClick={submit}>Confirm address · pay ₹{payable}</Primary>
          </>
        )}

        <Ghost onClick={onBack}>Back to basket</Ghost>
      </div>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string | undefined;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[12px] font-semibold text-muted-foreground">{label}</span>
      {children}
      {error && <span className="mt-1 block text-[11px] font-semibold text-destructive">{error}</span>}
    </label>
  );
}

function Input({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-xl border border-border bg-background px-3 py-3 text-sm outline-none focus:border-accent"
    />
  );
}

function Primary({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="mt-4 w-full rounded-2xl px-5 py-4 text-sm font-bold text-primary-foreground shadow-[var(--shadow-lift)] transition active:scale-[0.98]"
      style={{ background: "var(--gradient-cta)" }}
    >
      {children}
    </button>
  );
}

function Ghost({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="mx-auto mt-3 block text-[12px] font-semibold text-muted-foreground underline"
    >
      {children}
    </button>
  );
}
