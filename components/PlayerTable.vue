<script setup lang="ts">
import { h, resolveComponent } from 'vue'
import { upperFirst } from 'scule'
import type { TableColumn } from '@nuxt/ui'
import type { Column } from '@tanstack/vue-table'
import NumberFlow from '@number-flow/vue'
import { useWindowSize } from '@vueuse/core'

const UBadge = resolveComponent('UBadge')
const UButton = resolveComponent('UButton')
const UDropdownMenu = resolveComponent('UDropdownMenu')

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
  [key: string]: any
}

interface Props {
  data?: Player[]
  gameDetails?: GameDetails
  title?: string
}

const props = withDefaults(defineProps<Props>(), {
  data: () => [],
  title: 'Player Statistics'
})

function getHeader(column: Column<Player>, label: string) {
  const isSorted = column.getIsSorted()

  return h(
    UDropdownMenu,
    {
      content: {
        align: 'start'
      },
      'aria-label': 'Actions dropdown',
      items: [
        {
          label: 'Asc',
          type: 'checkbox',
          icon: 'i-lucide-arrow-up-narrow-wide',
          checked: isSorted === 'asc',
          onSelect: () => {
            if (isSorted === 'asc') {
              column.clearSorting()
            } else {
              column.toggleSorting(false)
            }
          }
        },
        {
          label: 'Desc',
          icon: 'i-lucide-arrow-down-wide-narrow',
          type: 'checkbox',
          checked: isSorted === 'desc',
          onSelect: () => {
            if (isSorted === 'desc') {
              column.clearSorting()
            } else {
              column.toggleSorting(true)
            }
          }
        }
      ]
    },
    () =>
      h(UButton, {
        color: 'neutral',
        variant: 'ghost',
        label,
        icon: isSorted
          ? isSorted === 'asc'
            ? 'i-lucide-arrow-up-narrow-wide'
            : 'i-lucide-arrow-down-wide-narrow'
          : 'i-lucide-arrow-up-down',
        class: '-mx-2.5 data-[state=open]:bg-elevated',
        'aria-label': `Sort by ${isSorted === 'asc' ? 'descending' : 'ascending'}`
      })
  )
}

// Simplified columns for main view
const columns: TableColumn<Player>[] = [
  {
    id: 'expand',
    meta: {
      class: {
        td: 'w-6 md:w-10 px-0 md:px-2'
      }
    },
    cell: ({ row }) =>
      h(UButton, {
        color: 'neutral',
        variant: 'ghost',
        icon: 'i-lucide-chevron-down',
        size: 'xs',
        square: true,
        'aria-label': 'Expand',
        class: 'transition-transform duration-200' + (row.getIsExpanded() ? ' rotate-180' : ''),
        ui: {
          base: 'h-5 w-5 md:h-6 md:w-6 p-0.5 md:p-1',
          icon: {
            size: {
              xs: 'h-3 w-3 md:h-4 md:w-4'
            }
          }
        },
        onClick: () => row.toggleExpanded()
      })
  },
  {
    accessorKey: 'name',
    header: ({ column }) => getHeader(column, 'Player'),
    meta: {
      class: {
        td: 'min-w-0 flex-1'
      }
    },
    sortingFn: (rowA, rowB) => {
      // Extract last name from format like "r.smith"
      const getLastName = (name: string) => {
        const parts = name.split('.')
        return parts.length > 1 ? parts[1].toLowerCase() : name.toLowerCase()
      }
      
      const lastNameA = getLastName(rowA.getValue('name'))
      const lastNameB = getLastName(rowB.getValue('name'))
      
      return lastNameA.localeCompare(lastNameB)
    },
    cell: ({ row }) => {
      const player = row.original
      return h('div', { class: 'flex items-center gap-1 md:gap-3 py-1' }, [
        h('span', { class: 'flex-shrink-0 min-w-[1.5rem] md:min-w-[2rem] text-center text-xs md:text-sm font-bold' }, player.jumperNumber),
        h('span', { class: 'font-medium truncate text-xs md:text-sm' }, player.name)
      ])
    }
  },
  {
    accessorKey: 'eTOGPercentage',
    header: ({ column }) => getHeader(column, 'TOG%'),
    meta: {
      class: {
        td: 'w-20 text-center'
      }
    },
    cell: ({ row }) => {
      const tog = row.getValue('eTOGPercentage') as number
      return h('span', { class: 'font-medium text-xs md:text-sm' }, `${Math.round(tog)}%`)
    }
  },
  {
    accessorKey: 'aflFantasyPosition',
    header: ({ column }) => getHeader(column, 'Position'),
    meta: {
      class: {
        td: 'w-24 text-center'
      }
    }
  },
  {
    accessorKey: 'currentBench',
    header: ({ column }) => getHeader(column, 'Status'),
    meta: {
      class: {
        td: 'w-32 text-center'
      }
    },
    cell: ({ row }) => {
      const player = row.original
      const status = row.getValue('currentBench') as string
      const benchTime = player.benchTime
      const iconImage = player.iconImage
      
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
      
      const statusEmoji = getStatusEmoji(iconImage)
      const elements = []
      
      // Add status emoji if present
      if (statusEmoji) {
        elements.push(h('span', { class: 'text-base' }, statusEmoji))
      }
      
      // Add bench info if on bench
      if (status === 'Y') {
        elements.push(h('span', { class: 'text-base' }, '🪑'))
        elements.push(
          benchTime 
            ? h('span', { class: 'text-orange-600 dark:text-orange-400 font-mono' }, benchTime)
            : h('span', { class: 'text-orange-600 dark:text-orange-400' }, 'Bench')
        )
      }
      
      // Return elements if any exist, otherwise null
      return elements.length > 0 
        ? h('div', { class: 'flex items-center justify-center gap-1 text-xs' }, elements)
        : null
    }
  },
  {
    id: 'aflFantasy',
    accessorKey: 'aflFantasy',
    header: ({ column }) => getHeader(column, 'Fantasy'),
    meta: {
      class: {
        td: 'w-20 text-center'
      }
    }
  }
]

const table = useTemplateRef('table')

const columnVisibility = ref({
  playerId: false,
  aflFantasyPosition: false,
  currentBench: true, // Show bench column by default
  eTOGPercentage: false // Hide TOG% by default
})

// Functions to toggle column visibility
function togglePosition() {
  columnVisibility.value.aflFantasyPosition = !columnVisibility.value.aflFantasyPosition
}

function toggleBench() {
  columnVisibility.value.currentBench = !columnVisibility.value.currentBench
}

function toggleTOG() {
  columnVisibility.value.eTOGPercentage = !columnVisibility.value.eTOGPercentage
}

// Computed property for column toggle items
const columnToggleItems = computed(() => {
  return [
    {
      label: columnVisibility.value.aflFantasyPosition ? '✓ Position' : 'Position',
      click: togglePosition
    },
    {
      label: columnVisibility.value.currentBench ? '✓ Status' : 'Status',
      click: toggleBench
    },
    {
      label: columnVisibility.value.eTOGPercentage ? '✓ TOG%' : 'TOG%',
      click: toggleTOG
    }
  ]
})

const expanded = ref({})

const sorting = ref([
  {
    id: 'aflFantasy',
    desc: true
  }
])

// Add responsive breakpoint detection
const { width } = process.client ? useWindowSize() : { width: ref(1024) }
const isMobile = computed(() => process.client ? width.value < 768 : true) // Default to mobile on server

// Watch for mobile changes and update column visibility
watch(isMobile, (mobile) => {
  if (mobile) {
    // Hide more columns on mobile
    columnVisibility.value = {
      ...columnVisibility.value,
      eTOGPercentage: false,
      aflFantasyPosition: false,
      currentBench: false
    }
  } else {
    // Show more columns on desktop (but keep TOG% hidden by default)
    columnVisibility.value = {
      ...columnVisibility.value
      // Removed eTOGPercentage: true so it stays hidden by default
    }
  }
}, { immediate: true })

function getFantasyColorClass(score: number): string {
  if (score >= 200) return 'fantasy-platinum'
  if (score >= 150) return 'fantasy-gold'
  if (score >= 100) return 'fantasy-deep-red'
  if (score >= 75) return 'fantasy-dark-orange'
  if (score >= 50) return 'fantasy-purple'
  if (score >= 25) return 'fantasy-green'
  if (score >= 15) return 'fantasy-blue'
  return 'fantasy-none'
}

function getRowClass(player: Player) {
  const score = parseInt(player.aflFantasy)
  if (score >= 200) return 'row-platinum'
  if (score >= 150) return 'row-gold'
  if (score >= 100) return 'row-deep-red'
  if (score >= 75) return 'row-dark-orange'
  if (score >= 50) return 'row-purple'
  if (score >= 25) return 'row-green'
  return 'row-blue'
}
</script>

<template>
  <UCard class="mb-8 rounded-none md:rounded-lg first:border-r-0 md:first:border-r border-r border-default md:border-r-0">
    <template #header>
      <div class="flex justify-between items-center">
        <h3 class="text-sm md:text-lg font-semibold">{{ title }}</h3>
        <UDropdownMenu
          :items="columnToggleItems"
          :content="{ align: 'end' }"
        >
          <UButton
            color="neutral"
            variant="outline"
            trailing-icon="i-lucide-chevron-down"
            size="sm"
            class="md:hidden"
            square
          />
          <UButton
            label="Columns"
            color="neutral"
            variant="outline"
            trailing-icon="i-lucide-chevron-down"
            size="sm"
            class="hidden md:inline-flex"
          />
        </UDropdownMenu>
      </div>
    </template>

    <UTable
      ref="table"
      v-model:column-visibility="columnVisibility"
      v-model:expanded="expanded"
      v-model:sorting="sorting"
      :data="props.data"
      :columns="columns"
      :ui="{
        root: 'min-w-full text-xs md:text-sm',
        thead: 'hidden md:table-header-group',
        td: 'empty:p-0 px-1 md:px-4 py-1 md:py-2',
        th: 'px-1 md:px-4 py-2 md:py-3 text-xs md:text-sm',
        tbody: '[&>tr:last-child]:border-0'
      }"
    >
      <template #aflFantasy-cell="{ row }">
        <div :class="`font-medium text-center ${getFantasyColorClass(parseInt(row.getValue('aflFantasy')))}`">
          <NumberFlow :value="parseInt(row.getValue('aflFantasy'))" />
        </div>
      </template>
      
      <template #expanded="{ row }">
        <PlayerExpandedView 
          v-if="props.gameDetails" 
          :player="row.original" 
          :game-details="props.gameDetails" 
        />
      </template>
    </UTable>
  </UCard>
</template>

<style scoped>
/* Target rows based on fantasy score using CSS */
:deep(tbody tr) {
  position: relative;
}

/* Platinum (200+) - Silver/platinum color */
:deep(tbody tr:has(.fantasy-platinum)) {
  background-color: rgba(192, 192, 192, 0.15) !important;
  border-color: rgba(192, 192, 192, 0.4) !important;
}

:deep(tbody tr:has(.fantasy-platinum):hover) {
  background-color: rgba(192, 192, 192, 0.25) !important;
}

/* Gold (150-199) - Gold color */
:deep(tbody tr:has(.fantasy-gold)) {
  background-color: rgba(255, 215, 0, 0.15) !important;
  border-color: rgba(255, 215, 0, 0.4) !important;
}

:deep(tbody tr:has(.fantasy-gold):hover) {
  background-color: rgba(255, 215, 0, 0.25) !important;
}

/* Maroon (100-149) - Maroon color */
:deep(tbody tr:has(.fantasy-deep-red)) {
  background-color: rgba(128, 0, 32, 0.15) !important;
  border-color: rgba(128, 0, 32, 0.4) !important;
}

:deep(tbody tr:has(.fantasy-deep-red):hover) {
  background-color: rgba(128, 0, 32, 0.25) !important;
}

/* Red-Orange (75-99) - Red-orange color */
:deep(tbody tr:has(.fantasy-dark-orange)) {
  background-color: rgba(255, 30, 0, 0.15) !important;
  border-color: rgba(255, 30, 0, 0.4) !important;
}

:deep(tbody tr:has(.fantasy-dark-orange):hover) {
  background-color: rgba(255, 30, 0, 0.25) !important;
}

/* Purple (50-74) - Deeper purple color */
:deep(tbody tr:has(.fantasy-purple)) {
  background-color: rgba(75, 0, 130, 0.15) !important;
  border-color: rgba(75, 0, 130, 0.4) !important;
}

:deep(tbody tr:has(.fantasy-purple):hover) {
  background-color: rgba(75, 0, 130, 0.25) !important;
}

/* Green (25-49) - Green color */
:deep(tbody tr:has(.fantasy-green)) {
  background-color: rgba(34, 197, 94, 0.15) !important;
  border-color: rgba(34, 197, 94, 0.4) !important;
}

:deep(tbody tr:has(.fantasy-green):hover) {
  background-color: rgba(34, 197, 94, 0.25) !important;
}

/* Blue (15-24) - Blue color */
:deep(tbody tr:has(.fantasy-blue)) {
  background-color: rgba(59, 130, 246, 0.15) !important;
  border-color: rgba(59, 130, 246, 0.4) !important;
}

:deep(tbody tr:has(.fantasy-blue):hover) {
  background-color: rgba(59, 130, 246, 0.25) !important;
}

/* No color for scores below 15 */
:deep(tbody tr:has(.fantasy-none)) {
  background-color: transparent !important;
  border-color: transparent !important;
}

:deep(tbody tr:has(.fantasy-none):hover) {
  background-color: rgba(0, 0, 0, 0.02) !important;
}
</style>
