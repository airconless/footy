<script setup lang="ts">
// Set page meta
</script>

<template>
  <div class="min-h-screen">
    <!-- Hero Section -->
    <div class="bg-gradient-to-br from-blue-600 to-purple-700 dark:from-blue-800 dark:to-purple-900">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div class="text-center">
          <h1 class="text-4xl md:text-6xl font-bold text-white mb-6">
            Welcome to Footy WTF
          </h1>
          <p class="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Your ultimate destination for live AFL statistics, player performance, and match analytics
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
          </div>
        </div>
      </div>
    </div>

    <!-- Features Section -->
    <div class="py-24 bg-gray-50 dark:bg-gray-900">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Everything AFL in One Place
          </h2>
          <p class="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Explore comprehensive AFL data with real-time updates, detailed player statistics, and match insights
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <!-- Live Statistics -->
          <UCard class="hover:shadow-lg transition-shadow cursor-pointer" @click="navigateToLiveGame">
            <div class="text-center p-6">
              <div class="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg class="w-6 h-6 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd" />
                </svg>
              </div>
              <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">Live Statistics</h3>
              <p class="text-gray-600 dark:text-gray-400">
                Real-time player performance, fantasy scores, and match statistics updated every 3 seconds
              </p>
            </div>
          </UCard>

          <!-- Round Explorer -->
          <UCard class="hover:shadow-lg transition-shadow cursor-pointer">
            <div class="text-center p-6">
              <div class="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg class="w-6 h-6 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd" />
                </svg>
              </div>
              <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">Round Explorer</h3>
              <p class="text-gray-600 dark:text-gray-400">
                Browse all AFL rounds, view match schedules, and explore game results across the season
              </p>
            </div>
          </UCard>

          <!-- Game Details -->
          <UCard class="hover:shadow-lg transition-shadow">
            <div class="text-center p-6">
              <div class="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg class="w-6 h-6 text-purple-600 dark:text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clip-rule="evenodd" />
                </svg>
              </div>
              <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">Game Analysis</h3>
              <p class="text-gray-600 dark:text-gray-400">
                Deep dive into individual games with detailed player breakdowns, team statistics, and match analysis
              </p>
            </div>
          </UCard>
        </div>
      </div>
    </div>

    <!-- Quick Stats -->
    <div class="py-16 bg-white dark:bg-gray-800">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center">
          <h2 class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-8">
            Start Exploring
          </h2>
          <p class="text-lg text-gray-600 dark:text-gray-400 mb-8">
            Use the rounds dropdown in the navigation to jump straight to any AFL round, or explore live game statistics
          </p>
          <UButton 
            label="View Latest Round" 
            color="primary" 
            size="lg"
            icon="i-lucide-arrow-right"
          />
        </div>
      </div>
    </div>
  </div>
</template> 