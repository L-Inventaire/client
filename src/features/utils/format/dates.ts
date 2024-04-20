/* Show minimal needed information to get date
 * ex. if it is to_day only show hour and minutes
 * ex. if it is yesterday show day and hour and minutes
 * ex. if it is this year show day and month
 * else show day and month and year
 */
export const formatTime = (
  time: number | string,
  options: { keepTime?: boolean; keepSeconds?: boolean; keepDate?: boolean } = {
    keepTime: true,
  },
  locale?: string
) => {
  time = new Date(time).getTime();
  locale = locale || navigator.language;
  const now = Date.now();
  const year = new Date(time).getFullYear();
  const nowYear = new Date(now).getFullYear();
  const nowDay = new Date();
  nowDay.setHours(0);
  nowDay.setMinutes(0);
  const oneDayLater = time < nowDay.getTime();
  return new Intl.DateTimeFormat(locale, {
    year: nowYear !== year || options?.keepDate ? "numeric" : undefined,
    month: oneDayLater || options?.keepDate ? "short" : undefined,
    day: oneDayLater || options?.keepDate ? "numeric" : undefined,
    hour: !oneDayLater || options?.keepTime ? "numeric" : undefined,
    minute: !oneDayLater || options?.keepTime ? "numeric" : undefined,
    second: options?.keepSeconds ? "numeric" : undefined,
  }).format(new Date(time));
};

export const formatDuration = (duration: number) => {
  duration = Math.floor(duration / 1000 / 60);
  const hours = Math.floor(duration / 60);
  const minutes = duration % 60;
  return `${hours}h ${(minutes + "").padStart(2, "0")}m`;
};
