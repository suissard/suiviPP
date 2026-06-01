# Stage 1: Build the VueJS app (actually it's a simple Node script that bundles HTML)
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy source code and build
COPY . .
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# The build script writes index.html to the root, but let's copy the needed assets.
# Actually, build.js outputs `index.html` to the root folder, which bundles CSS/JS inline.
# The images are in the `public` directory.
# Let's copy `index.html` and the images into Nginx's serving directory.

COPY --from=builder /app/index.html /usr/share/nginx/html/index.html
# Copy images and PDF files that are in the public folder and used by the tutorial
COPY --from=builder /app/public/*.PNG /usr/share/nginx/html/
COPY --from=builder /app/public/*.pdf /usr/share/nginx/html/

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
