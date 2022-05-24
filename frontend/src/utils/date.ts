import moment from "moment";

/**
 *
 * @param item Example: `1646092800000`
 * @returns string Example: "Jan 1"
 */
export const shortDateFormat = (timestamp: number) =>
  moment(timestamp).format("MMM D");

/**
 *
 * @param item Example: `1646092800000`
 * @returns string Example: "Jan 1, 2019"
 */
export const longDateFormat = (timestamp: number) => {
  const date = moment(timestamp);
  const today = moment().startOf("day");

  if (date > today) return "Today";

  return moment(timestamp).format("MMM D, YYYY");
};

/**
 *
 * @param item Example: `1646092800000`
 * @returns string Example: "Jan 1, 2019 (UTC)"
 */
export const longDateFormatWithTimezone = (timestamp: number) => {
  return `${longDateFormat(timestamp)} (UTC)`;
};
