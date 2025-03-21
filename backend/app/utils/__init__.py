import logging

# Создаем логгер для приложения
logger = logging.getLogger("app")

# Настраиваем базовые параметры логгера
logger.setLevel(logging.INFO)

# Создаем обработчик вывода в консоль
console_handler = logging.StreamHandler()
console_handler.setLevel(logging.INFO)

# Создаем форматировщик логов
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
console_handler.setFormatter(formatter)

# Добавляем обработчик к логгеру
logger.addHandler(console_handler)
