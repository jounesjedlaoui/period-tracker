import { entriesStore } from "../store/entriesStore"
import TemperatureChart from "./TemperatureChart"

export default function FertilityDashboard() {
  const { fertility, enrichedTemperatures } =
    entriesStore

  const fert = fertility()
  const temps = enrichedTemperatures()

  const lastTemp = temps[temps.length - 1]

  return (
    <div class="dashboard">
      {/* =========================
          HEADER
      ========================= */}
      <div class="dashboard-header">
        <h2>Dashboard</h2>
        <p>
          Cycle intelligence, temperature trends &
          predictions
        </p>
      </div>

      {/* =========================
          GRID LAYOUT
      ========================= */}
      <div class="dashboard-grid">
        {/* LEFT: CHART */}
        <div class="dashboard-main">
          <TemperatureChart />
        </div>

        {/* RIGHT: INSIGHTS */}
        <div class="dashboard-side">
          <div class="card">
            <h3>Current State</h3>

            <p>
              🧬 Phase:{" "}
              <strong>
                {lastTemp?.phase ?? "unknown"}
              </strong>
            </p>

            <p>
              📅 Cycle Day:{" "}
              <strong>
                {lastTemp?.cycleDay ?? "—"}
              </strong>
            </p>

            <p>
              🌡️ Latest temp:{" "}
              <strong>
                {lastTemp?.temperature ?? "—"}°C
              </strong>
            </p>
          </div>

          {/* =========================
              FERTILITY INSIGHTS
          ========================= */}
          <div class="card">
            <h3>Fertility Insight</h3>

            {fert.ovulationTimestamp ? (
              <p>
                🥚 Ovulation detected around{" "}
                <strong>
                  {new Date(
                    fert.ovulationTimestamp,
                  ).toLocaleDateString()}
                </strong>
              </p>
            ) : (
              <p>
                🥚 No clear ovulation signal yet
              </p>
            )}

            {fert.fertileWindow && (
              <p>
                🌸 Fertile window: CD{" "}
                <strong>
                  {fert.fertileWindow.start}
                </strong>{" "}
                → CD{" "}
                <strong>
                  {fert.fertileWindow.end}
                </strong>
              </p>
            )}
          </div>

          {/* =========================
              PREDICTIONS
          ========================= */}
          <div class="card">
            <h3>Predictions</h3>

            <p>
              📆 Avg cycle length:{" "}
              <strong>
                {fert.avgCycleLength.toFixed(1)} days
              </strong>
            </p>

            <p>
              🔮 Next period:{" "}
              <strong>
                {fert.nextPeriod
                  ? new Date(
                      fert.nextPeriod,
                    ).toLocaleDateString()
                  : "unknown"}
              </strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}