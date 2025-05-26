export const formatTime = (time: Date | string | null | undefined) => {
  if (!time) {
    return '';
  }

  const date = time instanceof Date ? time : new Date(time);

  if (isNaN(date.getTime())) {
    return '';
  }

  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  const formattedDay = day < 10 ? `0${day}` : day;
  const formattedMonth = month < 10 ? `0${month}` : month;

  // Time formatting
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const formattedHours = hours % 12 || 12;
  const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;

  return `${formattedDay}/${formattedMonth}/${year} ${formattedHours}:${formattedMinutes} ${ampm}`;
};
