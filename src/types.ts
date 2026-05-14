export type TempEntry = {
  type: "temperature"
  timestamp: string
  temperature: number
  note?: string
  tags?: string[]
}

export type CycleEvent = {
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

export type Entry = TempEntry | CycleEvent