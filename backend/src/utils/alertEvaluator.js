/**
 * Pure decision function: given a watchlist item's alert config and a
 * current price, decides whether the alert should fire right now.
 * Kept separate from any DB/socket code so it's trivially unit-testable.
 */
export const shouldTriggerAlert = (item, currentPrice) => {
  if (!item.alertEnabled) return false;
  if (item.targetPrice === null || item.targetPrice === undefined) return false;
  if (currentPrice === null || currentPrice === undefined) return false;
  if (item.alertTriggeredAt) return false; // already fired, armed again only on edit

  if (item.alertDirection === "above") {
    return currentPrice >= item.targetPrice;
  }
  if (item.alertDirection === "below") {
    return currentPrice <= item.targetPrice;
  }
  return false;
};

/**
 * Builds the human-readable alert message.
 */
export const buildAlertMessage = (item, currentPrice) => {
  const direction = item.alertDirection === "above" ? "risen to" : "fallen to";
  return `${item.symbol} has ${direction} $${currentPrice.toFixed(2)}, hitting your target of $${item.targetPrice.toFixed(2)}.`;
};
