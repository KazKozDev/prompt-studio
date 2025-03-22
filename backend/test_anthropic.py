import anthropic
import os
import sys

def test_anthropic_api():
    # Использование ключа API из переменных окружения или командной строки
    api_key = sys.argv[1] if len(sys.argv) > 1 else os.getenv("ANTHROPIC_API_KEY")
    
    if not api_key:
        print("Ошибка: API ключ не указан. Используйте переменную окружения ANTHROPIC_API_KEY или передайте ключ как аргумент командной строки.")
        return
    
    try:
        # Настройка клиента с указанием версии API
        client = anthropic.Anthropic(
            api_key=api_key,
            default_headers={"anthropic-version": "2023-06-01"}
        )
        
        # Простой запрос к API
        response = client.messages.create(
            model="claude-3-haiku-20240307",
            max_tokens=100,
            messages=[
                {"role": "user", "content": "Привет, Клод!"}
            ]
        )
        
        # Вывод успешного ответа
        print("✅ API запрос выполнен успешно!")
        print(f"Ответ: {response.content[0].text}")
        
        # Проверка токенов
        print(f"Использовано входных токенов: {response.usage.input_tokens}")
        print(f"Использовано выходных токенов: {response.usage.output_tokens}")
        
    except Exception as e:
        # Детальный вывод ошибки
        print(f"❌ Ошибка при обращении к API Anthropic: {type(e).__name__}")
        print(f"Сообщение об ошибке: {str(e)}")
        
        # Обработка конкретных случаев
        error_msg = str(e)
        if 'authentication_error' in error_msg.lower() or '401' in error_msg:
            print("\nРекомендации для решения проблемы аутентификации:")
            print("1. Убедитесь, что ключ API не содержит лишних пробелов или символов")
            print("2. Проверьте, что ключ API начинается с 'sk-ant-'")
            print("3. Попробуйте сгенерировать новый ключ API в консоли Anthropic")
            print("4. Убедитесь, что на вашем аккаунте активирован биллинг и есть доступные кредиты")
        
if __name__ == "__main__":
    test_anthropic_api() 