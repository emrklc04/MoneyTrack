export function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency }).format(amount);
}
