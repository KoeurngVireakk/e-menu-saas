export function formatCurrency(amount, currency = "KHR") {
  const value = Number(amount || 0);

  if (currency === "USD") {
    return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  return `${value.toLocaleString(undefined, { maximumFractionDigits: 0 })} KHR`;
}

export function formatDualCurrency(primaryAmount, primaryCurrency, secondaryAmount, secondaryCurrency) {
  const primary = formatCurrency(primaryAmount, primaryCurrency);

  if (!secondaryCurrency || secondaryAmount === null || secondaryAmount === undefined) {
    return primary;
  }

  return `${primary} / ${formatCurrency(secondaryAmount, secondaryCurrency)}`;
}
