export type CityKey = "mumbai" | "delhi" | "bengaluru" | "pune" | "hyderabad" | "chennai";

export const CITIES: { key: CityKey; label: string; eta: number; stores: number }[] = [
  { key: "mumbai", label: "Mumbai", eta: 8, stores: 61 },
  { key: "delhi", label: "Delhi NCR", eta: 9, stores: 74 },
  { key: "bengaluru", label: "Bengaluru", eta: 9, stores: 68 },
  { key: "pune", label: "Pune", eta: 10, stores: 42 },
  { key: "hyderabad", label: "Hyderabad", eta: 10, stores: 38 },
  { key: "chennai", label: "Chennai", eta: 11, stores: 33 },
];

export type NeedKey =
  | "milk"
  | "midnight"
  | "chai"
  | "fresh"
  | "care"
  | "party"
  | "meds";

export const NEEDS: { key: NeedKey; label: string; emoji: string }[] = [
  { key: "milk", label: "Milk & eggs run out", emoji: "🥛" },
  { key: "midnight", label: "Late-night snack cravings", emoji: "🍫" },
  { key: "chai", label: "Chai / coffee refills", emoji: "☕" },
  { key: "fresh", label: "Fresh veggies & fruit", emoji: "🥬" },
  { key: "care", label: "Baby / pet essentials", emoji: "🍼" },
  { key: "party", label: "Last-minute guests", emoji: "🧊" },
  { key: "meds", label: "Medicines & first aid", emoji: "💊" },
];

export type Item = { name: string; pack: string; price: number; mrp: number; emoji: string };

const BASKETS: Record<NeedKey, Item[]> = {
  milk: [
    { name: "Amul Taaza Milk", pack: "500 ml", price: 27, mrp: 30, emoji: "🥛" },
    { name: "Farm Eggs", pack: "6 pcs", price: 62, mrp: 78, emoji: "🥚" },
  ],
  midnight: [
    { name: "Dairy Milk Silk", pack: "60 g", price: 78, mrp: 90, emoji: "🍫" },
    { name: "Lay's Magic Masala", pack: "52 g", price: 18, mrp: 20, emoji: "🥔" },
  ],
  chai: [
    { name: "Tata Tea Premium", pack: "250 g", price: 132, mrp: 155, emoji: "🍵" },
    { name: "Sugar", pack: "1 kg", price: 54, mrp: 62, emoji: "🧂" },
  ],
  fresh: [
    { name: "Tomatoes", pack: "500 g", price: 24, mrp: 32, emoji: "🍅" },
    { name: "Bananas", pack: "6 pcs", price: 38, mrp: 48, emoji: "🍌" },
  ],
  care: [
    { name: "Pampers Pants M", pack: "9 pcs", price: 199, mrp: 245, emoji: "🍼" },
    { name: "Pedigree Chicken", pack: "400 g", price: 109, mrp: 130, emoji: "🐕" },
  ],
  party: [
    { name: "Ice Cubes", pack: "1 kg", price: 45, mrp: 55, emoji: "🧊" },
    { name: "Coca-Cola", pack: "750 ml", price: 40, mrp: 45, emoji: "🥤" },
  ],
  meds: [
    { name: "Dolo 650", pack: "15 tabs", price: 32, mrp: 34, emoji: "💊" },
    { name: "Band-Aid", pack: "10 strips", price: 45, mrp: 52, emoji: "🩹" },
  ],
};

export const CURRENT_APPS = [
  { key: "instamart", label: "Swiggy Instamart" },
  { key: "blinkit", label: "Blinkit" },
  { key: "bigbasket", label: "BigBasket" },
  { key: "store", label: "Kirana / store trips" },
] as const;

export type Answers = {
  city: CityKey | null;
  app: string | null;
  needs: NeedKey[];
  tripsPerWeek: number;
};

export type MatchResult = {
  items: Item[];
  total: number;
  mrpTotal: number;
  saved: number;
  eta: number;
  stores: number;
  minutesSavedPerMonth: number;
  firstOrderOff: number;
  payable: number;
};

export function buildMatch(a: Answers): MatchResult {
  const city = CITIES.find((c) => c.key === a.city) ?? CITIES[0]!;
  const needs = a.needs.length ? a.needs : (["milk", "midnight"] as NeedKey[]);
  const items = needs.flatMap((n) => BASKETS[n]).slice(0, 6);
  const total = items.reduce((s, i) => s + i.price, 0);
  const mrpTotal = items.reduce((s, i) => s + i.mrp, 0);
  const firstOrderOff = Math.min(100, Math.round(total * 0.3));
  return {
    items,
    total,
    mrpTotal,
    saved: mrpTotal - total,
    eta: city.eta,
    stores: city.stores,
    // a store trip averages ~22 min door-to-door in metro traffic
    minutesSavedPerMonth: Math.round(a.tripsPerWeek * 4 * (22 - city.eta)),
    firstOrderOff,
    payable: total - firstOrderOff,
  };
}