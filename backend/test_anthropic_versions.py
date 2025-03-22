import anthropic
import sys
from datetime import datetime

# Список возможных версий API для тестирования
API_VERSIONS = [
    "2023-01-01", 
    "2023-06-01", 
    "2023-12-01", 
    None  # Без указания версии (будет использована версия по умолчанию)
]

def test_version(api_key, version):
    """Тест конкретной версии API"""
    print(f"\n[{datetime.now().strftime('%H:%M:%S')}] Тестирую версию API: {version or 'По умолчанию'}")
    
    try:
        default_headers = {"anthropic-version": version} if version else {}
        
        client = anthropic.Anthropic(
            api_key=api_key,
            default_headers=default_headers
        )
        
        # Пробуем сделать простой запрос
        response = client.messages.create(
            model="claude-3-haiku-20240307",
            max_tokens=10,
            messages=[{"role": "user", "content": "Hi"}]
        )
        print(f"✅ Успешно! Получен ответ от модели: {response.content[0].text[:30]}...")
        return True
            
    except Exception as e:
        print(f"❌ Ошибка: {type(e).__name__}: {str(e)}")
        return False

def main():
    if len(sys.argv) < 2:
        print("Использование: python test_anthropic_versions.py <ваш_апи_ключ>")
        return
        
    api_key = sys.argv[1]
    
    # Информация о библиотеке
    print(f"Версия библиотеки anthropic: {anthropic.__version__}")
    print(f"Тестирование API ключа: {api_key[:8]}...")
    
    # Проверяем все версии API
    successful_versions = []
    for version in API_VERSIONS:
        if test_version(api_key, version):
            successful_versions.append(version or "По умолчанию")
    
    # Результаты
    if successful_versions:
        print("\n✅ Успешные версии API:")
        for v in successful_versions:
            print(f"  - {v}")
        print(f"\nРекомендация: Используйте версию {successful_versions[0]}")
    else:
        print("\n❌ Ни одна версия API не работает с данным ключом.")
        print("Попробуйте сгенерировать новый ключ API в консоли Anthropic.")

if __name__ == "__main__":
    main() 