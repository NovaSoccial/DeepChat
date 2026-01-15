import telebot
from telebot import types
import requests
from datetime import datetime
import uuid

TOKEN = "8216293009:AAFaVEicQN5lhaM-Hk43mYCptwOV14_bvLQ"
FIREBASE_URL = "https://deepchat-d84d7-default-rtdb.firebaseio.com/"

bot = telebot.TeleBot(TOKEN)

@bot.message_handler(commands=['start'])
def welcome(message):
    # Kullanıcıdan numarasını isteyen buton oluşturuyoruz
    markup = types.ReplyKeyboardMarkup(one_time_keyboard=True, resize_keyboard=True)
    button_phone = types.KeyboardButton(text="📱 Numarayı Doğrula ve Mühürle", request_contact=True)
    markup.add(button_phone)
    
    msg = (
        "🛡️ *DeepChat Sentinel Giriş Paneli*\n\n"
        "Sisteme erişim sağlamak için aşağıdaki butona basarak numaranızı mühürlemeniz gerekmektedir."
    )
    bot.send_message(message.chat.id, msg, parse_mode="Markdown", reply_markup=markup)

@bot.message_handler(content_types=['contact'])
def handle_contact(message):
    if message.contact is not None:
        phone_number = message.contact.phone_number
        chat_id = str(message.chat.id)
        
        # 16 Haneli Master Key Üretimi
        master_key = "DC-" + uuid.uuid4().hex.upper()[:16]
        
        # Firebase'e Kayıt
        user_data = {
            "phone": phone_number,
            "masterKey": master_key,
            "status": "verified",
            "timestamp": datetime.now().strftime("%d/%m/%Y %H:%M:%S")
        }
        
        requests.put(f"{FIREBASE_URL}users/{chat_id}.json", json=user_data)
        
        # Başarılı mesajı ve klavyeyi kaldırma
        markup = types.ReplyKeyboardRemove()
        success_msg = (
            "✅ *Mühürleme İşlemi Tamamlandı!*\n\n"
            f"👤 *Numara:* `{phone_number}`\n"
            f"🔑 *Master Key:* `{master_key}`\n\n"
            "Artık DeepChat paneline bu anahtar ile giriş yapabilirsiniz."
        )
        bot.send_message(message.chat.id, success_msg, parse_mode="Markdown", reply_markup=markup)

print("🚀 DeepChat Botu (No-AppsScript) Aktif!")
bot.infinity_polling()
