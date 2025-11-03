FROM node:20-bullseye-slim
WORKDIR /app
RUN apt-get update -y && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*
COPY package.json ./
RUN npm i -g npm@latest && npm install
COPY . .
RUN npx prisma generate || true
EXPOSE 3000
CMD ["npm","run","dev"]


