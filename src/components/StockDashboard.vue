<template>
  <div class="space-y-5">
    <header class="bg-slate-900 rounded-2xl border-2 border-slate-800 p-4 md:p-5 shadow-xl">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 class="text-lg md:text-xl font-black text-white tracking-wide">股票統整室</h2>
          <p class="text-sm text-slate-400 mt-1">持股損益儀表板（含匯率影響）</p>
        </div>
        <div class="flex items-center gap-2 flex-wrap">
          <button
            @click="refreshAll(true)"
            :disabled="isRefreshing"
            class="px-3 py-2 rounded-lg text-xs font-bold tracking-wide transition-colors border"
            :class="isRefreshing ? 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed' : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 hover:bg-indigo-500/35'"
          >
            {{ isRefreshing ? '更新中...' : 'Refresh All' }}
          </button>
        </div>
      </div>
      <div class="mt-3 text-xs text-slate-400">
        <span v-if="lastRefreshAt">最後更新：{{ formatDateTime(lastRefreshAt) }}</span>
        <span v-else>尚未抓取即時報價</span>
      </div>
    </header>

    <section class="bg-slate-900 rounded-xl border border-slate-800 p-4">
      <h3 class="text-sm font-black text-slate-200 mb-3">新增標的</h3>
      <div class="grid grid-cols-2 md:grid-cols-6 gap-2">
        <label class="col-span-2 md:col-span-2">
          <span class="block text-[11px] text-slate-400 mb-1 font-bold">股票代號</span>
          <input
            v-model.trim="newStock.symbol"
            class="w-full rounded-lg bg-slate-200 text-slate-900 px-3 py-2 text-sm font-bold"
            placeholder="例：SPY、2330"
          />
        </label>
        <label>
          <span class="block text-[11px] text-slate-400 mb-1 font-bold">持有股數</span>
          <input
            v-model.number="newStock.shares"
            type="number"
            min="1"
            step="1"
            class="w-full rounded-lg bg-slate-200 text-slate-900 px-3 py-2 text-sm font-bold"
            placeholder="股數"
          />
        </label>
        <label>
          <span class="block text-[11px] text-slate-400 mb-1 font-bold">成本均價</span>
          <input
            v-model.number="newStock.costPrice"
            type="number"
            min="0"
            step="0.01"
            class="w-full rounded-lg bg-slate-200 text-slate-900 px-3 py-2 text-sm font-bold"
            placeholder="成本價"
          />
        </label>
        <label>
          <span class="block text-[11px] text-slate-400 mb-1 font-bold">幣別</span>
          <select
            v-model="newStock.currency"
            class="w-full rounded-lg bg-slate-800 border border-slate-700 px-2 py-2 text-xs font-bold text-slate-200"
          >
            <option value="USD">USD</option>
            <option value="TWD">TWD</option>
          </select>
        </label>
        <button
          @click="addStock"
          class="self-end rounded-lg bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-xs font-bold px-3 py-2 hover:bg-indigo-500/35 transition-colors"
        >
          新增
        </button>
      </div>
    </section>

    <section class="grid grid-cols-1 md:grid-cols-3 gap-3">
      <article class="bg-slate-900 rounded-xl border border-slate-800 p-4">
        <p class="text-xs text-slate-400 font-bold mb-1">總投資成本</p>
        <p class="text-2xl font-black text-slate-100 font-mono-data">NT$ {{ formatNumber(summary.totalCostTwd) }}</p>
      </article>
      <article class="bg-slate-900 rounded-xl border border-slate-800 p-4">
        <p class="text-xs text-slate-400 font-bold mb-1">目前總市值</p>
        <p class="text-2xl font-black text-slate-100 font-mono-data">NT$ {{ formatNumber(summary.totalMarketTwd) }}</p>
      </article>
      <article class="bg-slate-900 rounded-xl border border-slate-800 p-4">
        <p class="text-xs text-slate-400 font-bold mb-1">總損益百分比</p>
        <p :class="profitClass(summary.totalProfitTwd)" class="text-2xl font-black font-mono-data">
          {{ summary.profitPct >= 0 ? '+' : '' }}{{ summary.profitPct.toFixed(2) }}%
        </p>
      </article>
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

    <section v-else class="space-y-2">
      <p class="text-[11px] text-slate-400 px-1">提示：向左滑動清單列或點右側 `✕` 可刪除標的。</p>
      <article
        v-for="item in dashboardRows"
        :key="item.key"
        class="bg-slate-900 rounded-xl border border-slate-800 px-3 py-3 shadow-lg shadow-black/10"
        @touchstart="handleTouchStart($event)"
        @touchend="handleTouchEnd($event, item.index)"
      >
        <div class="flex items-center gap-2 md:gap-4">
          <div class="basis-[36%] min-w-0">
            <p class="font-black text-base md:text-lg text-white truncate">{{ item.symbol }}</p>
            <p class="text-[11px] text-slate-400">{{ formatShares(item.shares) }} 股</p>
          </div>
          <div class="basis-[32%] min-w-0">
            <p class="font-mono-data tabular-nums text-sm md:text-base font-black text-slate-100 truncate">
              {{ item.currencySymbol }} {{ formatNumber(item.currentPrice) }}
            </p>
            <p class="text-[11px] text-slate-400 font-mono-data tabular-nums truncate">
              成本 {{ item.currencySymbol }} {{ formatNumber(item.costPrice) }}
            </p>
          </div>
          <div class="basis-[32%] min-w-0 text-right">
            <p class="font-mono-data tabular-nums text-sm md:text-base font-black" :class="profitClass(item.totalPnlTwd)">
              {{ item.totalPnlTwd >= 0 ? '+' : '' }}{{ item.currencySymbol }} {{ formatNumber(item.totalPnlDisplay) }}
            </p>
            <p class="text-[11px] font-mono-data tabular-nums" :class="profitClass(item.totalPnlTwd)">
              {{ item.pnlPct >= 0 ? '+' : '' }}{{ item.pnlPct.toFixed(2) }}%
            </p>
          </div>
          <div class="shrink-0">
            <button
              @click="removePosition(item.index)"
              class="h-7 w-7 rounded-full border border-slate-700 text-slate-400 hover:text-rose-400 hover:border-rose-500/50 transition-colors font-black"
              title="刪除標的"
            >
              ✕
            </button>
          </div>
        </div>
        <div class="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
          <span class="text-slate-400">匯率貢獻</span>
          <span class="font-mono-data tabular-nums" :class="profitClass(item.fxContributionTwd)">
            {{ item.fxContributionTwd >= 0 ? '+' : '' }}NT$ {{ formatNumber(item.fxContributionTwd) }}
          </span>
        </div>
      </article>
    </section>
  </div>
</template>

<script>
export default {
  props: {
    positions: { type: Array, required: true },
    fx: { type: Object, required: true },
    isPrivateMode: { type: Boolean, default: false },
    active: { type: Boolean, default: false },
  },
  emits: ['positions-updated'],
  data() {
    return {
      isRefreshing: false,
      lastRefreshAt: null,
      staleMs: 5 * 60 * 1000,
      touchStartX: 0,
      localPositions: [],
      newStock: {
        symbol: '',
        shares: 1,
        costPrice: 0,
        currency: 'USD',
      },
    }
  },
  computed: {
    holdings() {
      return this.localPositions.filter((item) => item?.name)
    },
    skeletonCount() {
      return Math.max(3, Math.min(6, this.holdings.length || 3))
    },
    dashboardRows() {
      return this.holdings.map((item, idx) => {
        const current = parseFloat(item.current) || 0
        const cost = parseFloat(item.cost) || 0
        const shares = Math.max(parseFloat(item.shares) || 1, 1)
        const isUsd = item.currency === 'USD'
        const currentPrice = Number.isFinite(item.lastPrice) ? item.lastPrice : (current / shares)
        const costPrice = cost / shares
        const totalPnlTwd = isUsd
          ? current * this.fx.currentRate - cost * this.fx.buyRate
          : current - cost
        const pnlPct = cost > 0 ? (totalPnlTwd / (isUsd ? cost * this.fx.buyRate : cost)) * 100 : 0
        const fxContributionTwd = isUsd ? cost * (this.fx.currentRate - this.fx.buyRate) : 0
        const totalPnlDisplay = isUsd ? totalPnlTwd / (this.fx.currentRate || 1) : totalPnlTwd
        return {
          key: `${item.name}-${idx}`,
          index: idx,
          symbol: this.extractSymbolFromText(item.name) || item.name,
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
    },
    summary() {
      const totalCostTwd = this.dashboardRows.reduce((sum, row) => {
        return sum + (row.currency === 'USD' ? row.costTotal * this.fx.buyRate : row.costTotal)
      }, 0)
      const totalMarketTwd = this.dashboardRows.reduce((sum, row) => {
        return sum + (row.currency === 'USD' ? row.marketValue * this.fx.currentRate : row.marketValue)
      }, 0)
      const totalProfitTwd = totalMarketTwd - totalCostTwd
      const profitPct = totalCostTwd > 0 ? (totalProfitTwd / totalCostTwd) * 100 : 0
      return { totalCostTwd, totalMarketTwd, totalProfitTwd, profitPct }
    },
  },
  watch: {
    positions: {
      immediate: true,
      deep: true,
      handler(val) {
        this.localPositions = (Array.isArray(val) ? val : []).map((item) => ({
          name: item.name || '',
          currency: item.currency === 'TWD' ? 'TWD' : 'USD',
          current: parseFloat(item.current) || 0,
          cost: parseFloat(item.cost) || 0,
          shares: Math.max(parseFloat(item.shares) || 1, 1),
          lastPrice: Number.isFinite(item.lastPrice) ? item.lastPrice : null,
        }))
      },
    },
    active: {
      immediate: true,
      handler(v) {
        if (!v) return
        this.refreshAll(false)
      },
    },
  },
  methods: {
    formatDateTime(ts) {
      return new Date(ts).toLocaleString('zh-TW')
    },
    formatNumber(v) {
      if (this.isPrivateMode) return '****'
      return new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(v || 0)
    },
    formatShares(v) {
      if (this.isPrivateMode) return '****'
      return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(v || 0)
    },
    profitClass(value) {
      return value >= 0 ? 'text-green-500' : 'text-red-500'
    },
    emitPositionsUpdated() {
      this.$emit('positions-updated', this.localPositions.map((item) => ({ ...item })))
    },
    extractSymbolFromText(text) {
      if (!text) return ''
      const match = String(text).trim().match(/^([A-Za-z0-9.\-]+)/)
      return match ? match[1].toUpperCase() : ''
    },
    buildYahooSymbolCandidates(symbol, isTaiwanStock) {
      const normalized = this.extractSymbolFromText(symbol)
      if (!normalized) return []
      if (!isTaiwanStock) return [normalized]
      if (normalized.endsWith('.TW') || normalized.endsWith('.TWO')) return [normalized]
      return [`${normalized}.TW`, `${normalized}.TWO`]
    },
    async fetchStockPrice(symbol, currency = 'USD') {
      const candidates = this.buildYahooSymbolCandidates(symbol, currency === 'TWD')
      if (!candidates.length) {
        console.warn('[StockDashboard] 無法解析代號:', symbol)
        return null
      }
      for (const yahooSymbol of candidates) {
        try {
          const endpoint = `/api/yahoo/v8/finance/chart/${encodeURIComponent(yahooSymbol)}?interval=1m&range=1d`
          const res = await fetch(endpoint)
          if (!res.ok) {
            console.warn(`[StockDashboard] 請求失敗 (${res.status}):`, yahooSymbol)
            continue
          }
          const payload = await res.json()
          const result = payload?.chart?.result?.[0]
          const regularMarketPrice = result?.meta?.regularMarketPrice
          const closes = result?.indicators?.quote?.[0]?.close || []
          const latestClose = [...closes].reverse().find((v) => Number.isFinite(v))
          const latestPrice = Number.isFinite(regularMarketPrice) ? regularMarketPrice : latestClose
          if (Number.isFinite(latestPrice)) return Number(latestPrice)
          console.warn('[StockDashboard] 回傳資料缺少價格:', yahooSymbol, payload)
        } catch (err) {
          console.warn('[StockDashboard] 抓取報價失敗:', yahooSymbol, err)
        }
      }
      return null
    },
    isStale() {
      if (!this.lastRefreshAt) return true
      return Date.now() - this.lastRefreshAt > this.staleMs
    },
    addStock() {
      try {
        const symbol = this.extractSymbolFromText(this.newStock.symbol)
        const shares = Math.max(parseFloat(this.newStock.shares) || 0, 1)
        const costPrice = Math.max(parseFloat(this.newStock.costPrice) || 0, 0)
        if (!symbol) {
          console.warn('[StockDashboard] 新增標的失敗：代號為空')
          return
        }
        const totalCost = Number((shares * costPrice).toFixed(2))
        const row = {
          name: symbol,
          currency: this.newStock.currency,
          shares,
          cost: totalCost,
          current: totalCost,
          lastPrice: costPrice,
        }
        this.localPositions.unshift(row)
        this.newStock = { symbol: '', shares: 1, costPrice: 0, currency: this.newStock.currency }
        this.emitPositionsUpdated()
      } catch (err) {
        console.warn('[StockDashboard] 新增標的失敗:', err)
      }
    },
    removePosition(index) {
      this.localPositions.splice(index, 1)
      this.emitPositionsUpdated()
    },
    handleTouchStart(event) {
      this.touchStartX = event.changedTouches?.[0]?.clientX || 0
    },
    handleTouchEnd(event, key) {
      const endX = event.changedTouches?.[0]?.clientX || 0
      if (this.touchStartX - endX > 80) this.removePosition(key)
    },
    async refreshAll(force = false) {
      if (this.isRefreshing) return
      if (!force && !this.isStale()) return
      this.isRefreshing = true
      try {
        await Promise.all(this.holdings.map(async (item) => {
          const symbol = this.extractSymbolFromText(item.name)
          if (!symbol) return
          const latest = await this.fetchStockPrice(symbol, item.currency)
          if (Number.isFinite(latest)) {
            const shares = Math.max(parseFloat(item.shares) || 1, 1)
            item.lastPrice = Number(latest.toFixed(4))
            item.current = Number((latest * shares).toFixed(2))
          }
        }))
        this.lastRefreshAt = Date.now()
        this.emitPositionsUpdated()
      } catch (err) {
        console.warn('[StockDashboard] refreshAll 發生錯誤:', err)
      } finally {
        this.isRefreshing = false
      }
    },
  },
}
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
</style>
