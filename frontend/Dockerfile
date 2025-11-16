FROM node:18-alpine

WORKDIR /app

# Копируем файлы зависимостей
COPY package.json package-lock.json ./
RUN npm install

# Копируем исходный код
COPY . .

# Собираем приложение
RUN npm run build

# Устанавливаем serve для статических файлов
RUN npm install -g serve

EXPOSE 3000

# Запускаем сервер для статических файлов
CMD ["serve", "-s", "dist", "-l", "3000"]
