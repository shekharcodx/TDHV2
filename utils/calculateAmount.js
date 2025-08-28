exports.calculateAmount = (startDate, endDate, rates) => {
  const msPerDay = 1000 * 60 * 60 * 24;
  let days = Math.ceil((endDate - startDate) / msPerDay);

  let amount = 0;

  // First try months
  if (days >= 30) {
    const months = Math.floor(days / 30);
    amount += months * rates.perMonth;
    days -= months * 30;
  }

  // Then weeks
  if (days >= 7) {
    const weeks = Math.floor(days / 7);
    amount += weeks * rates.perWeek;
    days -= weeks * 7;
  }

  // Remaining days
  if (days > 0) {
    amount += days * rates.perDay;
  }

  return amount;
};
