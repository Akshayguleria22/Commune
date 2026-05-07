const GUEST_ID_KEY = 'commune-guest-id';

const createGuestId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `guest-${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
};

export const getOrCreateGuestId = (): string => {
  let guestId = localStorage.getItem(GUEST_ID_KEY);
  if (!guestId) {
    guestId = createGuestId();
    localStorage.setItem(GUEST_ID_KEY, guestId);
  }
  return guestId;
};

export const clearGuestId = () => {
  localStorage.removeItem(GUEST_ID_KEY);
};
