import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentSession } from '@/features/auth/auth-queries';
import { SignUpCard } from '@/features/auth/components/sign-up-card';

const SignUpPage = async () => {
  const user = await getCurrentSession();
  if (user) redirect('/');
  return (
    <SignUpCard />
  );
};

export default SignUpPage;