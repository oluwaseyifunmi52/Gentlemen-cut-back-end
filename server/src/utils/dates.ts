export const generateBookingReference = (): string => {
  const prefix = 'GC';
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const suffixLength = 6;
  let suffix = '';
  for (let i = 0; i < suffixLength; i++) {
    suffix += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${prefix}-${suffix}`;
};

export const getShopTimezone = (): string => {
  return process.env.SHOP_TIMEZONE || 'Africa/Lagos';
};

export const isPastDate = (dateStr: string): boolean => {
  const shopTz = getShopTimezone();
  const targetDate = new Date(`${dateStr}T00:00:00${shopTz.includes('+') || shopTz.includes('-') ? '' : 'Z'}`);
  const now = new Date();
  // Compare just the date portion in shop timezone
  return targetDate < now;
};

export const formatTime = (timeStr: string): { hour: number; minute: number } => {
  const [hour, minute] = timeStr.split(':').map(Number);
  return { hour, minute };
};

export const isTimeWithinOpeningHours = (
  timeStr: string,
  hours: { open: string; close: string }
): boolean => {
  const { hour, minute } = formatTime(timeStr);
  const openParts = hours.open.split(':').map(Number);
  const closeParts = hours.close.split(':').map(Number);
  const openMinutes = openParts[0] * 60 + openParts[1];
  const closeMinutes = closeParts[0] * 60 + closeParts[1];
  const timeMinutes = hour * 60 + minute;
  return timeMinutes >= openMinutes && timeMinutes < closeMinutes;
};