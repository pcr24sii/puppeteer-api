# Use the official Node.js runtime as the base image
FROM node:18-slim

# Install necessary dependencies for Puppeteer and Chrome
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    ca-certificates \
    procps \
    libxss1 \
    libgconf-2-4 \
    libxrandr2 \
    libasound2 \
    libpangocairo-1.0-0 \
    libstdc++6 \
    libatk1.0-0 \
    libx11-6 \
    libc6 \
    libx11-xcb1 \
    libxcb1 \
    libcairo2 \
    libcups2 \
    libcairo-gobject2 \
    libgtk-3-0 \
    libgdk-pixbuf2.0-0 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxrender1 \
    libxtst6 \
    libxss1 \
    lsb-release \
    libglib2.0-0 \
    libnss3 \
    libnspr4 \
    libpango-1.0-0 \
    libdbus-1-3 \
    libexpat1 \
    libgcc1 \
    libfontconfig1 \
    libgbm1 \
    libatk-bridge2.0-0 \
    libdrm2 \
    libxkbcommon0 \
    libatspi2.0-0 \
    fonts-liberation \
    libappindicator3-1 \
    xdg-utils \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Create a non-root user first
RUN groupadd -r pptruser && useradd -r -g pptruser -G audio,video pptruser \
    && mkdir -p /home/pptruser/Downloads \
    && mkdir -p /home/pptruser/.cache/puppeteer \
    && chown -R pptruser:pptruser /home/pptruser

# Create app directory and set ownership
WORKDIR /usr/src/app
RUN chown -R pptruser:pptruser /usr/src/app

# Switch to non-root user for installations
USER pptruser

# Copy package files
COPY --chown=pptruser:pptruser package*.json ./

# Install app dependencies
RUN npm ci --only=production

# Install Puppeteer browsers (Chrome) as the non-root user
RUN npx puppeteer browsers install chrome

# Copy app source code
COPY --chown=pptruser:pptruser . .

# Expose the port the app runs on
EXPOSE 3000

# Define the command to run the app
CMD ["npm", "start"]