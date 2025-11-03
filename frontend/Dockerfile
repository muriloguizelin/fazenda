FROM node:20-alpine
WORKDIR /app
COPY package.json ./
RUN npm i -g npm@latest && npm install
COPY . .
EXPOSE 5173
CMD ["npm","run","dev"]


