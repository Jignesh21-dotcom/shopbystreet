'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [role, setRole] = useState<'member' | 'owner'>('member');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [userLoaded, setUserLoaded] = useState(false);

  const router = useRouter();

  // ✅ Redirect if already logged in
  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        router.push('/profile'); // or wherever you want
      } else {
        setUserLoaded(true);
      }
    };
    checkUser();
  }, [router]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          isShopOwner: role === 'owner',
          shopStatus: role === 'owner' ? 'pendingPayment' : null,
        },
      },
    });

    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
    }

    setLoading(false);
  };

  if (!userLoaded) {
    return <div className="mt-10 text-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
      {success ? (
        <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md text-center text-green-700 space-y-4">
          <h1 className="text-3xl font-bold text-blue-700 mb-2">✅ Success!</h1>
          <p>Please check your email to confirm your account.</p>
          <p>
            Already confirmed?{' '}
            <Link href="/login" className="text-blue-600 underline hover:text-blue-800">
              Log in here
            </Link>
            .
          </p>
        </div>
      ) : (
        <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
          <h1 className="text-3xl font-bold text-center mb-6 text-blue-700">🔐 Sign Up</h1>
          <p className="text-gray-600 text-center mb-6">
            Join ShopStreet as a member or shop owner.
          </p>

          <form onSubmit={handleSignUp} className="flex flex-col space-y-4">
            <div className="flex justify-center gap-4 mb-2">
              <label>
                <input
                  type="radio"
                  name="role"
                  value="member"
                  checked={role === 'member'}
                  onChange={() => setRole('member')}
                />
                <span className="ml-2">👤 Member</span>
              </label>
              <label>
                <input
                  type="radio"
                  name="role"
                  value="owner"
                  checked={role === 'owner'}
                  onChange={() => setRole('owner')}
                />
                <span className="ml-2">🏪 Shop Owner</span>
              </label>
            </div>

            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />

            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition"
            >
              {loading ? 'Signing Up...' : `Sign Up as ${role === 'owner' ? 'Shop Owner' : 'Member'}`}
            </button>

            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          </form>
        </div>
      )}
    </div>
  );
}
