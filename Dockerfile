# --- Етап 1: Збірка React ---
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# --- Етап 2: Запуск Nginx ---
FROM nginx:1.27-alpine
# Копіюємо зібраний сайт
COPY --from=build /app/dist /usr/share/nginx/html
# Копіюємо налаштування Nginx 
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]