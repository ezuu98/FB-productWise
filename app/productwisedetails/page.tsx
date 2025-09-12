import type { Metadata } from "next";
import FreshBasketHeader from "@/components/freshbasket-header";
import { createServerSupabase } from "@/lib/supabase/server";
import ProductPickers from "@/components/product-pickers";

export const metadata: Metadata = {
  title: "FreshBasket — Live Inventory Tracking",
  description: "Live inventory tracking dashboard for ProductWise.",
};

export const dynamic = "force-dynamic";

function productLabel(row: Record<string, any>) {
  return row.name ?? row.product_name ?? row.title ?? row.sku ?? String(row.id ?? "Unknown");
}

function productCode(row: Record<string, any>) {
  return (
    row.barcode ?? row.bar_code ?? row.code ?? row.sku ?? row.ean ?? row.upc ?? row.product_code ?? null
  );
}

export default async function ProductWiseDetailsPage() {
  const supabase = createServerSupabase();
  const { data: products, error } = await supabase
    .from("inventory")
    .select("*")
    .order("name", { ascending: true })
    .limit(1000);

  const items = (products ?? []).map((p: any) => ({
    id: String(p.id ?? productLabel(p) ?? productCode(p) ?? Math.random()),
    label: productLabel(p),
    code: productCode(p),
  }));

  return (
    <main className="min-h-screen bg-white text-gray-900">
      <FreshBasketHeader />

      <section className="mx-auto w-full max-w-6xl px-6 py-8">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Live Inventory Tracking</h1>

        <div className="mt-6 w-full">
          <ProductPickers items={items} />
          {error && (
            <p className="mt-2 text-sm text-red-600">Failed to load products: {error.message}</p>
          )}
          {!error && products?.length === 0 && (
            <p className="mt-2 text-sm text-gray-600">No products found in inventory.</p>
          )}
        </div>

      </section>
    </main>
  );
}
