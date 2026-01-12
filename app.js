import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Firebase Yapılandırman [cite: 2026-01-08]
const firebaseConfig = {
    apiKey: "AIzaSyBA1H0C7y4Cbt2ZUBtGRnvu-HgPv8F-iog", 
    authDomain: "novasoccial.firebaseapp.com",
    projectId: "novasoccial",
    storageBucket: "novasoccial.firebasestorage.app",
    messagingSenderId: "680106218526",
    appId: "1:680106218526:web:0edcdbe46ff1c84582ca0f"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// reCAPTCHA Kurulumu (SMS için şart) [cite: 2026-01-12]
window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
    'size': 'normal', // Ekranda 'Ben robot değilim' kutusu görünür, SMS'i tetikler [cite: 2026-01-12]
    'callback': (response) => { console.log("reCAPTCHA doğrulandı."); }
});

// CANLI SMS GÖNDERME VE GİRİŞ [cite: 2026-01-12]
window.login = async () => {
    const phone = document.getElementById('phoneInput').value;

    // 🛡️ GÜVENLİK: Sadece Türkiye (+90) numaralarına izin ver [cite: 2026-01-12]
    if (!phone.startsWith("+90")) {
        alert("DeepChat şu an sadece Türkiye numaraları (+90) için aktiftir. Diğerleri engellendi."); [cite: 2026-01-12]
        return;
    }

    const verifier = window.recaptchaVerifier;

    try {
        const confirmationResult = await signInWithPhoneNumber(auth, phone, verifier);
        window.confirmationResult = confirmationResult;
        
        const code = prompt("Telefonunuza gelen 6 haneli doğrulama kodunu giriniz:");
        if (code) {
            const result = await confirmationResult.confirm(code);
            const user = result.user;

            // 📝 ADMIN LOG: Giriş yapanı veritabanına kaydet (Senin panelin için) [cite: 2026-01-11]
            await setDoc(doc(db, "users", user.uid), {
                phoneNumber: user.phoneNumber,
                joinedAt: serverTimestamp(),
                status: "active"
            });

            // Ekran değiştirme [cite: 2026-01-11]
            document.getElementById('login-box').style.display = 'none';
            document.getElementById('main-screen').style.display = 'flex';
            console.log("DeepChat'e hoş geldiniz!");
        }
    } catch (error) {
        console.error("SMS Hatası:", error);
        alert("SMS gönderilemedi! Lütfen numaranızı ve internet bağlantınızı kontrol edin."); [cite: 2026-01-12]
    }
};

// SEKME YÖNETİMİ (WhatsApp Tarzı) [cite: 2026-01-11]
window.switchTab = (tabName) => {
    // Tüm sekmeleri gizle
    const tabs = ['sohbetler', 'durumlar', 'kanallar', 'aramalar'];
    tabs.forEach(t => {
        const el = document.getElementById('tab-' + t);
        if (el) el.style.display = 'none';
    });

    // İlgili sekmeyi göster
    const activeTab = document.getElementById('tab-' + tabName);
    if (activeTab) activeTab.style.display = 'block';

    // Alt menüdeki aktif sınıfını güncelle
    document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
    // (Burada DOM yapına göre ilgili nav-item'a active eklenmeli)

    // Sağ alttaki butonun (FAB) ikonunu değiştir
    const fabIcon = document.getElementById('fab-icon');
    if (tabName === 'sohbetler') fabIcon.innerText = "💬";
    else if (tabName === 'durumlar') fabIcon.innerText = "📷";
    else if (tabName === 'aramalar') fabIcon.innerText = "📞";
};

// SAĞ ALT BUTON AKSİYONU [cite: 2026-01-11]
window.handleFabAction = () => {
    alert("Rehber taranıyor... DeepChat kullanıcıları aranıyor.");
};