// API configuration
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

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
