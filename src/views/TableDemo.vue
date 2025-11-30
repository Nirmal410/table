<script setup>
import { ref } from 'vue'
import VirtualTable from '@/components/VirtualTable.vue' // Adjust the path as necessary

const jsonData = ref({
  headers: ['ID', 'Name', 'Email', 'Age', 'Department', 'Position', 'Salary', 'Phone', 'Join Date', 'Gender', 'Food'],
  rows: Array.from({ length: 1000 }, (_, i) => ({
    'ID': i + 1,
    'Name': `Person ${i + 1}`,
    'Email': `Email${i + 1}@email.com`,
    'Age': Math.floor(Math.random() * 40) + 20,
    'Department': ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance'][Math.floor(Math.random() * 5)],
    'Position': ['Manager', 'Developer', 'Analyst', 'Designer', 'Coordinator'][Math.floor(Math.random() * 5)],
    'Salary': `₹${(Math.random() * 50000 + 30000).toFixed(0)}`,
    'Phone': `+91-${Math.floor(Math.random() * 9000000000) + 7000000000}`,
    'Join Date': new Date(2020 + Math.floor(Math.random() * 4), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toLocaleDateString(),
    'Gender': ['Male','Female'][Math.floor(Math.random()*2)],
    'Food': ['Plain parotta','Bun parotta','Veech parotta','Chicken lappa','Egg lappa','Chicken kothu','Egg kothu'][Math.floor(Math.random()*7)]
  }))
})
</script>

<template>
  <div class="demo-container">
    <div class="header">
      <h1>Virtual Table Demo - JSON Data</h1>
    </div>
    <VirtualTable 
      :json-data="jsonData"
      :row-height="40"
      :visible-count="20"
    />
  </div>
</template>

<style scoped>
.demo-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #0e0f0f 0%, #b4adbb 100%);
  padding: 20px;
}

.header {
  text-align: center;
  margin-bottom: 20px;
}

.header h1 {
  color: white;
  margin: 0;
  font-size: 2.5rem;
  font-weight: 700;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
}

@media (max-width: 768px) {
  .header h1 {
    font-size: 2rem;
  }
}
</style>