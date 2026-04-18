<template>
  <div class="bg-slate-950 text-slate-100 p-4 md:p-8 font-sans min-h-screen">
    <div id="app" class="max-w-[1600px] mx-auto space-y-6" @click="closeAllSearch">
      <nav class="sticky top-3 z-30 bg-slate-900/90 border border-slate-800 rounded-2xl p-2 backdrop-blur-md shadow-lg">
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
            <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            <span class="text-xs font-bold text-emerald-400 uppercase tracking-widest">系統狀態：連線中</span>
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
                class="inline-flex max-w-full flex-nowrap items-baseline justify-center gap-x-2 whitespace-nowrap px-1 font-black font-mono tabular-nums leading-none tracking-tight text-indigo-400 drop-shadow-md transition-[font-size] duration-200 ease-out"
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
              <label class="block text-[10px] text-slate-400 font-bold mb-1 uppercase text-center">美金換匯成本</label>
              <input type="number" v-model.number="fx.buyRate" step="0.01" @input="save" class="w-20 input-pv rounded p-1.5 font-bold text-sm text-center">
            </div>
            <div>
              <label class="block text-[10px] text-indigo-400 font-bold mb-1 uppercase text-center">市場即時匯率</label>
              <input type="number" v-model.number="fx.currentRate" step="0.01" @input="updateChart" class="w-20 input-pv input-pv--accent rounded p-1.5 font-bold text-sm text-center">
            </div>
            <div class="pl-3 border-l border-slate-700 text-right min-w-[140px]">
              <label class="block text-[10px] text-slate-400 font-bold mb-1 uppercase">總匯差損益</label>
              <div :class="fxProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'" class="text-xl font-black font-mono-data tabular-nums leading-none">
                {{ fxProfit >= 0 ? '+' : '' }}NT$ {{ fxProfit.toLocaleString() }}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div class="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div class="xl:col-span-5 bg-slate-900 rounded-2xl p-6 border-2 border-slate-800 flex flex-col items-center justify-center relative shadow-xl min-h-[450px]">
          <h2 class="absolute top-5 left-6 text-sm font-bold text-slate-300 uppercase tracking-widest z-10">📊 全球資產配置雷達</h2>
          <div class="relative w-full flex-1 flex items-center justify-center mt-4">
            <div id="echart-container" style="width: 100%; min-height: 400px;"></div>
          </div>
        </div>

        <div class="xl:col-span-7 bg-slate-900 rounded-2xl p-6 border-2 border-slate-800 flex flex-col h-full shadow-lg relative overflow-hidden">
          <div class="flex justify-between items-center border-b-2 border-slate-800 pb-3 mb-5">
            <h2 class="text-base font-bold text-indigo-400 uppercase tracking-widest italic">⚡ 全球再平衡交易指令</h2>
            <span class="text-xs font-bold px-3 py-1 rounded-full" :class="isAllocationValid ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'">
              {{ isAllocationValid ? '✅ 權重對齊' : '🔒 權重鎖定' }}
            </span>
          </div>
          
          <div v-if="!isAllocationValid" class="absolute inset-0 bg-slate-900/95 backdrop-blur-md z-20 flex flex-col items-center justify-center p-8 text-center">
            <span class="text-5xl mb-4">⚖️</span>
            <h3 class="text-xl font-black text-rose-400 mb-2">權重設定錯誤</h3>
            <p class="text-slate-300">總佔比為 {{ totalTargetPct }}%，必須等於 100% 才能啟動引擎。</p>
          </div>

          <div class="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar" style="max-height: 400px;">
            <div v-for="(item, i) in rebalanceActions" :key="'action-'+i" 
                 class="p-4 rounded-xl border-2 relative transition-all flex items-center justify-between"
                 :class="item.type === 'BUY' ? 'bg-slate-950 border-emerald-900/50' : (item.type === 'SELL' ? 'bg-slate-950 border-rose-900/50' : 'bg-slate-900 border-slate-800 opacity-50')">
              <div class="pl-3">
                <span class="text-[10px] font-black uppercase tracking-widest block mb-1" :class="item.mainCur === 'USD' ? 'text-blue-400' : 'text-emerald-500'">{{ item.mainCur === 'USD' ? '美金' : '台幣' }} [{{ item.tag }}]</span>
                <span class="text-base font-black text-white uppercase truncate block">{{ item.name || '未命名' }}</span>
              </div>
              <div class="text-right">
                <div v-if="item.type === 'BUY'" class="text-emerald-400">
                  <p class="text-xs font-bold uppercase opacity-90 mb-1">買進</p>
                  <div class="flex justify-end items-baseline gap-1 text-xl font-mono-data font-black">
                    <span>+</span>
                    <span class="w-8 text-left">{{ item.mainCur === 'USD' ? '$' : 'NT$' }}</span>
                    <span class="min-w-[100px] text-right">{{ formatAmount(item.gapDisplay).toLocaleString() }}</span>
                    <span class="w-8 text-right text-sm">{{ item.mainCur === 'USD' ? 'USD' : 'TWD' }}</span>
                  </div>
                </div>
                <div v-else-if="item.type === 'SELL'" class="text-rose-400">
                  <p class="text-xs font-bold uppercase opacity-90 mb-1">賣出</p>
                  <div class="flex justify-end items-baseline gap-1 text-xl font-mono-data font-black">
                    <span>-</span>
                    <span class="w-8 text-left">{{ item.mainCur === 'USD' ? '$' : 'NT$' }}</span>
                    <span class="min-w-[100px] text-right">{{ formatAmount(Math.abs(item.gapDisplay)).toLocaleString() }}</span>
                    <span class="w-8 text-right text-sm">{{ item.mainCur === 'USD' ? 'USD' : 'TWD' }}</span>
                  </div>
                </div>
                <div v-else class="text-slate-500 italic text-sm">持有</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-slate-900 rounded-2xl border-2 border-slate-800 overflow-hidden shadow-xl">
        <div class="px-4 py-3 border-b border-slate-800 bg-slate-900/70 flex items-center justify-between gap-3">
          <p class="text-xs text-slate-400 font-bold">再平衡資料來源：目前使用手動設定，可用按鈕帶入統整室當前部位。</p>
          <button
            @click="importDashboardPositions"
            class="text-[11px] px-3 py-1.5 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 hover:bg-indigo-500/35 transition-colors font-bold whitespace-nowrap"
          >
            一鍵帶入當前部位
          </button>
        </div>
        <div class="grid grid-cols-12 gap-4 p-4 bg-slate-950 text-xs font-bold text-slate-400 uppercase border-b-2 border-slate-800 items-center">
          <div class="col-span-5">資產標的名稱</div>
          <div class="col-span-3 text-right">目前市值 (原生貨幣)</div>
          <div class="col-span-3 text-right pr-4">目標絕對佔比 (%)</div>
          <div class="col-span-1 text-center">操作</div>
        </div>

        <div v-for="c in [usdCash, twdCash]" :key="c.currency" class="grid grid-cols-12 gap-4 p-4 bg-slate-900/30 border-b border-slate-800/50 items-start">
          <div class="col-span-5 flex gap-2 items-center">
            <input v-model="c.name" class="w-full input-pv input-pv--muted rounded p-2.5 text-sm font-bold" disabled>
          </div>
          <div class="col-span-3">
            <div class="relative w-full">
              <span class="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] font-black px-1.5 py-0.5 rounded-md pointer-events-none" :class="c.currency === 'USD' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'">{{ c.currency === 'USD' ? '美金' : '台幣' }}</span>
              <input type="number" v-model.number="c.current" @input="updateChart" class="w-full input-pv rounded p-2.5 pl-14 font-mono-data text-right" placeholder="0">
            </div>
            <div class="mt-2 w-full text-right pointer-events-none">
              <span v-if="c.currency === 'USD'" class="text-[13px] text-slate-400 font-mono-data font-bold tracking-wide">約 NT$ {{ formatAmount(getTWDValue(c)) }}</span>
              <span v-else class="text-[13px] text-slate-400 font-mono-data font-bold tracking-wide">約 $ {{ formatAmount(getTWDValue(c) / fx.currentRate) }}</span>
            </div>
          </div>
          <div class="col-span-3 flex items-center justify-end pr-4">
            <input type="number" v-model.number="c.target" @input="updateChart" class="w-20 input-pv rounded-l p-2.5 font-mono-data text-center" placeholder="0">
            <span class="bg-slate-800 px-3 py-2.5 text-slate-400 rounded-r border border-l-0 border-slate-700 text-sm">%</span>
          </div>
        </div>

        <div v-for="type in ['core', 'satellite']" :key="type">
          <div class="bg-slate-800/80 px-4 py-2 flex justify-between items-center border-b border-slate-700/50">
            <span class="text-xs font-black uppercase" :class="type==='core'?'text-blue-400':'text-amber-500'">{{ type==='core'?'🛡️ 核心大盤':'🚀 戰略衛星' }} (總佔比: {{ getGroupTargetPct(type) }}%)</span>
            <button @click="addRow(type)" class="text-[10px] bg-slate-700 hover:bg-indigo-600 text-white px-3 py-1 rounded transition-colors">+ 新增標的</button>
          </div>
          <div v-for="(item, index) in (type === 'core' ? coreList : satelliteList)" :key="type+index" class="grid grid-cols-12 gap-4 p-4 border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors items-start">
            <div class="col-span-5 relative flex gap-2 items-center">
              <div class="flex-1 relative">
                <input v-model="item.name" @input="onSearchInput(item)" @focus="item.showSearch = true" @click.stop class="w-full input-pv rounded p-2.5 text-sm font-bold uppercase" placeholder="輸入名稱或代號...">
                <ul v-if="item.showSearch && filteredDict(item.name).length > 0" class="absolute z-50 w-full bg-slate-800 border border-slate-600 rounded-md shadow-2xl top-[100%] mt-1 max-h-48 overflow-y-auto custom-scrollbar">
                  <li v-for="d in filteredDict(item.name)" :key="d" @mousedown.prevent="selectStock(item, d)" class="p-2 hover:bg-indigo-600 cursor-pointer text-xs font-bold text-slate-200 border-b border-slate-700 last:border-0 truncate">{{ d }}</li>
                </ul>
              </div>
            </div>
            <div class="col-span-3">
              <div class="relative w-full">
                <span class="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] font-black px-1.5 py-0.5 rounded-md pointer-events-none" :class="item.currency === 'USD' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'">{{ item.currency === 'USD' ? '美金' : '台幣' }}</span>
                <input type="number" v-model.number="item.current" @input="updateChart" class="w-full input-pv rounded p-2.5 pl-14 font-mono-data text-right" placeholder="0">
              </div>
              <div class="mt-2 w-full text-right pointer-events-none">
                <span v-if="item.currency === 'USD'" class="text-[13px] text-slate-400 font-mono-data font-bold tracking-wide">約 NT$ {{ formatAmount(getTWDValue(item)) }}</span>
                <span v-else class="text-[13px] text-slate-400 font-mono-data font-bold tracking-wide">約 $ {{ formatAmount(getTWDValue(item) / fx.currentRate) }}</span>
              </div>
            </div>
            <div class="col-span-3 flex items-center justify-end pr-4">
              <input type="number" v-model.number="item.target" @input="updateChart" class="w-20 input-pv rounded-l p-2.5 font-mono-data text-center" placeholder="0">
              <span class="bg-slate-800 px-3 py-2.5 text-slate-400 rounded-r border border-l-0 border-slate-700 text-sm">%</span>
            </div>
            <div class="col-span-1 text-center"><button @click="removeRow(type, index)" class="text-slate-500 hover:text-rose-500 font-bold text-lg">✕</button></div>
          </div>
        </div>

        <div class="grid grid-cols-12 gap-4 p-5 font-black font-mono-data text-xl border-t-4 border-slate-950 items-center" :class="isAllocationValid ? 'bg-indigo-900/40 text-indigo-400' : 'bg-rose-950/50 text-rose-400'">
          <div class="col-span-8 text-right text-sm tracking-wide font-bold">全球目標配置合計</div>
          <div class="col-span-3 text-right pr-4">{{ totalTargetPct }} %</div>
          <div class="col-span-1 text-center text-2xl">{{ isAllocationValid ? '✅' : '⚠️' }}</div>
        </div>
      </div>
        </section>
        <section v-else key="tab-dashboard">
          <StockDashboard
            :positions="dashboardPositions"
            :dictionary="dictionary"
            :fx="fx"
            :display-currency="displayCurrency"
            @update:displayCurrency="displayCurrency = $event"
            :is-private-mode="isPrivateMode"
            :active="currentTab === 'dashboard'"
            @positions-updated="handleDashboardPositionsUpdated"
          />
        </section>
      </transition>
      </div>
  </div>
</template>

<script>
import StockDashboard from './components/StockDashboard.vue'
// 2. 把原本包在 createApp 裡面的東西，改成 export default 導出
export default {
  components: {
    StockDashboard,
  },
  data() {
    return {
      currentTab: 'dashboard',
      displayCurrency: 'TWD', // 全局計價幣別
      isPrivateMode: false, // 預設不開啟隱私模式
      heroAssetFontPx: 52, // 主標金額字級（px），由 fitHeroAssetAmount 依容器寬度調整
      _heroAssetFitRaf: null,
      _heroAssetObserver: null,
      _heroAssetOnResize: null,
      thresholdTWD: 10000, 
      fx: { buyRate: 31.5, currentRate: 32.0 },
      usdCash: { name: '美金現金', currency: 'USD', current: 0, target: 0 },
      twdCash: { name: '台幣現金', currency: 'TWD', current: 0, target: 0 },
      coreList: [{ name: '', currency: 'USD', current: 0, cost: 0, shares: 1, target: 0, showSearch: false }],
      satelliteList: [{ name: '', currency: 'TWD', current: 0, cost: 0, shares: 1, target: 0, showSearch: false }],
      dashboardPositions: [],
      dictionary: [
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
        // --- 美股：軟體、雲端、網路安全 (SAAS) ---
        "U (Unity)","RBLX (Roblox)","PLTR (Palantir)","SHOP (Shopify)","SQ (Block)","PYPL (PayPal)","DOCU (DocuSign)","OKTA","TEAM (Atlassian)","DDOG (Datadog)","SNOW (Snowflake)","ZS (Zscaler)","CRWD (CrowdStrike)","PANW (Palo Alto)","FTNT (Fortinet)","NET (Cloudflare)","MDB (MongoDB)","ADSK (Autodesk)","TTD (The Trade Desk)","PATH (UiPath)","AFRM (Affirm)","DKNG (DraftKings)","AI (C3.ai)",

        // --- 美股：半導體設備、車用、類比晶片 ---
        "ARM (Arm Holdings)","AVGO (Broadcom)","MCHP (Microchip)","NXPI (恩智浦)","ON (安森美)","MPWR (芯源)","STM (意法半導體)","GFS (格羅方德)","LSCC (萊迪思)","ALTR (Altera)","WOLF (Wolfspeed)","AEHR (Aehr Test Systems)","TER (Teradyne)","ENTG (Entegris)",

        // --- 美股：醫療、生技、消費、工業 ---
        "LLY (禮來)","NVO (諾和諾德)","ISRG (直覺外科)","VRTX (頂點製藥)","REGN (再生元)","AMGN (安進)","MDGL","LULU (Lululemon)","SBUX (星巴克)","MELI (自由市場)","TME (騰訊音樂)","PDD (拼多多)","CPNG (Coupang)","FERG (Ferguson)","URI (United Rentals)",

        // --- 台股：AI 伺服器、散熱、機殼 (主力族群) ---
        "2301 (光寶科)","2352 (佳世達)","2353 (宏碁)","2365 (昆盈)","2417 (圓剛)","3013 (晟銘電)","6117 (迎廣)","8210 (勤誠)","3693 (營邦)","2421 (建準)","3017 (奇鋐)","3324 (雙鴻)","6230 (超眾)","3017 (奇鋐)","3483 (力致)","6125 (廣運)","8996 (高力)",

        // --- 台股：IC 設計、半導體設備、測試 ---
        "3661 (世芯-KY)","3443 (創意)","5269 (祥碩)","6643 (M31)","6415 (矽力-KY)","8016 (矽創)","3034 (聯詠)","3035 (智原)","2454 (聯發科)","3583 (辛耘)","3131 (弘塑)","6187 (萬潤)","1560 (中砂)","3376 (新日興)","6155 (鈞寶)",

        // --- 台股：重電、綠能、關鍵傳產 ---
        "1513 (中興電)","1514 (亞力)","1503 (士電)","1519 (華城)","1504 (東元)","1605 (華新)","1608 (華榮)","1609 (大亞)","6806 (森崴能源)","3708 (上緯投控)","9958 (世紀鋼)","2603 (長榮)","2609 (陽明)","2615 (萬海)","2618 (長榮航)","2610 (華航)",

        // --- 台股：熱門 ETF 補充 ---
        "00940 (元大臺灣價值高息)","00939 (統一台灣高息動能)","00944 (野村臺灣趨勢高股息)","00946 (群益台灣科技高息)","00919 (群益台灣精選高息)","00929 (復華台灣科技優息)","00713 (元大台灣高息低波)","00915 (凱基優選高股息30)","00918 (大華優利高填息30)","00882 (中信中國高股息)","00733 (富邦台灣中小)","00830 (國泰費城半導體)","00941 (中信上游半導體)"
      ]
    }
  },
  computed: {
    getTWDValue() { 
      return (item) => { 
        const v = parseFloat(item.current) || 0; 
        return item.currency === 'USD' ? v * this.fx.currentRate : v; 
      }; 
    },
    getDisplayValue() {
      return (item) => {
        const twd = this.getTWDValue(item);
        return this.displayCurrency === 'USD' ? twd / this.fx.currentRate : twd;
      };
    },
    totalAssetTWD() { 
      return [this.usdCash, this.twdCash, ...this.coreList, ...this.satelliteList].reduce((s, i) => s + this.getTWDValue(i), 0); 
    },
    totalAssetDisplay() { 
      return [this.usdCash, this.twdCash, ...this.coreList, ...this.satelliteList].reduce((s, i) => s + this.getDisplayValue(i), 0); 
    },
    totalTargetPct() { 
      const all = [this.usdCash, this.twdCash, ...this.coreList, ...this.satelliteList]; 
      return all.reduce((s, i) => s + (parseFloat(i.target) || 0), 0); 
    },
    isAllocationValid() { return Math.abs(this.totalTargetPct - 100) < 0.01; },
    fxProfit() { 
      return this.totalAssetTWD - [this.usdCash, this.twdCash, ...this.coreList, ...this.satelliteList].reduce((s, i) => s + (i.currency === 'USD' ? (parseFloat(i.current)||0) * this.fx.buyRate : (parseFloat(i.current)||0)), 0); 
    },
    rebalanceActions() {
      if (!this.isAllocationValid || this.totalAssetTWD === 0) return [];
      const all = [{ ...this.usdCash, tag: '現金', isCash: true }, { ...this.twdCash, tag: '現金', isCash: true }, ...this.coreList.map(i => ({...i, tag: '核心'})), ...this.satelliteList.map(i => ({...i, tag: '衛星'}))];
      return all.map(i => {
        const targetTWD = this.totalAssetTWD * ((parseFloat(i.target) || 0) / 100);
        const gapTWD = targetTWD - this.getTWDValue(i);
        const type = gapTWD >= this.thresholdTWD ? 'BUY' : (gapTWD <= -this.thresholdTWD ? 'SELL' : 'HOLD');
        const mainCur = this.displayCurrency === 'USD' ? 'USD' : i.currency;
        const gapDisplay = mainCur === 'USD' ? (gapTWD / this.fx.currentRate) : gapTWD;
        return { name: i.name, tag: i.tag, type, gapDisplay, mainCur, isCash: i.isCash };
      }).sort((a, b) => a.type === 'BUY' ? -1 : 1);
    }
  },
  watch: {
    currentTab(tab) {
      if (tab !== 'rebalancing') return
      this.$nextTick(() => {
        if (this._chart) this._chart.resize()
        this.scheduleFitHeroAssetAmount()
      })
    },
    totalAssetDisplay() {
      this.scheduleFitHeroAssetAmount()
    },
    displayCurrency() {
      this.updateChart();
    },
    totalAssetTWD() {
      this.scheduleFitHeroAssetAmount()
    },
    isPrivateMode() {
      this.scheduleFitHeroAssetAmount()
    }
  },
  methods: {
    switchTab(tab) {
      this.currentTab = tab
    },
    handleDashboardPositionsUpdated(positions) {
      this.dashboardPositions = positions
      this.save()
    },
    importDashboardPositions() {
      const source = this.dashboardPositions.filter((item) => item?.name)
      if (!source.length) {
        console.warn('[Rebalancing] 股票統整室目前沒有可帶入的部位')
        return
      }

      const targetMap = new Map()
      const rememberTarget = (item) => {
        const key = `${String(item.name || '').toUpperCase()}__${item.currency}`
        targetMap.set(key, parseFloat(item.target) || 0)
      }
      this.coreList.forEach(rememberTarget)
      this.satelliteList.forEach(rememberTarget)

      const mapRow = (item) => {
        const key = `${String(item.name || '').toUpperCase()}__${item.currency}`
        return {
          name: item.name || '',
          currency: item.currency === 'TWD' ? 'TWD' : 'USD',
          current: parseFloat(item.current) || 0,
          cost: parseFloat(item.cost) || 0,
          shares: Math.max(parseFloat(item.shares) || 1, 1),
          target: targetMap.has(key) ? targetMap.get(key) : 0,
          showSearch: false,
        }
      }

      this.coreList = source.filter((item) => item.currency === 'USD').map(mapRow)
      this.satelliteList = source.filter((item) => item.currency === 'TWD').map(mapRow)
      if (!this.coreList.length) this.coreList = [{ name: '', currency: 'USD', current: 0, cost: 0, shares: 1, target: 0, showSearch: false }]
      if (!this.satelliteList.length) this.satelliteList = [{ name: '', currency: 'TWD', current: 0, cost: 0, shares: 1, target: 0, showSearch: false }]
      this.updateChart()
    },
    normalizePortfolioRows() {
      const normalize = (item) => ({
        ...item,
        cost: Number.isFinite(item.cost) ? item.cost : (parseFloat(item.current) || 0),
        shares: Number.isFinite(item.shares) ? Math.max(item.shares, 1) : 1,
      })
      this.coreList = this.coreList.map(normalize)
      this.satelliteList = this.satelliteList.map(normalize)
    },

    /**
     * 計算特定群組的目標佔比總和
     * @param {string} type - 群組類型 (core 或是 satellite)
     */
    getGroupTargetPct(type) {
      const list = type === 'core' ? this.coreList : this.satelliteList;
      return list.reduce((s, i) => s + (parseFloat(i.target) || 0), 0);
    },
    /**
     * 排程執行自適應主視覺金額字體大小
     * 使用 requestAnimationFrame 避免頻繁觸發影響效能
     */
    scheduleFitHeroAssetAmount() {
      if (this._heroAssetFitRaf != null) cancelAnimationFrame(this._heroAssetFitRaf)
      this._heroAssetFitRaf = requestAnimationFrame(() => {
        this._heroAssetFitRaf = null
        this.fitHeroAssetAmount()
      })
    },
    /**
     * 取得主視覺金額的最大字體大小 (px)
     * 根據視窗寬度決定
     * @returns {number} 最大字體大小
     */
    getHeroAssetFontMaxPx() {
      // 約對應 text-5xl / text-6xl（無捲軸，必要時往下縮）
      return window.matchMedia('(min-width: 1024px)').matches ? 60 : 48
    },
    /**
     * 動態調整主視覺金額的字體大小，使其能完整顯示在容器內
     */
    fitHeroAssetAmount() {
      const wrap = this.$refs.assetAmountFitWrap
      const line = this.$refs.assetAmountLine
      if (!wrap || !line) return
      const maxPx = this.getHeroAssetFontMaxPx()
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
      this.heroAssetFontPx = chosen
    },
    /**
     * 過濾字典，提供股票代號自動補齊建議
     * @param {string} q - 搜尋關鍵字
     * @returns {string[]} 過濾後的字典陣列
     */
    filteredDict(q) { 
      if(!q) return [];
      const search = q.toUpperCase();
      // 核心邏輯：先過濾，再排序
      return this.dictionary
        .filter(d => d.toUpperCase().includes(search))
        .sort((a, b) => {
          // 讓「開頭就匹配」的標的排在前面 (例如輸入 V，VOO 會在最前面)
          const aStart = a.toUpperCase().startsWith(search) ? 0 : 1;
          const bStart = b.toUpperCase().startsWith(search) ? 0 : 1;
          return aStart - bStart;
        })
        .slice(0, 12); // 只取前 12 筆，避免畫面太亂
    },
    /**
     * 自動偵測股票名稱以切換幣別
     * 台灣股票多以數字開頭，美股多以英文字母開頭
     * @param {Object} item - 資產項目
     */
    autoDetectCurrency(item) {
      if (!item.name) return;
      // 若開頭為數字 (如 2330, 0050)，設定為 TWD；否則設定為 USD
      if (/^\d/.test(item.name.trim())) {
        item.currency = 'TWD';
      } else {
        item.currency = 'USD';
      }
    },
    /**
     * 處理搜尋輸入框焦點事件，顯示建議選單
     * @param {Object} item - 觸發事件的資產項目
     */
    onSearchInput(item) { 
      item.showSearch = true; 
      this.autoDetectCurrency(item);
    },
    /**
     * 選擇建議清單中的股票
     * @param {Object} item - 當前操作的資產項目
     * @param {string} name - 選擇的股票名稱
     */
    selectStock(item, name) { 
      item.name = name; 
      item.showSearch = false; 
      this.autoDetectCurrency(item);
      this.updateChart(); 
    },
    /**
     * 關閉所有資產項目的搜尋建議選單
     */
    closeAllSearch() { [...this.coreList, ...this.satelliteList].forEach(i => i.showSearch = false); },
    /**
     * 新增資產列
     * @param {string} type - 資產類型 ('core' 核心 或 'satellite' 衛星)
     */
    addRow(type) { 
      const row = { name: '', currency: type === 'core' ? 'USD' : 'TWD', current: 0, cost: 0, shares: 1, target: 0, showSearch: false }; 
      if(type === 'core') this.coreList.push(row); else this.satelliteList.push(row); 
    },
    /**
     * 移除資產列
     * @param {string} type - 資產類型 ('core' 核心 或 'satellite' 衛星)
     * @param {number} idx - 要移除的索引
     */
    removeRow(type, idx) { 
      if(confirm('確認移除？')) { 
        if(type === 'core') this.coreList.splice(idx, 1); else this.satelliteList.splice(idx, 1); 
        this.updateChart(); 
      } 
    },
    /**
     * 初始化 ECharts 圓餅圖
     */
    initChart() { 
      // 確保使用外部載入的 echarts
      if(window.echarts) {
        this._chart = window.echarts.init(document.getElementById('echart-container')); 
        window.addEventListener('resize', () => { if(this._chart) this._chart.resize(); }); 
      }
    },
    /**
     * 更新 ECharts 圓餅圖資料
     */
    updateChart() {
      if(!this._chart) return;
      const data = [];
      const colors = ['#3b82f6', '#60a5fa', '#818cf8', '#93c5fd', '#f59e0b', '#fbbf24', '#fcd34d', '#fde68a'];
      this.coreList.concat(this.satelliteList).forEach((i, idx) => { 
        const v = this.getDisplayValue(i); 
        if(v > 0) data.push({ value: v, name: i.name || '未命名', itemStyle: { color: colors[idx % 8] } }); 
      });
      if(this.getDisplayValue(this.usdCash) > 0) data.push({ value: this.getDisplayValue(this.usdCash), name: 'USD 現金', itemStyle: { color: '#0ea5e9' } });
      if(this.getDisplayValue(this.twdCash) > 0) data.push({ value: this.getDisplayValue(this.twdCash), name: 'TWD 現金', itemStyle: { color: '#10b981' } });
      const symbol = this.displayCurrency === 'USD' ? '$' : 'NT$';
      this._chart.setOption({ 
        tooltip: { trigger: 'item', formatter: `{b}<br/>${symbol} {c} ({d}%)` }, 
        series: [{ type: 'pie', radius: ['35%', '60%'], label: { show: true, formatter: '{name|{b}}\n{perc|{d}%}', rich: { name: { color: '#f1f5f9', fontSize: 11, fontWeight: 'bold' }, perc: { color: '#94a3b8', fontSize: 10 } } }, data }] 
      });
      this.save();
    },
    /**
     * 判斷資產是否偏離目標比例過遠 (>10%)
     * @param {Object} item - 資產項目
     * @returns {boolean} 是否偏離過遠
     */
    isDeviated(item) {
      const currentPct = (this.getTWDValue(item) / this.totalAssetTWD) * 100;
      const targetPct = parseFloat(item.target) || 0;
      if (targetPct === 0) return false;
      
      // 計算偏離率：(實際-目標) / 目標
      const deviation = Math.abs(currentPct - targetPct) / targetPct;
      return deviation > 0.1; // 超過 10% 就亮紅燈
    },
    /**
     * 格式化金額顯示，處理隱私模式與千分位
     * @param {number} val - 要格式化的金額
     * @returns {string} 格式化後的字串
     */
    formatAmount(val) {
      if (this.isPrivateMode) return '****'; // 隱私模式下直接顯示星號
      
      // 原本的格式化邏輯（千分位）
      return new Intl.NumberFormat('en-US').format(Math.round(val));
    },
    /**
     * 將當前資產狀態儲存至 localStorage
     */
    save() { 
      localStorage.setItem('portfolio_v9_clean', JSON.stringify({ 
        fx: this.fx, thresholdTWD: this.thresholdTWD, usdCash: this.usdCash, twdCash: this.twdCash, 
        coreList: this.coreList.map(i=>({name:i.name, currency:i.currency, current:i.current, cost:i.cost, shares:i.shares, target:i.target})), 
        satelliteList: this.satelliteList.map(i=>({name:i.name, currency:i.currency, current:i.current, cost:i.cost, shares:i.shares, target:i.target})),
        dashboardPositions: this.dashboardPositions.map(i => ({ name: i.name, currency: i.currency, current: i.current, cost: i.cost, shares: i.shares, lastPrice: i.lastPrice }))
      })); 
    },
    /**
     * 執行壓力測試
     * 隨機讓所有資產市值浮動 -5% ~ +5%，用以測試偏離警示系統
     */
    stressTest() {
      const randomize = (item) => {
        if (item.current > 0) {
          const factor = 1 + (Math.random() * 0.1 - 0.05); // -5% ~ +5%
          item.current = parseFloat((item.current * factor).toFixed(2));
        }
      };
      [this.usdCash, this.twdCash, ...this.coreList, ...this.satelliteList].forEach(randomize);
      this.updateChart();
    }
  },
  created() {
    const saved = localStorage.getItem('portfolio_v9_clean');
    if(saved) { 
      try { 
        const p = JSON.parse(saved); 
        Object.assign(this, p); 
        this.normalizePortfolioRows()
        if (!Array.isArray(this.dashboardPositions)) this.dashboardPositions = []
        if (!this.dashboardPositions.length) {
          this.dashboardPositions = [...this.coreList, ...this.satelliteList]
            .filter(i => i?.name)
            .map(i => ({ name: i.name, currency: i.currency, current: i.current, cost: i.cost, shares: i.shares, lastPrice: i.lastPrice }))
        }
        this.coreList.forEach(i => i.showSearch = false); 
        this.satelliteList.forEach(i => i.showSearch = false); 
      } catch(e) {} 
    }
    this.normalizePortfolioRows()
  },
  mounted() {
    this.$nextTick(() => { 
      setTimeout(() => { 
        this.initChart(); 
        this.updateChart(); 
        const wrap = this.$refs.assetAmountFitWrap
        if (wrap && !this._heroAssetObserver) {
          this._heroAssetObserver = new ResizeObserver(() => this.scheduleFitHeroAssetAmount())
          this._heroAssetObserver.observe(wrap)
        }
        if (!this._heroAssetOnResize) {
          this._heroAssetOnResize = () => this.scheduleFitHeroAssetAmount()
          window.addEventListener('resize', this._heroAssetOnResize, { passive: true })
        }
        this.scheduleFitHeroAssetAmount()
      }, 50); 
    });
  },
  beforeUnmount() {
    if (this._heroAssetObserver) {
      this._heroAssetObserver.disconnect()
      this._heroAssetObserver = null
    }
    if (this._heroAssetFitRaf != null) {
      cancelAnimationFrame(this._heroAssetFitRaf)
      this._heroAssetFitRaf = null
    }
    if (this._heroAssetOnResize) {
      window.removeEventListener('resize', this._heroAssetOnResize)
      this._heroAssetOnResize = null
    }
  }
}
</script>

<style scoped>
/* 表單輸入：淺底深色字，避免在深色版面中出現淺色游標字而難以辨識 */
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

/* 表格數字與等寬：供市值輸入、損益與主視覺數字區塊一致 */
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