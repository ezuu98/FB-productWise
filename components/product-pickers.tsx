"use client";

import { useMemo, useState } from "react";

type Item = { id: string; label: string; code?: string | null; category?: string | null };

type Warehouse = { id: number; display_name: string };

type Props = {
  items: Item[];
  warehouses?: Warehouse[];
};

type Option = { value: string; label: string };

function ChipMultiSelect({
  id,
  label,
  options,
  selected,
  onChange,
}: {
  id: string;
  label: string;
  options: Option[];
  selected: string[];
  onChange: (values: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const selectedSet = useMemo(() => new Set(selected), [selected]);
  const selectedOptions = useMemo(
    () => selected.map((v) => options.find((o) => o.value === v)).filter(Boolean) as Option[],
    [selected, options]
  );

  const toggle = (val: string) => {
    if (selectedSet.has(val)) {
      onChange(selected.filter((v) => v !== val));
    } else {
      onChange([...selected, val]);
    }
  };

  const remove = (val: string) => onChange(selected.filter((v) => v !== val));

  return (
    <div
      className="relative"
      onFocus={() => setOpen(true)}
      onBlur={(e) => {
        const rt = e.relatedTarget as Node | null;
        if (!rt || !e.currentTarget.contains(rt)) setOpen(false);
      }}
    >
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <button
        id={id}
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="mt-2 flex w-full min-h-[42px] flex-wrap items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-left text-gray-900 shadow-sm focus:border-gray-400 focus:outline-none"
      >
        {selectedOptions.length === 0 ? (
          <span className="text-sm text-gray-500">Select...</span>
        ) : (
          selectedOptions.map((opt) => (
            <span
              key={opt.value}
              className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-800"
            >
              {opt.label}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  remove(opt.value);
                }}
                className="ml-1 rounded-full p-0.5 text-gray-500 hover:bg-gray-200 hover:text-gray-700"
                aria-label={`Remove ${opt.label}`}
              >
                ×
              </button>
            </span>
          ))
        )}
        <span className="ml-auto text-gray-500">▾</span>
      </button>
      {open ? (
        <ul
          className="absolute z-10 mt-1 max-h-64 w-full overflow-auto rounded-md border border-gray-200 bg-white p-1 shadow-lg"
          role="listbox"
          aria-multiselectable
          onMouseDown={(e) => e.preventDefault()}
        >
          {options.map((opt) => (
            <li key={opt.value}>
              <label className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 text-sm hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={selectedSet.has(opt.value)}
                  onChange={() => toggle(opt.value)}
                  className="h-4 w-4 rounded border-gray-300 text-gray-700 focus:ring-gray-400"
                />
                <span className="text-gray-800">{opt.label}</span>
              </label>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export default function ProductPickers({ items, warehouses = [] }: Props) {
  const [qName, setQName] = useState("");
  const [qCode, setQCode] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [isNameOpen, setIsNameOpen] = useState(false);
  const [isCodeOpen, setIsCodeOpen] = useState(false);
  const [selectedWarehouses, setSelectedWarehouses] = useState<string[]>([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedMovements, setSelectedMovements] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<Record<string, Record<string, number>> | null>(null);

  const movementOptions: Option[] = [
    { label: "Purchases", value: "purchase" },
    { label: "Purchase Returns", value: "purchase_return" },
    { label: "Sales", value: "sales" },
    { label: "Sales Returns", value: "sales_returns" },
    { label: "Transfer In", value: "transfer_in" },
    { label: "Transfer Out", value: "transfer_out" },
    { label: "Manufacturings", value: "manufacturing" },
    { label: "Wastages", value: "wastages" },
    { label: "Consumption", value: "consumption" },
  ];

  const warehouseOptions: Option[] = useMemo(
    () => warehouses.map((w) => ({ value: String(w.id), label: w.display_name })),
    [warehouses]
  );

  const norm = (s: string) => s.normalize("NFKD").toLowerCase();

  const namePool = useMemo(() => {
    const q = norm(qName.trim());
    return q ? items.filter((i) => norm(i.label).startsWith(q)) : items;
  }, [items, qName]);

  const codePool = useMemo(() => {
    const q = norm(qCode.trim());
    return q
      ? items.filter((i) => norm(i.code ?? "").startsWith(q))
      : items.filter((i) => (i.code ?? "") !== "");
  }, [items, qCode]);

  const nameSize = useMemo(() => Math.min(10, Math.max(6, namePool.length)), [namePool.length]);
  const codeSize = useMemo(() => Math.min(10, Math.max(6, codePool.length)), [codePool.length]);

  const onNameChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const ids = Array.from(e.currentTarget.selectedOptions).map((o) => o.value);
    setSelected((prev) => Array.from(new Set([...prev, ...ids])));
  };

  const onCodeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const ids = Array.from(e.currentTarget.selectedOptions).map((o) => o.value);
    setSelected((prev) => Array.from(new Set([...prev, ...ids])));
  };

  const remove = (id: string) => setSelected((prev) => prev.filter((x) => x !== id));

  const selectedItems = selected
    .map((id) => items.find((i) => i.id === id))
    .filter(Boolean) as Item[];

  const namePoolIds = new Set(namePool.map((i) => i.id));
  const codePoolIds = new Set(codePool.map((i) => i.id));

  const showNameDropdown = isNameOpen && namePool.length > 0;
  const showCodeDropdown = isCodeOpen && codePool.length > 0;

  return (
    <div className="w-full">
      <div className="grid gap-6 sm:grid-cols-2">
        <div
          onFocus={() => setIsNameOpen(true)}
          onBlur={(e) => {
            const rt = e.relatedTarget as Node | null;
            if (!rt || !e.currentTarget.contains(rt)) setIsNameOpen(false);
          }}
        >
          <label htmlFor="search-name" className="block text-sm font-medium text-gray-700">
            Search by name
          </label>
          <input
            id="search-name"
            type="text"
            value={qName}
            onChange={(e) => setQName(e.target.value)}
            placeholder="Type name..."
            className="mt-2 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-gray-400 focus:outline-none"
          />
          {showNameDropdown ? (
            <select
              aria-label="Results by name"
              multiple
              size={nameSize}
              className="mt-2 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-gray-400 focus:outline-none"
              value={selected.filter((id) => namePoolIds.has(id))}
              onChange={onNameChange}
            >
              {namePool.map((it) => (
                <option key={it.id} value={it.id}>
                  {it.label}
                </option>
              ))}
            </select>
          ) : null}
        </div>
        <div
          onFocus={() => setIsCodeOpen(true)}
          onBlur={(e) => {
            const rt = e.relatedTarget as Node | null;
            if (!rt || !e.currentTarget.contains(rt)) setIsCodeOpen(false);
          }}
        >
          <label htmlFor="search-code" className="block text-sm font-medium text-gray-700">
            Search by barcode
          </label>
          <input
            id="search-code"
            type="text"
            value={qCode}
            onChange={(e) => setQCode(e.target.value)}
            placeholder="Type barcode..."
            className="mt-2 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-gray-400 focus:outline-none"
          />
          {showCodeDropdown ? (
            <select
              aria-label="Results by barcode"
              multiple
              size={codeSize}
              className="mt-2 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-gray-400 focus:outline-none"
              value={selected.filter((id) => codePoolIds.has(id))}
              onChange={onCodeChange}
            >
              {codePool.map((it) => (
                <option key={it.id} value={it.id}>
                  {(it.code ? `${it.code} — ` : "") + it.label}
                </option>
              ))}
            </select>
          ) : null}
        </div>
      </div>

      <div className="mt-6">
        <h2 className="text-sm font-semibold text-gray-800">Selected products</h2>
        {selectedItems.length === 0 ? (
          <p className="mt-2 text-sm text-gray-600">No products selected</p>
        ) : (
          <ul className="mt-2 divide-y divide-gray-200 rounded-md border border-gray-200">
            {selectedItems.map((it) => (
              <li key={it.id} className="flex items-center justify-between px-4 py-2">
                <span className="truncate text-sm text-gray-900">
                  {it.label}
                  {it.category ? <span className="text-gray-500"> ({it.category})</span> : null}
                  {it.code ? <span className="text-gray-500"> — {it.code}</span> : null}
                </span>
                <button
                  type="button"
                  onClick={() => remove(it.id)}
                  className="ml-4 inline-flex items-center rounded-md border border-gray-300 px-2 py-1 text-xs text-gray-700 hover:bg-gray-50"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="mt-6 grid gap-6 sm:grid-cols-4">
        <ChipMultiSelect
          id="wh-multi"
          label="Warehouses"
          options={warehouseOptions}
          selected={selectedWarehouses}
          onChange={setSelectedWarehouses}
        />
        <div>
          <label htmlFor="from-date" className="block text-sm font-medium text-gray-700">
            From date
          </label>
          <input
            id="from-date"
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="mt-2 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-gray-400 focus:outline-none"
          />
        </div>
        <div>
          <label htmlFor="to-date" className="block text-sm font-medium text-gray-700">
            To date
          </label>
          <input
            id="to-date"
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="mt-2 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-gray-400 focus:outline-none"
          />
        </div>
        <ChipMultiSelect
          id="move-multi"
          label="Type of movement"
          options={movementOptions}
          selected={selectedMovements}
          onChange={setSelectedMovements}
        />
      </div>
      <div className="mt-6 flex items-center gap-3">
        <button
          type="button"
          onClick={async () => {
            setLoading(true);
            setError(null);
            setReport(null);
            try {
              if (selected.length === 0) throw new Error("Select at least one product");
              if (selectedWarehouses.length === 0) throw new Error("Select at least one warehouse");
              if (selectedMovements.length === 0) throw new Error("Select at least one movement type");
              const res = await fetch("/api/report", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  productIds: selected.map((v) => (Number(v) || v)),
                  warehouseIds: selectedWarehouses.map((v) => (Number(v) || v)),
                  movements: selectedMovements,
                  fromDate: fromDate || null,
                  toDate: toDate || null,
                }),
              });
              const json = await res.json();
              if (!res.ok) throw new Error(json.error || "Failed to create report");
              setReport(json.byWarehouse || {});
            } catch (e: any) {
              setError(e?.message || "Something went wrong");
            } finally {
              setLoading(false);
            }
          }}
          disabled={loading}
          className="inline-flex items-center rounded-md bg-[rgb(37_99_235)] px-4 py-2 text-sm font-medium text-white hover:bg-[rgb(29_78_216)] focus:outline-none focus:ring-2 focus:ring-[rgb(37_99_235)] focus:ring-offset-1 disabled:opacity-60"
        >
          {loading ? "Creating..." : "Create Report"}
        </button>
        <button
          type="button"
          className="inline-flex items-center rounded-md bg-[rgb(37_99_235)] px-4 py-2 text-sm font-medium text-white hover:bg-[rgb(29_78_216)] focus:outline-none focus:ring-2 focus:ring-[rgb(37_99_235)] focus:ring-offset-1"
        >
          Create As of Report
        </button>
      </div>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      {report && (
        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 border">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-700">Warehouse</th>
                {selectedMovements.map((mv) => (
                  <th key={mv} className="px-4 py-2 text-left text-xs font-medium text-gray-700">{mv}</th>
                ))}
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-700">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {selectedWarehouses.map((wid) => {
                const name = warehouses.find((w) => String(w.id) === String(wid))?.display_name || wid;
                const row = (report as any)[String(wid)] || {};
                const total = selectedMovements.reduce((s, mv) => s + Number(row[mv] || 0), 0);
                return (
                  <tr key={wid}>
                    <td className="px-4 py-2 text-sm text-gray-900">{name}</td>
                    {selectedMovements.map((mv) => (
                      <td key={mv} className="px-4 py-2 text-sm text-gray-900">{Number(row[mv] || 0)}</td>
                    ))}
                    <td className="px-4 py-2 text-sm font-semibold text-gray-900">{total}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
