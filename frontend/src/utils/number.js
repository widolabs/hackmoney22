export function formatAsPercentage(number, digits = 2) {
  return new Intl.NumberFormat("en-US", {
    style: "percent",
    minimumFractionDigits: digits,
  }).format(number);
}

export function formatAsCurrency(number, digits) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    minimumFractionDigits: digits,
    currency: "USD",
  }).format(number);
}

export function formatAsNumber(number, digits) {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: digits,
  }).format(number);
}

export function formatAsShortCurrency(number, digits) {
  return `$${formatAsShortNumber(number, digits)}`;
}

/**
 *
 * https://stackoverflow.com/a/9462382
 *
 * @param {*} number
 * @param {*} digits
 * @returns
 */
export function formatAsShortNumber(number, digits) {
  const lookup = [
    { value: 1, symbol: "" },
    { value: 1e3, symbol: "K" },
    { value: 1e6, symbol: "M" },
    { value: 1e9, symbol: "B" },
    { value: 1e12, symbol: "T" },
    { value: 1e15, symbol: "P" },
    { value: 1e18, symbol: "E" },
  ];
  var item = lookup
    .slice()
    .reverse()
    .find(function (item) {
      return number >= item.value;
    });
  return item ? (number / item.value).toFixed(digits) + item.symbol : "0";
}
