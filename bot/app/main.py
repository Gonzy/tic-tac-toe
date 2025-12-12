import asyncio
import os
from typing import Dict

from aiogram import Bot, Dispatcher, types
from aiogram.filters import Command
from aiogram.types import InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo
from dotenv import load_dotenv

# Загрузка переменных окружения из .env файла
load_dotenv()

# Получение переменных окружения
BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
FRONTEND_URL = os.getenv("FRONTEND_URL")

# Инициализация бота и диспетчера
bot = Bot(token=BOT_TOKEN)
dp = Dispatcher()

@dp.message(Command("start"))
async def cmd_start(message: types.Message):
    """Обработчик команды /start"""

    # Получаем chat_id пользователя
    chat_id = message.chat.id

    # Создаем URL с параметром chat_id
    game_url = f"{FRONTEND_URL}?id={chat_id}"

    # Создание инлайн-клавиатуры с кнопкой, ведущей на фронтенд с chat_id
    keyboard = InlineKeyboardMarkup(
        inline_keyboard=[
            [InlineKeyboardButton(
                text="Играть в крестики-нолики",
                url=game_url
            )]
        ]
    )

    # Приветственное сообщение
    welcome_text = (
        "👋 Привет! Добро пожаловать в игру Крестики-нолики!\n\n"
        "Нажмите на кнопку ниже, чтобы начать игру.\n\n"
        "🎮 Правила просты:\n"
        "• Игрок, ставящий крестики, всегда ходит первым\n"
        "• Победителем становится тот, кто выстроит ряд из трёх своих символов\n"
        "• Если все клетки заполнены, а победителя нет — ничья\n\n"
        "Удачи! 🍀"
    )

    await message.answer(welcome_text, reply_markup=keyboard)

@dp.message()
async def echo_message(message: types.Message):
    """Обработчик для всех остальных сообщений"""
    await message.answer(
        "Пожалуйста, используйте команду /start для начала игры."
    )

async def main():
    """Запуск бота"""
    print("Bot starting...")
    await dp.start_polling(bot)

if __name__ == "__main__":
    asyncio.run(main())