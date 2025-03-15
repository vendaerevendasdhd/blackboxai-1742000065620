declare module '*.svg' {
  const content: React.FunctionComponent<React.SVGAttributes<SVGElement>>;
  export default content;
}

declare module '*.png' {
  const content: string;
  export default content;
}

declare module '*.jpg' {
  const content: string;
  export default content;
}

declare module '*.jpeg' {
  const content: string;
  export default content;
}

// Add custom type definitions
interface User {
  id: number;
  name: string;
  email: string;
  role: 'user' | 'admin';
}

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  stock: number;
}

interface CartItem extends Product {
  quantity: number;
}

interface Order {
  id: number;
  userId: number;
  items: CartItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

interface ChatMessage {
  id: number;
  text: string;
  sender: 'user' | 'support';
  timestamp: Date;
}

// Extend Window interface for global variables
declare global {
  interface Window {
    websocket: WebSocket;
  }
}
