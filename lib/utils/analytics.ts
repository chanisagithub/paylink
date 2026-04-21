export function calculateConversionRate(views: number, payments: number) {
  if (views <= 0) {
    return 0;
  }

  return (payments / views) * 100;
}

export function toFixedPercent(value: number) {
  return `${value.toFixed(1)}%`;
}

