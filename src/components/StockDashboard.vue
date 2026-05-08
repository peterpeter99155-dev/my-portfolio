<template>
  <div class="space-y-5" @click="closeSearch">
    <div class="flex items-center justify-end">
      <div class="flex items-center gap-2.5">
        <div class="flex bg-slate-800/90 rounded-lg p-1 border border-slate-700/80 shadow-inner">
          <button @click="$emit('update:displayCurrency', 'TWD')" :class="displayCurrency === 'TWD' ? 'bg-indigo-500 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'" class="min-w-[48px] h-[36px] text-[11px] font-bold rounded-md uppercase transition-all">台幣</button>
          <button @click="$emit('update:displayCurrency', 'USD')" :class="displayCurrency === 'USD' ? 'bg-indigo-500 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'" class="min-w-[48px] h-[36px] text-[11px] font-bold rounded-md uppercase transition-all">美金</button>
        </div>
        <button
          @click="$emit('toggle-private-mode')"
          class="flex items-center justify-center gap-1.5 px-4 h-[44px] rounded-lg text-xs font-bold tracking-wide transition-all border bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white hover:border-slate-500 active:scale-95"
        >
          <svg v-if="isPrivateMode" class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" /><circle cx="12" cy="12" r="3" />
          </svg>
          <svg v-else class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" />
          </svg>
          <span>{{ isPrivateMode ? '顯示' : '隱藏' }}</span>
        </button>
        <button
          @click="refreshAll(true)"
          :disabled="isRefreshing"
          class="flex items-center justify-center gap-1.5 px-4 h-[44px] rounded-lg text-xs font-bold tracking-wide transition-all border"
          :class="isRefreshing ? 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed' : 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30 hover:bg-indigo-500/25 active:scale-95'"
        >
          <svg v-if="!isRefreshing" xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <svg v-else class="animate-spin h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>{{ isRefreshing ? '更新中...' : '刷新' }}</span>
        </button>
      </div>
    </div>

    <section class="grid grid-cols-1 md:grid-cols-3 gap-3">
      <article class="bg-gray-900/50 rounded-xl p-4 flex flex-col justify-center items-center text-center">
        <p class="text-[11px] text-gray-400 font-bold mb-1 tracking-widest">總投資成本</p>
        <p class="text-2xl font-bold text-gray-100 font-mono tabular-nums leading-none">{{ displayCurrency === 'USD' ? '$' : 'NT$' }} {{ formatNumber(summary.totalCostDisplay) }}</p>
      </article>
      <article class="bg-gray-900/50 rounded-xl p-4 flex flex-col justify-center items-center text-center">
        <p class="text-[11px] text-gray-400 font-bold mb-1 tracking-widest">總當前市值</p>
        <p class="text-2xl font-bold text-gray-100 font-mono tabular-nums leading-none">{{ displayCurrency === 'USD' ? '$' : 'NT$' }} {{ formatNumber(summary.totalMarketDisplay) }}</p>
      </article>
      <article class="bg-gray-900/50 rounded-xl p-4 flex flex-col justify-center items-center text-center">
        <p class="text-[11px] text-gray-400 font-bold mb-1 tracking-widest">未實現損益</p>
        <p :class="summary.profitPct >= 0 ? 'text-[#00C805]' : 'text-[#FF5000]'" class="text-2xl font-bold font-mono tabular-nums leading-none">
          {{ summary.profitPct >= 0 ? '+' : '' }}{{ summary.profitPct.toFixed(2) }}%
        </p>
      </article>
    </section>

    <!-- Chart Slot -->
    <slot name="chart"></slot>

    <section class="bg-gray-900/40 rounded-xl p-4 md:p-5 mt-6 border border-gray-800/50 shadow-sm">
      <h3 class="text-sm font-bold text-gray-200 mb-4 tracking-wide">新增標的</h3>
      <div class="grid grid-cols-2 md:grid-cols-12 gap-3 items-end">
        <label class="col-span-2 md:col-span-4 relative group">
          <span class="block text-[11px] text-gray-500 mb-1.5 font-bold tracking-widest transition-colors group-focus-within:text-indigo-400">標的代碼</span>
          <input
            v-model.trim="newStock.symbol"
            @input="onSearchInput"
            @focus="showSearch = true"
            @click.stop
            class="w-full h-11 rounded-lg bg-gray-800 text-gray-100 px-3 text-base font-bold uppercase border border-gray-700 focus:outline-none focus:border-indigo-500 focus:bg-gray-900 transition-all placeholder:text-gray-600 shadow-inner"
            placeholder="例如: SPY, 2330"
          />
          <ul v-if="showSearch && filteredDict.length > 0" class="absolute z-50 w-full bg-gray-800 border border-gray-700 rounded-md shadow-2xl top-[100%] mt-1 max-h-48 overflow-y-auto custom-scrollbar">
            <li v-for="d in filteredDict" :key="d" @mousedown.prevent="selectStock(d)" class="p-2 hover:bg-gray-700 cursor-pointer text-xs font-bold text-gray-200 border-b border-gray-700 last:border-0 truncate">{{ d }}</li>
          </ul>
        </label>
        <label class="col-span-1 md:col-span-2 group">
          <span class="block text-[11px] text-gray-500 mb-1.5 font-bold tracking-widest transition-colors group-focus-within:text-indigo-400">股數</span>
          <input
            v-model.number="newStock.shares"
            type="number"
            min="1"
            step="1"
            class="w-full h-11 rounded-lg bg-gray-800 text-gray-100 px-3 text-base font-bold font-mono tabular-nums border border-gray-700 focus:outline-none focus:border-indigo-500 focus:bg-gray-900 transition-all placeholder:text-gray-600 hide-spinners shadow-inner"
            placeholder="數量"
          />
        </label>
        <label class="col-span-1 md:col-span-2 group">
          <span class="block text-[11px] text-gray-500 mb-1.5 font-bold tracking-widest transition-colors group-focus-within:text-indigo-400">平均成本</span>
          <input
            v-model.number="newStock.costPrice"
            type="number"
            min="0"
            step="0.01"
            class="w-full h-11 rounded-lg bg-gray-800 text-gray-100 px-3 text-base font-bold font-mono tabular-nums border border-gray-700 focus:outline-none focus:border-indigo-500 focus:bg-gray-900 transition-all placeholder:text-gray-600 hide-spinners shadow-inner"
            placeholder="成本"
          />
        </label>
        <label class="col-span-1 md:col-span-2 group">
          <span class="block text-[11px] text-gray-500 mb-1.5 font-bold tracking-widest transition-colors group-focus-within:text-indigo-400">幣別</span>
          <select
            v-model="newStock.currency"
            class="w-full h-11 rounded-lg bg-gray-800 px-3 text-base font-bold text-gray-200 border border-gray-700 focus:outline-none focus:border-indigo-500 focus:bg-gray-900 transition-all appearance-none cursor-pointer shadow-inner"
          >
            <option value="USD">USD</option>
            <option value="TWD">TWD</option>
          </select>
        </label>
        <div class="col-span-2 md:col-span-2 flex items-end">
          <button
            @click="addStock"
            class="w-full h-11 rounded-lg bg-indigo-600 text-white text-sm font-bold shadow-md shadow-indigo-900/40 hover:bg-indigo-500 hover:shadow-lg hover:-translate-y-[1px] transition-all tracking-wider active:scale-[0.98]"
          >
            新增
          </button>
        </div>
      </div>
    </section>

    <section v-if="isRefreshing" class="space-y-2">
      <article v-for="n in skeletonCount" :key="'skeleton-' + n" class="bg-slate-900 rounded-xl border border-slate-800 p-3">
        <div class="flex items-center gap-3">
          <div class="skeleton h-10 w-[36%] rounded"></div>
          <div class="skeleton h-10 w-[32%] rounded"></div>
          <div class="skeleton h-10 w-[32%] rounded"></div>
        </div>
      </article>
    </section>

    <section v-else class="space-y-0 bg-[#0A0B0D] overflow-visible">
      <div class="flex justify-between items-end px-2 py-3 border-b border-gray-800/60">
        <h2 class="text-xl font-bold text-gray-100 tracking-wide">自選股觀察清單</h2>
      </div>

      <article
        v-for="item in dashboardRows"
        :key="item.key"
        class="border-b border-gray-800/40 py-3.5 px-2 hover:bg-gray-900/40 transition-colors active:bg-gray-800/60 cursor-pointer group relative overflow-hidden"
        @touchstart="handleTouchStart($event)"
        @touchend="handleTouchEnd($event, item.id)"
      >
        <div class="flex items-center justify-between w-full md:pr-10">
          <!-- Left Column: Symbol & Shares -->
          <div class="flex flex-col min-w-[80px]">
            <span class="text-lg font-bold text-white leading-tight uppercase tracking-wide truncate">
              {{ item.symbol }}
            </span>
            <span class="text-xs text-gray-400 font-mono tabular-nums mt-0.5 tracking-widest truncate">
              {{ formatShares(item.shares) }} 股
            </span>
          </div>

          <!-- Middle Column: Current Price & Avg Price -->
          <div class="flex flex-col items-end min-w-[90px]">
            <template v-if="item.currentPrice === null">
              <div class="h-4 w-12 bg-gray-800 animate-pulse rounded mb-1.5"></div>
              <div class="h-3 w-10 bg-gray-800/50 animate-pulse rounded"></div>
            </template>
            <template v-else>
              <span class="text-[15px] font-bold text-gray-100 font-mono tabular-nums leading-tight tracking-tight">
                {{ item.currencySymbol }} {{ formatNumber(item.currentPrice) }}
              </span>
              <span class="text-[11px] text-gray-500 mt-1 flex items-baseline gap-1.5 tracking-widest">
                <span class="opacity-60">平均</span>
                <span class="font-mono tabular-nums text-gray-400">{{ item.currencySymbol }} {{ formatNumber(item.costPrice) }}</span>
              </span>
            </template>
          </div>

          <!-- Right Column: P&L Amount & Percentage -->
          <div class="flex flex-col items-end min-w-[100px] text-right">
            <template v-if="item.currentPrice === null">
              <div class="h-4 w-16 bg-gray-800 animate-pulse rounded mb-1.5"></div>
              <div class="h-3 w-12 bg-gray-800/50 animate-pulse rounded"></div>
            </template>
            <template v-else>
              <span 
                class="text-[15px] font-bold font-mono tabular-nums leading-tight tracking-tight"
                :class="item.totalPnlTwd >= 0 ? 'text-[#00C805]' : 'text-[#FF5000]'"
              >
                {{ item.totalPnlTwd >= 0 ? '+' : '' }}{{ formatNumber(item.totalPnlDisplay) }}
              </span>
              <span 
                class="mt-1.5 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold font-mono tabular-nums tracking-wide"
                :class="item.totalPnlTwd >= 0 ? 'bg-[#00C805]/15 text-[#00C805]' : 'bg-[#FF5000]/15 text-[#FF5000]'"
              >
                {{ item.pnlPct >= 0 ? '+' : '' }}{{ item.pnlPct.toFixed(2) }}%
              </span>
            </template>
          </div>

        </div>

        <!-- Delete Button -->
        <button @click.stop="portfolio.removePositionSilent(item.id)" class="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-600 hover:text-red-500 hover:bg-red-500/10 rounded-xl md:opacity-0 opacity-100 group-hover:opacity-100 transition-all flex items-center justify-center" title="刪除">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
        </button>
      </article>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { usePortfolio } from '../composables/usePortfolio'

const props = defineProps({
  dictionary: { type: Array, default: () => [] },
  displayCurrency: { type: String, default: 'TWD' },
  isPrivateMode: { type: Boolean, default: false },
  active: { type: Boolean, default: false },
})

const emit = defineEmits(['update:displayCurrency', 'toggle-private-mode'])

const portfolio = usePortfolio()
const dashboardList = portfolio.dashboardList

const isRefreshing = ref(false)
const lastRefreshAt = ref(null)
const staleMs = 5 * 60 * 1000
const touchStartX = ref(0)
const showSearch = ref(false)
const newStock = ref({
  symbol: '',
  shares: 1,
  costPrice: 0,
  currency: 'USD',
})

const holdings = computed(() => dashboardList.value.filter(item => item && item.name))

const skeletonCount = computed(() => Math.max(3, Math.min(6, holdings.value.length || 3)))

const dashboardRows = computed(() => {
  return holdings.value.map((item, idx) => {
    const current = parseFloat(item.current) || 0
    const cost = parseFloat(item.cost) || 0
    const shares = Math.max(parseFloat(item.shares) || 1, 1)
    const isUsd = item.currency === 'USD'
    const currentPrice = Number.isFinite(item.lastPrice) && item.lastPrice !== null ? item.lastPrice : null
    const costPrice = cost / shares
    
    // 使用全域 fx
    const buyRate = portfolio.fx.value.buyRate
    const currentRate = portfolio.fx.value.currentRate
    
    const totalPnlTwd = isUsd
      ? current * currentRate - cost * buyRate
      : current - cost
    const pnlPct = cost > 0 ? (totalPnlTwd / (isUsd ? cost * buyRate : cost)) * 100 : 0
    const fxContributionTwd = isUsd ? cost * (currentRate - buyRate) : 0
    const totalPnlDisplay = isUsd ? totalPnlTwd / (currentRate || 1) : totalPnlTwd
    
    return {
      id: item.id,
      key: `${item.name}-${item.id}`,
      index: idx,
      symbol: item.name,
      currency: item.currency,
      currencySymbol: isUsd ? '$' : 'NT$',
      shares,
      marketValue: current,
      costTotal: cost,
      currentPrice,
      costPrice,
      totalPnlTwd,
      totalPnlDisplay,
      pnlPct,
      fxContributionTwd,
    }
  })
})

const summary = computed(() => {
  const buyRate = portfolio.fx.value.buyRate
  const currentRate = portfolio.fx.value.currentRate

  const totalCostTwd = dashboardRows.value.reduce((sum, row) => {
    return sum + (row.currency === 'USD' ? row.costTotal * buyRate : row.costTotal)
  }, 0)
  const totalMarketTwd = dashboardRows.value.reduce((sum, row) => {
    return sum + (row.currency === 'USD' ? row.marketValue * currentRate : row.marketValue)
  }, 0)
  const totalProfitTwd = totalMarketTwd - totalCostTwd
  const profitPct = totalCostTwd > 0 ? (totalProfitTwd / totalCostTwd) * 100 : 0
  
  const totalCostDisplay = props.displayCurrency === 'USD' ? totalCostTwd / currentRate : totalCostTwd
  const totalMarketDisplay = props.displayCurrency === 'USD' ? totalMarketTwd / currentRate : totalMarketTwd
  
  return { totalCostTwd, totalMarketTwd, totalProfitTwd, profitPct, totalCostDisplay, totalMarketDisplay }
})

const filteredDict = computed(() => {
  const q = newStock.value.symbol
  if(!q) return []
  const search = q.toUpperCase()
  return props.dictionary
    .filter(d => d.toUpperCase().includes(search))
    .sort((a, b) => {
      const aStart = a.toUpperCase().startsWith(search) ? 0 : 1
      const bStart = b.toUpperCase().startsWith(search) ? 0 : 1
      return aStart - bStart
    })
    .slice(0, 12)
})



const formatNumber = (v) => {
  if (props.isPrivateMode) return '****'
  if (v === null || v === undefined || !Number.isFinite(v)) return '-'
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(v)
}

const formatShares = (v) => {
  if (props.isPrivateMode) return '****'
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(v || 0)
}

const closeSearch = () => {
  showSearch.value = false
}

const autoDetectCurrency = () => {
  if (!newStock.value.symbol) return
  if (/^\d/.test(newStock.value.symbol.trim())) {
    newStock.value.currency = 'TWD'
  } else {
    newStock.value.currency = 'USD'
  }
}

const onSearchInput = () => {
  showSearch.value = true
  autoDetectCurrency()
}

const selectStock = (name) => {
  newStock.value.symbol = name
  showSearch.value = false
  autoDetectCurrency()
}

const extractSymbolFromText = (text) => {
  if (!text) return ''
  const match = String(text).trim().match(/^([A-Za-z0-9.\-]+)/)
  return match ? match[1].toUpperCase() : ''
}

const buildYahooSymbolCandidates = (symbol, isTaiwanStock) => {
  const normalized = extractSymbolFromText(symbol)
  if (!normalized) return []
  if (!isTaiwanStock) return [normalized]
  if (normalized.endsWith('.TW') || normalized.endsWith('.TWO')) return [normalized]
  return [`${normalized}.TW`, `${normalized}.TWO`]
}

const fetchStockPrice = async (symbol, currency = 'USD') => {
  const candidates = buildYahooSymbolCandidates(symbol, currency === 'TWD')
  if (!candidates.length) {
    console.warn('[StockDashboard] 無法解析代號:', symbol)
    return null
  }
  
  // Create an AbortController for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
  
  for (const yahooSymbol of candidates) {
    try {
      const endpoint = `/api/yahoo/v8/finance/chart/${encodeURIComponent(yahooSymbol)}?interval=1m&range=1d`
      const res = await fetch(endpoint, { signal: controller.signal })
      if (!res.ok) {
        console.error(`[API 失敗] 請求失敗 (${res.status}): ${yahooSymbol}`)
        continue
      }
      const payload = await res.json()
      const result = payload?.chart?.result?.[0]
      const regularMarketPrice = result?.meta?.regularMarketPrice
      const closes = result?.indicators?.quote?.[0]?.close || []
      const validCloses = closes.filter((c) => c !== null && c !== undefined)
      const finalPrice = validCloses.length > 0 ? validCloses[validCloses.length - 1] : regularMarketPrice
      
      if (finalPrice !== undefined && finalPrice !== null) {
        console.log(`[API 成功] 取得標的: ${yahooSymbol}, 價格: ${finalPrice}`)
      }
      
      clearTimeout(timeoutId)
      return finalPrice
    } catch (error) {
      if (error.name === 'AbortError') {
        console.error(`[API 失敗] Timeout for ${yahooSymbol}`)
      } else {
        console.error('[API 失敗]', error)
      }
    }
  }
  clearTimeout(timeoutId)
  return null
}

const isStale = () => {
  if (!lastRefreshAt.value) return true
  return Date.now() - lastRefreshAt.value > staleMs
}

const addStock = async () => {
  try {
    const inputSymbol = newStock.value.symbol
    const symbolStr = extractSymbolFromText(inputSymbol)
    if (!symbolStr) {
      console.warn('[StockDashboard] 新增標的失敗：代號為空')
      return
    }

    const shares = Math.max(parseFloat(newStock.value.shares) || 0, 1)
    const costPrice = Math.max(parseFloat(newStock.value.costPrice) || 0, 0)
    const totalCost = Number((shares * costPrice).toFixed(2))

    portfolio.addStockFromDashboard({
      symbol: inputSymbol,
      shares,
      cost: totalCost,
      currency: newStock.value.currency
    })

    newStock.value = { symbol: '', shares: 1, costPrice: 0, currency: newStock.value.currency }
    
    await refreshAll(true)

  } catch (err) {
    console.warn('[StockDashboard] 新增標的失敗:', err)
  }
}

const handleTouchStart = (event) => {
  touchStartX.value = event.changedTouches?.[0]?.clientX || 0
}

const handleTouchEnd = (event, id) => {
  const endX = event.changedTouches?.[0]?.clientX || 0
  if (touchStartX.value - endX > 80) {
    portfolio.removePositionSilent(id)
  }
}

const refreshAll = async (force = false) => {
  if (isRefreshing.value) return
  if (!force && !isStale()) return
  isRefreshing.value = true
  try {
    const fetchTasks = holdings.value.map(item => ({
      id: item.id,
      name: item.name,
      symbol: extractSymbolFromText(item.name),
      currency: item.currency
    }))

    await Promise.all(fetchTasks.map(async (task) => {
      if (!task.symbol) return
      
      // 標記為 loading
      const target = portfolio.positions.value.find(r => r.id === task.id)
      if (target) target.lastPrice = null

      const latest = await fetchStockPrice(task.symbol, task.currency)
      if (Number.isFinite(latest) && latest !== null) {
        // 從最新的 positions 中找回來
        const realTarget = portfolio.positions.value.find(r => r.id === task.id)
        if (realTarget) {
          const shares = Math.max(parseFloat(realTarget.shares) || 1, 1)
          realTarget.lastPrice = Number(latest.toFixed(4))
          realTarget.current = Number((latest * shares).toFixed(2))
        }
      }
    }))
    lastRefreshAt.value = Date.now()
  } catch (err) {
    console.warn('[StockDashboard] refreshAll 發生錯誤:', err)
  } finally {
    isRefreshing.value = false
  }
}

watch(() => props.active, (v) => {
  if (!v) return
  refreshAll(false)
}, { immediate: true })
</script>

<style scoped>
.font-mono-data {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
  font-variant-numeric: tabular-nums;
}

.skeleton {
  position: relative;
  overflow: hidden;
  background: rgba(51, 65, 85, 0.55);
}
.skeleton::after {
  content: '';
  position: absolute;
  inset: 0;
  transform: translateX(-100%);
  background: linear-gradient(90deg, transparent, rgba(148, 163, 184, 0.35), transparent);
  animation: shimmer 1.2s infinite;
}
@keyframes shimmer {
  100% {
    transform: translateX(100%);
  }
}
.hide-spinners::-webkit-outer-spin-button,
.hide-spinners::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
.hide-spinners {
  -moz-appearance: textfield;
}
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(31, 41, 55, 0.5);
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(75, 85, 99, 0.8);
  border-radius: 4px;
}
</style>
