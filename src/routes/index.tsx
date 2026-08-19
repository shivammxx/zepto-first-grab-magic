import { createFileRoute } from "@tanstack/react-router";
import { LandingPage } from "@/components/landing/LandingPage";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Zepto | Groceries delivered in 10 minutes" },
      {
        name: "description",
        content:
          "Check your real delivery ETA by pincode, see how Zepto's dark-store network pulls off 10-minute delivery, and why it beats the usual 45-minute wait.",
      },
      { property: "og:title", content: "Zepto | Groceries delivered in 10 minutes" },
      {
        property: "og:description",
        content:
          "Still waiting 45 minutes for your order? Check your pincode and see how fast Zepto actually delivers.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return <LandingPage />;
}
