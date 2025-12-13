import os
import random
import string
from typing import Dict

import httpx
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

# Настройка CORS
# Для разработки разрешаем localhost, для продакшена нужно будет настроить конкретный домен
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,  # Разрешить фронтенд
    allow_credentials=True,
    allow_methods=["*"],  # Разрешить все методы
    allow_headers=["*"],  # Разрешить все заголовки
)

# Модель для запроса
class GameResult(BaseModel):
    chat_id: int

# Получение токена бота из переменных окружения
BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
TELEGRAM_API_URL = f"https://api.telegram.org/bot{BOT_TOKEN}"

def generate_promocode(length: int = 5) -> str:
    """Генерирует промокод из 8 символов (A-Z, 0-9)"""
    characters = string.ascii_uppercase + string.digits
    return ''.join(random.choice(characters) for _ in range(length))

async def send_telegram_message(chat_id: int, text: str) -> Dict:
    """Отправляет сообщение в Telegram с форматированием Markdown v2"""
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{TELEGRAM_API_URL}/sendMessage",
            json={
                "chat_id": chat_id,
                "text": text,
                "parse_mode": "MarkdownV2"
            }
        )
        return response.json()

@app.post("/api/win")
async def win(game_result: GameResult):
    """Обрабатывает победу игрока"""
    if not BOT_TOKEN:
        raise HTTPException(status_code=500, detail="Telegram bot token not configured")

    promocode = generate_promocode()
    message = f"*Поздравляю с победой! Ваш промокод: `{promocode}`"

    try:
        result = await send_telegram_message(game_result.chat_id, message)
        return {"status": "success", "message": "Win message sent", "promocode": promocode}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send message: {str(e)}")

@app.post("/api/lose")
async def lose(game_result: GameResult):
    """Обрабатывает поражение игрока"""
    if not BOT_TOKEN:
        raise HTTPException(status_code=500, detail="Telegram bot token not configured")

    message = "Не расстраивайтесь, в следующий раз повезёт больше\\! Попробуйте ещё раз\\."

    try:
        result = await send_telegram_message(game_result.chat_id, message)
        return {"status": "success", "message": "Lose message sent"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send message: {str(e)}")

@app.get("/")
async def root():
    """Корневой эндпоинт для проверки работоспособности"""
    return {"status": "running", "message": "Tic-Tac-Toe backend is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)