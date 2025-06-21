<script setup lang="ts">
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
  benchTime?: string
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

type GameDetails = {
  lengthSeconds: string
  gamePeriods?: Record<string, string>
  [key: string]: any
}

interface Props {
  player: Player
  gameDetails: GameDetails
}

const props = defineProps<Props>()

// Map iconImage to emojis
const getStatusEmoji = (iconImage: string) => {
  switch (iconImage) {
    case 'redvest.png': return '🦺'
    case 'bandaid.png': return '🤕'
    case 'greenvest.png': return '🟢'
    case 'redcross.png': return '🚨'
    case 'padlock.png': return '🗜️'
    case 'tag.png': return '🔖'
    default: return null
  }
}
</script>

<template>
  <div class="p-4 bg-gray-50">
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div class="space-y-2">
        <h4 class="font-semibold text-sm text-gray-700"></h4>
        <div class="space-y-1 text-sm">
          <div class="flex justify-between">
            <span class="text-gray-600">Kicks:</span>
            <span class="font-medium">{{ player.kick }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Handballs:</span>
            <span class="font-medium">{{ player.handball }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Marks:</span>
            <span class="font-medium">{{ player.mark }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Tackles:</span>
            <span class="font-medium">{{ player.tackle }}</span>
          </div>
        </div>
      </div>

      <div class="space-y-2">
        <h4 class="font-semibold text-sm text-gray-700"></h4>
        <div class="space-y-1 text-sm">
          <div class="flex justify-between">
            <span class="text-gray-600">Goals:</span>
            <span class="font-medium">{{ player.goal }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Behinds:</span>
            <span class="font-medium">{{ player.behind }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Hit Outs:</span>
            <span class="font-medium">{{ player.hitOut }}</span>
          </div>
        </div>
      </div>

      <div class="space-y-2">
        <h4 class="font-semibold text-sm text-gray-700"></h4>
        <div class="space-y-1 text-sm">
          <div class="flex justify-between">
            <span class="text-gray-600">Free For:</span>
            <span class="font-medium">{{ player.freeFor }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Free Against:</span>
            <span class="font-medium">{{ player.freeAgainst }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">TOG%:</span>
            <span class="font-medium">{{ player.tOGPercentage }}%</span>
          </div>
          <div class="flex justify-between" v-if="player.currentBench === 'Y' || getStatusEmoji(player.iconImage)">
            <span class="text-gray-600">Status:</span>
            <span class="font-medium flex items-center gap-1">
              <!-- Status emoji if present -->
              <span v-if="getStatusEmoji(player.iconImage)">{{ getStatusEmoji(player.iconImage) }}</span>
              <!-- Bench info if on bench -->
              <template v-if="player.currentBench === 'Y'">
                <span>🪑</span>
                <span class="text-orange-600 dark:text-orange-400 font-mono text-xs">
                  {{ player.benchTime || 'On Bench' }}
                </span>
              </template>
            </span>
          </div>
        </div>
      </div>

      <div class="space-y-2">
        <h4 class="font-semibold text-sm text-gray-700"></h4>
        <div class="space-y-1 text-sm">
          <div class="flex justify-between">
            <span class="text-gray-600">Price:</span>
            <span class="font-medium">${{ (player.aflFantasyPrice * 1000)?.toLocaleString() }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Average:</span>
            <span class="font-medium">{{ player.aflFantasyAverage }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Break Even:</span>
            <span class="font-medium">{{ player.aflFantasyBreakEven }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Chart Section -->
    <div class="mt-6" v-if="gameDetails">
      <h4 class="font-semibold text-sm text-gray-700 mb-3">Fantasy Score Progress</h4>
      <div class="bg-white p-4 rounded-lg shadow-sm">
        <PlayerChart 
          :chart-data="player.chartData"
          :length-seconds="parseInt(gameDetails.lengthSeconds)"
          :player-name="player.name"
          :game-periods="gameDetails.gamePeriods"
        />
      </div>
    </div>
  </div>
</template> 