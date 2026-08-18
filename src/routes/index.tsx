import { createFileRoute } from "@tanstack/react-router";
import { MatchWidget } from "@/components/MatchWidget";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Zepto 10-Minute Match | Build your first basket in 60 seconds" },
      {
        name: "description",
        content:
          "Answer 4 quick questions and see your personalised Zepto starter basket, real delivery ETA and first-order savings. Mobile web, no app download.",
      },
      { property: "og:title", content: "Zepto 10-Minute Match" },
      {
        property: "og:description",
        content:
          "A 60-second interactive widget that turns first-time Zepto visitors into an add-to-cart with a personalised starter basket.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main className="min-h-screen bg-background font-sans">
      <MatchWidget />
    </main>
  );
}
