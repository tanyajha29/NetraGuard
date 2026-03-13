FROM node:20-alpine

WORKDIR /app

COPY package.json tsconfig.json tsconfig.node.json vite.config.ts index.html ./
COPY src ./src

RUN npm install
RUN npm run build

EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]
