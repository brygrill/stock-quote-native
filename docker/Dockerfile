FROM node:8.4.0

# Global install yarn package manager
RUN apt-get update && apt-get install -y curl apt-transport-https && \
    curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add - && \
    echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list && \
    apt-get update && apt-get install -y yarn

# Make a working directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Copy Deps
COPY package.json yarn.lock /usr/src/app/

# Copy everything else
COPY . .

# Install Deps
RUN yarn install

# Expose Port
EXPOSE 3000

CMD ["node", "index.js"]
