# Используем официальный Node.js образ для сборки
FROM node:20-alpine AS build

WORKDIR /app

# Копируем package.json и package-lock.json
COPY package.json package-lock.json* ./

# Устанавливаем зависимости
RUN npm install

# Копируем всё остальное в контейнер
COPY . .

# Собираем проект
RUN npm run build

# Используем nginx для продакшн-статических файлов
FROM nginx:alpine

# Копируем собранные файлы из build stage
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
