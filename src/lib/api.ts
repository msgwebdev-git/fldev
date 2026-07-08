// API configuration
import { API_URL } from "@/lib/env";

interface CreateOrderRequest {
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  items: Array<{
    ticketId: string;
    optionId?: string;
    quantity: number;
  }>;
  promoCode?: string;
  language: 'ro' | 'ru';
}

interface CreateOrderResponse {
  success: boolean;
  data?: {
    orderId: string;
    orderNumber: string;
    redirectUrl: string;
  };
  error?: string;
}

interface ValidatePromoResponse {
  success: boolean;
  data?: {
    code: string;
    discountPercent?: number;
    discountAmount: number;
  };
  error?: string;
}

interface OrderStatusResponse {
  success: boolean;
  data?: {
    orderNumber: string;
    status: string;
    paymentStatus: string;
    totalAmount: number;
    discountAmount: number;
  };
  error?: string;
}

interface OrderTicketsResponse {
  success: boolean;
  data?: {
    orderNumber: string;
    status: string;
    tickets: Array<{
      ticketCode: string;
      ticketName: string;
      optionName: string | null;
      pdfUrl: string | null;
    }>;
  };
  error?: string;
}

interface CreateMerchOrderRequest {
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  items: Array<{
    productId: string;
    variantId: string;
    quantity: number;
  }>;
  fulfillmentMethod: 'pickup' | 'delivery';
  shippingAddress?: {
    address: string;
    city: string;
    region?: string;
    postalCode?: string;
    notes?: string;
  };
  promoCode?: string;
  language: 'ro' | 'ru';
}

interface CreateMerchOrderResponse {
  success: boolean;
  data?: {
    orderId: string;
    orderNumber: string;
    redirectUrl: string;
  };
  error?: string;
}

interface MerchOrderStatusResponse {
  success: boolean;
  data?: {
    orderNumber: string;
    status: string;
    paymentStatus: string;
    fulfillmentMethod: 'pickup' | 'delivery';
    fulfillmentStatus: string;
    subtotalAmount: number;
    shippingAmount: number;
    discountAmount: number;
    totalAmount: number;
    items: Array<{
      productName: string;
      size: string;
      quantity: number;
      totalPrice: number;
    }>;
  };
  error?: string;
}

interface CreateBusOrderRequest {
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  busDateIds: string[];
  passengers: number;
  promoCode?: string;
  language: 'ro' | 'ru';
}

interface CreateBusOrderResponse {
  success: boolean;
  data?: {
    orderId: string;
    orderNumber: string;
    redirectUrl: string;
  };
  error?: string;
}

interface BusOrderStatusResponse {
  success: boolean;
  data?: {
    orderNumber: string;
    status: string;
    paymentStatus: string;
    passengers: number;
    totalAmount: number;
    tickets: Array<{
      travelDate: string;
      direction: 'tur' | 'retur';
      ticketCode: string;
    }>;
  };
  error?: string;
}

export const api = {
  // Create order and get payment redirect URL
  async createOrder(data: CreateOrderRequest): Promise<CreateOrderResponse> {
    const response = await fetch(`${API_URL}/api/checkout/create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    return response.json();
  },

  // Validate promo code
  async validatePromo(code: string, totalAmount: number): Promise<ValidatePromoResponse> {
    const response = await fetch(`${API_URL}/api/promo/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code, totalAmount }),
    });

    return response.json();
  },

  // Get order status
  async getOrderStatus(orderNumber: string): Promise<OrderStatusResponse> {
    const response = await fetch(`${API_URL}/api/checkout/status/${orderNumber}`);
    return response.json();
  },

  // Get order tickets
  async getOrderTickets(orderNumber: string): Promise<OrderTicketsResponse> {
    const response = await fetch(`${API_URL}/api/checkout/tickets/${orderNumber}`);
    return response.json();
  },

  // Get download URL for all tickets as ZIP
  getTicketsDownloadUrl(orderNumber: string): string {
    return `${API_URL}/api/checkout/tickets/${orderNumber}/download`;
  },

  // Create merch order and get payment redirect URL
  async createMerchOrder(data: CreateMerchOrderRequest): Promise<CreateMerchOrderResponse> {
    const response = await fetch(`${API_URL}/api/merch/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  // Get merch order status
  async getMerchOrderStatus(orderNumber: string): Promise<MerchOrderStatusResponse> {
    const response = await fetch(`${API_URL}/api/merch/status/${orderNumber}`);
    return response.json();
  },

  // Create bus transfer order and get payment redirect URL
  async createBusOrder(data: CreateBusOrderRequest): Promise<CreateBusOrderResponse> {
    const response = await fetch(`${API_URL}/api/bus/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  // Get bus order status
  async getBusOrderStatus(orderNumber: string): Promise<BusOrderStatusResponse> {
    const response = await fetch(`${API_URL}/api/bus/status/${orderNumber}`);
    return response.json();
  },

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${API_URL}/api/health`);
      const data = await response.json();
      return data.success === true;
    } catch {
      return false;
    }
  },
};
