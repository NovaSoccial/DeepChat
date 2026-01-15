const DB_URL = "https://deepchat-d84d7-default-rtdb.firebaseio.com/users.json";

// SİSTEME GİRİŞ
async function sistemeGiris() {
    const key = document.getElementById('master-key-input').value;
    const err = document.getElementById('login-error');
    if(!key) { err.innerText = "Lütfen anahtarınızı girin!"; return; }

    try {
        const res = await fetch(DB_URL);
        const users = await res.json();
        let valid = false;
        for (let i in users) { if (users[i].masterKey === key) { valid = true; break; } }

        if (valid) {
            document.getElementById('login-screen').style.display = 'none';
            document.getElementById('app-screen').style.display = 'block';
            tabDegistir('chats');
        } else {
            err.innerText = "Hatalı Anahtar! Lütfen bot üzerinden tekrar kontrol edin.";
        }
    } catch(e) { err.innerText = "Bağlantı hatası!"; }
}

// SEKME DEĞİŞTİRME
function tabDegistir(t) {
    const main = document.getElementById('main-content');
    document.querySelectorAll('.tab').forEach(el => el.classList.remove('active'));
    document.getElementById('tab-' + t).classList.add('active');
    
    if(t === 'chats') {
        main.innerHTML = `
            <div class="user-item" onclick="sohbetAc('Ablam')">
                <div class="user-avatar"><span class="material-icons">person</span></div>
                <div class="user-info"><h4>Ablam</h4><p>Dokun ve mesaj gönder...</p></div>
            </div>`;
    } else {
        main.innerHTML = `<div style="padding:50px; text-align:center; color:#8696a0;">Burada bir şey yok.</div>`;
    }
}

// SOHBETİ AÇ
function sohbetAc(isim) {
    const win = document.createElement('div');
    win.className = 'chat-window';
    win.innerHTML = `
        <div class="chat-header">
            <span class="material-icons" onclick="this.parentElement.parentElement.remove()">arrow_back</span>
            <h4>${isim}</h4>
        </div>
        <div class="msg-area" id="msg-box">
            <div class="msg received">Selam! DeepChat üzerinden mesajlaşabiliriz.</div>
        </div>
        <div class="input-area">
            <input type="text" id="m-text" placeholder="Mesaj yaz...">
            <span class="material-icons" style="color:#00a884; cursor:pointer;" onclick="gonder('${isim}')">send</span>
        </div>`;
    document.body.appendChild(win);
}

// MESAJ GÖNDER
async function gonder(alici) {
    const inp = document.getElementById('m-text');
    const box = document.getElementById('msg-box');
    if(!inp.value) return;

    box.innerHTML += `<div class="msg sent">${inp.value}</div>`;
    await fetch(`https://deepchat-d84d7-default-rtdb.firebaseio.com/messages/${alici}.json`, {
        method: 'POST',
        body: JSON.stringify({ text: inp.value, time: Date.now() })
    });
    inp.value = "";
    box.scrollTop = box.scrollHeight;
}

// REHBER KONTROLÜ
async function rehberAc() {
    try {
        const contacts = await navigator.contacts.select(['name', 'tel'], {multiple: true});
        const res = await fetch(DB_URL);
        const users = await res.json();
        const reg = Object.values(users).map(u => u.phone.replace(/\D/g,''));

        let html = '<div style="background:#0b141a; min-height:100vh;">';
        contacts.forEach(c => {
            let p = c.tel[0].replace(/\D/g,'');
            let using = reg.includes(p);
            html += `
                <div class="user-item">
                    <div class="user-avatar">${c.name[0][0]}</div>
                    <div class="user-info">
                        <h4>${c.name[0]}</h4>
                        <p class="${using ? '' : 'not-using'}">${using ? 'DeepChat Kullanıyor' : 'DeepChat kullanmıyor'}</p>
                    </div>
                </div>`;
        });
        document.getElementById('main-content').innerHTML = html + '</div>';
    } catch(e) { alert("Rehber izni desteklenmiyor veya reddedildi."); }
                }
