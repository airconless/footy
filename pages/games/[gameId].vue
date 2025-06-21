<template>
    <div class="p-6">
      <div v-if="pending" class="flex justify-center items-center h-64">
        <div class="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
      
      <div v-else-if="error" class="text-red-500 text-center">
        <p>Error loading game data: {{ error }}</p>
      </div>
      
      <div v-else-if="gameData?.game">
        <!-- Back Button -->
        <div class="mb-6">
          <UButton 
            icon="i-lucide-arrow-left" 
            variant="ghost" 
            @click="$router.back()"
            label="Back to Round"
          />
        </div>
  
        <!-- Game Header -->
        <div class="mb-8">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
                {{ gameData.game.homeTeam }} vs {{ gameData.game.awayTeam }}
              </h1>
              <p class="text-lg text-gray-600 dark:text-gray-400 mt-1">
                {{ gameData.game.roundname }} - {{ gameData.game.year }} Season
              </p>
            </div>
            <UBadge 
              :color="getGameStatusColor(gameData.game)" 
              variant="subtle"
              size="lg"
            >
              {{ getGameStatus(gameData.game) }}
            </UBadge>
          </div>
  
          <!-- Game Info Cards -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <UCard>
              <div class="text-center">
                <div class="text-sm text-gray-500 dark:text-gray-400">Date</div>
                <div class="text-lg font-semibold">{{ formatDate(gameData.game.date) }}</div>
              </div>
            </UCard>
            <UCard>
              <div class="text-center">
                <div class="text-sm text-gray-500 dark:text-gray-400">Time</div>
                <div class="text-lg font-semibold">{{ gameData.game.localtime }}</div>
              </div>
            </UCard>
            <UCard>
              <div class="text-center">
                <div class="text-sm text-gray-500 dark:text-gray-400">Venue</div>
                <div class="text-lg font-semibold">{{ gameData.game.venue }}</div>
              </div>
            </UCard>
          </div>
        </div>
  
        <!-- Score Display -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <!-- Home Team -->
          <UCard>
            <template #header>
              <div class="flex items-center justify-between">
                <h3 class="text-xl font-bold">{{ gameData.game.homeTeam }}</h3>
                <div v-if="gameData.game.winner === gameData.game.homeTeam" class="text-green-500">
                  <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                  </svg>
                </div>
              </div>
            </template>
            
            <div class="text-center">
              <div class="text-6xl font-bold text-gray-900 dark:text-white mb-2">
                {{ gameData.game.homeScore || 0 }}
              </div>
              <div class="text-2xl text-gray-600 dark:text-gray-400">
                {{ gameData.game.homeGoals || 0 }} goals, {{ gameData.game.homeBehinds || 0 }} behinds
              </div>
            </div>
          </UCard>
  
          <!-- Away Team -->
          <UCard>
            <template #header>
              <div class="flex items-center justify-between">
                <h3 class="text-xl font-bold">{{ gameData.game.awayTeam }}</h3>
                <div v-if="gameData.game.winner === gameData.game.awayTeam" class="text-green-500">
                  <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                  </svg>
                </div>
              </div>
            </template>
            
            <div class="text-center">
              <div class="text-6xl font-bold text-gray-900 dark:text-white mb-2">
                {{ gameData.game.awayScore || 0 }}
              </div>
              <div class="text-2xl text-gray-600 dark:text-gray-400">
                {{ gameData.game.awayGoals || 0 }} goals, {{ gameData.game.awayBehinds || 0 }} behinds
              </div>
            </div>
          </UCard>
        </div>
  
        <!-- Game Details -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <UCard>
            <template #header>
              <h3 class="text-lg font-semibold">Game Information</h3>
            </template>
            
            <div class="space-y-3">
              <div class="flex justify-between">
                <span class="text-gray-600 dark:text-gray-400">Status:</span>
                <UBadge 
                  :color="getGameStatusColor(gameData.game)" 
                  variant="subtle"
                >
                  {{ getGameStatus(gameData.game) }}
                </UBadge>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600 dark:text-gray-400">Completion:</span>
                <span>{{ gameData.game.complete }}%</span>
              </div>
              <div v-if="gameData.game.is_final" class="flex justify-between">
                <span class="text-gray-600 dark:text-gray-400">Final:</span>
                <UBadge color="success" variant="subtle">Yes</UBadge>
              </div>
              <div v-if="gameData.game.is_grand_final" class="flex justify-between">
                <span class="text-gray-600 dark:text-gray-400">Grand Final:</span>
                <UBadge color="primary" variant="subtle">Yes</UBadge>
              </div>
              <div v-if="gameData.game.timestr" class="flex justify-between">
                <span class="text-gray-600 dark:text-gray-400">Time Status:</span>
                <span>{{ gameData.game.timestr }}</span>
              </div>
            </div>
          </UCard>
  
          <UCard>
            <template #header>
              <h3 class="text-lg font-semibold">Match Details</h3>
            </template>
            
            <div class="space-y-3">
              <div class="flex justify-between">
                <span class="text-gray-600 dark:text-gray-400">Round:</span>
                <span>{{ gameData.game.roundname }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600 dark:text-gray-400">Season:</span>
                <span>{{ gameData.game.year }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600 dark:text-gray-400">Venue:</span>
                <span>{{ gameData.game.venue }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600 dark:text-gray-400">Date:</span>
                <span>{{ formatDate(gameData.game.date) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600 dark:text-gray-400">Local Time:</span>
                <span>{{ gameData.game.localtime }}</span>
              </div>
                      </div>
        </UCard>
      </div>

      <!-- Player Statistics Section -->
      <div class="mt-12">
        <div class="mb-8">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Live Player Statistics
          </h2>
          
          <!-- Live update controls -->
          <div class="flex justify-between items-center mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div class="text-sm text-gray-600 dark:text-gray-400">
              <span class="flex items-center gap-2">
                <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                Live Updates Active - Last updated: {{ lastUpdated.toLocaleTimeString() }}
              </span>
            </div>
            <div class="flex gap-2">
              <UButton 
                @click="refreshPlayers()" 
                :loading="playersPending"
                color="primary" 
                variant="outline"
                size="sm"
              >
                Refresh Now
              </UButton>
              <UButton 
                @click="updateCache()" 
                :loading="cacheUpdating"
                color="success" 
                variant="outline"
                size="sm"
              >
                Update Cache
              </UButton>
            </div>
          </div>
        </div>

        <!-- Player Tables -->
        <div v-if="playersPending" class="flex justify-center items-center h-64">
          <div class="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
        </div>
        
        <div v-else-if="playersError" class="text-red-500 text-center">
          <p>Error loading player data: {{ playersError }}</p>
        </div>
        
        <div v-else class="grid grid-cols-2 gap-4 md:gap-8">
          <!-- Home Team Card -->
          <UCard>
            <template #header>
              <div class="flex items-center justify-between">
                <h3 class="text-xl font-bold text-gray-900 dark:text-white">
                  {{ gameData?.game?.homeTeam || 'Home Team' }} 
                </h3>
                <UBadge color="primary" variant="subtle">
                  {{ homeData.length }}
                </UBadge>
              </div>
            </template>
            
            <PlayerTable :data="homeData" :gameDetails="playerGameData?.gameDetails" />
          </UCard>

          <!-- Away Team Card -->
          <UCard>
            <template #header>
              <div class="flex items-center justify-between">
                <h3 class="text-xl font-bold text-gray-900 dark:text-white">
                  {{ gameData?.game?.awayTeam || 'Away Team' }} 
                </h3>
                <UBadge color="secondary" variant="subtle">
                  {{ awayData.length }}
                </UBadge>
              </div>
            </template>
            
            <PlayerTable :data="awayData" :gameDetails="playerGameData?.gameDetails" />
          </UCard>
        </div>
      </div>
    </div>
    
    <div v-else class="text-center py-12">
        <div class="text-gray-500 dark:text-gray-400">
          <svg class="mx-auto h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p class="text-lg font-medium">Game not found</p>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
interface Game {
  id: number;
  apiID: number;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  homeGoals: number;
  homeBehinds: number;
  awayGoals: number;
  awayBehinds: number;
  venue: string;
  date: string;
  localtime: string;
  timestr: string;
  winner: string | null;
  complete: number;
  is_final: number;
  is_grand_final: number;
  roundname: string;
  year: number;
}

interface GameData {
  success: boolean;
  game: Game | null;
}

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

interface PlayerGameData {
  gameDetails: any
  home: { players: Player[] }
  away: { players: Player[] }
}
  
  // Get the game ID from the route
  const route = useRoute();
  const gameId = route.params.gameId as string;
  
  // Set page meta for SEO
  useHead({
    title: `Game ${gameId} - AFL Game Details`
  });
  
  // Fetch game data from database
const { data: gameData, pending, error } = await useFetch<GameData>(`/api/afl/game/${gameId}`, {
  server: false,
  default: () => ({ success: false, game: null } as GameData)
});

// Fetch player data from KV store for this specific game
const { data: playerGameData, pending: playersPending, error: playersError, refresh: refreshPlayers } = await useFetch<PlayerGameData>('/api/afl/game', {
  server: false,
  query: { gameId },
  default: () => ({ gameDetails: null, home: { players: [] }, away: { players: [] } } as PlayerGameData)
});

// Enhanced update checking using last update timestamp (from index.vue)
const isConnected = ref(true)
const lastUpdated = ref(new Date())
const cacheUpdating = ref(false)
let lastUpdateTime = '0'

const updateCache = async () => {
  try {
    cacheUpdating.value = true
    await $fetch('/api/afl/update-cache', {
      method: 'POST',
      body: { gameId }
    })
    // Refresh players after cache update
    await refreshPlayers()
    lastUpdated.value = new Date()
  } catch (err) {
    console.error('Error updating cache:', err)
  } finally {
    cacheUpdating.value = false
  }
}

const checkForUpdates = async () => {
  try {
    const response = await $fetch<{ lastUpdateTime: string }>('/api/afl/last-update', {
      query: { gameId }
    })
    const serverUpdateTime = response.lastUpdateTime
    
    // If server data is newer than our last known update, refresh immediately
    if (serverUpdateTime !== lastUpdateTime) {
      lastUpdateTime = serverUpdateTime
      await refreshPlayers()
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
watch(playerGameData, () => {
  if (playerGameData.value) {
    lastUpdated.value = new Date()
  }
})

const homeData = computed(() => playerGameData.value?.home?.players || [])
const awayData = computed(() => playerGameData.value?.away?.players || [])
  
  // Helper functions (same as round page)
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-AU', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long',
      year: 'numeric'
    });
  };
  
  const getGameStatus = (game: Game) => {
    if (game.complete === 100) {
      return 'Final';
    } else if (game.complete > 0) {
      return game.timestr || 'In Progress';
    } else {
      return 'Upcoming';
    }
  };
  
  const getGameStatusColor = (game: Game) => {
    if (game.complete === 100) {
      return 'success';
    } else if (game.complete > 0) {
      return 'warning';
    } else {
      return 'neutral';
    }
  };
  
  // Update page title when game data loads
  watch(gameData, (newData) => {
    if (newData?.game) {
      useHead({
        title: `${newData.game.homeTeam} vs ${newData.game.awayTeam} - AFL Game Details`
      });
    }
  });
  </script>