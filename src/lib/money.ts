/** GHS amounts are stored and transported as minor units (pesewas). 100 = ₵1.00 */

const GHS_FORMATTER = new Intl.NumberFormat("en-GH", {
  style: "currency",
  currency: "GHS",
  currencyDisplay: "symbol",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatGhs(minorUnits: number): string {
  return GHS_FORMATTER.format(minorUnits / 100).replace("GHS", "₵").trim();
}

export function toMinorUnits(major: number): number {
  return Math.round(major * 100);
}

export function fromMinorUnits(minor: number): number {
  return minor / 100;
}

export function parseGhsInput(value: string): number | null {
  const cleaned = value.replace(/[₵,\s]/g, "");
  const n = Number(cleaned);
  if (!Number.isFinite(n)) return null;
  return toMinorUnits(n);
}
