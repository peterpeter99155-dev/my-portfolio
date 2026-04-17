<template>
  <div class="bg-slate-950 text-slate-100 p-4 md:p-8 font-sans min-h-screen">
    <div id="app" class="max-w-[1600px] mx-auto space-y-6" @click="closeAllSearch">
      
      <header class="bg-slate-900 border-2 border-slate-800 rounded-2xl p-6 shadow-lg flex flex-col xl:flex-row justify-between items-center gap-6">
        <div class="text-center xl:text-left min-w-[280px]">
          <h1 class="text-3xl lg:text-4xl font-black text-white tracking-tighter italic">資產戰略總部 <span class="text-indigo-500">v8.3</span></h1>
          <p class="text-slate-400 text-sm font-bold uppercase tracking-widest mt-2">Global Asset Commander / 終極擴充圖鑑</p>
        </div>

        <div class="flex-1 flex items-center justify-center gap-8 bg-indigo-900/10 p-5 rounded-2xl border border-indigo-500/20 shadow-inner w-full md:w-auto">
          <div class="text-center">
            <p class="text-sm text-indigo-400 font-bold uppercase mb-2 tracking-widest">🌍 全球總資產淨值 (TWD)</p>
            <p class="text-5xl lg:text-6xl font-mono-data font-black text-indigo-400 drop-shadow-md">NT$ {{ totalAssetTWD.toLocaleString() }}</p>
          </div>
        </div>
        
        <div class="flex items-center gap-3 bg-slate-800/50 p-4 rounded-xl border border-white/5 justify-end">
          <div>
            <label class="block text-[10px] text-slate-400 font-bold mb-1 uppercase">美金換匯成本</label>
            <input type="number" v-model.number="fx.buyRate" step="0.01" @input="save" class="w-20 input-pv rounded p-1 text-slate-300 font-bold text-sm text-center">
          </div>
          <div>
            <label class="block text-[10px] text-indigo-400 font-bold mb-1 uppercase">市場即時匯率</label>
            <input type="number" v-model.number="fx.currentRate" step="0.01" @input="updateChart" class="w-20 input-pv rounded p-1 text-indigo-400 font-bold text-sm text-center border-indigo-500/30">
          </div>
          <div class="pl-3 border-l border-slate-700 text-right">
            <label class="block text-[10px] text-slate-400 font-bold mb-1 uppercase">總匯差損益</label>
            <div :class="fxProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'" class="text-lg font-black font-mono-data">
              {{ fxProfit >= 0 ? '+' : '' }}NT$ {{ fxProfit.toLocaleString() }}
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
                <span class="text-[10px] font-black uppercase tracking-widest block mb-1" :class="item.currency === 'USD' ? 'text-blue-400' : 'text-emerald-500'">{{ item.currency }} [{{ item.tag }}]</span>
                <span class="text-base font-black text-white uppercase truncate block">{{ item.name || '未命名' }}</span>
              </div>
              <div class="text-right">
                <div v-if="item.type === 'BUY'" class="text-emerald-400">
                  <p class="text-xs font-bold uppercase opacity-90 mb-1">買進 (BUY)</p>
                  <p class="text-xl font-mono-data font-black">+{{ item.currency === 'USD' ? '$' : 'NT$ ' }}{{ Math.round(item.gapNative).toLocaleString() }}</p>
                </div>
                <div v-else-if="item.type === 'SELL'" class="text-rose-400">
                  <p class="text-xs font-bold uppercase opacity-90 mb-1">賣出 (SELL)</p>
                  <p class="text-xl font-mono-data font-black">-{{ item.currency === 'USD' ? '$' : 'NT$ ' }}{{ Math.round(Math.abs(item.gapNative)).toLocaleString() }}</p>
                </div>
                <div v-else class="text-slate-500 italic text-sm">HOLD</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-slate-900 rounded-2xl border-2 border-slate-800 overflow-hidden shadow-xl">
        <div class="grid grid-cols-12 gap-4 p-4 bg-slate-950 text-xs font-bold text-slate-400 uppercase border-b-2 border-slate-800 items-center">
          <div class="col-span-5">資產標的名稱</div>
          <div class="col-span-3 text-right">目前市值 (原生貨幣)</div>
          <div class="col-span-3 text-right pr-4">目標絕對佔比 (%)</div>
          <div class="col-span-1 text-center">操作</div>
        </div>

        <div v-for="c in [usdCash, twdCash]" :key="c.currency" class="grid grid-cols-12 gap-4 p-4 bg-slate-900/30 border-b border-slate-800/50 items-center">
          <div class="col-span-5 flex gap-2">
            <span class="bg-slate-800 text-slate-400 font-bold px-3 py-2 rounded text-xs w-20 text-center border border-slate-700">{{ c.currency }}</span>
            <input v-model="c.name" class="w-full input-pv rounded p-2.5 text-sm font-bold text-slate-300" disabled>
          </div>
          <div class="col-span-3"><input type="number" v-model.number="c.current" @input="updateChart" class="w-full input-pv rounded p-2.5 font-mono-data text-right" placeholder="0"></div>
          <div class="col-span-3 flex items-center justify-end pr-4">
            <input type="number" v-model.number="c.target" @input="updateChart" class="w-20 input-pv rounded-l p-2.5 font-mono-data text-emerald-400 text-center" placeholder="0">
            <span class="bg-slate-800 px-3 py-2.5 text-slate-400 rounded-r border border-l-0 border-slate-700 text-sm">%</span>
          </div>
        </div>

        <div v-for="type in ['core', 'satellite']" :key="type">
          <div class="bg-slate-800/80 px-4 py-2 flex justify-between items-center border-b border-slate-700/50">
            <span class="text-xs font-black uppercase" :class="type==='core'?'text-blue-400':'text-amber-500'">{{ type==='core'?'🛡️ 核心大盤 (Core)':'🚀 戰略衛星 (Satellite)' }}</span>
            <button @click="addRow(type)" class="text-[10px] bg-slate-700 hover:bg-indigo-600 text-white px-3 py-1 rounded transition-colors">+ 新增標的</button>
          </div>
          <div v-for="(item, index) in (type === 'core' ? coreList : satelliteList)" :key="type+index" class="grid grid-cols-12 gap-4 p-4 border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors items-center">
            <div class="col-span-5 relative flex gap-2">
              <select v-model="item.currency" @change="updateChart" class="input-pv rounded p-2 text-xs font-bold w-20 text-center cursor-pointer currency-toggle" :class="item.currency === 'USD' ? 'text-blue-400' : 'text-emerald-500'">
                <option value="USD">USD</option>
                <option value="TWD">TWD</option>
              </select>
              <div class="flex-1 relative">
                <input v-model="item.name" @input="onSearchInput(item)" @focus="item.showSearch = true" @click.stop class="w-full input-pv rounded p-2.5 text-sm font-bold uppercase" placeholder="輸入名稱或代號...">
                <ul v-if="item.showSearch && filteredDict(item.name).length > 0" class="absolute z-50 w-full bg-slate-800 border border-slate-600 rounded-md shadow-2xl top-[100%] mt-1 max-h-48 overflow-y-auto custom-scrollbar">
                  <li v-for="d in filteredDict(item.name)" :key="d" @mousedown.prevent="selectStock(item, d)" class="p-2 hover:bg-indigo-600 cursor-pointer text-xs font-bold text-slate-200 border-b border-slate-700 last:border-0 truncate">{{ d }}</li>
                </ul>
              </div>
            </div>
            <div class="col-span-3"><input type="number" v-model.number="item.current" @input="updateChart" class="w-full input-pv rounded p-2.5 font-mono-data text-right" placeholder="0"></div>
            <div class="col-span-3 flex items-center justify-end pr-4">
              <input type="number" v-model.number="item.target" @input="updateChart" class="w-20 input-pv rounded-l p-2.5 font-mono-data text-blue-400 text-center" placeholder="0">
              <span class="bg-slate-800 px-3 py-2.5 text-slate-400 rounded-r border border-l-0 border-slate-700 text-sm">%</span>
            </div>
            <div class="col-span-1 text-center"><button @click="removeRow(type, index)" class="text-slate-500 hover:text-rose-500 font-bold text-lg">✕</button></div>
          </div>
        </div>

        <div class="grid grid-cols-12 gap-4 p-5 font-black font-mono-data text-xl border-t-4 border-slate-950 items-center" :class="isAllocationValid ? 'bg-indigo-900/40 text-indigo-400' : 'bg-rose-950/50 text-rose-400'">
          <div class="col-span-8 text-right uppercase text-sm tracking-widest">Total Global Allocation :</div>
          <div class="col-span-3 text-right pr-4">{{ totalTargetPct }} %</div>
          <div class="col-span-1 text-center text-2xl">{{ isAllocationValid ? '✅' : '⚠️' }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// 2. 把原本包在 createApp 裡面的東西，改成 export default 導出
export default {
  data() {
    return {
      thresholdTWD: 10000, 
      fx: { buyRate: 31.5, currentRate: 32.0 },
      usdCash: { name: '美金現金', currency: 'USD', current: 0, target: 0 },
      twdCash: { name: '台幣現金', currency: 'TWD', current: 0, target: 0 },
      coreList: [{ name: '', currency: 'USD', current: 0, target: 0, showSearch: false }],
      satelliteList: [{ name: '', currency: 'TWD', current: 0, target: 0, showSearch: false }],
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
        "1519 (華城)","1513 (中興電)","1514 (亞力)","8996 (高力)","1504 (東元)","1605 (華新)","2002 (中鋼)","1101 (台泥)","2603 (長榮)","2609 (陽明)","2618 (長榮航)","2881 (富邦金)","2882 (國泰金)","2891 (中信金)","2886 (兆豐金)","2884 (玉山金)","2892 (第一金)","5880 (合庫金)","2885 (元大金)","2880 (華南金)","2883 (開發金)","2890 (永豐金)","2887 (台新金)"
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
    totalAssetTWD() { 
      return [this.usdCash, this.twdCash, ...this.coreList, ...this.satelliteList].reduce((s, i) => s + this.getTWDValue(i), 0); 
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
        const gapNative = i.currency === 'USD' ? (gapTWD / this.fx.currentRate) : gapTWD;
        return { name: i.name, tag: i.tag, type, gapNative, currency: i.currency, isCash: i.isCash };
      }).sort((a, b) => a.type === 'BUY' ? -1 : 1);
    }
  },
  methods: {
    filteredDict(q) { 
      if(!q) return [];
      const search = q.toUpperCase();
      return this.dictionary.filter(d => d.toUpperCase().includes(search)).slice(0, 12); 
    },
    onSearchInput(item) { item.showSearch = true; },
    selectStock(item, name) { item.name = name; item.showSearch = false; this.updateChart(); },
    closeAllSearch() { [...this.coreList, ...this.satelliteList].forEach(i => i.showSearch = false); },
    addRow(type) { 
      const row = { name: '', currency: type === 'core' ? 'USD' : 'TWD', current: 0, target: 0, showSearch: false }; 
      if(type === 'core') this.coreList.push(row); else this.satelliteList.push(row); 
    },
    removeRow(type, idx) { 
      if(confirm('確認移除？')) { 
        if(type === 'core') this.coreList.splice(idx, 1); else this.satelliteList.splice(idx, 1); 
        this.updateChart(); 
      } 
    },
    initChart() { 
      // 確保使用外部載入的 echarts
      if(window.echarts) {
        this._chart = window.echarts.init(document.getElementById('echart-container')); 
        window.addEventListener('resize', () => { if(this._chart) this._chart.resize(); }); 
      }
    },
    updateChart() {
      if(!this._chart) return;
      const data = [];
      const colors = ['#3b82f6', '#60a5fa', '#818cf8', '#93c5fd', '#f59e0b', '#fbbf24', '#fcd34d', '#fde68a'];
      this.coreList.concat(this.satelliteList).forEach((i, idx) => { 
        const v = this.getTWDValue(i); 
        if(v > 0) data.push({ value: v, name: i.name || '未命名', itemStyle: { color: colors[idx % 8] } }); 
      });
      if(this.getTWDValue(this.usdCash) > 0) data.push({ value: this.getTWDValue(this.usdCash), name: 'USD 現金', itemStyle: { color: '#0ea5e9' } });
      if(this.getTWDValue(this.twdCash) > 0) data.push({ value: this.getTWDValue(this.twdCash), name: 'TWD 現金', itemStyle: { color: '#10b981' } });
      
      this._chart.setOption({ 
        tooltip: { trigger: 'item', formatter: '{b}<br/>NT$ {c} ({d}%)' }, 
        series: [{ type: 'pie', radius: ['35%', '60%'], label: { show: true, formatter: '{name|{b}}\n{perc|{d}%}', rich: { name: { color: '#f1f5f9', fontSize: 11, fontWeight: 'bold' }, perc: { color: '#94a3b8', fontSize: 10 } } }, data }] 
      });
      this.save();
    },
    save() { 
      localStorage.setItem('portfolio_v8_public_template', JSON.stringify({ 
        fx: this.fx, thresholdTWD: this.thresholdTWD, usdCash: this.usdCash, twdCash: this.twdCash, 
        coreList: this.coreList.map(i=>({name:i.name, currency:i.currency, current:i.current, target:i.target})), 
        satelliteList: this.satelliteList.map(i=>({name:i.name, currency:i.currency, current:i.current, target:i.target})) 
      })); 
    }
  },
  mounted() {
    const saved = localStorage.getItem('portfolio_v8_public_template');
    if(saved) { 
      try { 
        const p = JSON.parse(saved); 
        Object.assign(this, p); 
        this.coreList.forEach(i => i.showSearch = false); 
        this.satelliteList.forEach(i => i.showSearch = false); 
      } catch(e) {} 
    }
    this.$nextTick(() => { 
      setTimeout(() => { 
        this.initChart(); 
        this.updateChart(); 
      }, 50); 
    });
  }
}
</script>

<style scoped>
/* 如果你之前有用到 .input-pv 或是 .custom-scrollbar 的 CSS，可以貼在這裡 */
/* 例如輸入框背景色或捲軸樣式，如果沒有的話就放空即可 */
</style>