export function convertToCSV(dataObj) {
  const rows = [];

  const pushSection = (label, items) => {
    rows.push([label]);
    if (!items || items.length === 0) {
      rows.push(["No data"]);
      rows.push([]);
      return;
    }

    const keys = Object.keys(items[0]);
    rows.push(keys);

    for (const item of items) {
      rows.push(keys.map(k => JSON.stringify(item[k] ?? "")));
    }
    rows.push([]);
  };

  pushSection("Favorites", dataObj.favorites);
  pushSection("Search History", dataObj.searchHistory);
  pushSection("Contact Tickets", dataObj.contactTickets);

  return rows.map(r => r.join(",")).join("\n");
}
