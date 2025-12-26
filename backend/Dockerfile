# 1. Use Node official image
FROM node:20

# 2. Set working directory inside container
WORKDIR /app

# 3. Copy package files
COPY package*.json ./

# 4. Install dependencies
RUN npm install

# 5. Copy rest of backend code
COPY . .

# 6️. Expose backend port
EXPOSE 5000

# 7. Start server
CMD ["npm", "run", "dev"]
