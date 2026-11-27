// Display helpers. All "relative" wording is computed from real data and the user's local today.

export const pluralize = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`;

/** "Today", "Yesterday", "5 days ago", or "Never" for a days-since count. */
export const relativeDays = (days) => {
  if (days === null || days === undefined) return "Never";
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
};

/** "Fri, Nov 27" for an ISO date string (yyyy-mm-dd) or Date. */
export const shortDate = (value) => {
  if (!value) return "";
  const d = typeof value === "string" ? new Date(`${value}T00:00:00`) : value;
  return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
};

/** "Nov 27" for an ISO date string. */
export const monthDay = (value) => {
  if (!value) return "";
  return new Date(`${value}T00:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric" });
};

/** "due today", "due in 3 days", "2 days overdue" for a follow-up. */
export const dueLabel = (daysOverdue, dueDate, today = new Date().toLocaleDateString("en-CA")) => {
  if (daysOverdue > 0) return `${pluralize(daysOverdue, "day")} overdue`;
  if (dueDate === today) return "Due today";
  const diff = Math.round((new Date(`${dueDate}T00:00:00`) - new Date(`${today}T00:00:00`)) / 86400000);
  return `Due in ${pluralize(diff, "day")}`;
};

/** Escapes one CSV cell, including protection against spreadsheet formula injection. */
export const csvCell = (value) => {
  let text = value === null || value === undefined ? "" : String(value);
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
};
