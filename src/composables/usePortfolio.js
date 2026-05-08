import { ref, computed, watch } from 'vue'

const STATE_KEY = 'portfolio_v9_clean'

// --- 全域響應式狀態 (Single Source of Truth) ---
const fx = ref({ buyRate: 31.5, currentRate: 32.0 })
const thresholdTWD = ref(10000)

// 所有的資產（現金、核心、衛星）皆儲存於此單一陣列中
// Schema: { id, name, currency, shares, cost, current, lastPrice, target, type, showSearch }
// type: 'cash' | 'core' | 'satellite'
const positions = ref([])

// 初始化現金預設值 (確保至少有 USD 與 TWD 現金列)
const initPositions = () => {
  if (!positions.value.find(p => p.type === 'cash' && p.currency === 'USD')) {
    positions.value.push({ id: `cash-usd`, name: '美金現金', currency: 'USD', shares: 1, cost: 0, current: 0, lastPrice: null, target: 0, type: 'cash', showSearch: false })
  }
  if (!positions.value.find(p => p.type === 'cash' && p.currency === 'TWD')) {
    positions.value.push({ id: `cash-twd`, name: '台幣現金', currency: 'TWD', shares: 1, cost: 0, current: 0, lastPrice: null, target: 0, type: 'cash', showSearch: false })
  }
}

// 產生獨立 ID
const generateId = () => `pos-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

// 從 LocalStorage 載入並做資料轉型 (Migration)
const loadState = () => {
  try {
    const saved = localStorage.getItem(STATE_KEY)
    if (saved) {
      const p = JSON.parse(saved)
      if (p.fx) fx.value = p.fx
      if (p.thresholdTWD) thresholdTWD.value = p.thresholdTWD
      
      // 如果已經是新版的 positions 格式，直接讀取
      if (p.positions && Array.isArray(p.positions)) {
        positions.value = p.positions
      } else {
        // 舊版資料轉型 (Migration from V9)
        const newPos = []
        if (p.usdCash) newPos.push({ id: 'cash-usd', ...p.usdCash, type: 'cash' })
        if (p.twdCash) newPos.push({ id: 'cash-twd', ...p.twdCash, type: 'cash' })
        
        // 整合 dashboardPositions 與 coreList/satelliteList
        const oldDash = p.dashboardPositions || []
        oldDash.forEach(dp => {
          if (!dp.name) return
          let target = 0
          const matchCore = (p.coreList || []).find(c => c.name === dp.name && c.currency === dp.currency)
          const matchSat = (p.satelliteList || []).find(s => s.name === dp.name && s.currency === dp.currency)
          if (matchCore) target = matchCore.target
          if (matchSat) target = matchSat.target
          
          newPos.push({
            id: generateId(),
            name: dp.name,
            currency: dp.currency,
            shares: dp.shares || 1,
            cost: dp.cost || 0,
            current: dp.current || 0,
            lastPrice: dp.lastPrice || null,
            target: target || 0,
            type: dp.currency === 'USD' ? 'core' : 'satellite',
            showSearch: false
          })
        })
        
        // 處理在 Rebalance 中但不在 Dashboard 中的項目
        const addMissing = (list, type) => {
          (list || []).forEach(item => {
            if (item.name && !newPos.find(p => p.name === item.name && p.currency === item.currency)) {
              newPos.push({
                id: generateId(),
                name: item.name,
                currency: item.currency,
                shares: item.shares || 1,
                cost: item.cost || item.current || 0,
                current: item.current || 0,
                lastPrice: null,
                target: item.target || 0,
                type,
                showSearch: false
              })
            }
          })
        }
        addMissing(p.coreList, 'core')
        addMissing(p.satelliteList, 'satellite')
        
        positions.value = newPos
      }
    }
  } catch (e) {
    console.error('[Portfolio] Failed to load portfolio state', e)
  }
  
  // 確保現金列存在且資料正規化
  initPositions()
  positions.value.forEach(p => {
    p.cost = Number.isFinite(p.cost) ? p.cost : (parseFloat(p.current) || 0)
    p.shares = Number.isFinite(p.shares) ? Math.max(p.shares, 1) : 1
    p.showSearch = false
  })
}

// 儲存狀態
const saveState = () => {
  localStorage.setItem(STATE_KEY, JSON.stringify({
    fx: fx.value,
    thresholdTWD: thresholdTWD.value,
    positions: positions.value
  }))
}

// 監聽並自動存檔
watch([fx, thresholdTWD, positions], () => {
  saveState()
}, { deep: true })

// 初次載入
loadState()

// --- 全域計算屬性 (Getters) ---
const usdCash = computed(() => positions.value.find(p => p.type === 'cash' && p.currency === 'USD'))
const twdCash = computed(() => positions.value.find(p => p.type === 'cash' && p.currency === 'TWD'))
const coreList = computed(() => positions.value.filter(p => p.type === 'core'))
const satelliteList = computed(() => positions.value.filter(p => p.type === 'satellite'))
// Dashboard 列表（排除現金，只顯示標的）
const dashboardList = computed(() => positions.value.filter(p => p.type !== 'cash'))

// 價值轉換
const getTWDValue = (item) => {
  let v = parseFloat(item.current)
  if (isNaN(v) || v < 0) v = 0
  let rate = parseFloat(fx.value.currentRate)
  if (item.currency === 'USD' && (isNaN(rate) || rate <= 0)) return 0
  return item.currency === 'USD' ? v * rate : v
}

const getDisplayValue = (item, displayCurrency) => {
  const twd = getTWDValue(item)
  let rate = parseFloat(fx.value.currentRate)
  if (displayCurrency === 'USD' && (isNaN(rate) || rate <= 0)) return 0
  return displayCurrency === 'USD' ? twd / rate : twd
}

// 總計
const totalAssetTWD = computed(() => positions.value.reduce((s, i) => s + getTWDValue(i), 0))
const totalTargetPct = computed(() => positions.value.reduce((s, i) => s + (parseFloat(i.target) || 0), 0))
const isAllocationValid = computed(() => Math.abs(totalTargetPct.value - 100) <= 0.01)

const fxProfit = computed(() => {
  return totalAssetTWD.value - positions.value.reduce((s, i) => s + (i.currency === 'USD' ? (parseFloat(i.current)||0) * fx.value.buyRate : (parseFloat(i.current)||0)), 0)
})

// --- 全域方法 (Actions) ---
const addPosition = (type) => {
  positions.value.push({
    id: generateId(),
    name: '',
    currency: type === 'core' ? 'USD' : 'TWD',
    shares: 1,
    cost: 0,
    current: 0,
    lastPrice: null,
    target: 0,
    type,
    showSearch: false
  })
}

const removePosition = (id) => {
  positions.value = positions.value.filter(p => p.id !== id)
}

const removePositionSilent = (id) => {
  positions.value = positions.value.filter(p => p.id !== id)
}

const addStockFromDashboard = (stock) => {
  const symbol = String(stock.symbol || '').trim().toUpperCase()
  if (!symbol) return
  
  const existing = positions.value.find(p => p.name === symbol && p.type !== 'cash')
  if (existing) {
    existing.shares += stock.shares
    existing.cost += stock.cost // total cost
    existing.current += stock.cost
  } else {
    positions.value.unshift({
      id: generateId(),
      name: symbol,
      currency: stock.currency,
      shares: Math.max(stock.shares, 1),
      cost: stock.cost,
      current: stock.cost,
      lastPrice: null,
      target: 0,
      type: stock.currency === 'USD' ? 'core' : 'satellite',
      showSearch: false
    })
  }
}

// 提供給外部使用的 Composition function
export function usePortfolio() {
  return {
    fx,
    thresholdTWD,
    positions,
    usdCash,
    twdCash,
    coreList,
    satelliteList,
    dashboardList,
    totalAssetTWD,
    totalTargetPct,
    isAllocationValid,
    fxProfit,
    getTWDValue,
    getDisplayValue,
    addPosition,
    removePosition,
    removePositionSilent,
    addStockFromDashboard
  }
}
