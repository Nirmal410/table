<script setup>
import { ref } from 'vue'
import VirtualTable from './components/VirtualTable.vue'

// JSON data with 8 columns and 500 rows
const jsonData = ref({
  headers: ['ID', 'Name', 'Email', 'Department', 'Position', 'Salary', 'Phone', 'Status'],
  rows: Array.from({ length: 500 }, (_, i) => ({
    'ID': i + 1,
    'Name': `Employee ${i + 1}`,
    'Email': `Email${i + 1}@sample.com`,
    'Department': ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance'][Math.floor(Math.random() * 5)],
    'Position': ['Manager', 'Developer', 'Analyst', 'Designer', 'Coordinator'][Math.floor(Math.random() * 5)],
    'Salary': `$${(Math.random() * 50000 + 50000).toFixed(0)}`,
    'Phone': `+91-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
    'Status': ['Active', 'Inactive', 'Pending'][Math.floor(Math.random() * 3)]
  }))
})
</script>

<template>
  <div class="app">
    <h1>Virtual Table with DOM Reuse</h1>
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