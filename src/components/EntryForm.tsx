import {
  createEffect,
  createSignal,
  Show,
} from "solid-js"

import type { CycleEvent, Entry } from "../types"
type Props = {
  onSubmit: (entry: Entry) => void
  initialData?: any
}

export default function EntryForm(props: Props) {
  const now = () =>
    new Date().toISOString().slice(0, 16)

  const [entryType, setEntryType] = createSignal<
    "temperature" | "cycle"
  >("temperature")

  const [timestamp, setTimestamp] =
    createSignal(now())

  // temperature fields
  const [temperature, setTemperature] =
    createSignal("")
  const [tempNote, setTempNote] =
    createSignal("")
  const [tags, setTags] = createSignal("")

  // cycle fields
  const [cycleEvent, setCycleEvent] =
    createSignal<CycleEvent["event"]>(
      "period-start",
    )

  const [cycleNote, setCycleNote] =
    createSignal("")

  /**
   * Fill form when editing
   */
  createEffect(() => {
    const data = props.initialData
    if (!data) return

    setEntryType(data.type)
    setTimestamp(data.timestamp)

    if (data.type === "temperature") {
      setTemperature(String(data.temperature))
      setTempNote(data.note ?? "")
      setTags((data.tags ?? []).join(", "))
    }

    if (data.type === "cycle") {
      setCycleEvent(data.event)
      setCycleNote(data.note ?? "")
    }
  })

  /**
   * Reset when switching to add mode
   */
  createEffect(() => {
    if (props.initialData) return

    setTemperature("37.0")
    setTempNote("")
    setTags("")
    setCycleNote("")
  })

  // =========================
  // QUICK ACTIONS
  // =========================

  function setNow() {
    setTimestamp(now())
  }

  // =========================
  // TEMPERATURE WHEEL INPUT
  // =========================

  function handleWheel(e: WheelEvent) {
    if (entryType() !== "temperature") return

    e.preventDefault()

    const delta = e.deltaY < 0 ? 0.05 : -0.05

    const current = parseFloat(temperature() || "0")
    const next = (current + delta).toFixed(2)

    setTemperature(next)
  }

  function handleSubmit(e: SubmitEvent) {
    e.preventDefault()

    if (entryType() === "temperature") {
      const temp = parseFloat(temperature())
      if (Number.isNaN(temp)) return

      props.onSubmit({
        type: "temperature",
        timestamp: timestamp(),
        temperature: temp,
        note: tempNote(),
        tags: tags()
          .split(",")
          .map(t => t.trim())
          .filter(Boolean),
      })
    } else {
      props.onSubmit({
        type: "cycle",
        timestamp: timestamp(),
        event: cycleEvent(),
        note: cycleNote(),
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} class="entry-form">
      <h2>
        {props.initialData
          ? "Edit Entry"
          : "Add Entry"}
      </h2>

      {/* =========================
          TYPE
      ========================= */}
      <div class="form-group">
        <label>Entry Type</label>

        <select
          value={entryType()}
          onInput={e =>
            setEntryType(
              e.currentTarget.value as any,
            )
          }
        >
          <option value="temperature">
            Temperature
          </option>
          <option value="cycle">
            Cycle Event
          </option>
        </select>
      </div>

      {/* =========================
          TIMESTAMP + QUICK ACTIONS
      ========================= */}
      <div class="form-group">
        <label>Date & Time</label>

        <input
          type="datetime-local"
          value={timestamp()}
          onInput={e =>
            setTimestamp(e.currentTarget.value)
          }
        />

        {/* QUICK BUTTON */}
        <div class="quick-actions">
          <button
            type="button"
            class="secondary-button"
            onClick={setNow}
          >
            ⏱ Now
          </button>
        </div>
      </div>

      {/* =========================
          TEMPERATURE MODE
      ========================= */}
      <Show when={entryType() === "temperature"}>
        <>
          <div class="form-group">
            <label>Temperature (°C)</label>

            <input
              type="number"
              step="0.01"
              value={temperature()}
              onInput={e =>
                setTemperature(
                  e.currentTarget.value,
                )
              }
              onWheel={handleWheel}
            />

            <small class="helper-text">
              Scroll to adjust ±0.05°C
            </small>
          </div>

          <div class="form-group">
            <label>Tags</label>

            <input
              placeholder="sleep, sick, alcohol"
              value={tags()}
              onInput={e =>
                setTags(e.currentTarget.value)
              }
            />
          </div>

          <div class="form-group">
            <label>Notes</label>

            <textarea
              rows={3}
              value={tempNote()}
              onInput={e =>
                setTempNote(
                  e.currentTarget.value,
                )
              }
            />
          </div>
        </>
      </Show>

      {/* =========================
          CYCLE MODE
      ========================= */}
      <Show when={entryType() === "cycle"}>
        <>
          <div class="form-group">
            <label>Cycle Event</label>

            <select
              value={cycleEvent()}
              onInput={e =>
                setCycleEvent(
                  e.currentTarget
                    .value as any,
                )
              }
            >
              <option value="period-start">
                Period Start
              </option>
              <option value="period-end">
                Period End
              </option>
              <option value="ovulation">
                Ovulation
              </option>
              <option value="spotting">
                Spotting
              </option>
              <option value="symptom">
                Symptom
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>Notes</label>

            <textarea
              rows={3}
              value={cycleNote()}
              onInput={e =>
                setCycleNote(
                  e.currentTarget.value,
                )
              }
            />
          </div>
        </>
      </Show>

      {/* =========================
          SUBMIT
      ========================= */}
      <button
        type="submit"
        class="submit-button"
      >
        {props.initialData
          ? "Update Entry"
          : "Save Entry"}
      </button>
    </form>
  )
}