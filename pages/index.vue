<script setup lang="ts">
import { h, resolveComponent } from 'vue'
import { upperFirst } from 'scule'
import type { TableColumn } from '@nuxt/ui'

const UBadge = resolveComponent('UBadge')

type Player = {
  playerId: string
  name: string
  iconImage: string
  jumperNumber: string
  kick: string
  handball: string
  mark: string
  hitOut: string
  tackle: string
  freeFor: string
  freeAgainst: string
  goal: string
  behind: string
  aflFantasy: string
  predictedScore: number
  tOGPercentage: string
  eTOG: number
  eTOGPercentage: number
  currentBench: string
  aflFantasyPrice: number
  aflFantasyTotalPriceChange: number
  aflFantasyEstimatedPriceChange: number
  aflFantasyAverage: string
  aflFantasyBreakEven: string
  aflFantasyPosition: string
  selection: string
  chartData: any
  periodScores: any
  history: any[]
  team: string
  teamName: string
  teamShort: string
}

interface GameData {
  gameDetails: any
  home: { players: Player[] }
  away: { players: Player[] }
}

// Fetch data from KV store with enhanced real-time updates
const { data: gameData, pending, error, refresh } = await useFetch<GameData>('/api/afl/game', {
  // Refresh when user returns to tab
  server: false,
  default: () => ({ gameDetails: null, home: { players: [] }, away: { players: [] } } as GameData)
})

// Enhanced update checking using last update timestamp
const isConnected = ref(true)
const lastUpdated = ref(new Date())
let lastUpdateTime = '0'

const checkForUpdates = async () => {
  try {
    const response = await $fetch<{ lastUpdateTime: string }>('/api/afl/last-update')
    const serverUpdateTime = response.lastUpdateTime
    
    // If server data is newer than our last known update, refresh immediately
    if (serverUpdateTime !== lastUpdateTime) {
      lastUpdateTime = serverUpdateTime
      await refresh()
      lastUpdated.value = new Date()
    }
  } catch (err) {
    console.error('Error checking for updates:', err)
    isConnected.value = false
  }
}

// Poll for updates every 3 seconds (faster than data refresh) to catch cron job updates
let updateCheckInterval: NodeJS.Timeout | null = null

onMounted(() => {
  updateCheckInterval = setInterval(checkForUpdates, 3000)
  lastUpdated.value = new Date()
})

onBeforeUnmount(() => {
  if (updateCheckInterval) {
    clearInterval(updateCheckInterval)
  }
})

// Update timestamp when data changes
watch(gameData, () => {
  if (gameData.value) {
    lastUpdated.value = new Date()
  }
})

const homeData = computed(() => gameData.value?.home?.players || [])
const awayData = computed(() => gameData.value?.away?.players || [])

const columns: TableColumn<Player>[] = [
  {
    accessorKey: 'name',
    header: 'Player',
    cell: ({ row }) => {
      const player = row.original
      return h('div', { class: 'flex items-center gap-2' }, [
        h(UBadge, { size: 'xs', variant: 'subtle' }, () => player.jumperNumber),
        h('span', { class: 'font-medium' }, player.name)
      ])
    }
  },
  {
    accessorKey: 'aflFantasyPosition',
    header: 'Position'
  },
  {
    accessorKey: 'kick',
    header: 'Kicks'
  },
  {
    accessorKey: 'handball',
    header: 'Handballs'
  },
  {
    accessorKey: 'mark',
    header: 'Marks'
  },
  {
    accessorKey: 'tackle',
    header: 'Tackles'
  },
  {
    accessorKey: 'goal',
    header: 'Goals'
  },
  {
    accessorKey: 'behind',
    header: 'Behinds'
  },
  {
    accessorKey: 'aflFantasy',
    header: 'Fantasy',
    cell: ({ row }) => {
      const score = row.getValue('aflFantasy') as string
      const scoreNum = parseInt(score)
      const color = scoreNum >= 100 ? 'success' : scoreNum >= 70 ? 'warning' : 'error'
      return h(UBadge, { color, variant: 'subtle' }, () => score)
    }
  },
  {
    accessorKey: 'tOGPercentage',
    header: 'TOG%',
    cell: ({ row }) => `${row.getValue('tOGPercentage')}%`
  },
  {
    accessorKey: 'currentBench',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('currentBench') as string
      const color = status === 'Y' ? 'warning' : 'success'
      const text = status === 'Y' ? 'Bench' : 'Field'
      return h(UBadge, { color, variant: 'subtle', size: 'xs' }, () => text)
    }
  }
]

const columnVisibility = ref({
  playerId: false
})
</script>

<template>
  <div class="p-6">
    <div v-if="pending" class="flex justify-center items-center h-64">
      <div class="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
    </div>
    
    <div v-else-if="error" class="text-red-500 text-center">
      <p>Error loading game data: {{ error }}</p>
    </div>
    
    <div v-else>
      <!-- Live update controls -->
      <div class="flex justify-between items-center mb-6 p-4 bg-gray-50 rounded-lg">
        <div class="text-sm text-gray-600">
          <span class="flex items-center gap-2">
            <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            Live Updates Active - Last updated: {{ lastUpdated.toLocaleTimeString() }}
          </span>
        </div>
        <UButton 
          @click="refresh()" 
          :loading="pending"
          color="primary" 
          variant="outline"
          size="sm"
        >
          Refresh Now
        </UButton>
      </div>

      <PlayerTable :data="homeData" :gameDetails="gameData?.gameDetails" />
      <PlayerTable :data="awayData" :gameDetails="gameData?.gameDetails" />
    </div>
  </div>
</template> 