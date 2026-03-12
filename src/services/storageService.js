// ─── Pure storage and CSV utility functions ───────────────────────────────────
// No React hooks here — these are plain side-effect utilities.

export function loadFromStorage(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore demo storage issues
  }
}

export function downloadCsv(filename, rows) {
  const csvContent = rows
    .map((row) =>
      row
        .map((cell) => {
          const value = cell == null ? '' : String(cell);
          if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
          return value;
        })
        .join(',')
    )
    .join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
