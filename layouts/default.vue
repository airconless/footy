<template>
  <div class="min-h-screen" :class="{ 'dark': isDark }">
    <header class="bg-default shadow-sm border-b border-default">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <!-- Logo/Brand -->
          <div class="flex justify-start">
            <NuxtLink 
              to="/" 
              class="text-muted hover:text-default px-3 py-2 rounded-md text-base md:text-lg font-medium transition-colors whitespace-nowrap"
              active-class="text-primary"
            >
             Footy 🏈 WTF
            </NuxtLink>
          </div>

          <!-- Desktop Navigation (Centered) -->
          <nav class="hidden md:flex justify-center absolute left-1/2 transform -translate-x-1/2">
            <div class="flex space-x-4 items-center">
              <!-- Live Games -->
              <UButton 
                to="/"
                color="primary" 
                variant="soft"
                icon="i-heroicons-signal"
                size="sm"
              >
                Live Games
              </UButton>

              <!-- Current Round -->
              <UButton 
                :to="currentRoundPath"
                color="primary" 
                variant="outline"
                icon="i-heroicons-calendar-days"
                :loading="currentRoundLoading"
                size="sm"
              >
                {{ currentRoundLabel }}
              </UButton>
              
              <!-- Rounds Dropdown -->
              <UDropdownMenu 
                v-model:open="roundsDropdownOpen" 
                :items="roundMenuItems" 
                :ui="{ content: 'w-64' }"
              >
                <UButton 
                  label="All Rounds" 
                  color="neutral" 
                  variant="outline" 
                  icon="i-heroicons-chevron-down"
                  :loading="roundsLoading"
                  size="sm"
                />
              </UDropdownMenu>
            </div>
          </nav>

          <!-- Right Side Controls -->
          <div class="flex justify-end items-center space-x-4">
            <!-- Desktop Dark Mode Toggle -->
            <button
              @click="toggleDarkMode"
              class="hidden md:block p-2 rounded-md text-muted hover:text-default hover:bg-elevated transition-colors"
              aria-label="Toggle dark mode"
            >
              <svg v-if="isDark" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clip-rule="evenodd" />
              </svg>
              <svg v-else class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            </button>

            <!-- Mobile menu button -->
            <button
              @click="toggleMobileMenu"
              class="md:hidden p-2 rounded-md text-muted hover:text-default hover:bg-elevated transition-colors"
              aria-label="Toggle mobile menu"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Mobile Navigation -->
        <div v-show="showMobileMenu" class="md:hidden border-t border-default pt-4 pb-4">
          <div class="space-y-3">
            <!-- Live Games -->
            <div class="px-3">
              <UButton 
                to="/"
                @click="closeMobileMenu"
                color="primary" 
                variant="soft"
                icon="i-heroicons-signal"
                class="w-full justify-start"
                size="sm"
              >
                Live Games
              </UButton>
            </div>

            <!-- Current Round -->
            <div class="px-3">
              <UButton 
                :to="currentRoundPath"
                @click="closeMobileMenu"
                color="primary" 
                variant="outline"
                icon="i-heroicons-calendar-days"
                :loading="currentRoundLoading"
                class="w-full justify-start"
                size="sm"
              >
                {{ currentRoundLabel }}
              </UButton>
            </div>
            
            <!-- Mobile Rounds Dropdown -->
            <div class="px-3">
              <UDropdownMenu 
                v-model:open="mobileRoundsDropdownOpen" 
                :items="roundMenuItems" 
                :ui="{ content: 'w-full' }"
              >
                <UButton 
                  label="All Rounds" 
                  color="neutral" 
                  variant="outline" 
                  icon="i-heroicons-chevron-down"
                  :loading="roundsLoading"
                  class="w-full justify-start"
                  size="sm"
                />
              </UDropdownMenu> 
            </div>

            <!-- Mobile Dark Mode Toggle -->
            <div class="px-3">
              <UButton
                @click="toggleDarkMode"
                color="neutral"
                variant="outline"
                class="w-full justify-start"
                size="sm"
              >
                <template #leading>
                  <svg v-if="isDark" class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clip-rule="evenodd" />
                  </svg>
                  <svg v-else class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                </template>
                {{ isDark ? 'Light Mode' : 'Dark Mode' }}
              </UButton>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="bg-muted min-h-[calc(100vh-4rem)] transition-colors">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

interface RoundOption {
  value: string;
  label: string;
  round: number;
  roundname: string;
  year: number;
}

interface RoundsResponse {
  success: boolean;
  rounds: RoundOption[];
}

const isDark = ref(false)
const showMobileMenu = ref(false)
const roundsDropdownOpen = ref(false)
const mobileRoundsDropdownOpen = ref(false)

// Fetch rounds data
const { data: roundsData, pending: roundsLoading } = await useFetch<RoundsResponse>('/api/afl/rounds', {
  server: false,
  default: () => ({ success: false, rounds: [] } as RoundsResponse)
})

// Fetch current round data
interface CurrentRoundResponse {
  success: boolean;
  currentRound: {
    year: number;
    round: number;
    roundname: string;
    value: string;
    source: string;
  } | null;
}

const { data: currentRoundData, pending: currentRoundLoading } = await useFetch<CurrentRoundResponse>('/api/afl/current-round', {
  server: false,
  default: () => ({ success: false, currentRound: null } as CurrentRoundResponse)
})

// Computed properties for current round
const currentRoundPath = computed(() => {
  if (currentRoundData.value?.currentRound?.value) {
    return `/rounds/${currentRoundData.value.currentRound.value}`;
  }
  return '/rounds/2025-1'; // fallback
})

const currentRoundLabel = computed(() => {
  if (currentRoundData.value?.currentRound?.roundname) {
    return currentRoundData.value.currentRound.roundname;
  }
  return 'Current Round';
})

// Convert rounds data to dropdown menu format
const roundMenuItems = computed(() => {
  if (!roundsData.value?.rounds?.length) {
    return [{
      label: 'No rounds available',
      disabled: true
    }] satisfies DropdownMenuItem[]
  }
  
  return roundsData.value.rounds.map(round => ({
    label: round.label,
    icon: 'i-lucide-calendar',
    onSelect: () => navigateToRound(round.value)
  })) satisfies DropdownMenuItem[]
})

// Navigation function
const navigateToRound = (roundValue: string) => {
  if (roundValue) {
    navigateTo(`/rounds/${roundValue}`)
    roundsDropdownOpen.value = false
    mobileRoundsDropdownOpen.value = false
  }
}

// Initialize dark mode from localStorage or system preference
onMounted(() => {
  const stored = localStorage.getItem('darkMode')
  if (stored) {
    isDark.value = stored === 'true'
  } else {
    isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
  }
  
  // Apply dark class to html element for Tailwind
  if (isDark.value) {
    document.documentElement.classList.add('dark')
  }
})

const toggleDarkMode = () => {
  isDark.value = !isDark.value
  localStorage.setItem('darkMode', isDark.value.toString())
  
  if (isDark.value) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

const toggleMobileMenu = () => {
  showMobileMenu.value = !showMobileMenu.value
}

const closeMobileMenu = () => {
  showMobileMenu.value = false
}

// Close mobile menu when clicking outside
onMounted(() => {
  const handleClickOutside = (event: Event) => {
    const target = event.target as Element
    if (!target.closest('header') && showMobileMenu.value) {
      showMobileMenu.value = false
    }
  }
  
  document.addEventListener('click', handleClickOutside)
  
  onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
  })
})
</script>

<style scoped>
/* Additional custom styles if needed */
</style>