export type DayHours = { open: string; close: string } | { closed: true };

export const openingHours: Record<string, DayHours> = {
  monday: { open: '09:00', close: '19:00' },
  tuesday: { open: '09:00', close: '19:00' },
  wednesday: { open: '09:00', close: '19:00' },
  thursday: { open: '09:00', close: '19:00' },
  friday: { open: '09:00', close: '19:00' },
  saturday: { open: '08:00', close: '18:00' },
  sunday: { open: '10:00', close: '16:00' },
};

export const isOpen = (dayHours: DayHours): dayHours is { open: string; close: string } => {
  return 'open' in dayHours;
};