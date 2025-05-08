'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

export default function LoginPage() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        router.push('/profile');
      }
    };
    checkUser();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (showReset) {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) {
        setMessage(`❌ ${error.message}`);
      } else {
        setMessage('✅ Reset link sent! Check your email.');
      }
      return;
    }

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username },
        },
      });
      if (error) {
        setMessage(`❌ ${error.message}`);
      } else {
        setMessage('✅ Sign-up successful! Please check your email to confirm.');
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setMessage(`❌ ${error.message}`);
      } else {
        setMessage('✅ Logged in successfully! Redirecting...');
        setTimeout(() => {
          router.push('/profile');
        }, 1500);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 p-6">
      <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-8">
        <h1 className="text-3xl font-bold text-blue-700 mb-6 text-center">
          {showReset ? 'Reset Password' : isSignUp ? 'Create an Account' : 'Welcome Back'}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && !showReset && (
            <div>
              <label className="block mb-1 text-sm font-semibold text-gray-700">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>
          )}

          <div>
            <label className="block mb-1 text-sm font-semibold text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          {!showReset && !isSignUp && (
            <div>
              <label className="block mb-1 text-sm font-semibold text-gray-700">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
          >
            {showReset
              ? 'Send Reset Link'
              : isSignUp
              ? 'Sign Up'
              : 'Login'}
          </button>
        </form>

        {/* ✅ Message Box */}
        {message && (
          <div
            className={`mt-4 text-center px-4 py-2 rounded-lg ${
              message.includes('✅')
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}
          >
            {message}
          </div>
        )}

        {!showReset && (
          <div className="mt-4 text-center">
            <button
              onClick={() => setShowReset(true)}
              className="text-sm text-blue-600 hover:underline font-semibold"
            >
              Forgot Password?
            </button>
          </div>
        )}

        <div className="mt-6 text-center">
          {showReset ? (
            <button
              className="text-blue-600 hover:underline font-semibold text-sm"
              onClick={() => setShowReset(false)}
            >
              ← Back to Login
            </button>
          ) : isSignUp ? (
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <button
                className="text-blue-600 hover:underline font-semibold"
                onClick={() => setIsSignUp(false)}
              >
                Log in
              </button>
            </p>
          ) : (
            <p className="text-sm text-gray-600">
              Don&apos;t have an account?{' '}
              <button
                className="text-blue-600 hover:underline font-semibold"
                onClick={() => setIsSignUp(true)}
              >
                Sign up
              </button>
            </p>
          )}
        </div>
      </div>

      {/* ✅ Back to Home */}
      <Link
        href="/"
        className="mt-6 inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
      >
        ← Back to Home
      </Link>
    </div>
  );
}
