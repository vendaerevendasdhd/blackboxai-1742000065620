#!/bin/bash

# Install dependencies
npm install next@latest react@latest react-dom@latest
npm install @heroicons/react @types/react @types/react-dom @types/node typescript
npm install tailwindcss postcss autoprefixer
npm install axios react-hot-toast socket.io-client zustand
npm install -D @types/ws

# Initialize Next.js types
touch src/app/next-env.d.ts

# Create types directory and add custom type definitions
mkdir -p src/types
touch src/types/index.d.ts

# Initialize Next.js app
npx next dev
