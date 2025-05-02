import React from 'react';
import { SignInCard } from '@/features/auth/components/sign-in-card';
import { getCurrentSession } from '@/features/auth/auth-actions';
import { redirect } from 'next/navigation';

const SignInPage = async () => {
  const user = await getCurrentSession();
  if (user) redirect('/');
  return (
    <SignInCard />
  );
};

export default SignInPage;