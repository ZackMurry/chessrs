FROM node:17-alpine3.14
ENV NODE_OPTIONS=--openssl-legacy-provider
WORKDIR /usr/src/frontend
COPY package.json package-lock.json ./
RUN npm install
COPY . ./
RUN npm run build
RUN npm i -g serve
ENTRYPOINT ["serve", "-s", "build", "-l", "3000"]

