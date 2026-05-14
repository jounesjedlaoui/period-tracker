import {
  For,
  Show,
  createMemo,
  createSignal,
} from "solid-js"

import { entriesStore } from "../store/entriesStore"

type SortKey = "type" | "date" | "value" | "notes"
type SortDir = "asc" | "desc"

function getCycleIndex(
  timestamp: string,
  cycleStarts: number[],
) {
  const time = new Date(timestamp).getTime()

  let index = -1

  for (let i = 0; i < cycleStarts.length; i++) {
    if (cycleStarts[i] <= time) index = i
    else break
  }

  return index
}

function groupByCycle(entries: any[], cycleStarts: number[]) {
  const groups: Record<number, any[]> = {}

  for (const entry of entries) {
    const idx = getCycleIndex(entry.timestamp, cycleStarts)

    if (!groups[idx]) groups[idx] = []
    groups[idx].push(entry)
  }

  return Object.entries(groups)
    .map(([cycleIndex, items]) => ({
      cycleIndex: Number(cycleIndex),
      entries: items,
    }))
    .sort((a, b) => b.cycleIndex - a.cycleIndex)
}

export default function EntryTable(props: any) {
  const { cycleStarts } = entriesStore

  const [sortKey, setSortKey] = createSignal<SortKey>("date")
  const [sortDir, setSortDir] = createSignal<SortDir>("desc")

  function toggleSort(key: SortKey) {
    if (sortKey() === key) {
      setSortDir(sortDir() === "asc" ? "desc" : "asc")
    } else {
      setSortKey(key)
      setSortDir("asc")
    }
  }

  function sortEntries(entries: any[]) {
    return [...entries].sort((a, b) => {
      let va: any
      let vb: any

      switch (sortKey()) {
        case "type":
          va = a.type
          vb = b.type
          break

        case "date":
          va = new Date(a.timestamp).getTime()
          vb = new Date(b.timestamp).getTime()
          break

        case "value":
          va = a.type === "temperature" ? a.temperature : 0
          vb = b.type === "temperature" ? b.temperature : 0
          break

        case "notes":
          va = a.note || ""
          vb = b.note || ""
          break
      }

      if (va < vb) return sortDir() === "asc" ? -1 : 1
      if (va > vb) return sortDir() === "asc" ? 1 : -1
      return 0
    })
  }

  function getCycleDay(entry: any, cycleIndex: number) {
    const starts = cycleStarts()
    const start = starts[cycleIndex]
    if (!start) return null

    return (
      Math.floor(
        (new Date(entry.timestamp).getTime() - start) /
          86400000,
      ) + 1
    )
  }

  const grouped = createMemo(() =>
    groupByCycle(props.entries, cycleStarts()),
  )

  return (
    <div class="table-wrapper">
      <h2>Entries</h2>

      <table class="entry-table">
        <thead>
          <tr>
            <th onClick={() => toggleSort("type")}>
              Type {sortKey() === "type" ? "↕" : ""}
            </th>

            <th onClick={() => toggleSort("date")}>
              Date {sortKey() === "date" ? "↕" : ""}
            </th>

            <th onClick={() => toggleSort("value")}>
              Value {sortKey() === "value" ? "↕" : ""}
            </th>

            <th onClick={() => toggleSort("notes")}>
              Notes {sortKey() === "notes" ? "↕" : ""}
            </th>

            <th></th>
          </tr>
        </thead>

        <tbody>
          <For each={grouped()}>
            {cycle => (
              <>
                <tr class="cycle-header">
                  <td colspan="5">
                    🧬 Cycle #{cycle.cycleIndex + 1}
                  </td>
                </tr>

                <For each={sortEntries(cycle.entries)}>
                  {entry => {
                    const cd = getCycleDay(
                      entry,
                      cycle.cycleIndex,
                    )

                    return (
                      <tr>
                        <td>
                          {entry.type === "temperature"
                            ? "🌡️ Temp"
                            : "🩸 Cycle"}
                        </td>

                        <td>
                          <div>
                            {new Date(
                              entry.timestamp,
                            ).toLocaleString()}
                          </div>

                          <Show when={cd}>
                            <small class="muted">
                              CD{cd}
                            </small>
                          </Show>
                        </td>

                        <td>
                          <Show
                            when={
                              entry.type === "temperature"
                            }
                            fallback={entry.event}
                          >
                            {entry.temperature} °C
                          </Show>
                        </td>

                        <td>{entry.note || "-"}</td>

                        <td>
                          <button
                            class="delete-button"
                            onClick={() =>
                              props.onDelete(entry.id)
                            }
                          >
                            Delete
                          </button>

                          <button
                            class="edit-button"
                            onClick={() =>
                              props.onEdit(entry)
                            }
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    )
                  }}
                </For>
              </>
            )}
          </For>
        </tbody>
      </table>
    </div>
  )
}