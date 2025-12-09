# --- Етап 1: збірка React/Vite додатку ---
FROM node:20-alpine AS build

# Робоча директорія всередині контейнера
WORKDIR /app

# Спочатку копіюємо тільки файли з залежностями
COPY package*.json ./

# Встановлюємо залежності
RUN npm install

# Копіюємо увесь проєкт в контейнер
COPY . .

# Збираємо production-версію (папка dist)
RUN npm run build

# --- Етап 2: легкий веб-сервер nginx для віддачі статичних файлів ---
FROM nginx:1.27-alpine

# Копіюємо зібраний фронтенд у стандартну папку nginx
COPY --from=build /app/dist /usr/share/nginx/html

# (не обовʼязково, але документуємо порт)
EXPOSE 80

# Запускаємо nginx у фореграунді
CMD ["nginx", "-g", "daemon off;"]
