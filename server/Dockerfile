# server/Dockerfile
FROM node:20-alpine

WORKDIR /app

# Копіюємо package.json і встановлюємо залежності
COPY package*.json ./
RUN npm install

# Копіюємо весь код сервера
COPY . .

# Відкриваємо порт, на якому працює сервер (4000)
EXPOSE 4000

# Запускаємо
CMD ["npm", "start"]