import { createMemo, createSignal } from "solid-js"
import { loadData, saveData } from "../utils/storage"

export type Entry = any

function createEntriesStore() {
  const [entries, setEntries] = createSignal<Entry[]>(loadData())

  function persist(next: Entry[]) {
    setEntries(next)
    saveData(next)
  }

  function add(entry: Entry) {
    persist([
      ...entries(),
      { ...entry, id: crypto.randomUUID() },
    ])
  }

  function update(id: string, entry: Entry) {
    persist(
      entries().map(e =>
        e.id === id ? { ...entry, id } : e,
      ),
    )
  }

  function remove(id: string) {
    persist(entries().filter(e => e.id !== id))
  }

  // =========================
  // CYCLE INTELLIGENCE
  // =========================

  const cycleStarts = createMemo(() =>
    entries()
      .filter(
        (e: any) => e.type === "cycle" && e.event === "period-start",
      )
      .map((e: any) => new Date(e.timestamp).getTime())
      .sort((a: number, b: number) => a - b),
  )

  function getCycleDay(timestamp: string) {
    const time = new Date(timestamp).getTime()

    const lastStart = [...cycleStarts()]
      .reverse()
      .find((d: number) => d <= time)

    if (!lastStart) return null

    return Math.floor(
      (time - lastStart) / (1000 * 60 * 60 * 24),
    ) + 1
  }

  function getPhase(cd: number | null) {
    if (!cd) return "unknown"
    if (cd <= 5) return "menstrual"
    if (cd <= 13) return "follicular"
    if (cd <= 16) return "ovulation"
    return "luteal"
  }

  function enrichTemperature(entry: any) {
    const cd = getCycleDay(entry.timestamp)
    return {
      ...entry,
      cycleDay: cd,
      phase: getPhase(cd),
    }
  }

  const enrichedTemperatures = createMemo(() =>
    entries()
      .filter((e: any) => e.type === "temperature")
      .sort(
        (a: any, b: any) =>
          new Date(a.timestamp).getTime() -
          new Date(b.timestamp).getTime(),
      )
      .map(enrichTemperature),
  )

  function detectTempShift(temps: any[]) {
  if (temps.length < 6) return null

  for (let i = 3; i < temps.length; i++) {
    const prev = temps.slice(i - 3, i)
    const next = temps.slice(i, i + 3)

    const prevAvg =
      prev.reduce((s, t) => s + t.temperature, 0) /
      prev.length

    const nextAvg =
      next.reduce((s, t) => s + t.temperature, 0) /
      next.length

    if (nextAvg - prevAvg >= 0.2) {
      return temps[i].timestamp
    }
  }

  return null
}

function getCycleSegments(cycleStarts: number[]) {
  const segments: {
    start: number
    end: number
    length: number
  }[] = []

  for (let i = 0; i < cycleStarts.length - 1; i++) {
    const start = cycleStarts[i]
    const end = cycleStarts[i + 1]

    segments.push({
      start,
      end,
      length:
        (end - start) /
        (1000 * 60 * 60 * 24),
    })
  }

  return segments
}

const cycleLengths = createMemo(() => {
  const segments = getCycleSegments(cycleStarts())

  return segments.map(s => s.length)
})

const avgCycleLength = createMemo(() => {
  const lengths = cycleLengths()
  if (!lengths.length) return 28

  return (
    lengths.reduce((a, b) => a + b, 0) /
    lengths.length
  )
})

function getFertileWindow(ovulationCD: number | null) {
  if (!ovulationCD) return null

  return {
    start: ovulationCD - 5,
    end: ovulationCD - 1,
  }
}

function getOvulationCD(
  ovulationTimestamp: string | null,
  cycleStarts: number[],
) {
  if (!ovulationTimestamp || !cycleStarts.length)
    return null

  const time =
    new Date(ovulationTimestamp).getTime()

  const lastStart = [...cycleStarts]
    .reverse()
    .find(d => d <= time)

  if (!lastStart) return null

  return Math.floor(
    (time - lastStart) /
      (1000 * 60 * 60 * 24),
  ) + 1
}

const fertility = createMemo(() => {
  const temps = enrichedTemperatures()
  const cycles = cycleStarts()

  const ovulationTimestamp =
    detectTempShift(temps)

  const ovulationCD = getOvulationCD(
    ovulationTimestamp,
    cycles,
  )

  const fertileWindow =
    getFertileWindow(ovulationCD)

  const predictedCycle =
    avgCycleLength()

  const lastCycleStart =
    cycles[cycles.length - 1]

  const nextPeriod =
    lastCycleStart && predictedCycle
      ? new Date(
          lastCycleStart +
            predictedCycle *
              86400000,
        ).toISOString()
      : null

  return {
    ovulationTimestamp,
    ovulationCD,
    fertileWindow,
    avgCycleLength: predictedCycle,
    nextPeriod,
  }
})
  return {
    entries,
    add,
    update,
    remove,

    // computed
    fertility,
    cycleStarts,
    enrichedTemperatures,
  }
}

export const entriesStore = createEntriesStore()