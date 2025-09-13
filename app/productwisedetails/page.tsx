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

async function fetchAllInventory(supabase: ReturnType<typeof createServerSupabase>) {
  const pageSize = 1000;
  const all: any[] = [];
  let offset = 0;
  let lastError: any = null;

  while (true) {
    const { data, error } = await supabase
      .from("inventory")
      .select("*")
      .order("name", { ascending: true })
      .range(offset, offset + pageSize - 1);

    if (error) {
      lastError = error;
      break;
    }

    if (data && data.length) {
      all.push(...data);
    }

    if (!data || data.length < pageSize) break;
    offset += pageSize;
    if (offset > 100000) break;
  }

  return { data: all, error: lastError } as { data: any[]; error: any };
}

async function fetchCategories(
  supabase: ReturnType<typeof createServerSupabase>,
  ids: Array<string | number>
) {
  const unique = Array.from(new Set(ids.filter((v) => v !== null && v !== undefined)));
  const chunkSize = 500;
  const map = new Map<string, string>();

  for (let i = 0; i < unique.length; i += chunkSize) {
    const chunk = unique.slice(i, i + chunkSize);
    const numbers = chunk
      .map((v) => (typeof v === "number" ? v : Number(v)))
      .filter((v) => Number.isFinite(v));
    const strings = chunk.map((v) => String(v));

    // Try numeric match first
    if (numbers.length) {
      const { data } = await supabase
        .from("categories")
        .select("categ_id, complete_name")
        .in("categ_id", numbers as any);
      data?.forEach((row: any) => map.set(String(row.categ_id), row.complete_name));
    }

    // Also try string match in case the column is text
    if (strings.length) {
      const { data } = await supabase
        .from("categories")
        .select("categ_id, complete_name")
        .in("categ_id", strings as any);
      data?.forEach((row: any) => map.set(String(row.categ_id), row.complete_name));
    }
  }

  return map;
}

export default async function ProductWiseDetailsPage() {
  const supabase = createServerSupabase();
  const { data: products, error } = await fetchAllInventory(supabase);

  const categoryIds = (products ?? []).map((p: any) => p.category_id);
  const categoryMap = await fetchCategories(supabase, categoryIds);

  const items = (products ?? []).map((p: any) => ({
    id: String(p.id ?? productLabel(p) ?? productCode(p) ?? Math.random()),
    label: productLabel(p),
    code: productCode(p),
    category:
      categoryMap.get(String(p.category_id)) ??
      p.complete_name ??
      p.category_name ??
      p.category ??
      p.categ_name ??
      p.category_full_name ??
      null,
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
