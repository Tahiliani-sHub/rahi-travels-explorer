export const CURRENCY_CODE = (typeof process !== "undefined" && process.env?.CURRENCY) || "EUR";

export function fmt(amount: number) {
  return `€${amount.toFixed(2)}`;
}
