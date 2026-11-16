'use client';

import { useEffect, useRef, useState } from 'react';

type TurnstileApi = {
  render: (container: HTMLElement, options: {
    sitekey: string;
    callback: (token: string) => void;
    'expired-callback': () => void;
    'error-callback': () => void;
    'timeout-callback': () => void;
    'refresh-expired': 'manual';
    retry: 'never';
    size: 'flexible';
  }) => string;
  remove: (id: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
    __localStreetShopTurnstileReady?: () => void;
  }
}

let scriptPromise: Promise<TurnstileApi> | undefined;

function loadTurnstile(): Promise<TurnstileApi> {
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    let settled = false;
    const cleanUp = () => {
      window.clearTimeout(timer);
      script.onerror = null;
      delete window.__localStreetShopTurnstileReady;
    };
    const fail = () => {
      if (settled) return;
      settled = true;
      cleanUp();
      script.remove();
      scriptPromise = undefined;
      reject(new Error('Unable to load verification.'));
    };
    const timer = window.setTimeout(fail, 15000);
    // Cloudflare invokes this when its API is ready, not merely downloaded.
    window.__localStreetShopTurnstileReady = () => {
      if (settled) return;
      if (!window.turnstile) {
        fail();
        return;
      }
      settled = true;
      cleanUp();
      resolve(window.turnstile);
    };
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=__localStreetShopTurnstileReady';
    script.async = true;
    script.onerror = fail;
    document.head.appendChild(script);
  });
  return scriptPromise;
}

export default function TurnstileCaptcha({
  onTokenChange,
  resetKey,
}: {
  onTokenChange: (token: string) => void;
  resetKey: number;
}) {
  const container = useRef<HTMLDivElement>(null);
  const [attempt, setAttempt] = useState(0);
  const [message, setMessage] = useState('Loading verification…');

  useEffect(() => {
    let active = true;
    let widgetId: string | undefined;
    let api: TurnstileApi | undefined;
    onTokenChange('');
    setMessage('Loading verification…');

    const invalidate = (text: string) => {
      if (!active) return;
      onTokenChange('');
      setMessage(text);
    };

    loadTurnstile().then((loadedApi) => {
      if (!active || !container.current) return;
      api = loadedApi;
      setMessage('Complete the verification to continue.');
      widgetId = api.render(container.current, {
        sitekey: '0x4AAAAAAFSOeubfnOrqbnH2',
        size: 'flexible',
        retry: 'never',
        'refresh-expired': 'manual',
        callback: (token) => {
          if (!active) return;
          onTokenChange(token);
          setMessage('Verification complete.');
        },
        'expired-callback': () => invalidate('Verification expired. Please retry.'),
        'error-callback': () => invalidate('Verification failed. Please retry.'),
        'timeout-callback': () => invalidate('Verification timed out. Please retry.'),
      });
    }).catch(() => invalidate('Verification could not load. Please retry.'));

    return () => {
      active = false;
      onTokenChange('');
      if (api && widgetId !== undefined) api.remove(widgetId);
    };
  }, [attempt, resetKey, onTokenChange]);

  return (
    <div className="space-y-2">
      <div ref={container} />
      <p role="status" aria-live="polite" className="text-sm text-gray-600">{message}</p>
      <button
        type="button"
        onClick={() => {
          onTokenChange('');
          setAttempt((value) => value + 1);
        }}
        className="text-sm font-semibold text-blue-700 hover:underline"
      >
        Retry verification
      </button>
    </div>
  );
}
