import requests
import sys
import json
from datetime import datetime

def test_endpoint(api_key, model="claude-3-5-sonnet-20240620"):
    """
    Тестирование эндпоинта API Anthropic с указанными параметрами
    """
    print(f"\n[{datetime.now().strftime('%H:%M:%S')}] Тестирую модель: {model}")
    
    url = "https://api.anthropic.com/v1/messages"
    
    headers = {
        "x-api-key": api_key,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json"
    }
    
    data = {
        "model": model,
        "max_tokens": 100,
        "messages": [
            {"role": "user", "content": "Hello, how are you?"}
        ]
    }
    
    try:
        print(f"Отправка запроса на {url} с моделью {model}")
        response = requests.post(url, headers=headers, json=data)
        
        if response.status_code == 200:
            result = response.json()
            content = result.get("content", [{}])[0].get("text", "Нет ответа")
            print(f"✅ Успешно! Ответ: {content[:50]}...")
            return True
        else:
            print(f"❌ Ошибка! Статус код: {response.status_code}")
            print(f"Ответ: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Ошибка: {type(e).__name__}: {str(e)}")
        return False

def main():
    if len(sys.argv) < 2:
        print("Использование: python test_anthropic_endpoint.py <ваш_апи_ключ> [модель]")
        return
        
    api_key = sys.argv[1]
    model = sys.argv[2] if len(sys.argv) > 2 else "claude-3-5-sonnet-20240620"
    
    print(f"Тестирование API ключа: {api_key[:8]}...")
    test_endpoint(api_key, model)

if __name__ == "__main__":
    main() 