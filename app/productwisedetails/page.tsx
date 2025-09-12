import type { Metadata } from "next";
import FreshBasketHeader from "@/components/freshbasket-header";
import { createServerSupabase } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "FreshBasket — Live Inventory Tracking",
  description: "Live inventory tracking dashboard for ProductWise.",
};

export const dynamic = "force-dynamic";

function productLabel(row: Record<string, any>) {
  return (
    row.name ?? row.product_name ?? row.title ?? row.sku ?? String(row.id ?? "Unknown")
  );
}

export default async function ProductWiseDetailsPage() {
  const supabase = createServerSupabase();
  const { data: products, error } = await supabase
    .from("inventory")
    .select("*")
    .order("name", { ascending: true })
    .limit(1000);

  return (
    <main className="min-h-screen bg-white text-gray-900">
      <FreshBasketHeader />

      <section className="mx-auto w-full max-w-6xl px-6 py-8">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Live Inventory Tracking</h1>

        <div className="mt-6 w-full max-w-md">
          <label htmlFor="product-select" className="block text-sm font-medium text-gray-700">
            Products
          </label>
          <select
            id="product-select"
            className="mt-2 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-gray-400 focus:outline-none"
            defaultValue=""
          >
            <option value="" disabled>
              Select a product
            </option>
            {products?.map((p: any) => (
              <option key={p.id ?? productLabel(p)} value={p.id ?? productLabel(p)}>
                {productLabel(p)}
              </option>
            ))}
          </select>
          {error && (
            <p className="mt-2 text-sm text-red-600">Failed to load products: {error.message}</p>
          )}
          {!error && products?.length === 0 && (
            <p className="mt-2 text-sm text-gray-600">No products found in inventory.</p>
          )}
        </div>

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
