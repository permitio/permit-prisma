FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

# Copy all files EXCEPT node_modules
COPY . .
RUN rm -rf node_modules/@permitio
RUN npm install

RUN npm run generate

CMD ["npm", "start"]