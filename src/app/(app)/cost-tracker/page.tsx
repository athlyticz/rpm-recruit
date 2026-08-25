"use client";

import { useState } from "react";
import { PageHeader } from "@/components/app/page-header";

/* ── types ─────────────────────────────────────────────────────── */

interface CostRow {
  id: number;
  college: string;
  tuition: string;
  roomBoard: string;
  books: string;
  scholarship: string;
  spending: string;
}

function emptyRow(id: number): CostRow {
  return { id, college: "", tuition: "", roomBoard: "", books: "", scholarship: "", spending: "" };
}

function toNum(v: string): number {
  const n = parseFloat(v);
  return isNaN(n) ? 0 : n;
}

function fmt(n: number): string {
  if (n === 0) return "$0";
  return "$" + n.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

/* ── page ──────────────────────────────────────────────────────── */

export default function CostTrackerPage() {
  const [rows, setRows] = useState<CostRow[]>([
    emptyRow(1),
    emptyRow(2),
    emptyRow(3),
  ]);

  function updateRow(id: number, field: keyof CostRow, value: string) {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  }

  function addRow() {
    setRows((prev) => [...prev, emptyRow(prev.length + 1)]);
  }

  const cellInputCls =
    "font-mono text-xs font-medium text-ink bg-white border-none border-b-[1.5px] border-bone-3 px-1 py-0.5 outline-none w-full focus:border-gold";
  const numInputCls = `${cellInputCls} w-[90px]`;

  return (
    <>
      <PageHeader
        eyebrow="Financial Planning"
        title="Cost Tracker"
        subtitle="Compare net cost across programs after scholarship."
        bgText="COST"
      />

      <div className="px-gutter lg:px-gutter-lg py-5 lg:py-6 pb-10 lg:pb-14">
        <div className="bg-white border border-black/[0.06] shadow-sm">
          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-3.5 pb-3 border-b border-black/[0.06]">
            <div>
              <h2 className="font-display text-[17px] font-semibold text-ink">
                College Cost Comparison
              </h2>
              <p className="text-[11px] text-slate">
                Net cost auto-calculates from total minus scholarship.
              </p>
            </div>
            <button
              type="button"
              onClick={addRow}
              className="font-condensed text-xs font-bold tracking-[0.13em] uppercase px-5 py-2.5 min-h-touch inline-flex items-center justify-center transition-colors bg-transparent border-[1.5px] border-bone-3 text-ink-4 hover:border-ink hover:text-ink"
            >
              + Add Row
            </button>
          </div>

          {/* Table */}
          <div className="px-5 py-4 overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  {[
                    "College",
                    "Tuition",
                    "Room & Board",
                    "Books",
                    "Total",
                    "Scholarship",
                    "Net Cost",
                    "Spending $",
                  ].map((col) => (
                    <th
                      key={col}
                      className="font-condensed text-[10px] font-bold tracking-[0.15em] uppercase text-ink-4 text-left pb-2 px-1"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const total =
                    toNum(row.tuition) + toNum(row.roomBoard) + toNum(row.books);
                  const net = total - toNum(row.scholarship);

                  return (
                    <tr
                      key={row.id}
                      className="border-b border-bone"
                    >
                      <td className="px-1 py-1.5">
                        <input
                          type="text"
                          className={`${cellInputCls} min-w-[160px]`}
                          placeholder="College name"
                          value={row.college}
                          onChange={(e) =>
                            updateRow(row.id, "college", e.target.value)
                          }
                        />
                      </td>
                      <td className="px-1 py-1.5">
                        <input
                          type="number"
                          className={numInputCls}
                          placeholder="0"
                          value={row.tuition}
                          onChange={(e) =>
                            updateRow(row.id, "tuition", e.target.value)
                          }
                        />
                      </td>
                      <td className="px-1 py-1.5">
                        <input
                          type="number"
                          className={numInputCls}
                          placeholder="0"
                          value={row.roomBoard}
                          onChange={(e) =>
                            updateRow(row.id, "roomBoard", e.target.value)
                          }
                        />
                      </td>
                      <td className="px-1 py-1.5">
                        <input
                          type="number"
                          className={numInputCls}
                          placeholder="0"
                          value={row.books}
                          onChange={(e) =>
                            updateRow(row.id, "books", e.target.value)
                          }
                        />
                      </td>
                      <td className="px-1 py-1.5">
                        <span className="font-mono text-[13px] text-ink">
                          {fmt(total)}
                        </span>
                      </td>
                      <td className="px-1 py-1.5">
                        <input
                          type="number"
                          className={numInputCls}
                          placeholder="0"
                          value={row.scholarship}
                          onChange={(e) =>
                            updateRow(row.id, "scholarship", e.target.value)
                          }
                        />
                      </td>
                      <td className="px-1 py-1.5">
                        <span className="font-mono text-[13px] text-green-600 font-medium">
                          {fmt(net)}
                        </span>
                      </td>
                      <td className="px-1 py-1.5">
                        <input
                          type="number"
                          className={numInputCls}
                          placeholder="0"
                          value={row.spending}
                          onChange={(e) =>
                            updateRow(row.id, "spending", e.target.value)
                          }
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
