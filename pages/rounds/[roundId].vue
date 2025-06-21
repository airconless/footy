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
        <GameCard 
          v-for="game in roundData.games" 
          :key="game.id"
          :game="game"
        />
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

// These helper functions are now in the GameCard component
</script> 