#!/bin/bash

# Remove existing node_modules and package-lock.json if they exist
rm -rf node_modules package-lock.json

# Install dependencies
npm install next@latest react@latest react-dom@latest
npm install @heroicons/react @types/react @types/react-dom @types/node typescript
npm install tailwindcss postcss autoprefixer
npm install axios react-hot-toast socket.io-client zustand @types/axios
npm install -D @types/ws @types/socket.io-client

# Create next-env.d.ts
echo 'declare module "*.module.css";' > next-env.d.ts

# Initialize Next.js
npm run dev
