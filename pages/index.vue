<script setup lang="ts">
interface Game {
  id: number;
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
  readableTime: string;
  unixtime: number;
  round: number;
  roundname: string;
}

interface ActiveGamesData {
  success: boolean;
  currentUnixTime: number;
  timeWindow: {
    start: number;
    end: number;
    startReadable: string;
    endReadable: string;
    currentReadable: string;
  };
  activeGamesCount: number;
  activeGames: Game[];
}


// Fetch current active games
const { data: activeGamesData, pending, error, refresh } = await useFetch<ActiveGamesData>('/api/afl/active-games', {
  server: false,
  default: () => ({
    success: false,
    currentUnixTime: 0,
    timeWindow: { start: 0, end: 0, startReadable: '', endReadable: '', currentReadable: '' },
    activeGamesCount: 0,
    activeGames: []
  } as ActiveGamesData)
});

// Auto-refresh every 30 seconds to keep current games updated
let refreshInterval: NodeJS.Timeout | null = null;

onMounted(() => {
  refreshInterval = setInterval(() => {
    refresh();
  }, 30000); // 30 seconds
});

onBeforeUnmount(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }
});
</script>

<template>
  <div class="min-h-screen">

    <!-- Current Games Section -->
    <div class="py-12 bg-gray-50 dark:bg-gray-900">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Section Header -->
        <div class="text-center mb-12">
          <h2 class="text-3xl md:text-4xl font-bold mb-4">
            Current Games
          </h2>
          <div class="flex items-center justify-center gap-2">
            <div class="w-2 h-2 bg-success-400 rounded-full animate-pulse"></div>
            <span class="text-sm text-gray-600">Updated every 30 seconds</span>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="pending" class="flex justify-center items-center h-64">
          <div class="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600"></div>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="text-center py-12">
          <div class="text-error-500 mb-4">
            <UIcon name="i-heroicons-exclamation-circle" class="mx-auto h-12 w-12 mb-4" />
            <p class="text-lg font-medium">Unable to load current games</p>
            <p class="text-sm text-gray-500 mt-2">{{ error }}</p>
          </div>
          <UButton @click="refresh()" color="primary" variant="outline">
            Try Again
          </UButton>
        </div>

        <!-- Games Grid -->
        <div v-else-if="activeGamesData?.activeGames?.length" class="space-y-8">
          <!-- Time Window Info -->
          <div class="bg-primary-50 rounded-lg p-4 text-center">
            <p class="text-sm text-primary-700">
              <strong>{{ activeGamesData.activeGamesCount }}</strong> active games found
              (as of {{ activeGamesData.timeWindow.currentReadable }})
            </p>
          </div>

          <!-- Games Grid -->
          <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <GameCard 
              v-for="game in activeGamesData.activeGames" 
              :key="game.id"
              :game="game"
            />
          </div>
        </div>

        <!-- No Current Games -->
        <div v-else class="text-center py-16">
          <div class="text-gray-500">
            <UIcon name="i-heroicons-clock" class="mx-auto h-16 w-16 mb-6" />
            <h3 class="text-2xl font-medium mb-4">No Current Games</h3>
            <p class="text-lg mb-2">There are no AFL games happening right now.</p>
            <p class="text-sm text-gray-400 mb-6">
              Last checked: {{ activeGamesData?.timeWindow?.currentReadable || 'Unknown' }}
            </p>
            <div class="flex justify-center gap-4">
              <UButton @click="refresh()" color="primary" variant="outline">
                Refresh
              </UButton>
            </div>
          </div>
        </div>
      </div>
    </div>


  </div>
</template> 