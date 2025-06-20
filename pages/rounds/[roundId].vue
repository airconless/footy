<template>
  <div class="p-6">
    <div v-if="pending" class="flex justify-center items-center h-64">
      <div class="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
    </div>
    
    <div v-else-if="error" class="text-red-500 text-center">
      <p>Error loading round data: {{ error }}</p>
    </div>
    
    <div v-else>
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
              {{ roundData?.roundInfo?.roundname || `Round ${roundData?.roundInfo?.round}` }}
            </h1>
            <p class="text-lg text-gray-600 dark:text-gray-400 mt-1">
              {{ roundData?.roundInfo?.year }} Season
            </p>
          </div>
          <UBadge size="lg" variant="outline">
            {{ roundData?.games?.length || 0 }} Games
          </UBadge>
        </div>
      </div>

      <!-- Games Grid -->
      <div v-if="roundData?.games?.length" class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <UCard 
          v-for="game in roundData.games" 
          :key="game.id"
          class="hover:shadow-lg transition-shadow cursor-pointer"
          @click="navigateToGame(game.id)"
        >
          <template #header>
            <div class="flex justify-between items-center">
              <div class="text-sm text-gray-500 dark:text-gray-400">
                {{ formatDate(game.date) }}
              </div>
              <UBadge 
                :color="getGameStatusColor(game)" 
                variant="subtle"
                size="xs"
              >
                {{ getGameStatus(game) }}
              </UBadge>
            </div>
          </template>

          <!-- Teams and Scores -->
          <div class="space-y-4">
            <!-- Home Team -->
            <div class="flex justify-between items-center">
              <div class="flex items-center space-x-3">
                <div class="text-lg font-semibold text-gray-900 dark:text-white">
                  {{ game.homeTeam }}
                </div>
                <div v-if="game.winner === game.homeTeam" class="text-green-500">
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                  </svg>
                </div>
              </div>
              <div class="text-right">
                <div class="text-2xl font-bold text-gray-900 dark:text-white">
                  {{ game.homeScore || 0 }}
                </div>
                <div class="text-sm text-gray-500 dark:text-gray-400">
                  {{ game.homeGoals || 0 }}.{{ game.homeBehinds || 0 }}
                </div>
              </div>
            </div>

            <!-- VS Divider -->
            <div class="text-center text-gray-400 dark:text-gray-500 font-medium">
              VS
            </div>

            <!-- Away Team -->
            <div class="flex justify-between items-center">
              <div class="flex items-center space-x-3">
                <div class="text-lg font-semibold text-gray-900 dark:text-white">
                  {{ game.awayTeam }}
                </div>
                <div v-if="game.winner === game.awayTeam" class="text-green-500">
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                  </svg>
                </div>
              </div>
              <div class="text-right">
                <div class="text-2xl font-bold text-gray-900 dark:text-white">
                  {{ game.awayScore || 0 }}
                </div>
                <div class="text-sm text-gray-500 dark:text-gray-400">
                  {{ game.awayGoals || 0 }}.{{ game.awayBehinds || 0 }}
                </div>
              </div>
            </div>
          </div>

          <template #footer>
            <div class="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
              <div>{{ game.venue }}</div>
              <div>{{ game.localtime }}</div>
            </div>
          </template>
        </UCard>
      </div>

      <!-- No Games Message -->
      <div v-else class="text-center py-12">
        <div class="text-gray-500 dark:text-gray-400">
          <svg class="mx-auto h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p class="text-lg font-medium">No games found for this round</p>
        </div>
      </div>
    </div>
  </div>
</template>

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
}

interface RoundData {
  success: boolean;
  roundInfo: {
    year: number;
    round: number;
    roundname: string;
  };
  games: Game[];
}

// Get the round ID from the route
const route = useRoute();
const roundId = route.params.roundId as string;

// Set page meta for SEO
useHead({
  title: `Round ${roundId.split('-')[1]} - ${roundId.split('-')[0]} AFL Season`
});

// Fetch round data
const { data: roundData, pending, error } = await useFetch<RoundData>(`/api/afl/games/${roundId}`, {
  server: false,
  default: () => ({ success: false, roundInfo: { year: 0, round: 0, roundname: '' }, games: [] } as RoundData)
});

// Helper functions
const formatDate = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-AU', { 
    weekday: 'short', 
    day: 'numeric', 
    month: 'short' 
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

// Navigation function for games
const navigateToGame = (gameId: number) => {
  navigateTo(`/games/${gameId}`);
};
</script> 