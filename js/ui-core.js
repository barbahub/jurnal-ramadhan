// File: js/ui-core.js
// Fungsi: Mengatur Navigasi Tab, Tema, Modals, dan UI Global

// --- 0. UTILS ANTI-CRASH & MODALS ---
window.safeJSONParse = function(key, fallback) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : fallback;
    } catch (e) {
        console.error(`Error parsing ${key} from LocalStorage, reseting to default.`, e);
        return fallback;
    }
};

window.hardRefreshApp = function() {
    if(confirm("Sistem terasa lambat atau crash? Klik OK untuk menyegarkan memori tanpa menghapus progresmu.")) {
        localStorage.removeItem('statsRadar');
        localStorage.removeItem('activityHistory');
        window.location.reload(true);
    }
}

window.openInfoModal = function(title, desc) {
    const titleEl = document.getElementById('info-modal-title');
    const descEl = document.getElementById('info-modal-desc');
    const modal = document.getElementById('info-modal');
    const content = document.getElementById('info-modal-content');
    
    if(!modal || !titleEl || !descEl) return;
    
    titleEl.innerHTML = title;
    descEl.innerHTML = desc;
    modal.classList.remove('hidden'); 
    modal.classList.add('flex');
    setTimeout(() => { if(content) content.classList.remove('scale-95'); }, 10);
}

window.closeInfoModal = function() {
    const modal = document.getElementById('info-modal');
    const content = document.getElementById('info-modal-content');
    if(!modal) return;
    
    if(content) content.classList.add('scale-95');
    setTimeout(() => { 
        modal.classList.add('hidden'); 
        modal.classList.remove('flex'); 
    }, 200);
}

// --- 1. GLOBAL VARS & WAKTU ---
window.today = new Date();
window.startOfYear = new Date(window.today.getFullYear(), 0, 0);
window.dayOfYear = Math.floor((window.today - window.startOfYear) / (1000 * 60 * 60 * 24));
window.tglRilis = new Date("2026-02-01T00:00:00"); 
window.selisihMinggu = Math.floor(Math.max(0, window.today - window.tglRilis) / (1000 * 60 * 60 * 24 * 7));
window.currentHour = window.today.getHours();

// Cek dan tampilkan peringatan instalasi PWA
const isPWA = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
if (!isPWA) {
    const installBanner = document.getElementById('install-banner');
    if(installBanner) installBanner.style.display = 'block';
}

// --- 2. DARK MODE TOGGLE ---
const darkToggle = document.getElementById('dark-toggle');
const htmlElement = document.documentElement;

// Inisialisasi awal
if (localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) { 
    htmlElement.classList.add('dark');
    if(darkToggle) darkToggle.innerText = '☀️'; 
} else {
    htmlElement.classList.remove('dark');
    if(darkToggle) darkToggle.innerText = '🌙'; 
}

if(darkToggle) {
    darkToggle.addEventListener('click', () => {
        htmlElement.classList.toggle('dark');
        const isDark = htmlElement.classList.contains('dark');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        darkToggle.innerText = isDark ? '☀️' : '🌙';
        
        // Panggil fungsi update chart jika ada (agar warnanya menyesuaikan)
        if(typeof window.updateChartTheme === 'function') window.updateChartTheme();
    });
}

// --- 3. TAB NAVIGASI ---
const views = { 
    home: document.getElementById('view-home'), 
    target: document.getElementById('view-target'), 
    profile: document.getElementById('view-profile') 
};
const btns = { 
    home: document.getElementById('nav-btn-home'), 
    target: document.getElementById('nav-btn-target'), 
    profile: document.getElementById('nav-btn-profile') 
};

const activeClass = "flex-1 py-2.5 flex flex-col items-center text-emerald-600 dark:text-emerald-400 transition transform scale-105 bg-emerald-50 dark:bg-emerald-900/30 rounded-3xl";
const inactiveClass = "flex-1 py-2.5 flex flex-col items-center text-gray-400 hover:text-emerald-500 transition rounded-3xl relative";

window.switchTab = function(tab) {
    Object.keys(views).forEach(key => { 
        if(views[key]) {
            views[key].classList.remove('block');
            views[key].classList.add('hidden'); 
        }
        if(btns[key]) {
            btns[key].className = inactiveClass; 
        }
    });
    
    if(views[tab]) {
        views[tab].classList.remove('hidden');
        views[tab].classList.add('block');
    }
    if(btns[tab]) btns[tab].className = activeClass;
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Bind Event Listener ke tombol
if(btns.home) btns.home.addEventListener('click', () => window.switchTab('home'));
if(btns.target) btns.target.addEventListener('click', () => window.switchTab('target'));
if(btns.profile) btns.profile.addEventListener('click', () => { 
    window.switchTab('profile'); 
    // Jeda sedikit agar elemen DOM selesai di-render sebelum chart & shop digambar
    setTimeout(() => { 
        if(typeof window.renderCharts === 'function') window.renderCharts();
        if(typeof window.renderShop === 'function') window.renderShop(); 
        if(typeof window.renderFeaturedItems === 'function') window.renderFeaturedItems();
    }, 100); 
});

// Set halaman default saat pertama dimuat
document.addEventListener('DOMContentLoaded', () => {
    window.switchTab('target'); // Langsung buka tab Quest (target)
});
