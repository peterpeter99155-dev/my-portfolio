<template>
  <div class="relative w-full flex items-center justify-center mt-2">
    <div ref="chartRef" class="w-full h-[220px] md:h-[300px]"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { usePortfolio } from '../composables/usePortfolio'

const props = defineProps({
  displayCurrency: { type: String, default: 'TWD' }
})

const portfolio = usePortfolio()
const chartRef = ref(null)
let chartInstance = null
let resizeObserver = null

const initChart = () => {
  if (window.echarts && chartRef.value) {
    if (chartInstance) {
      chartInstance.dispose()
    }
    chartInstance = window.echarts.init(chartRef.value)
    
    // Use ResizeObserver for memory-safe resizing
    resizeObserver = new ResizeObserver(() => {
      if (chartInstance) chartInstance.resize()
    })
    resizeObserver.observe(chartRef.value)
  }
}

const updateChart = () => {
  if (!chartInstance) return
  
  const data = []
  const colors = ['#00C805', '#24A0ED', '#818CF8', '#C084FC', '#FF5000', '#F59E0B', '#EAB308', '#64748B']
  
  let colorIdx = 0
  const addData = (items, defaultColor) => {
    items.forEach((i) => {
      const v = portfolio.getDisplayValue(i, props.displayCurrency)
      if (v > 0) {
        data.push({
          value: v,
          name: i.name || 'Unknown',
          itemStyle: { color: defaultColor || colors[colorIdx % 8] }
        })
        if (!defaultColor) colorIdx++
      }
    })
  }

  // 避免直接把 computed ref 當陣列 iterate，加上 .value
  addData(portfolio.coreList.value)
  addData(portfolio.satelliteList.value)
  
  if (portfolio.usdCash.value) {
    addData([portfolio.usdCash.value], '#24A0ED') // USD Cash color
  }
  if (portfolio.twdCash.value) {
    addData([portfolio.twdCash.value], '#00C805') // TWD Cash color
  }

  const symbol = props.displayCurrency === 'USD' ? '$' : 'NT$'
  
  chartInstance.setOption({
    tooltip: { trigger: 'item', formatter: `{b}<br/>${symbol} {c} ({d}%)` },
    series: [{
      type: 'pie',
      radius: ['35%', '60%'],
      label: {
        show: true,
        formatter: '{name|{b}}\n{perc|{d}%}',
        rich: {
          name: { color: '#E5E7EB', fontSize: 11, fontWeight: 'bold' },
          perc: { color: '#9CA3AF', fontSize: 10 }
        }
      },
      data
    }]
  })
}

// Watch positions deep to update chart
watch(() => portfolio.positions.value, () => {
  updateChart()
}, { deep: true })

watch(() => props.displayCurrency, () => {
  updateChart()
})

onMounted(() => {
  // Use a slight timeout to ensure DOM is ready and window.echarts is loaded
  setTimeout(() => {
    initChart()
    updateChart()
  }, 100)
})

onBeforeUnmount(() => {
  if (resizeObserver && chartRef.value) {
    resizeObserver.unobserve(chartRef.value)
    resizeObserver.disconnect()
  }
  if (chartInstance) {
    chartInstance.dispose()
    chartInstance = null
  }
})
</script>
