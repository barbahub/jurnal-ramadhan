// ... existing code ...
window.userCircleId = null;
let circleOwnerId = null;

signInAnonymously(auth).catch((error) => console.warn("Guest Auth:", error));

// --- FUNGSI FETCH LEADERBOARD BARU ---
window.fetchLeaderboard = async function() {
// ... existing code ...
        const gmt = document.getElementById('global-mission-title');
        if(gmt) gmt.innerText = misiSaatIni.title;
      
        if (!docSnap.exists()) {
            let defaultName = user.displayName || "User";
            await setDoc(userRef, {
                name: defaultName, photo: user.photoURL || "",
                koin: window.totalKoin, totalKoin: window.totalKoin, total_exp: window.totalExp,
                monthly_exp: window.totalExp, unlockedItems: window.unlockedItems, inventory: window.inventory,
                statsRadar: window.statsRadar, activityHistory: window.activityHistory,
                streakNum: parseInt(localStorage.getItem('streakNum') || 0), // FIX: Simpan streak user baru
                lastStreakClaim: localStorage.getItem('lastStreakClaim') || '', // FIX: Simpan status klaim
                circle_id: null, last_reset_month: currentMonthStr 
            }, { merge: true });
            if(nameInputFire) nameInputFire.value = defaultName; 
            localStorage.setItem('userName', defaultName);
            if(user.photoURL) { document.getElementById('avatar-initial').innerHTML = `<img src="${user.photoURL}" class="w-full h-full object-cover">`; }
        } else {
            const data = docSnap.data();
            let customName = data.name || user.displayName || "User";
            if(nameInputFire) nameInputFire.value = customName; 
            localStorage.setItem('userName', customName);
            
            if (data.photo && data.photo.trim() !== "") {
                document.getElementById('avatar-initial').innerHTML = `<img src="${data.photo}" class="w-full h-full object-cover" onerror="this.style.display='none'; this.parentNode.innerText='${customName.charAt(0).toUpperCase()}'">`;
            } else { document.getElementById('avatar-initial').innerText = customName.charAt(0).toUpperCase(); }
            
            window.totalExp = data.total_exp || window.totalExp; 
            // FIX: Tarik data koin, item, dan inventori dari Firebase
            window.totalKoin = data.totalKoin !== undefined ? data.totalKoin : (data.koin || window.totalKoin);
            window.unlockedItems = data.unlockedItems || data.unlocked_items || window.unlockedItems || [];
            window.inventory = data.inventory || window.inventory || {};

            // Simpan ke local storage agar terbaca oleh shop.js
            localStorage.setItem('totalExp', window.totalExp); 
            localStorage.setItem('totalKoin', window.totalKoin);
            localStorage.setItem('unlockedItems', JSON.stringify(window.unlockedItems));
            localStorage.setItem('inventory', JSON.stringify(window.inventory));
            
            const koinDisp = document.getElementById('koin-display');
            if(koinDisp) koinDisp.innerText = window.totalKoin;

            // Render ulang toko dengan data dari cloud
            if(typeof window.renderShop === 'function') window.renderShop();
            if(typeof window.renderFeaturedItems === 'function') window.renderFeaturedItems();
            
            if(typeof window.updateStatsUI === 'function') window.updateStatsUI();

            // FIX: Load Streak Data dari Cloud ke LocalStorage agar tersimpan saat ganti device
// ... existing code ...
    tabLbCircle.addEventListener('click', () => {
        window.currentLbTab = 'circle';
        tabLbCircle.className = "flex-1 text-xs font-bold py-1.5 rounded-lg bg-white/20 text-white shadow-sm transition";
        tabLbIndividu.className = "flex-1 text-xs font-bold py-1.5 rounded-lg text-indigo-200 hover:text-white hover:bg-white/10 transition";
        window.fetchLeaderboard();
    });
}

// --- INTEGRASI TOKO FLEXING KE FIREBASE ---
window.saveShopDataToFirebase = async function(sisaKoin, itemTerbuka, inventori) {
    if (!auth || !auth.currentUser || auth.currentUser.isAnonymous) {
        console.warn("User belum login (Anonymous). Data hanya tersimpan di LocalStorage.");
        return;
    }
    
    try {
        const userRef = doc(db, "users", auth.currentUser.uid);
        
        await updateDoc(userRef, {
            totalKoin: sisaKoin,
            koin: sisaKoin, // backup field lama supaya aman
            unlockedItems: itemTerbuka,
            inventory: inventori
        });
        console.log("Transaksi toko berhasil disimpan ke database!");
    } catch (error) {
        console.error("Gagal menyimpan transaksi ke database:", error);
    }
};
