import { differenceInCalendarDays, format } from "date-fns";

export function formatToAbrFormat(dateString) {
  const date = new Date(dateString);
  const formattedDate = format(date, "EEE, MMM dd");
  return formattedDate;
}

export function daysDifferCount(before, after) {
  return differenceInCalendarDays(new Date(before), new Date(after));
}

export function calculateDiscount(price, coupon) {
  const { discount, discount_type, usage_limit_per_coupon: max } = coupon || {};

  if (discount_type === "percentage") {
    const percentageDiscount = price * (discount / 100);
    return max > 0 ? Math.min(percentageDiscount, max) : percentageDiscount;
  }

  if (discount_type === "fixed") {
    return max > 0 ? Math.min(discount, max) : discount;
  }

  return discount;
}
