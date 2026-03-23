FROM oven/bun:latest

WORKDIR /app

COPY package*.json ./
COPY bun.lock ./

RUN bun install

COPY . .

EXPOSE 3020

LABEL maintainer="goutamkumar.sharmq@gmail.com" author="Goutam Kumar Sharma"
