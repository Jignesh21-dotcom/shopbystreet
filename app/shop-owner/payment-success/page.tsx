'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import SEO from '@/app/components/SEO';

export default function PaymentSuccess() {
  const router = useRouter();

  useEffect(() => {
    const activateShop = async () => {
      await supabase.auth.updateUser({
        data: { shopStatus: 'active' },
      });

      // Redirect to dashboard
      router.push('/shop-owner/dashboard');
    };

    activateShop();
  }, [router]);

  return (
    <>
      <SEO
        title="Payment Success | Shop Street"
        description="Your payment was successful. Your shop is being activated and you'll be redirected shortly."
        url="https://www.localstreetshop.com/shop-owner/payment-success"
      />

      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-green-600">
          ✅ Payment successful! Activating your shop...
        </p>
      </div>
    </>
  );
}
