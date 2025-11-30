<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'

const props = defineProps({
  jsonData: {
    type: Object,
    required: true
  },
  rowHeight: { 
    type: Number, 
    default: 40 
  },
  visibleCount: { 
    type: Number, 
    default: 20 
  }
})

// Refs
const tableContainer = ref(null)
const headerContainer = ref(null)
const bodyContainer = ref(null)
const scrollTop = ref(0)

// Headers from parent
const headers = computed(() => props.jsonData.headers || [])

// Determine if we're using lazy loading or pre-generated rows
const isLazyMode = computed(() => typeof props.jsonData.getRow === 'function')
const totalRowCount = computed(() => {
  if (isLazyMode.value) {
    return props.jsonData.totalRows || 0
  }
  return props.jsonData.rows?.length || 0
})

// Search & filter state
const searchTerm = ref('')
const selectedColumn = ref('')

// Cache for lazy-generated rows (only for search/filter)
const rowCache = ref(new Map())

// Get row by index (lazy or direct)
function getRowByIndex(index) {
  if (isLazyMode.value) {
    // Check cache first
    if (rowCache.value.has(index)) {
      return rowCache.value.get(index)
    }
    // Generate and cache
    const row = props.jsonData.getRow(index)
    rowCache.value.set(index, row)
    return row
  }
  return props.jsonData.rows[index]
}

// For search: we need to generate rows on-demand
// This is still better than generating all upfront
const filteredIndices = computed(() => {
  const term = String(searchTerm.value || '').trim().toLowerCase()
  
  if (!term) {
    // No search - return all indices
    return Array.from({ length: totalRowCount.value }, (_, i) => i)
  }

  // Search mode - generate rows as needed for filtering
  const matches = []
  for (let i = 0; i < totalRowCount.value; i++) {
    const row = getRowByIndex(i)
    
    if (selectedColumn.value) {
      if (String(row[selectedColumn.value] ?? '').toLowerCase().includes(term)) {
        matches.push(i)
      }
    } else {
      const found = headers.value.some(h => 
        String(row[h] ?? '').toLowerCase().includes(term)
      )
      if (found) matches.push(i)
    }
  }
  
  return matches
})

// Virtual scrolling calculations
const startIndex = computed(() => {
  return Math.floor(scrollTop.value / props.rowHeight)
})

const endIndex = computed(() => {
  return Math.min(startIndex.value + props.visibleCount, filteredIndices.value.length)
})

// Only render visible rows (true DOM reuse - only ~20 rows in DOM)
const visibleRows = computed(() => {
  const result = []
  for (let i = startIndex.value; i < endIndex.value; i++) {
    const dataIndex = filteredIndices.value[i]
    result.push(getRowByIndex(dataIndex))
  }
  return result
})

// Spacer calculations
const topSpacer = computed(() => startIndex.value * props.rowHeight)
const bottomSpacer = computed(() => {
  return Math.max(0, (filteredIndices.value.length - endIndex.value) * props.rowHeight)
})

const totalHeight = computed(() => filteredIndices.value.length * props.rowHeight)

// Clear cache when search changes (optional optimization)
watch([searchTerm, selectedColumn], () => {
  if (isLazyMode.value && rowCache.value.size > 1000) {
    // Keep cache reasonable size
    rowCache.value.clear()
  }
})

// Scroll handlers
function handleScroll() {
  const bodyEl = bodyContainer.value
  const headerEl = headerContainer.value
  if (!bodyEl) return
  
  scrollTop.value = bodyEl.scrollTop
  
  if (headerEl && headerEl.scrollLeft !== bodyEl.scrollLeft) {
    headerEl.scrollLeft = bodyEl.scrollLeft
  }
}

function handleHeaderScroll() {
  const headerEl = headerContainer.value
  const bodyEl = bodyContainer.value
  
  if (headerEl && bodyEl && bodyEl.scrollLeft !== headerEl.scrollLeft) {
    bodyEl.scrollLeft = headerEl.scrollLeft
  }
}

// Column width synchronization
function setColumnWidths() {
  nextTick(() => {
    const headerTable = headerContainer.value?.querySelector('table')
    const bodyTable = bodyContainer.value?.querySelector('table')
    
    if (!headerTable || !bodyTable) return
    
    const bodyWrapper = bodyContainer.value
    const fullWidth = bodyWrapper.clientWidth
    const columnWidth = Math.floor(fullWidth / headers.value.length)
    const columnWidths = headers.value.map(() => columnWidth)
    
    const totalWidth = columnWidths.reduce((sum, width) => sum + width, 0)
    const minTableWidth = Math.max(totalWidth, fullWidth + 200)
    
    headerTable.style.width = `${minTableWidth}px`
    bodyTable.style.width = `${minTableWidth}px`
    headerTable.style.minWidth = `${minTableWidth}px`
    bodyTable.style.minWidth = `${minTableWidth}px`
    
    const headerCells = headerTable.querySelectorAll('th')
    const bodyRows = bodyTable.querySelectorAll('tr')
    
    headerCells.forEach((cell, index) => {
      cell.style.width = `${columnWidths[index]}px`
      cell.style.minWidth = `${columnWidths[index]}px`
      cell.style.maxWidth = `${columnWidths[index]}px`
      cell.style.boxSizing = 'border-box'
    })
    
    bodyRows.forEach(row => {
      const cells = row.querySelectorAll('td')
      cells.forEach((cell, index) => {
        cell.style.width = `${columnWidths[index]}px`
        cell.style.minWidth = `${columnWidths[index]}px`
        cell.style.maxWidth = `${columnWidths[index]}px`
        cell.style.boxSizing = 'border-box'
      })
    })
  })
}

onMounted(() => {
  setColumnWidths()
})

watch(visibleRows, () => {
  nextTick(() => setColumnWidths())
})
</script>

<template>
  <div class="virtual-table-container" ref="tableContainer">
    <!-- Search and filter controls -->
    <div class="table-controls">
      <input v-model="searchTerm" class="search-input" placeholder="Search..." />
      <select v-model="selectedColumn" class="column-select">
        <option value="">All columns</option>
        <option v-for="h in headers" :key="h" :value="h">{{ h }}</option>
      </select>
      <span class="row-count">{{ filteredIndices.length }} / {{ totalRowCount }} rows</span>
    </div>
    
    <!-- Fixed Header -->
    <div 
      class="header-wrapper" 
      ref="headerContainer"
      @scroll="handleHeaderScroll"
    >
      <table class="table header-table">
        <thead>
          <tr>
            <th v-for="header in headers" :key="header">
              {{ header }}
            </th>
          </tr>
        </thead>
      </table>
    </div>
    
    <!-- Scrollable Body with Virtual Scrolling -->
    <div 
      class="body-wrapper" 
      ref="bodyContainer"
      @scroll="handleScroll"
    >
      <div class="virtual-content" :style="{ height: totalHeight + 'px' }">
        <div :style="{ height: topSpacer + 'px' }"></div>
        
        <table class="table body-table">
          <tbody>
            <tr 
              v-for="(row, index) in visibleRows" 
              :key="startIndex + index"
              class="table-row"
            >
              <td v-for="header in headers" :key="header">
                {{ row[header] }}
              </td>
            </tr>
          </tbody>
        </table>
        
        <div :style="{ height: bottomSpacer + 'px' }"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.virtual-table-container {
  height: 600px;
  border: 1px solid #ddd;
  display: flex;
  flex-direction: column;
  background: rgb(43, 41, 41);
}

.header-wrapper {
  background: #303131;
  border-bottom: 2px solid #dee2e6;
  overflow-x: auto;
  overflow-y: hidden;
  flex-shrink: 0;
  scrollbar-width: none;
  -ms-overflow-style: none;
  padding-right: 8px;
  box-sizing: border-box;
}

.header-wrapper::-webkit-scrollbar {
  display: none;
}

.body-wrapper {
  flex: 1;
  overflow: auto;
  position: relative;
  box-sizing: border-box;
  scroll-padding: 0;
}

.virtual-content {
  position: relative;
}

.table {
  border-collapse: collapse;
  table-layout: fixed;
  margin: 0;
}

.header-table {
  background: #f6f2f2;
}

.body-table {
  background: #f6f2f2;
}

th, td {
  padding: 12px 16px;
  text-align: left;
  border-right: 1px solid #0c0c0c;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  box-sizing: border-box;
}

th {
  background: #ffffff;
  font-weight: 600;
  color: #212529;
  border-bottom: 1px solid #dee2e6;
}

td {
  color: #212529;
  border-bottom: 1px solid #f1f3f4;
}

.table-row:hover {
  background-color: #c9ced3;
}

th:last-child,
td:last-child {
  border-right: none;
}

.body-wrapper::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.body-wrapper::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.body-wrapper::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.body-wrapper::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.table-controls {
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 8px 12px;
  border-bottom: 1px solid #e6e6e6;
  background: #fafafa;
}

.search-input {
  flex: 1 1 300px;
  padding: 8px 10px;
  border: 1px solid #d0d0d0;
  border-radius: 4px;
  font-size: 14px;
}

.column-select {
  padding: 8px 10px;
  border: 1px solid #d0d0d0;
  border-radius: 4px;
  background: #fff;
}

.row-count {
  padding: 8px 12px;
  font-size: 13px;
  color: #666;
  background: #f0f0f0;
  border-radius: 4px;
}
</style>