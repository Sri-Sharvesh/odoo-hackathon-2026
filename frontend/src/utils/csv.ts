/** Minimal client-side CSV export — no library needed for a handful of report rows. */
export function downloadCsv(filename: string, rows: Array<Record<string, string | number>>): void {
  if (rows.length === 0) return
  const headers = Object.keys(rows[0])
  const escape = (value: string | number) => `"${String(value).replace(/"/g, '""')}"`
  const lines = [
    headers.join(','),
    ...rows.map((row) => headers.map((key) => escape(row[key])).join(',')),
  ]

  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
