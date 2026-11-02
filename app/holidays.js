// US holidays and popular observances. Every one of them gets a banana in the UI.
const Holidays = (() => {
  const cache = {};
  const pad = n => String(n).padStart(2, "0");
  const key = (y, m, d) => `${y}-${pad(m + 1)}-${pad(d)}`;

  // nth weekday (0=Sun) of a month; n = -1 means the last one
  function nthWeekday(y, m, weekday, n) {
    if (n > 0) {
      const first = new Date(y, m, 1).getDay();
      return 1 + ((weekday - first + 7) % 7) + (n - 1) * 7;
    }
    const lastDate = new Date(y, m + 1, 0).getDate();
    const lastDay = new Date(y, m, lastDate).getDay();
    return lastDate - ((lastDay - weekday + 7) % 7);
  }

  // Easter Sunday (Anonymous Gregorian algorithm)
  function easter(y) {
    const a = y % 19, b = Math.floor(y / 100), c = y % 100;
    const d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4), k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31) - 1;
    const day = ((h + l - 7 * m + 114) % 31) + 1;
    return new Date(y, month, day);
  }

  function build(y) {
    const map = {};
    const add = (m, d, name) => (map[key(y, m, d)] ||= []).push(name);
    const addDate = (dt, name) => (map[key(dt.getFullYear(), dt.getMonth(), dt.getDate())] ||= []).push(name);

    add(0, 1, "New Year's Day");
    add(0, nthWeekday(y, 0, 1, 3), "Martin Luther King Jr. Day");
    add(1, 2, "Groundhog Day");
    add(1, 14, "Valentine's Day");
    add(1, nthWeekday(y, 1, 1, 3), "Presidents' Day");
    add(2, 17, "St. Patrick's Day");
    add(3, 1, "April Fools' Day");
    add(3, 22, "Earth Day");
    const e = easter(y);
    addDate(new Date(y, e.getMonth(), e.getDate() - 2), "Good Friday");
    addDate(e, "Easter Sunday");
    add(4, 5, "Cinco de Mayo");
    add(4, nthWeekday(y, 4, 0, 2), "Mother's Day");
    add(4, nthWeekday(y, 4, 1, -1), "Memorial Day");
    add(5, 14, "Flag Day");
    add(5, nthWeekday(y, 5, 0, 3), "Father's Day");
    add(5, 19, "Juneteenth");
    add(6, 4, "Independence Day");
    add(8, nthWeekday(y, 8, 1, 1), "Labor Day");
    add(9, nthWeekday(y, 9, 1, 2), "Columbus / Indigenous Peoples' Day");
    add(9, 31, "Halloween");
    add(10, 11, "Veterans Day");
    add(10, nthWeekday(y, 10, 4, 4), "Thanksgiving");
    add(11, 14, "International Monkey Day");
    add(11, 24, "Christmas Eve");
    add(11, 25, "Christmas Day");
    add(11, 31, "New Year's Eve");
    return map;
  }

  return {
    // list of holiday names on a "YYYY-MM-DD" date
    on(dateStr) {
      const y = +dateStr.slice(0, 4);
      return (cache[y] ||= build(y))[dateStr] || [];
    },
  };
})();
