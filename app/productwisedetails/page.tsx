import type { Metadata } from "next";
import FreshBasketHeader from "@/components/freshbasket-header";

export const metadata: Metadata = {
  title: "FreshBasket — Live Inventory Tracking",
  description: "Live inventory tracking dashboard for ProductWise.",
};

export default function ProductWiseDetailsPage() {
  return (
    <main className="min-h-screen bg-white text-gray-900">
      <FreshBasketHeader />

      <section className="mx-auto w-full max-w-6xl px-6 py-8">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Live Inventory Tracking</h1>

        <div className="mt-24 flex flex-col items-center justify-center text-center" aria-busy="true" aria-live="polite">
          <span
            className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-gray-400"
            aria-hidden="true"
          />
          <p className="mt-6 text-gray-700">Loading inventory data...</p>
          <p className="mt-2 text-sm text-gray-500">This may take a few moments for large datasets</p>
        </div>
      </section>
    </main>
  );
}
