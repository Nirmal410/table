<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'

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

// Data from parent
const headers = computed(() => props.jsonData.headers || [])
const allRows = computed(() => props.jsonData.rows || [])

// Search & filter state (local to the table)
const searchTerm = ref('')
const selectedColumn = ref('')

// Filter rows by search term and optional selected column
const filteredRows = computed(() => {
  const term = String(searchTerm.value || '').trim().toLowerCase()
  if (!term) return allRows.value

  // If a specific column is selected, only search that column
  if (selectedColumn.value) {
    return allRows.value.filter(r => String(r[selectedColumn.value] ?? '').toLowerCase().includes(term))
  }

  // Otherwise search across all columns
  return allRows.value.filter(row => {
    return headers.value.some(h => String(row[h] ?? '').toLowerCase().includes(term))
  })
})

// Virtual scrolling calculations - DOM reuse logic
const startIndex = computed(() => {
  return Math.floor(scrollTop.value / props.rowHeight)
})

const endIndex = computed(() => {
  return Math.min(startIndex.value + props.visibleCount, filteredRows.value.length)
})

// Only render visible rows (DOM reuse)
const visibleRows = computed(() => {
  return filteredRows.value.slice(startIndex.value, endIndex.value)
})

// Spacer calculations for virtual scrolling
const topSpacer = computed(() => startIndex.value * props.rowHeight)
const bottomSpacer = computed(() => {
  return Math.max(0, (filteredRows.value.length - endIndex.value) * props.rowHeight)
})

const totalHeight = computed(() => filteredRows.value.length * props.rowHeight)

// Scroll handler for vertical and horizontal sync
function handleScroll() {
  const bodyEl = bodyContainer.value
  const headerEl = headerContainer.value
  if (!bodyEl) return
  
  // Update vertical scroll position
  scrollTop.value = bodyEl.scrollTop
  
  // Sync horizontal scroll with header - prevent shifting
  if (headerEl && headerEl.scrollLeft !== bodyEl.scrollLeft) {
    headerEl.scrollLeft = bodyEl.scrollLeft
  }
}

// Prevent header from scrolling independently
function handleHeaderScroll() {
  const headerEl = headerContainer.value
  const bodyEl = bodyContainer.value
  
  if (headerEl && bodyEl && bodyEl.scrollLeft !== headerEl.scrollLeft) {
    bodyEl.scrollLeft = headerEl.scrollLeft
  }
}

// Set equal column widths for perfect alignment
function setColumnWidths() {
  nextTick(() => {
    const headerTable = headerContainer.value?.querySelector('table')
    const bodyTable = bodyContainer.value?.querySelector('table')
    
    if (!headerTable || !bodyTable) return
    
    // Calculate exact column widths to prevent shifting
    const bodyWrapper = bodyContainer.value
    const headerWrapper = headerContainer.value
    
    // Use the full client width for calculations
    const fullWidth = bodyWrapper.clientWidth
    const columnWidth = Math.floor(fullWidth / headers.value.length)
    const columnWidths = headers.value.map(() => columnWidth)
    
    // Set table widths to be wider than container to enable horizontal scrolling
    const totalWidth = columnWidths.reduce((sum, width) => sum + width, 0)
    const minTableWidth = Math.max(totalWidth, fullWidth + 200) // Add extra width for scrolling
    
    // Ensure both tables have exactly the same width
    headerTable.style.width = `${minTableWidth}px`
    bodyTable.style.width = `${minTableWidth}px`
    headerTable.style.minWidth = `${minTableWidth}px`
    bodyTable.style.minWidth = `${minTableWidth}px`
    
    // Set individual column widths
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

// Watch for data changes and reset widths
computed(() => {
  if (visibleRows.value.length > 0) {
    nextTick(() => setColumnWidths())
  }
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
        <!-- Top spacer -->
        <div :style="{ height: topSpacer + 'px' }"></div>
        
        <!-- Visible rows (DOM reuse - only 20 rows rendered) -->
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
        
        <!-- Bottom spacer -->
        <div :style="{ height: bottomSpacer + 'px' }"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
body{
  background: linear-gradient(135deg, #118a8a 0%, #b4adbb 100%);
}
.virtual-table-container {
  height: 600px;
  border: 1px solid #ddd;
  display: flex;
  flex-direction: column;
  background: rgb(43, 41, 41);
}

/* Header */
.header-wrapper {
  background: #303131;
  border-bottom: 2px solid #dee2e6;
  overflow-x: auto;
  overflow-y: hidden;
  flex-shrink: 0;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
  /* Reserve space for body scrollbar to prevent shifting */
  padding-right: 8px;
  box-sizing: border-box;
}

.header-wrapper::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Opera */
}

/* Body */
.body-wrapper {
  flex: 1;
  overflow: auto;
  position: relative;
  /* Ensure consistent scrollbar space */
  box-sizing: border-box;
  /* Prevent content shift at scroll boundaries */
  scroll-padding: 0;
}

.virtual-content {
  position: relative;
}

/* Tables */
.table {
  border-collapse: collapse;
  table-layout: fixed;
  margin: 0;
}

.header-table {
  background: #f6f2f2; /* changed from dark to white */
}

.body-table {
  background: #f6f2f2; /* changed from gray/brown tone to white */
}

/* Cells */
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
  background: #ffffff; /* keep header cells white */
  font-weight: 600;
  color: #212529; /* darker text for contrast */
  border-bottom: 1px solid #dee2e6;
}

td {
  color: #212529; /* ensure body text is dark on white */
  border-bottom: 1px solid #f1f3f4;
}

/* Row styling */
.table-row:hover {
  background-color: #c9ced3;
}

/* .table-row:nth-child(even) {
  background-color: #161616;
} */

/* Remove last border */
th:last-child,
td:last-child {
  border-right: none;
}

/* Scrollbar styling */
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

/* Search / filter controls */
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
</style>