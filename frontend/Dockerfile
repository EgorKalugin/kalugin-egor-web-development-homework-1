FROM node:20-alpine AS build
WORKDIR /app

ARG VITE_CATALOG_URL=http://localhost:3001
ARG VITE_ORDERS_URL=http://localhost:3002
ENV VITE_CATALOG_URL=$VITE_CATALOG_URL
ENV VITE_ORDERS_URL=$VITE_ORDERS_URL

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build


FROM nginx:1.27-alpine AS runtime
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
