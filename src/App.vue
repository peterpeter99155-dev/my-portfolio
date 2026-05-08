<template>
  <div class="bg-slate-950 text-slate-100 p-4 md:p-8 font-sans min-h-screen" @click="closeAllSearch">
    <div id="app" class="max-w-[1600px] mx-auto space-y-6">
      <nav class="bg-slate-900/90 border border-slate-800 rounded-2xl p-2 backdrop-blur-md shadow-lg mb-6">
        <div class="flex items-center gap-2">
          <button
            @click="switchTab('dashboard')"
            :class="currentTab === 'dashboard' ? 'bg-indigo-500 text-white shadow-sm' : 'text-slate-300 hover:bg-slate-800'"
            class="px-4 py-2 rounded-xl text-sm font-bold tracking-wide transition-colors"
          >
            股票統整室 (Dashboard)
          </button>
          <button
            @click="switchTab('rebalancing')"
            :class="currentTab === 'rebalancing' ? 'bg-indigo-500 text-white shadow-sm' : 'text-slate-300 hover:bg-slate-800'"
            class="px-4 py-2 rounded-xl text-sm font-bold tracking-wide transition-colors"
          >
            再平衡計算 (Rebalancing)
          </button>
        </div>
      </nav>
      
      <transition name="tab-fade" mode="out-in">
        <section v-if="currentTab === 'rebalancing'" key="tab-rebalancing" class="space-y-6">
      <header class="bg-slate-900 border-2 border-slate-800 rounded-2xl p-5 md:p-6 shadow-xl shadow-black/20 grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-5 items-stretch">
        <div class="w-full min-w-0 lg:col-span-4 bg-slate-950/55 rounded-2xl border border-slate-800/90 p-4 md:p-5">
          <div class="flex items-center justify-start gap-2 mb-3">
            <span class="relative inline-flex rounded-full h-2.5 w-2.5" :class="isOnline ? 'bg-emerald-500' : 'bg-red-500'"></span>
            <span class="text-xs font-bold uppercase tracking-widest" :class="isOnline ? 'text-emerald-400' : 'text-red-400'">系統狀態：{{ isOnline ? '連線中' : '離線' }}</span>
          </div>
          <h1 class="font-black text-white tracking-tight leading-[1.08] [font-size:clamp(2rem,3.2vw,3.25rem)] break-words">
            資產戰略總部 <span class="text-indigo-500 align-baseline">v8.3</span>
          </h1>
          <p class="text-slate-300/90 text-sm md:text-base font-semibold tracking-wide mt-3 leading-relaxed">
            全球資產戰略指揮中心 / 終極擴充圖鑑
          </p>
        </div>

        <div class="w-full min-w-0 lg:col-span-4 flex items-center justify-center bg-indigo-900/10 p-4 md:p-5 rounded-2xl border border-indigo-500/25 shadow-inner overflow-hidden">
          <div class="text-center w-full max-w-full min-w-0 px-1">
            <div class="flex flex-wrap items-center justify-center gap-3 mb-2">
              <span class="text-sm text-indigo-400 font-bold uppercase tracking-wide xl:tracking-widest whitespace-nowrap overflow-hidden text-ellipsis">🌍 全球總資產淨值</span>
              <div class="flex bg-slate-800/80 rounded-md p-0.5 border border-slate-700">
                <button @click.stop="displayCurrency = 'TWD'" :class="displayCurrency === 'TWD' ? 'bg-indigo-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'" class="px-2 py-0.5 text-[10px] font-bold rounded uppercase transition-colors">台幣</button>
                <button @click.stop="displayCurrency = 'USD'" :class="displayCurrency === 'USD' ? 'bg-indigo-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'" class="px-2 py-0.5 text-[10px] font-bold rounded uppercase transition-colors">美金</button>
              </div>
            </div>
            <div ref="assetAmountFitWrap" class="mx-auto flex w-full max-w-full justify-center overflow-hidden rounded-xl py-1">
              <p
                ref="assetAmountLine"
                class="inline-flex max-w-full flex-nowrap items-baseline justify-center gap-x-2 whitespace-nowrap px-1 font-black font-mono tabular-nums leading-none tracking-tight text-indigo-400 drop-shadow-md"
                :class="{ 'select-none': isPrivateMode }"
                :style="{ fontSize: heroAssetFontPx + 'px' }"
              >
                <span class="shrink-0 text-indigo-300/90">{{ displayCurrency === 'USD' ? '$' : 'NT$' }}</span>
                <span
                  class="shrink-0"
                  :class="{ 'blur-md pointer-events-none rounded-sm': isPrivateMode }"
                >{{ formatAmount(totalAssetDisplay) }}</span>
              </p>
            </div>
          </div>
        </div>
        <div class="w-full min-w-0 lg:col-span-4 bg-slate-950/40 p-4 rounded-2xl border border-white/10 flex flex-col gap-4">
          <div class="flex justify-start md:justify-end">
            <button
              type="button"
              :aria-pressed="isPrivateMode"
              :aria-label="isPrivateMode ? '顯示金額' : '隱藏金額'"
              @click.stop="isPrivateMode = !isPrivateMode"
              class="group relative inline-flex w-max max-w-full shrink-0 items-center gap-2.5 overflow-hidden rounded-full border border-slate-600/70 bg-gradient-to-b from-slate-800/95 to-slate-900/95 px-1 py-1 pl-1 pr-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-300 shadow-md shadow-black/20 ring-1 ring-white/5 transition-all hover:border-indigo-500/45 hover:text-white hover:shadow-lg hover:shadow-indigo-950/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400 active:scale-[0.98]"
            >
              <span
                class="flex h-9 w-9 items-center justify-center rounded-full border border-slate-600/50 bg-slate-950/80 text-slate-400 transition-colors group-hover:border-indigo-500/35 group-hover:bg-indigo-950/50 group-hover:text-indigo-200"
                aria-hidden="true"
              >
                <svg v-if="isPrivateMode" class="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                <svg v-else class="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              </span>
              <span class="pr-0.5 whitespace-nowrap">{{ isPrivateMode ? '顯示金額' : '隱藏金額' }}</span>
            </button>
          </div>
          <div class="flex items-end gap-3 justify-start md:justify-end flex-wrap">
            <button @click="stressTest" class="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/20 text-rose-400 border border-rose-500/50 rounded-lg hover:bg-rose-500/40 transition-colors text-xs font-bold uppercase tracking-widest">
            <span>🔥 壓力測試</span>
            </button>
            <div>
              <label class="block text-[11px] text-slate-400 font-bold mb-1.5 uppercase text-center">美金換匯成本</label>
              <input type="number" v-model.number="fx.buyRate" step="0.01" class="w-20 input-pv rounded p-1.5 font-bold text-base text-center">
            </div>
            <div>
              <label class="block text-[11px] text-indigo-400 font-bold mb-1.5 uppercase text-center">市場即時匯率</label>
              <input type="number" v-model.number="fx.currentRate" step="0.01" class="w-20 input-pv input-pv--accent rounded p-1.5 font-bold text-base text-center">
            </div>
            <div class="pl-3 border-l border-slate-700 text-right min-w-[140px]">
              <label class="block text-[11px] text-slate-400 font-bold mb-1.5 uppercase">總匯差損益</label>
              <div :class="fxProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'" class="text-xl font-black font-mono-data tabular-nums leading-none">
                {{ fxProfit >= 0 ? '+' : '' }}NT$ {{ formatAmount(fxProfit, false) }}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div class="flex flex-col gap-5">        
        <!-- Top: Rebalancing Chart Area -->
        <div class="bg-gray-900/30 rounded-xl border border-gray-800 p-4 flex flex-col items-center justify-center relative mt-2 shadow-sm">
          <h2 class="absolute top-4 left-4 text-sm font-bold text-gray-400 tracking-widest z-10">目標資產配置比例</h2>
          <PortfolioChart :display-currency="displayCurrency" />
        </div>

        <!-- Bottom: Strategy List Area -->
        <div class="bg-transparent overflow-hidden">
          <div class="px-2 py-3 border-b border-gray-800/60 flex flex-wrap items-center justify-between gap-3">
            <h2 class="text-xl font-bold text-gray-100 tracking-wide">投資組合再平衡</h2>
            <div class="flex items-center gap-2">
              <span class="text-xs font-bold px-2 py-1 rounded tracking-wide" :class="isAllocationValid ? 'bg-[#00C805]/20 text-[#00C805]' : 'bg-[#FF5000]/20 text-[#FF5000]'">
                總目標佔比：{{ totalTargetPct }}%
              </span>
              <div class="text-xs flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#00C805]/10 text-[#00C805] border border-[#00C805]/30 font-bold whitespace-nowrap tracking-wide">
                <span class="relative flex h-2 w-2">
                  <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00C805] opacity-75"></span>
                  <span class="relative inline-flex rounded-full h-2 w-2 bg-[#00C805]"></span>
                </span>
                即時同步
              </div>
            </div>
          </div>

          <div v-if="!isAllocationValid" class="bg-[#FF5000]/10 border-b border-[#FF5000]/30 p-3 text-center">
            <p class="text-sm font-bold text-[#FF5000] tracking-wide">⚠️ 總目標佔比目前為 <span class="font-mono text-[15px] mx-1">{{ totalTargetPct }}%</span>，必須等於 100% 才能進行再平衡試算。</p>
          </div>

          <div class="flex flex-col">
            <template v-for="(group, gIdx) in displayGroups" :key="gIdx">
              <div class="px-3 py-3 flex justify-between items-center border-b border-gray-800 bg-gray-900/40 mt-6 rounded-t-xl">
                 <span class="text-[15px] font-bold text-gray-400 tracking-widest flex items-center gap-2">
                    {{ group.title === 'Cash' ? '現金部位' : group.title === 'Core' ? '核心部位' : '衛星部位' }} 
                    <span class="text-indigo-400 text-[13px] px-2 py-0.5 bg-indigo-500/10 rounded-md tracking-wider">
                      目標佔比：<span class="font-mono ml-0.5">{{ group.targetSum }}%</span>
                    </span>
                 </span>
                 <button v-if="group.type !== 'cash'" @click="addPosition(group.type)" class="flex items-center justify-center h-[32px] px-3 text-sm font-bold text-indigo-300 bg-indigo-500/15 border border-indigo-500/20 rounded-lg hover:bg-indigo-500/25 hover:text-indigo-200 transition-all active:scale-95 tracking-widest">+ 新增</button>
              </div>
              
              <RebalanceRow 
                v-for="(item, idx) in group.items" 
                :key="item.id || (gIdx + '-' + idx)"
                :item="item"
                :dictionary="dictionary"
                :is-private-mode="isPrivateMode"
                @remove="removePosition"
              />
            </template>
          </div>
        </div>
      </div>
        </section>
        <section v-else key="tab-dashboard" class="space-y-6">
          <StockDashboard
            :dictionary="dictionary"
            :display-currency="displayCurrency"
            @update:displayCurrency="displayCurrency = $event"
            :is-private-mode="isPrivateMode"
            @toggle-private-mode="isPrivateMode = !isPrivateMode"
            :active="currentTab === 'dashboard'"
          />
        </section>
      </transition>
      </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick, watch, provide } from 'vue'
import StockDashboard from './components/StockDashboard.vue'
import PortfolioChart from './components/PortfolioChart.vue'
import RebalanceRow from './components/RebalanceRow.vue'
import { usePortfolio } from './composables/usePortfolio'

// 全域狀態 Store 整合
const portfolio = usePortfolio()
const fx = portfolio.fx
const positions = portfolio.positions
const totalTargetPct = portfolio.totalTargetPct
const isAllocationValid = portfolio.isAllocationValid
const fxProfit = portfolio.fxProfit
const addPosition = portfolio.addPosition
const removePosition = portfolio.removePosition

const currentTab = ref('dashboard')
const isOnline = ref(typeof navigator !== 'undefined' ? navigator.onLine : true)
const displayCurrency = ref('TWD')
const isPrivateMode = ref(false)
const heroAssetFontPx = ref(52)

const assetAmountFitWrap = ref(null)
const assetAmountLine = ref(null)

let _heroAssetFitRaf = null
let _heroAssetObserver = null
let _heroAssetOnResize = null

const totalAssetDisplay = computed(() => {
  return positions.value.reduce((s, i) => s + portfolio.getDisplayValue(i, displayCurrency.value), 0)
})

const displayGroups = computed(() => {
  const cashItems = []
  if (portfolio.usdCash.value) cashItems.push(portfolio.usdCash.value)
  if (portfolio.twdCash.value) cashItems.push(portfolio.twdCash.value)

  return [
    { 
      title: 'Cash', 
      type: 'cash',
      items: cashItems, 
      targetSum: cashItems.reduce((s, i) => s + (parseFloat(i.target) || 0), 0) 
    },
    { 
      title: 'Core', 
      type: 'core',
      items: portfolio.coreList.value, 
      targetSum: portfolio.coreList.value.reduce((s, i) => s + (parseFloat(i.target) || 0), 0) 
    },
    { 
      title: 'Satellite', 
      type: 'satellite',
      items: portfolio.satelliteList.value, 
      targetSum: portfolio.satelliteList.value.reduce((s, i) => s + (parseFloat(i.target) || 0), 0) 
    }
  ]
})

const dictionary = [
  "TQQQ (那斯達克正3)","SQQQ (那斯達克反3)","SOXL (半導體正3)","SOXS (半導體反3)","FNGU (FANG+正3)","FNGD (FANG+反3)","USD (半導體正2)","SSG (半導體反2)","QLD (那斯達克正2)","QID (那斯達克反2)","SSO (標普500正2)","SDS (標普500反2)","UPRO (標普500正3)","SPXU (標普500反3)","LABU (生技正3)","LABD (生技反3)","YINN (中國正3)","YANG (中國反3)","NUGT (黃金礦業正2)","DUST (黃金礦業反2)","BITX (比特幣期貨正2)","BITO (比特幣期貨)","BOIL (天然氣正2)","KOLD (天然氣反2)","TECL (科技正3)","TECS (科技反3)",
  "SPY","VOO","IVV","QQQ","QQQM","VTI","VXUS","VT","VWO","VEA","IWM","DIA","SMH","SOXX","XLK","XLF","XLV","XLE","XLU","XLI","XLB","XLP","XLY","IBIT","FBTC","ARKK","GLD","IAU","TLT","IEF","SHY","BND","AGG","VNQ","URA","NLR","TAN","ICLN","LIT",
  "AAPL","MSFT","NVDA","GOOGL","AMZN","META","TSLA","TSM","AVGO","ASML","ORCL","AMD","INTC","QCOM","TXN","MU","AMAT","LRCX","KLAC","ADI","NXPI","MRVL","MCHP","MPWR","ON","MSTR","PLTR","SNOW","NOW","ADBE","CRM","WDAY","DDOG","CRWD","PANW","ZS","FTNT","NET","COIN",
  "CEG","PWR","VST","TLN","SMR","OKLO","GEV","ETR","SO","NEE","DUK","AEP","D","CAT","DE","GE","HON","BA","UNP","LMT","RTX","GD","NOC",
  "BRK.B","JPM","BAC","WFC","GS","MS","V","MA","AXP","PYPL","UNH","LLY","ABBV","MRK","JNJ","PFE","WMT","COST","HD","LOW","PG","KO","PEP","MCD","NKE","DIS","NFLX",
  "00631L (元大台灣50正2)","00632R (元大台灣50反1)","00670L (富邦Nasdaq正2)","00671R (富邦Nasdaq反1)","00675L (富邦臺灣加權正2)","00685L (群益臺灣加權正2)","00663L (國泰臺灣加權正2)","00757 (統一FANG+)","00640L (富邦日本正2)","00655L (國泰中國A50正2)",
  "0050","006208","0056","00878","00919","00929","00713","00915","00918","00940","00939","00944","00946","00881","00891","00892","0052","0051","00692","00850","00922","00923",
  "00679B","00687B","00751B","00720B","00937B","00933B","00772B","00725B","00740B","00780B","00844B","00761B",
  "2330 (台積電)","2454 (聯發科)","2317 (鴻海)","2382 (廣達)","2308 (台達電)","3711 (日月光投控)","2303 (聯電)","2412 (中華電)","3008 (大立光)","2379 (瑞昱)","3034 (聯詠)","6669 (緯穎)","3661 (世芯-KY)","3443 (創意)","5269 (祥碩)","2344 (華邦電)","2408 (南亞科)","2324 (仁寶)","2356 (英業達)","2376 (技嘉)","2357 (華碩)","3037 (欣興)","3231 (緯創)","3533 (嘉澤)","2395 (研華)","6239 (力成)","6213 (聯茂)","2449 (京元電子)","3017 (奇鋐)","3324 (雙鴻)","2421 (建準)","3044 (健鼎)","2368 (金像電)","2313 (華通)","6271 (同欣電)","8046 (南電)",
  "1519 (華城)","1513 (中興電)","1514 (亞力)","8996 (高力)","1504 (東元)","1605 (華新)","2002 (中鋼)","1101 (台泥)","2603 (長榮)","2609 (陽明)","2618 (長榮航)","2881 (富邦金)","2882 (國泰金)","2891 (中信金)","2886 (兆豐金)","2884 (玉山金)","2892 (第一金)","5880 (合庫金)","2885 (元大金)","2880 (華南金)","2883 (開發金)","2890 (永豐金)","2887 (台新金)",
  "U (Unity)","RBLX (Roblox)","PLTR (Palantir)","SHOP (Shopify)","SQ (Block)","PYPL (PayPal)","DOCU (DocuSign)","OKTA","TEAM (Atlassian)","DDOG (Datadog)","SNOW (Snowflake)","ZS (Zscaler)","CRWD (CrowdStrike)","PANW (Palo Alto)","FTNT (Fortinet)","NET (Cloudflare)","MDB (MongoDB)","ADSK (Autodesk)","TTD (The Trade Desk)","PATH (UiPath)","AFRM (Affirm)","DKNG (DraftKings)","AI (C3.ai)",
  "ARM (Arm Holdings)","AVGO (Broadcom)","MCHP (Microchip)","NXPI (恩智浦)","ON (安森美)","MPWR (芯源)","STM (意法半導體)","GFS (格羅方德)","LSCC (萊迪思)","ALTR (Altera)","WOLF (Wolfspeed)","AEHR (Aehr Test Systems)","TER (Teradyne)","ENTG (Entegris)",
  "LLY (禮來)","NVO (諾和諾德)","ISRG (直覺外科)","VRTX (頂點製藥)","REGN (再生元)","AMGN (安進)","MDGL","LULU (Lululemon)","SBUX (星巴克)","MELI (自由市場)","TME (騰訊音樂)","PDD (拼多多)","CPNG (Coupang)","FERG (Ferguson)","URI (United Rentals)",
  "2301 (光寶科)","2352 (佳世達)","2353 (宏碁)","2365 (昆盈)","2417 (圓剛)","3013 (晟銘電)","6117 (迎廣)","8210 (勤誠)","3693 (營邦)","2421 (建準)","3017 (奇鋐)","3324 (雙鴻)","6230 (超眾)","3017 (奇鋐)","3483 (力致)","6125 (廣運)","8996 (高力)",
  "3661 (世芯-KY)","3443 (創意)","5269 (祥碩)","6643 (M31)","6415 (矽力-KY)","8016 (矽創)","3034 (聯詠)","3035 (智原)","2454 (聯發科)","3583 (辛耘)","3131 (弘塑)","6187 (萬潤)","1560 (中砂)","3376 (新日興)","6155 (鈞寶)",
  "1513 (中興電)","1514 (亞力)","1503 (士電)","1519 (華城)","1504 (東元)","1605 (華新)","1608 (華榮)","1609 (大亞)","6806 (森崴能源)","3708 (上緯投控)","9958 (世紀鋼)","2603 (長榮)","2609 (陽明)","2615 (萬海)","2618 (長榮航)","2610 (華航)",
  "00940 (元大臺灣價值高息)","00939 (統一台灣高息動能)","00944 (野村臺灣趨勢高股息)","00946 (群益台灣科技高息)","00919 (群益台灣精選高息)","00929 (復華台灣科技優息)","00713 (元大台灣高息低波)","00915 (凱基優選高股息30)","00918 (大華優利高填息30)","00882 (中信中國高股息)","00733 (富邦台灣中小)","00830 (國泰費城半導體)","00941 (中信上游半導體)"
]

watch(totalAssetDisplay, () => { scheduleFitHeroAssetAmount() })
watch(isPrivateMode, () => { scheduleFitHeroAssetAmount() })

const formatAmount = (val, checkPrivate = true) => {
  if (checkPrivate && isPrivateMode.value) return '****'
  return new Intl.NumberFormat('en-US').format(Math.round(val))
}

const switchTab = (tab) => {
  currentTab.value = tab
  if (tab === 'rebalancing' || tab === 'dashboard') {
    setTimeout(() => {
      nextTick(() => {
        scheduleFitHeroAssetAmount()
      })
    }, 250)
  }
}

const scheduleFitHeroAssetAmount = () => {
  if (_heroAssetFitRaf != null) cancelAnimationFrame(_heroAssetFitRaf)
  _heroAssetFitRaf = requestAnimationFrame(() => {
    _heroAssetFitRaf = null
    fitHeroAssetAmount()
  })
}

const getHeroAssetFontMaxPx = () => {
  return window.matchMedia('(min-width: 1024px)').matches ? 60 : 48
}

const fitHeroAssetAmount = () => {
  const wrap = assetAmountFitWrap.value
  const line = assetAmountLine.value
  if (!wrap || !line) return
  const maxPx = getHeroAssetFontMaxPx()
  const minPx = 11
  const maxW = Math.max(0, wrap.clientWidth - 4)
  if (maxW <= 0) return

  let chosen = minPx
  for (let fs = maxPx; fs >= minPx; fs--) {
    line.style.fontSize = `${fs}px`
    if (line.scrollWidth <= maxW) {
      chosen = fs
      break
    }
  }
  line.style.removeProperty('font-size')
  heroAssetFontPx.value = chosen
}

const stressTest = () => {
  positions.value.forEach(item => {
    if (item.current > 0) {
      const factor = 1 + (Math.random() * 0.1 - 0.05)
      item.current = parseFloat((item.current * factor).toFixed(2))
    }
  })
}

const closeSearchSignal = ref(0)
provide('closeSearchSignal', closeSearchSignal)

const closeAllSearch = () => {
  closeSearchSignal.value++
}

const handleOnline = () => { isOnline.value = true }
const handleOffline = () => { isOnline.value = false }

onMounted(() => {
  nextTick(() => {
    setTimeout(() => {
      const wrap = assetAmountFitWrap.value
      if (wrap && !_heroAssetObserver) {
        _heroAssetObserver = new ResizeObserver(() => scheduleFitHeroAssetAmount())
        _heroAssetObserver.observe(wrap)
      }
      if (!_heroAssetOnResize) {
        _heroAssetOnResize = () => scheduleFitHeroAssetAmount()
        window.addEventListener('resize', _heroAssetOnResize, { passive: true })
      }
      window.addEventListener('online', handleOnline)
      window.addEventListener('offline', handleOffline)
      scheduleFitHeroAssetAmount()
    }, 50)
  })
})

onBeforeUnmount(() => {
  if (_heroAssetObserver) {
    _heroAssetObserver.disconnect()
    _heroAssetObserver = null
  }
  if (_heroAssetFitRaf != null) {
    cancelAnimationFrame(_heroAssetFitRaf)
    _heroAssetFitRaf = null
  }
  if (_heroAssetOnResize) {
    window.removeEventListener('resize', _heroAssetOnResize)
    _heroAssetOnResize = null
  }
  window.removeEventListener('online', handleOnline)
  window.removeEventListener('offline', handleOffline)
})
</script>

<style scoped>
.input-pv {
  color: #0a0a0a;
  background-color: #f1f5f9;
  border: 1px solid #94a3b8;
}
.input-pv::placeholder {
  color: #64748b;
}
.input-pv:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.35);
}
.input-pv--accent {
  border-color: #818cf8;
  background-color: #eef2ff;
}
.input-pv--muted {
  color: #475569;
  background-color: #e2e8f0;
  cursor: not-allowed;
}

.font-mono-data {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
  font-variant-numeric: tabular-nums;
}

.tab-fade-enter-active,
.tab-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.tab-fade-enter-from,
.tab-fade-leave-to {
  opacity: 0;
  transform: translateY(6px);
}
</style>