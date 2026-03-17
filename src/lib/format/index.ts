const euroFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
});

const numberFormatter = new Intl.NumberFormat("fr-FR", {
  maximumFractionDigits: 2,
});

const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

export function formatCurrency(value: number, currency = "EUR") {
  if (currency === "EUR") {
    return euroFormatter.format(value);
  }

  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(value);
}

export function formatNumber(value: number) {
  return numberFormatter.format(value);
}

export function formatHoursFromMinutes(minutes: number) {
  return `${formatNumber(minutes / 60)} h`;
}

export function formatDate(value: Date | string | null | undefined) {
  if (!value) {
    return "—";
  }

  return dateFormatter.format(typeof value === "string" ? new Date(value) : value);
}
