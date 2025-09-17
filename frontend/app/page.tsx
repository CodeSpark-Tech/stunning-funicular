'use client';
import { useState, useEffect } from 'react';
import Onboarding from '@/components/Onboarding';
import Dashboard from '@/components/Dashboard';
import { Toaster } from 'react-hot-toast';

export default function Home() {
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  useEffect(() => {
    const onboarded = localStorage.getItem('sentinel_onboarded');
    setHasCompletedOnboarding(!!onboarded);
  }, []);

  const completeOnboarding = () => {
    localStorage.setItem('sentinel_onboarded', 'true');
    setHasCompletedOnboarding(true);
  };

  return (
    <>
      <Toaster 
        position="bottom-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
      {!hasCompletedOnboarding ? (
        <Onboarding onComplete={completeOnboarding} />
      ) : (
        <Dashboard />
      )}
    </>
  );
}
