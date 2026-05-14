export type TempEntry = {
  id: string
  type: "temperature"
  timestamp: string
  temperature: number
  note?: string
  tags?: string[]
}

export type CycleEvent = {
  id: string
  type: "cycle"
  timestamp: string
  event:
    | "period-start"
    | "period-end"
    | "ovulation"
    | "spotting"
    | "symptom"
  note?: string
}

type Entry = TempEntry | CycleEvent