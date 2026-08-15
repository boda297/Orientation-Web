import { NextResponse } from 'next/server';
import type { 
  CreateIntentionApiRequest, 
  CreateIntentionApiResponse, 
  PaymobIntentionPayload, 
  PaymobIntentionResponse 
} from '@/types/paymob';

const PAYMOB_INTENTION_API = 'https://accept.paymob.com/v1/intention/';
const UNIFIED_CHECKOUT_BASE_URL = 
  process.env.NEXT_PUBLIC_PAYMOB_UNIFIED_CHECKOUT_URL || 'https://accept.paymob.com/unified-checkout/';

export async function POST(request: Request) {
  try {
    const body: CreateIntentionApiRequest = await request.json();
    const { amount, currency = 'EGP', customer, orderId, description, planId } = body;

    // Basic Validation
    if (!amount || amount <= 0) {
      return NextResponse.json<CreateIntentionApiResponse>(
        { success: false, error: 'المبلغ المحدد غير صالح' },
        { status: 400 }
      );
    }

    if (!customer?.firstName || !customer?.lastName || !customer?.email || !customer?.phone) {
      return NextResponse.json<CreateIntentionApiResponse>(
        { success: false, error: 'برجاء استكمال كافة بيانات العميل المطلوبة' },
        { status: 400 }
      );
    }

    // Convert EGP amount to cents (e.g. 106.76 -> 10676 cents)
    const amountInCents = Math.round(amount * 100);
    const uniqueOrderId = orderId || `SUB-${planId || 'PLAN'}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const secretKey = process.env.PAYMOB_SECRET_KEY;
    const publicKey = process.env.NEXT_PUBLIC_PAYMOB_PUBLIC_KEY;

    if (!secretKey) {
      console.warn('[Paymob API] PAYMOB_SECRET_KEY is missing. Using Test Mode redirect.');
      // Demo Mode: Redirect to success page for local testing if key is not added yet
      const demoCheckoutUrl = `/checkout/success?id=DEMO-TXN-${Date.now()}&order=${uniqueOrderId}&amount_cents=${amountInCents}&pending=false`;
      
      return NextResponse.json<CreateIntentionApiResponse>({
        success: true,
        clientSecret: 'demo_client_secret',
        checkoutUrl: demoCheckoutUrl,
      });
    }

    // Build Payment Methods array if integration IDs exist
    const paymentMethods: (number | string)[] = [];
    if (process.env.PAYMOB_CARD_INTEGRATION_ID) {
      paymentMethods.push(Number(process.env.PAYMOB_CARD_INTEGRATION_ID));
    }
    if (process.env.PAYMOB_WALLET_INTEGRATION_ID) {
      paymentMethods.push(Number(process.env.PAYMOB_WALLET_INTEGRATION_ID));
    }

    const payload: PaymobIntentionPayload = {
      amount: amountInCents,
      currency: currency.toUpperCase(),
      billing_data: {
        first_name: customer.firstName.trim(),
        last_name: customer.lastName.trim(),
        email: customer.email.trim(),
        phone_number: customer.phone.trim(),
        country: 'EGY',
        city: 'Cairo',
        street: 'NA',
        building: 'NA',
        floor: 'NA',
        apartment: 'NA',
      },
      special_reference: uniqueOrderId,
      ...(paymentMethods.length > 0 && { payment_methods: paymentMethods }),
      ...(description && {
        items: [
          {
            name: description,
            amount: amountInCents,
            quantity: 1,
          },
        ],
      }),
    };

    // Call Paymob Intention API
    const paymobResponse = await fetch(PAYMOB_INTENTION_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Token ${secretKey}`,
      },
      body: JSON.stringify(payload),
    });

    const data: PaymobIntentionResponse = await paymobResponse.json();

    if (!paymobResponse.ok || !data.client_secret) {
      console.error('[Paymob Intention API Error]:', data);
      return NextResponse.json<CreateIntentionApiResponse>(
        {
          success: false,
          error: data.detail || data.message || 'حدث خطأ أثناء التواصل مع بوابة الدفع (Paymob)',
        },
        { status: paymobResponse.status || 500 }
      );
    }

    // Construct Unified Checkout Redirect URL
    const checkoutUrl = `${UNIFIED_CHECKOUT_BASE_URL}?publicKey=${publicKey || ''}&clientSecret=${data.client_secret}`;

    return NextResponse.json<CreateIntentionApiResponse>({
      success: true,
      clientSecret: data.client_secret,
      intentionId: data.id,
      checkoutUrl,
    });
  } catch (error: any) {
    console.error('[Paymob Route Handler Exception]:', error);
    return NextResponse.json<CreateIntentionApiResponse>(
      {
        success: false,
        error: error?.message || 'حدث خطأ غير متوقع في الخادم',
      },
      { status: 500 }
    );
  }
}
