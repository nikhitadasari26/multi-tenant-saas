FROM node:20

WORKDIR /app

# Install postgres client for psql
RUN apt-get update && apt-get install -y postgresql-client

COPY package*.json ./
RUN npm install

COPY . .

# Make start.sh executable (Linux containers)
RUN chmod +x start.sh

EXPOSE 5000

CMD ["sh","./start.sh"]