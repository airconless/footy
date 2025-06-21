<template>
  <div class="w-full h-64">
    <ClientOnly>
      <Line :data="data" :options="options" />
      <template #fallback>
        <div class="w-full h-64 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded">
          <div class="text-gray-500 dark:text-gray-400">Loading chart...</div>
        </div>
      </template>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import { Line } from 'vue-chartjs'

if (process.client) {
  ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
  )
}

interface Props {
  chartData: any
  lengthSeconds: number
  playerName: string
  gamePeriods?: Record<string, string>
}

const props = defineProps<Props>()

const data = computed(() => {
  // Handle case where chartData might be missing or empty
  if (!props.chartData || Object.keys(props.chartData).length === 0) {
    return {
      datasets: [
        {
          label: `${props.playerName} Fantasy Score`,
          backgroundColor: '#3b82f6',
          borderColor: '#3b82f6',
          data: [],
          fill: false,
          tension: 0.1,
          pointRadius: 2,
          pointHoverRadius: 5
        }
      ]
    }
  }

  // Convert chartData object to arrays for Chart.js
  const chartEntries = Object.entries(props.chartData).map(([time, data]) => ({
    x: parseInt(time),
    y: (data as any).score
  }))

  // Sort by time to ensure proper line drawing
  chartEntries.sort((a, b) => a.x - b.x)

  // Add final point at lengthSeconds with the last score
  const lastScore = chartEntries.length > 0 ? chartEntries[chartEntries.length - 1].y : 0
  if (chartEntries.length === 0 || chartEntries[chartEntries.length - 1].x < props.lengthSeconds) {
    chartEntries.push({
      x: props.lengthSeconds,
      y: lastScore
    })
  }

  return {
    datasets: [
      {
        label: `${props.playerName} Fantasy Score`,
        backgroundColor: '#3b82f6',
        borderColor: '#3b82f6',
        data: chartEntries,
        fill: false,
        tension: 0.1,
        pointRadius: 2,
        pointHoverRadius: 5
      }
    ]
  }
})

const options = computed(() => {
  return {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: 'linear' as const,
        position: 'bottom' as const,
        title: {
          display: false,
          text: 'Game Progress'
        },
        min: 0,
        max: props.lengthSeconds,
        ticks: {
          callback: function(value: any, index: any) {
            const seconds = Number(value)
            
            // Always show start
            if (seconds === 0) return 'Start'
            
            // Check if this value is close to any quarter end
            if (props.gamePeriods) {
              for (const [quarter, quarterSeconds] of Object.entries(props.gamePeriods)) {
                const qSeconds = parseInt(quarterSeconds)
                if (Math.abs(seconds - qSeconds) <= 50) {
                  return `Q${quarter} End`
                }
              }
            }
            
            // Show end label
            if (Math.abs(seconds - props.lengthSeconds) <= 50) {
              return 'Final'
            }
            
            // For other ticks, don't show label
            return ''
          },
          // Generate ticks at quarter boundaries
          stepSize: props.gamePeriods ? Math.floor(props.lengthSeconds / 6) : Math.floor(props.lengthSeconds / 8),
          maxTicksLimit: 8
        }
      },
      y: {
        title: {
          display: false,
          text: 'Fantasy Score'
        },
        min: 0
      }
    },
    plugins: {
      title: {
        display: false,
        text: `${props.playerName} Fantasy Score Over Time`
      },
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          title: (context: any) => {
            const seconds = context[0].parsed.x
            
            // Find which quarter this time falls in
            let quarter = 'Game'
            if (props.gamePeriods) {
              let currentQuarter = 1
              for (const [q, qSeconds] of Object.entries(props.gamePeriods)) {
                if (seconds <= parseInt(qSeconds)) {
                  quarter = `Q${q}`
                  break
                }
                currentQuarter = parseInt(q) + 1
              }
            }
            
            const minutes = Math.floor(seconds / 60)
            const remainingSeconds = seconds % 60
            return `${quarter} - ${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
          },
          label: (context: any) => {
            return `Fantasy Score: ${context.parsed.y}`
          }
        }
      }
    }
  }
})
</script> 