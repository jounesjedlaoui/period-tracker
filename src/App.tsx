import { createSignal, Show, onMount } from "solid-js"

import EntryForm from "./components/EntryForm"
import EntryTable from "./components/EntryTable"
import TemperatureChart from "./components/TemperatureChart"
import FertilityDashboard from "./components/FertilityDashboard"

import { entriesStore } from "./store/entriesStore"

type Theme = "light" | "dark"

export default function App() {
  const [editing, setEditing] = createSignal<any | null>(null)
  const [isOpen, setIsOpen] = createSignal(false)

  const [theme, setTheme] = createSignal<Theme>("dark")

  const {
    entries,
    add,
    update,
    remove,
  } = entriesStore

  // =========================
  // INIT THEME
  // =========================
  onMount(() => {
    const saved = localStorage.getItem("theme") as Theme | null

    if (saved) {
      setTheme(saved)
      return
    }

    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches

    setTheme(prefersDark ? "dark" : "light")
  })

  function toggleTheme() {
    const next = theme() === "dark" ? "light" : "dark"
    setTheme(next)
    localStorage.setItem("theme", next)
  }

  function handleSubmit(entry: any) {
    if (editing()) {
      update(editing().id, entry)
      setEditing(null)
    } else {
      add(entry)
    }

    setIsOpen(false)
  }

  function handleEdit(entry: any) {
    setEditing(entry)
    setIsOpen(true)
  }

  function handleDelete(id: string) {
    remove(id)
  }

  return (
    <div class={`app theme-${theme()}`}>
      {/* =========================
          HEADER
      ========================= */}
      <div class="app-header">
        <h1>Cycle Tracker</h1>

        <button
          class="theme-toggle"
          onClick={toggleTheme}
        >
          {theme() === "dark"
            ? "☀️ Light"
            : "🌙 Dark"}
        </button>
      </div>

      <div class="layout">
        {/* ADD BUTTON */}
        <button
          class="add-entry-button"
          onClick={() => setIsOpen(true)}
        >
          + Add Entry
        </button>

        {/* Dashboard */}
        <FertilityDashboard />

        {/* TABLE */}
        <EntryTable
          entries={entries()}
          onDelete={handleDelete}
          onEdit={handleEdit}
        />

        {/* MODAL */}
        <Show when={isOpen()}>
          <div
            class="modal-backdrop"
            onClick={() => {
              setIsOpen(false)
              setEditing(null)
            }}
          />

          <div class="modal">
            <button
              class="close-button"
              onClick={() => {
                setIsOpen(false)
                setEditing(null)
              }}
            >
              ✕
            </button>

            <EntryForm
              onSubmit={handleSubmit}
              initialData={editing()}
            />
          </div>
        </Show>
      </div>
    </div>
  )
}