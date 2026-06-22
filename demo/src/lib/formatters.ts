export function fmt(n: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(n);
}

export function fmtPct(n: number): string {
  return `${n}%`;
}

export function fmtNum(n: number): string {
  return new Intl.NumberFormat('en-US').format(n);
}
