# Используем образ Node.js в качестве базового
FROM node:18-alpine

# Устанавливаем рабочую директорию внутри контейнера
WORKDIR /app

# Копируем package.json и package-lock.json для установки зависимостей
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем исходный код приложения
COPY . .

# Компилируем TypeScript код в JavaScript
RUN npm run build

# Открываем порт, который будет прослушиваться приложением
ENV PORT=3000
EXPOSE $PORT

# Запускаем приложение при старте контейнера
CMD [ "node", "build/main.js" ]