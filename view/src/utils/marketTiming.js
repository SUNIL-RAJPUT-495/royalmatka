// Utility functions for Matka Market real-time session tracking

export const parseMarketTime = (timeStr) => {
  if (!timeStr) return null;
  const now = new Date();
  const cleanStr = String(timeStr).trim().toUpperCase();
  const match = cleanStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/);
  if (!match) return null;

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3] || 'AM';

  if (period === 'PM' && hours !== 12) {
    hours += 12;
  } else if (period === 'AM' && hours === 12) {
    hours = 0;
  }

  const d = new Date(now);
  d.setHours(hours, minutes, 0, 0);
  return d;
};

export const getMarketSessionStatus = (market) => {
  if (!market) return { isOpenSessionOpen: false, isCloseSessionOpen: false, isMarketClosed: true };
  if (market.is_closed) return { isOpenSessionOpen: false, isCloseSessionOpen: false, isMarketClosed: true };

  // Check off days
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const todayName = daysOfWeek[new Date().getDay()];
  if (Array.isArray(market.off_days) && market.off_days.includes(todayName)) {
    return { isOpenSessionOpen: false, isCloseSessionOpen: false, isMarketClosed: true };
  }

  const now = new Date();
  const openTime = parseMarketTime(market.open_time);
  const closeTime = parseMarketTime(market.close_time);

  if (!openTime || !closeTime) {
    return { isOpenSessionOpen: true, isCloseSessionOpen: true, isMarketClosed: false };
  }

  // Handle overnight markets (e.g. Open 09:30 PM, Close 12:05 AM)
  let adjustedCloseTime = new Date(closeTime);
  if (closeTime <= openTime) {
    adjustedCloseTime.setDate(adjustedCloseTime.getDate() + 1);
  }

  // Phase 1: Before Open Time -> Open & Close Both Open
  if (now < openTime) {
    return { isOpenSessionOpen: true, isCloseSessionOpen: true, isMarketClosed: false };
  }

  // Phase 2: After Open Time, Before Close Time -> Open Session CLOSED (3-digit result declared), Close Session OPEN
  if (now >= openTime && now < adjustedCloseTime) {
    return { isOpenSessionOpen: false, isCloseSessionOpen: true, isMarketClosed: false };
  }

  // Phase 3: After Close Time -> Market Completely CLOSED
  return { isOpenSessionOpen: false, isCloseSessionOpen: false, isMarketClosed: true };
};
