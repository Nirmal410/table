<script setup>
import { ref, computed } from 'vue'
import VirtualTable from './components/VirtualTable.vue'

const TOTAL_ROWS = 1000

// Store only metadata, not actual row objects
const totalRows = ref(TOTAL_ROWS)
const headers = ref(['ID', 'Name', 'Email', 'Department', 'Position', 'Salary', 'Phone', 'Status'])

// Function to generate a single row on-demand
function generateRow(index) {
  return {
    'ID': index + 1,
    'Name': `Employee ${index + 1}`,
    'Email': `Email${index + 1}@sample.com`,
    'Department': ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance'][Math.floor(Math.random() * 5)],
    'Position': ['Manager', 'Developer', 'Analyst', 'Designer', 'Coordinator'][Math.floor(Math.random() * 5)],
    'Salary': `$${(Math.random() * 50000 + 50000).toFixed(0)}`,
    'Phone': `+91-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
    'Status': ['Active', 'Inactive', 'Pending'][Math.floor(Math.random() * 3)]
  }
}

// Virtual row generator - creates rows only when needed
const jsonData = computed(() => ({
  headers: headers.value,
  totalRows: totalRows.value,
  getRow: generateRow
}))
</script>

<template>
  <div class="app">
    <h1>Virtual Table with DOM Reuse + Lazy Loading</h1>
    <VirtualTable 
      :json-data="jsonData"
      :row-height="40"
      :visible-count="20"
    />
  </div>
</template>

<style scoped>
.app {
  padding: 20px;
  background: #f5f5f5;
  min-height: 100vh;
}

h1 {
  text-align: center;
  color: #333;
  margin-bottom: 20px;
}
</style>