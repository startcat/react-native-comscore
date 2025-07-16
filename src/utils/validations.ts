export const validatePosition = (position: number): boolean => {
  return position >= 0 && Number.isFinite(position);
};

export const validateRate = (rate: number): boolean => {
  return rate >= 0 && rate <= 10 && Number.isFinite(rate);
};

export const validateDuration = (duration: number): boolean => {
  return duration > 0 && Number.isFinite(duration);
};
