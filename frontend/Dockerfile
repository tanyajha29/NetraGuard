FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
COPY next.config.mjs tsconfig.json tsconfig.node.json ./
COPY public ./public
COPY app ./app
COPY components ./components
COPY hooks ./hooks
COPY lib ./lib
COPY styles ./styles

RUN npm install
RUN npm run build

EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--hostname", "0.0.0.0", "--port", "5173"]
