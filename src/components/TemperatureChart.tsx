// src/components/TemperatureChart.tsx

import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  TimeScale,
  Tooltip,
  Legend,
  CategoryScale,
} from "chart.js"

import "chartjs-adapter-date-fns"
import { Line } from "solid-chartjs"
import { entriesStore } from "../store/entriesStore.tsx"

Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  TimeScale,
  Tooltip,
  Legend,
  CategoryScale,
)

/**
 * Fertility overlay plugin:
 * draws fertile window + ovulation + predicted period
 */
const fertilityPlugin = {
  id: "fertilityPlugin",

  beforeDraw(chart: any) {
    const { ctx, chartArea, scales } = chart
    const { fertility } = entriesStore

    const fert = fertility()

    if (!chartArea || !fert) return

    const { top, bottom } = chartArea
    const xScale = scales.x

    ctx.save()

    // =========================
    // Fertile window shading
    // =========================
    if (fert.fertileWindow) {
      const start = xScale.getPixelForValue(
        new Date(fert.fertileWindow.start).toISOString(),
      )

      const end = xScale.getPixelForValue(
        new Date(fert.fertileWindow.end).toISOString(),
      )

      ctx.fillStyle = "rgba(34, 197, 94, 0.08)"
      ctx.fillRect(start, top, end - start, bottom - top)
    }

    // =========================
    // Ovulation marker
    // =========================
    if (fert.ovulationTimestamp) {
      const x = xScale.getPixelForValue(
        fert.ovulationTimestamp,
      )

      ctx.strokeStyle = "#ef4444"
      ctx.lineWidth = 2

      ctx.beginPath()
      ctx.moveTo(x, top)
      ctx.lineTo(x, bottom)
      ctx.stroke()
    }

    // =========================
    // Next period marker
    // =========================
    if (fert.nextPeriod) {
      const x = xScale.getPixelForValue(fert.nextPeriod)

      ctx.strokeStyle = "#3b82f6"
      ctx.setLineDash([6, 4])

      ctx.beginPath()
      ctx.moveTo(x, top)
      ctx.lineTo(x, bottom)
      ctx.stroke()

      ctx.setLineDash([])
    }

    ctx.restore()
  },
}

Chart.register(fertilityPlugin)

export default function TemperatureChart() {
  const { enrichedTemperatures, cycleStarts, fertility } =
    entriesStore

  const data = () => ({
    datasets: [
      // =========================
      // Temperature series
      // =========================
      {
        label: "Temperature",
        data: enrichedTemperatures().map(e => ({
          x: e.timestamp,
          y: e.temperature,
          phase: e.phase,
          cycleDay: e.cycleDay,
        })),

        borderColor: "#aa3bff",
        tension: 0.3,
        pointRadius: 3,

        pointBackgroundColor: (ctx: any) => {
          const phase = ctx.raw?.phase

          switch (phase) {
            case "menstrual":
              return "#ef4444"
            case "ovulation":
              return "#f59e0b"
            case "luteal":
              return "#8b5cf6"
            default:
              return "#aa3bff"
          }
        },
      },

      // =========================
      // Cycle start markers
      // =========================
      {
        label: "Cycle Start",
        data: cycleStarts().map(t => ({
          x: new Date(t).toISOString(),
          y: 38,
        })),

        showLine: false,
        pointRadius: 9,
        pointBackgroundColor: "#ef4444",
        pointBorderColor: "#ffffff",
        pointBorderWidth: 2,
      },
    ],
  })

  const options = {
    responsive: true,
    maintainAspectRatio: false,

    interaction: {
      mode: "nearest" as const,
      intersect: false,
    },

    plugins: {
      legend: {
        position: "top" as const,
      },

      tooltip: {
        callbacks: {
          label(context: any) {
            const raw = context.raw
            if (!raw) return ""

            const parts = [
              `Temp: ${raw.y}`,
              raw.cycleDay ? `CD${raw.cycleDay}` : null,
              raw.phase ? `Phase: ${raw.phase}` : null,
            ].filter(Boolean)

            return parts.join(" | ")
          },
        },
      },
    },

    scales: {
      x: {
        type: "time" as const,
      },

      y: {
        suggestedMin: 35.5,
        suggestedMax: 38.5,
      },
    },
  }

  return (
    <div class="chart-card">
      <div class="chart-header">
        <h2>Temperature Tracking</h2>
        <p>
          Fertility-aware cycle visualization with
          phase detection
        </p>
      </div>

      <div class="chart-container">
        <Line data={data()} options={options} />
      </div>
    </div>
  )
}