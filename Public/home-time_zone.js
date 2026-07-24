// --- Timezone handling (UTC+7) ------------------------------------------
const UTC7_PART_FORMATTER = new Intl.DateTimeFormat("en-US", {
  timeZone: "Asia/Ho_Chi_Minh",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

export function getUTC7Parts(timestamp) {
  const date = new Date(timestamp);
  const parts = UTC7_PART_FORMATTER.formatToParts(date).reduce((acc, p) => {
    acc[p.type] = p.value;
    return acc;
  }, {});
  if (parts.hour === "24") parts.hour = "00";
  return parts;
}

export function partsToPlotlyISOString(parts) {
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}.000Z`;
}

export function formatUTC7Display(parts) {
  return `${parts.day}/${parts.month}/${parts.year} ${parts.hour}:${parts.minute}:${parts.second}`;
}