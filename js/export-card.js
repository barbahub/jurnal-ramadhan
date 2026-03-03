// File: js/export-card.js
// Fungsi: Menampilkan Aura Card / CV Akhirat untuk di-screenshot pengguna

import { playerState } from './state.js';
import { calculateLevelInfo, getTitle } from './player.js';

// Event Listener Tombol Generate Player Card (AURA AURA CARD) - MODE POPUP SCREENSHOT
const btnShare = document.getElementById('btn-share');
const cardPreviewModal = document.getElementById('card-preview-modal');

// Fungsi Global untuk menutup Modal
window.closeCardPreview = function() {
    if(cardPreviewModal) {
        cardPreviewModal.classList.add('hidden');
        cardPreviewModal.classList.remove('flex');
    }
}

if(btnShare) {
    btnShare.addEventListener('click', async () => {
        btnShare.innerText = "⏳ Membuka Panel...";
        btnShare.disabled = true;

        try {
            // AMBIL DATA DARI MODULE STATE
            let currentExp = playerState.exp || 0;
            let info = calculateLevelInfo(currentExp);
            let overall = Math.min(99, Math.floor(info.level * 1.8) + 10); 
            
            // 1. Set Basic Info
            const cardOvr = document.getElementById('card-ovr');
            if(cardOvr) cardOvr.innerText = overall;

            const userNameEl = document.getElementById('user-name');
            const cardName = document.getElementById('card-name');
            // Prioritaskan input DOM, fallback ke state, fallback lagi ke 'PLAYER'
            let playerName = userNameEl ? (userNameEl.value || playerState.name || 'PLAYER') : (playerState.name || 'PLAYER');
            if(cardName) cardName.innerText = playerName;
            
            const cardTitle = document.getElementById('card-title');
            if(cardTitle) cardTitle.innerText = getTitle(info.level);
            
            const cardExp = document.getElementById('card-exp');
            if(cardExp) cardExp.innerText = currentExp.toLocaleString('id-ID');

            // 1.5 Set Info Circle Dinamis (DENGAN AUTO-GENERATE LOGO)
            const circleNameDisp = document.getElementById('circle-name-display');
            const circleLogoDisp = document.getElementById('circle-logo-display');
            
            if(window.userCircleId && circleNameDisp && circleNameDisp.innerText !== 'Memuat...') {
                let circleName = circleNameDisp.innerText;
                document.getElementById('card-circle-name').innerText = circleName;
                
                // Jika punya logo asli dari URL Firebase
                if(circleLogoDisp.querySelector('img')) {
                    let imgSrc = circleLogoDisp.querySelector('img').src;
                    document.getElementById('card-circle-logo').innerHTML = `<img src="${imgSrc}" crossorigin="anonymous" class="w-full h-full object-cover rounded-lg">`;
                } else {
                    // JIKA TIDAK PUNYA LOGO: Generate otomatis logo robot keren berdasarkan Nama Circle!
                    let seed = encodeURIComponent(circleName);
                    let autoLogoUrl = `https://api.dicebear.com/7.x/bottts/svg?seed=${seed}&backgroundColor=064e3b`;
                    document.getElementById('card-circle-logo').innerHTML = `<img src="${autoLogoUrl}" crossorigin="anonymous" class="w-full h-full object-cover rounded-lg">`;
                }
            } else {
                document.getElementById('card-circle-name').innerText = "Solo Player";
                document.getElementById('card-circle-logo').innerHTML = `<span class="text-2xl drop-shadow-md">👤</span>`;
            }

            // 2. Set Foto Profil (DENGAN AUTO-GENERATE AVATAR)
            const avatarSrcEl = document.getElementById('avatar-initial');
            const cardAvatarDest = document.getElementById('card-avatar');
            if(avatarSrcEl && cardAvatarDest) {
                // Jika sudah konek Google dan punya Foto Profil
                if(avatarSrcEl.querySelector('img')) {
                    cardAvatarDest.innerHTML = `<img src="${avatarSrcEl.querySelector('img').src}" crossorigin="anonymous" class="w-full h-full rounded-full object-cover">`;
                } else { 
                    // JIKA TIDAK PUNYA FOTO: Generate avatar karakter otomatis berdasarkan Nama Player!
                    let seedPlayer = encodeURIComponent(playerName);
                    let autoAvatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${seedPlayer}&backgroundColor=10b981`;
                    cardAvatarDest.innerHTML = `<img src="${autoAvatarUrl}" crossorigin="anonymous" class="w-full h-full rounded-full object-cover">`; 
                }
            }

            // 3. Set 6 Atribut (AMBIL DARI STATE)
            const getStat = (val) => Math.min(99, Math.floor((val || 0) / 2) + 20);
            const radar = playerState.statsRadar || { pusat:0, aura:0, peka:0, sigma:0, derma:0, stoic:0 };
            
            let stPusat = getStat(radar.pusat);
            let stAura = getStat(radar.aura);
            let stPeka = getStat(radar.peka);
            let stSigma = getStat(radar.sigma);
            let stDerma = getStat(radar.derma);
            let stStoic = getStat(radar.stoic);

            if(document.getElementById('stat-pusat')) document.getElementById('stat-pusat').innerText = stPusat;
            if(document.getElementById('stat-aura')) document.getElementById('stat-aura').innerText = stAura;
            if(document.getElementById('stat-peka')) document.getElementById('stat-peka').innerText = stPeka;
            if(document.getElementById('stat-sigma')) document.getElementById('stat-sigma').innerText = stSigma;
            if(document.getElementById('stat-derma')) document.getElementById('stat-derma').innerText = stDerma;
            if(document.getElementById('stat-stoic')) document.getElementById('stat-stoic').innerText = stStoic;

            // 4. Kalkulasi Aura Dominan
            const allStats = { 'Pusat': stPusat, 'Aura': stAura, 'Peka': stPeka, 'Sigma': stSigma, 'Derma': stDerma, 'Stoic': stStoic };
            const domName = Object.keys(allStats).reduce((a, b) => allStats[a] > allStats[b] ? a : b);
            const statEmojis = { 'Pusat': '🕋', 'Aura': '✨', 'Peka': '👼', 'Sigma': '🗿', 'Derma': '🤝', 'Stoic': '🧊' };
            
            const cardDomIcon = document.getElementById('card-dom-icon');
            const cardDomText = document.getElementById('card-dom-text');
            if(cardDomIcon) cardDomIcon.innerText = statEmojis[domName];
            if(cardDomText) cardDomText.innerText = domName;

            // 5. Cek Rank Global
            const rankBanner = document.getElementById('card-rank-banner');
            if(rankBanner) rankBanner.classList.add('hidden'); 
            
            if (window.auth && window.auth.currentUser && !window.auth.currentUser.isAnonymous) {
                try {
                    if(window.getDocs && window.query && window.collection && window.db && window.where) {
                        const qRank = window.query(window.collection(window.db, "users"), window.where("monthly_exp", ">", currentExp));
                        const snapRank = await window.getDocs(qRank);
                        let actualRank = snapRank.size + 1; 
                        
                        if (actualRank <= 10 && currentExp > 0 && rankBanner) {
                            rankBanner.innerText = `GLOBAL RANK ${actualRank}`;
                            rankBanner.classList.remove('hidden');
                        }
                    }
                } catch(e) { console.warn("Rank fetch failed", e); }
            }

            // 6. Buka Pop-Up
            setTimeout(() => {
                if(cardPreviewModal) {
                    cardPreviewModal.classList.remove('hidden');
                    cardPreviewModal.classList.add('flex');
                }
                btnShare.innerText = "🃏 Flex Prayer Card"; btnShare.disabled = false;
                if(typeof confetti === 'function') confetti({ particleCount: 150, spread: 80, zIndex: 1000, colors: ['#a855f7', '#eab308'] });
            }, 300);

        } catch (err) {
            console.error(err);
            btnShare.innerText = "🃏 Flex Prayer Card"; btnShare.disabled = false;
        }
    });
}

// ==========================================
// JEMBATAN KE HTML (Agar tombol bisa diklik)
// ==========================================

// Sesuaikan nama di sisi kanan dengan nama fungsi asli yang ada di file Anda
window.closeCardPreview = closeCardPreview;
