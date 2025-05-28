// app/shop-owner-signup/page.tsx
import SignUpClient from './SignUpClient';
import SEO from '@/components/SEO';

export default function ShopOwnerSignUpPage() {
  return (
    <>
      <SEO
        title="Shop Owner Sign Up | Local Street Shop"
        description="Create your shop owner account to start listing your local business on Local Street Shop. Connect with customers and manage your store easily."
        url="https://www.localstreetshop.com/shop-owner-signup"
      />
      <SignUpClient />
    </>
  );
}
