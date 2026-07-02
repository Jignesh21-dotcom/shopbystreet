import { redirect } from 'next/navigation';

// Legacy signup route.
// Redirects users to the unified Login/Signup page.

export default function SignupPage() {
  redirect('/login?mode=signup');
}