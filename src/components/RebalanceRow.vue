<template>
  <div class="grid grid-cols-12 gap-x-2 md:gap-x-4 gap-y-3 items-start border-b border-gray-800/40 py-3 px-2 hover:bg-gray-800/30 transition-colors bg-transparent group relative">
    
    <!-- 區塊 A: 標的名稱 -->
    <div class="col-span-12 md:col-span-3 lg:col-span-4 flex flex-col justify-start text-left">
        <div class="text-[11px] font-bold tracking-widest opacity-0 select-none pointer-events-none mb-1 flex items-center">標的代碼</div>
        <div v-if="!item.fromDashboard && item.type !== 'cash'" class="relative w-full h-10">
          <input v-model="item.name" @input="onSearchInput" @focus="showSearchLocal = true" @click.stop class="w-full h-full bg-transparent text-lg font-bold text-white placeholder-gray-600 focus:outline-none uppercase truncate leading-tight px-2 rounded-md hover:bg-gray-800 focus:bg-gray-800 transition-colors" placeholder="標的代碼">
          <ul v-if="showSearchLocal && filteredDict.length > 0" class="absolute z-50 w-full min-w-[150px] bg-gray-800 border border-gray-700 rounded-lg shadow-2xl mt-1 max-h-48 overflow-y-auto custom-scrollbar text-left">
            <li v-for="d in filteredDict" :key="d" @mousedown.prevent="selectStock(d)" class="p-2.5 hover:bg-gray-700 cursor-pointer text-xs font-bold text-gray-200 border-b border-gray-700 last:border-0 truncate">{{ d }}</li>
          </ul>
        </div>
        <div v-else class="text-lg font-bold text-white truncate leading-tight px-2 h-10 flex items-center">{{ item.name }}</div>
        <div class="mt-1 text-xs text-gray-500 truncate px-2 tracking-widest font-bold flex items-center min-h-[16px]">
          <span v-if="item.type === 'cash'">現金</span>
        </div>
    </div>

    <!-- 區塊 B: 當前市值 -->
    <div class="col-span-4 md:col-span-3 lg:col-span-3 flex flex-col justify-start px-1">
        <div class="text-[11px] text-gray-500 font-bold tracking-widest pl-2 mb-1 flex items-center">當前市值</div>
        <div class="w-full h-10 relative group/input bg-transparent hover:bg-gray-800/60 focus-within:bg-gray-800 rounded-md transition-colors flex items-center">
          <span class="absolute left-2 text-xs text-gray-400 font-mono tabular-nums font-bold pointer-events-none">{{ item.currency === 'USD' ? '$' : 'NT$' }}</span>
          <input type="number" v-model.number="item.current" @input="validateCurrent" class="w-full h-full bg-transparent pl-8 pr-2 text-base font-bold text-gray-100 font-mono tabular-nums focus:outline-none hide-spinners">
        </div>
        <div class="mt-1 min-h-[16px]"></div>
    </div>

    <!-- 區塊 C: 目標佔比輸入區 -->
    <div class="col-span-4 md:col-span-3 lg:col-span-2 flex flex-col justify-start px-1">
        <div class="text-[11px] text-gray-500 font-bold tracking-widest mb-1 flex items-center">目標佔比</div>
        <div class="w-full max-w-[85px] h-10 relative">
          <input type="number" min="0" v-model.number="item.target" @input="validateTarget" class="w-full h-full bg-gray-900/60 border border-gray-700 rounded-lg py-1 pl-2 pr-6 text-center font-mono tabular-nums font-bold text-white text-base focus:border-indigo-500 focus:bg-gray-800 focus:outline-none transition-all hide-spinners shadow-inner" :class="{ 'blur-sm text-transparent select-none': isPrivateMode }" placeholder="0">
          <span class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold pointer-events-none">%</span>
        </div>
        <div class="mt-1 text-xs text-gray-500 whitespace-nowrap tracking-widest font-bold flex items-center min-h-[16px]" :class="{ 'blur-sm select-none': isPrivateMode }">
          目前: <span class="font-mono text-gray-400 ml-1.5">{{ actualPct.toFixed(1) }}%</span>
        </div>
    </div>

    <!-- 區塊 D: 行動指示 -->
    <div class="col-span-4 md:col-span-2 lg:col-span-2 flex flex-col justify-start items-end pr-2">
        <div class="text-[11px] font-bold tracking-widest opacity-0 select-none pointer-events-none mb-1 flex items-center">操作指示</div>
        <div class="h-10 flex items-center">
          <template v-if="isAllocationValid">
            <button v-if="action.type === 'BUY'" class="bg-[#00C805] text-white h-[32px] px-4 rounded-lg text-sm font-bold whitespace-nowrap tracking-wider shadow-md shadow-[#00C805]/20 hover:bg-[#00b304] active:scale-95 transition-all">
              買進
            </button>
            <button v-else-if="action.type === 'SELL'" class="bg-[#FF5000] text-white h-[32px] px-4 rounded-lg text-sm font-bold whitespace-nowrap tracking-wider shadow-md shadow-[#FF5000]/20 hover:bg-[#e64800] active:scale-95 transition-all">
              賣出
            </button>
            <span v-else class="inline-flex items-center justify-center h-[32px] px-4 bg-gray-800 text-gray-400 rounded-lg text-sm font-bold whitespace-nowrap tracking-wider">
              續抱
            </span>
          </template>
          <template v-else>
            <span class="inline-flex items-center justify-center h-[28px] px-3 bg-red-500/10 text-red-400 rounded text-xs font-bold tracking-widest whitespace-nowrap">
              佔比錯誤
            </span>
          </template>
        </div>
        <div class="mt-1 flex items-center justify-end w-full min-h-[16px]">
          <template v-if="isAllocationValid && action.type !== 'HOLD'">
              <span :class="action.type === 'BUY' ? 'text-[#00C805]' : 'text-[#FF5000]'" class="text-xs font-bold tabular-nums font-mono tracking-tight mr-1.5">
                {{ action.currencySymbol }}{{ formatAmount(action.amount) }}
              </span>
              <span class="text-xs text-gray-500 tabular-nums font-mono tracking-widest" :class="{ 'blur-sm select-none': isPrivateMode }" v-if="action.tradeShares > 0">
                約 {{ action.tradeShares }} 股
              </span>
              <span class="text-[10px] text-rose-400 font-bold tracking-widest flex items-center ml-1" v-else-if="action.type !== 'HOLD' && item.type !== 'cash' && (!item.current || item.current == 0)" title="請輸入現價以計算股數">
                ⚠️ 缺現價
              </span>
          </template>
        </div>
    </div>

    <!-- 刪除按鈕 -->
    <div class="absolute right-2 top-3 md:static md:col-span-1 flex flex-col justify-start items-center" v-if="item.type !== 'cash'">
        <div class="text-[11px] font-bold tracking-widest opacity-0 select-none pointer-events-none mb-1 flex items-center hidden md:flex">刪除</div>
        <div class="h-10 flex items-center justify-center">
          <button @click.stop="$emit('remove', item.id)" class="flex items-center justify-center w-[40px] h-[40px] text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-all rounded-xl active:scale-90 bg-gray-800/50 md:bg-transparent" title="刪除">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
        <div class="mt-1 min-h-[16px] hidden md:block"></div>
    </div>

  </div>
</template>

<script setup>
import { computed, ref, inject, watch } from 'vue'
import { usePortfolio } from '../composables/usePortfolio'

const props = defineProps({
  item: { type: Object, required: true },
  dictionary: { type: Array, default: () => [] },
  isPrivateMode: { type: Boolean, default: false }
})

const emit = defineEmits(['remove'])

const portfolio = usePortfolio()
const totalAssetTWD = portfolio.totalAssetTWD
const getTWDValue = portfolio.getTWDValue
const isAllocationValid = portfolio.isAllocationValid
const thresholdTWD = portfolio.thresholdTWD
const fx = portfolio.fx

const validateTarget = () => {
  let val = parseFloat(props.item.target)
  if (isNaN(val)) val = 0
  if (val < 0) val = 0
  if (val > 100) val = 100
  props.item.target = val
}

const validateCurrent = () => {
  let val = parseFloat(props.item.current)
  if (isNaN(val)) val = 0
  if (val < 0) val = 0
  props.item.current = val
}

const actualPct = computed(() => {
  if (totalAssetTWD.value <= 0) return 0
  return (getTWDValue(props.item) / totalAssetTWD.value) * 100
})

const action = computed(() => {
  if (!isAllocationValid.value || totalAssetTWD.value <= 0) return { type: 'HOLD' }
  
  const targetPct = parseFloat(props.item.target) || 0
  const targetTWD = totalAssetTWD.value * (targetPct / 100)
  const currentTWD = getTWDValue(props.item)
  const gapTWD = targetTWD - currentTWD
  
  const type = gapTWD >= thresholdTWD.value ? 'BUY' : (gapTWD <= -thresholdTWD.value ? 'SELL' : 'HOLD')
  
  const mainCur = props.item.currency
  const rate = parseFloat(fx.value.currentRate) || 1
  const amountNative = mainCur === 'USD' ? (gapTWD / rate) : gapTWD
  const currencySymbol = mainCur === 'USD' ? '$' : 'NT$'
  
  let tradeShares = 0
  const currentVal = parseFloat(props.item.current) || 0
  const shares = parseFloat(props.item.shares) || 0
  
  if (shares > 0 && currentVal > 0) {
    const pricePerShare = currentVal / shares
    if (pricePerShare > 0) {
      tradeShares = Math.round(Math.abs(amountNative) / pricePerShare)
    }
  }
  
  return { type, amount: Math.abs(amountNative), currencySymbol, tradeShares }
})

const formatAmount = (val) => {
  if (props.isPrivateMode) return '****'
  return new Intl.NumberFormat('en-US').format(Math.round(val))
}

const filteredDict = computed(() => {
  const q = props.item.name
  if (!q) return []
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

const showSearchLocal = ref(false)
const closeSearchSignal = inject('closeSearchSignal', ref(0))

watch(closeSearchSignal, () => {
  showSearchLocal.value = false
})

const autoDetectCurrency = () => {
  if (!props.item.name) return
  if (/^\d/.test(props.item.name.trim())) {
    props.item.currency = 'TWD'
  } else {
    props.item.currency = 'USD'
  }
}

const onSearchInput = () => {
  showSearchLocal.value = true
  autoDetectCurrency()
}

const selectStock = (name) => {
  props.item.name = name
  showSearchLocal.value = false
  autoDetectCurrency()
}
</script>

<style scoped>
.font-mono-data {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
  font-variant-numeric: tabular-nums;
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
