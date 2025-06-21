<template>
  <UCard 
    class="hover:shadow-lg transition-shadow cursor-pointer"
    @click="navigateToGame(game.id)"
  >
    <template #header>
      <div class="flex justify-between items-center">
        <div class="text-sm text-gray-500">
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
          <div class="text-lg font-semibold">
            {{ game.homeTeam }}
          </div>
          <div v-if="game.winner === game.homeTeam">
            <UIcon name="i-heroicons-check-circle" class="w-4 h-4 text-success-500" />
          </div>
        </div>
        <div class="text-right">
          <div class="text-2xl font-bold">
            {{ game.homeScore || 0 }}
          </div>
          <div class="text-sm text-gray-500">
            {{ game.homeGoals || 0 }}.{{ game.homeBehinds || 0 }}
          </div>
        </div>
      </div>

      <!-- VS Divider -->
      <div class="text-center text-gray-400 font-medium">
        VS
      </div>

      <!-- Away Team -->
      <div class="flex justify-between items-center">
        <div class="flex items-center space-x-3">
          <div class="text-lg font-semibold">
            {{ game.awayTeam }}
          </div>
          <div v-if="game.winner === game.awayTeam">
            <UIcon name="i-heroicons-check-circle" class="w-4 h-4 text-success-500" />
          </div>
        </div>
        <div class="text-right">
          <div class="text-2xl font-bold">
            {{ game.awayScore || 0 }}
          </div>
          <div class="text-sm text-gray-500">
            {{ game.awayGoals || 0 }}.{{ game.awayBehinds || 0 }}
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-between items-center text-sm text-gray-500">
        <div>{{ game.venue }}</div>
        <div>{{ game.localtime }}</div>
      </div>
    </template>
  </UCard>
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

// Props
const props = defineProps<{
  game: Game;
}>();

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