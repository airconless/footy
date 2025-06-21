interface GameData {
  gameDetails: any
  home: { players: any[] }
  away: { players: any[] }
}

export const useRealTimeData = () => {
  const gameData = ref<GameData | null>(null)
  const pending = ref(false)
  const error = ref<string | null>(null)
  const lastUpdated = ref(new Date())
  const isConnected = ref(false)
  
  let pollInterval: NodeJS.Timeout | null = null
  let lastUpdateTime = '0'

  // Function to fetch data from the API
  const fetchData = async () => {
    try {
      pending.value = true
      error.value = null
      
      const response = await $fetch<GameData>('/api/afl/game')
      gameData.value = response
      lastUpdated.value = new Date()
      
      return response
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch data'
      console.error('Error fetching game data:', err)
      throw err
    } finally {
      pending.value = false
    }
  }

  // Function to check if data has been updated
  const checkForUpdates = async () => {
    try {
      const response = await $fetch<{ lastUpdateTime: string }>('/api/afl/last-update')
      const serverUpdateTime = response.lastUpdateTime
      
      // If server data is newer than our last known update, refresh
      if (serverUpdateTime !== lastUpdateTime) {
        lastUpdateTime = serverUpdateTime
        await fetchData()
        return true
      }
      return false
    } catch (err) {
      console.error('Error checking for updates:', err)
      return false
    }
  }

  // Start polling for updates
  const startPolling = (intervalMs = 5000) => {
    if (pollInterval) {
      clearInterval(pollInterval)
    }
    
    isConnected.value = true
    
    pollInterval = setInterval(async () => {
      await checkForUpdates()
    }, intervalMs)
  }

  // Stop polling
  const stopPolling = () => {
    if (pollInterval) {
      clearInterval(pollInterval)
      pollInterval = null
    }
    isConnected.value = false
  }

  // Manual refresh
  const refresh = async () => {
    return await fetchData()
  }

  // Auto-start polling when composable is used
  onMounted(() => {
    fetchData().then(() => {
      startPolling()
    })
    
    // Pause polling when page is hidden, resume when visible
    if (process.client) {
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          stopPolling()
        } else {
          startPolling()
          // Immediate check when tab becomes visible
          checkForUpdates()
        }
      })
    }
  })

  // Clean up on unmount
  onBeforeUnmount(() => {
    stopPolling()
  })

  return {
    gameData: readonly(gameData),
    pending: readonly(pending),
    error: readonly(error),
    lastUpdated: readonly(lastUpdated),
    isConnected: readonly(isConnected),
    refresh,
    startPolling,
    stopPolling
  }
} 