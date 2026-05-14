const STORAGE_KEY = "temp-tracker-data"

export function saveData(data: unknown) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function loadData() {
  const raw = localStorage.getItem(STORAGE_KEY)
  return raw ? JSON.parse(raw) : []
}