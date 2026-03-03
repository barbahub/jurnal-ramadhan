// File: js/charts.js
// Fungsi: Mengatur Radar Skena, Heatmap, dan Rak Trofi (Badges)

import { playerState } from './state.js';

// --- AUTO-MIGRASI DATA STATS LAMA KE BARU ---
// Fungsi ini memastikan kalau ada data format lama, tidak bikin error
function migrateOldStats() {
    let radar = playerState.statsRadar;
    if (radar.ketuhanan !== undefined) {
        playerState.statsRadar = {
            pusat: radar.ketuhanan || 10,
            derma: radar.gotong_royong || 10,
            stoic: radar.disiplin || 10,
            sigma: radar.tanggung_jawab || 10,
            peka: radar.peduli || 10,
            aura: 10
        };
        localStorage.setItem('statsRadar', JSON.stringify(playerState.statsRadar));
    }
}
migrateOldStats();

// --- 1. RENDER RAK TROFI (BADGES) ---
export function updateBadges() {
    const badgeContainer = document.getElementById('badges-container');
    if (!badgeContainer) return;

    let badgesHTML = '';
    const level = playerState.level || 1;
    const streak = parseInt(localStorage.getItem('streakNum')) || 0;
    const totalKoin = playerState.koin || 0;
    const radar = playerState.statsRadar || { pusat:0, aura:0, derma:0, stoic:0, peka:0, sigma:0 };

    // Kriteria Badges (Bisa Anda tambah sesuka hati nanti)
    const badges = [
        { id: 'b1', icon: '🌱', name: 'Newbie', desc: 'Mencapai Level 5', unlocked: level >= 5 },
        { id: 'b2', icon: '🔥', name: 'Istiqomah', desc: 'Streak 7 Hari', unlocked: streak >= 7 },
        { id: 'b3', icon: '💎', name: 'Sultan', desc: 'Kumpulkan 1.000 Koin', unlocked: totalKoin >= 1000 },
        { id: 'b4', icon: '👑', name: 'Sepuh', desc: 'Mencapai Level 30', unlocked: level >= 30 },
        { id: 'b5', icon: '⚡', name: 'Backingan Pusat', desc: 'Stat Sholat > 50', unlocked: radar.pusat >= 50 },
        { id: 'b6', icon: '💰', name: 'Crazy Rich', desc: 'Stat Sedekah > 50', unlocked: radar.derma >= 50 }
    ];

    badges.forEach(b => {
        if (b.unlocked) {
            badgesHTML += `
            <div class="flex flex-col items-center p-3 bg-gradient-to-br from-yellow-50 to-yellow-200 dark:from-yellow-900/40 dark:to-yellow-800/40 rounded-2xl border border-yellow-300 dark:border-yellow-700 shadow-sm transform hover:-translate-y-1 transition duration-300 relative group cursor-pointer">
                <span class="text-3xl mb-1 filter drop-shadow-md">${b.icon}</span>
                <span class="text-[10px] font-black text-yellow-800 dark:text-yellow-400 text-center leading-tight">${b.name}</span>
                <div class="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-[10px] font-bold py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap z-50">
                    ${b.desc}
                </div>
            </div>`;
        } else {
            badgesHTML += `
            <div class="flex flex-col items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 opacity-60 grayscale relative group cursor-help">
                <span class="text-3xl mb-1">🔒</span>
                <span class="text-[10px] font-bold text-gray-500 text-center leading-tight">Terkunci</span>
                <div class="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-[10px] font-bold py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap z-50">
                    ${b.desc}
                </div>
            </div>`;
        }
    });

    badgeContainer.innerHTML = badgesHTML;
}

// --- 2. SISTEM AURA BADGE UI (KOSMETIK LEVEL) ---
window.getAuraBadgeUI = function(level, dominantStatName) {
    const statEmojis = { 'Pusat': '🕋', 'Aura': '✨', 'Peka': '👼', 'Sigma': '🗿', 'Derma': '🤝', 'Stoic': '🧊' };
    let baseEmoji = statEmojis[dominantStatName] || '🔥';
    let badgeClass = '', titleColor = '', emojiDisplay = baseEmoji;

    if (level < 10) { badgeClass = 'bg-gray-800 border-gray-600'; titleColor = 'text-gray-400'; emojiDisplay = baseEmoji; } 
    else if (level < 20) { badgeClass = 'bg-gray-800 border-amber-700 shadow-lg shadow-amber-900/40'; titleColor = 'text-amber-500'; emojiDisplay = `${baseEmoji}✨`; } 
    else if (level < 30) { badgeClass = 'bg-slate-800 border-slate-300 shadow-lg shadow-slate-400/50 animate-pulse'; titleColor = 'text-slate-200'; emojiDisplay = `❄️${baseEmoji}❄️`; } 
    else if (level < 40) { badgeClass = 'bg-gradient-to-br from-yellow-900 to-yellow-700 border-yellow-400 shadow-xl shadow-yellow-500/50 relative overflow-hidden'; titleColor = 'text-yellow-300 font-black'; emojiDisplay = `<span class="inline-block animate-bounce">👑${baseEmoji}</span>`; } 
    else if (level < 50) { badgeClass = 'bg-fuchsia-950 border-fuchsia-500 shadow-[0_0_20px_rgba(217,70,239,0.6)]'; titleColor = 'text-fuchsia-400 font-black tracking-widest drop-shadow-md'; emojiDisplay = `🔮${baseEmoji}🔮`; } 
    else { badgeClass = 'bg-black border-transparent relative z-10 before:absolute before:-inset-1 before:bg-gradient-to-r before:from-red-500 before:via-yellow-500 before:to-purple-500 before:-z-10 before:animate-spin shadow-[0_0_25px_rgba(239,68,68,0.8)]'; titleColor = 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-red-500 font-black tracking-widest animate-pulse'; emojiDisplay = `<span class="inline-block animate-bounce">⚡👑${baseEmoji}👑⚡</span>`; }

    return `<div class="rounded-2xl p-2 border-2 flex flex-col items-center justify-center text-center transition-all ${badgeClass} h-full min-h-[90px]">
        <div class="text-3xl mb-1 drop-shadow-lg">${emojiDisplay}</div>
        <p class="text-[8px] font-bold uppercase tracking-widest text-gray-300 mb-0.5 opacity-80">Aura Dominan</p>
        <h4 class="text-[10px] ${titleColor} uppercase line-clamp-1">${dominantStatName}</h4>
    </div>`;
}

// --- 3. RENDER RADAR & DONUT CHART ---
window.radarChartInstance = null;
window.donutChartInstance = null;

export function renderCharts() {
    const ctxR = document.getElementById('radarChart');
    const ctxD = document.getElementById('donutChart');
    
    if (!ctxR || !ctxD || typeof Chart === 'undefined') return;

    const isDark = document.documentElement.classList.contains('dark');
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    const fontColor = isDark ? '#9CA3AF' : '#6B7280';
    
    const radar = playerState.statsRadar || { pusat:10, aura:10, peka:10, sigma:10, derma:10, stoic:10 };
    const labels = ['Pusat', 'Aura', 'Peka', 'Sigma', 'Derma', 'Stoic'];
    const dataPts = [radar.pusat, radar.aura, radar.peka, radar.sigma, radar.derma, radar.stoic];

    // RADAR CHART
    if (window.radarChartInstance) window.radarChartInstance.destroy();
    window.radarChartInstance = new Chart(ctxR.getContext('2d'), {
        type: 'radar',
        data: {
            labels: labels,
            datasets: [{
                data: dataPts, 
                backgroundColor: 'rgba(16, 185, 129, 0.2)', 
                borderColor: 'rgba(16, 185, 129, 1)', 
                pointBackgroundColor: '#FBBC05', 
                borderWidth: 1.5, 
                pointRadius: 2
            }]
        },
        options: { 
            responsive: true, 
            maintainAspectRatio: false, 
            scales: { r: { angleLines: { color: gridColor }, grid: { color: gridColor }, pointLabels: { color: fontColor, font: { size: 9, weight: 'bold' } }, ticks: { display: false } } }, 
            plugins: { legend: { display: false } } 
        }
    });

    // DONUT CHART (Progress Misi Harian)
    let checkedBoxes = document.querySelectorAll('.checklist-item:checked, .sholat-item:checked').length;
    let totalBoxes = document.querySelectorAll('.checklist-item, .sholat-item').length;
    let percentVal = totalBoxes === 0 ? 0 : Math.floor((checkedBoxes/totalBoxes)*100);
    
    if (window.donutChartInstance) window.donutChartInstance.destroy();
    window.donutChartInstance = new Chart(ctxD.getContext('2d'), {
        type: 'doughnut',
        data: { 
            labels: ['Selesai', 'Sisa'], 
            datasets: [{ data: [checkedBoxes, Math.max(0, totalBoxes - checkedBoxes)], backgroundColor: ['#10B981', gridColor], borderWidth: 0, cutout: '75%' }] 
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: {enabled: false} } }
    });

    const percentText = document.getElementById('donut-percent');
    if(percentText) percentText.innerText = `${percentVal}%`;

    // UPDATE AURA BADGE (Berdasarkan data tertinggi dari Radar)
    const maxStatName = labels[ dataPts.indexOf(Math.max(...dataPts)) ];
    const auraBadgeContainer = document.getElementById('aura-badge-container');
    if(auraBadgeContainer) {
        auraBadgeContainer.innerHTML = window.getAuraBadgeUI(playerState.level, maxStatName);
    }
}

// --- 4. HEATMAP (JEJAK AKTIVITAS 7 HARI) ---
window.activityHistory = (() => {
    try { return JSON.parse(localStorage.getItem('activityHistory')) || []; } 
    catch(e) { return []; }
})();

window.updateHeatmap = function() {
    const container = document.getElementById('heatmap-container');
    if(!container) return;
    container.innerHTML = '';
    const last7Days = [];
    for(let i = 6; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); last7Days.push(d.toDateString()); }
    
    last7Days.forEach(dateStr => {
        const count = window.activityHistory.find(r => r.date === dateStr)?.count || 0;
        let colorClass, tooltip;
        if (count === 0) { colorClass = 'bg-gray-200 dark:bg-gray-700'; tooltip = "Fase Nyasar"; }
        else if (count <= 3) { colorClass = 'bg-emerald-200 dark:bg-emerald-900'; tooltip = "Minimal Niat"; }
        else if (count <= 6) { colorClass = 'bg-emerald-400 dark:bg-emerald-700'; tooltip = "Skena Ibadah"; }
        else if (count <= 10) { colorClass = 'bg-emerald-600 dark:bg-emerald-500'; tooltip = "Rajin Parah"; }
        else { colorClass = 'bg-cyan-400 shadow-sm shadow-cyan-400/50 animate-pulse'; tooltip = "Backingan Pusat"; }
      
        const dayName = new Date(dateStr).toLocaleDateString('id-ID', {weekday: 'short'}).charAt(0);
        container.innerHTML += `<div onclick="alert('Kasta Hari Ini: ${tooltip}')" class="flex flex-col items-center gap-1 cursor-pointer hover:scale-110 transition"><div class="w-8 h-8 rounded-lg ${colorClass} transition-colors duration-500" title="${tooltip}"></div><span class="text-[9px] font-bold text-gray-400">${dayName}</span></div>`;
    });
}
window.updateHeatmap();

window.logActivityForHeatmap = function() {
    const dateStr = new Date().toDateString();
    let recordIndex = window.activityHistory.findIndex(r => r.date === dateStr);
    if(recordIndex >= 0) window.activityHistory[recordIndex].count += 1;
    else window.activityHistory.push({ date: dateStr, count: 1 });
    
    if(window.activityHistory.length > 14) window.activityHistory.shift(); 
    localStorage.setItem('activityHistory', JSON.stringify(window.activityHistory));
    window.updateHeatmap();
}

// --- 5. JEMBATAN LEGACY & AUTO-UPDATE ---
window.updateBadges = updateBadges;
window.renderCharts = renderCharts;
window.updateChartTheme = function() { renderCharts(); }

// Inisialisasi awal dengan jeda agar UI siap
setTimeout(() => {
    updateBadges();
    renderCharts();
}, 500);

// Otomatis update Chart dan Badge setiap kali EXP/Koin bertambah di state.js!
document.addEventListener('stateUpdated', () => {
    // Memberikan jeda sangat kecil agar data DOM (seperti checklist) sempat ter-update
    setTimeout(() => {
        updateBadges();
        renderCharts();
    }, 50);
});
