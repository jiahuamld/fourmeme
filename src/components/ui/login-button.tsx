'use client'


import { signIn } from 'next-auth/react';
import Image from 'next/image';
import { RainbowButton } from "@/components/ui/rainbow-button";
interface LoginButtonProps {
  callbackUrl?: string;
  className?: string;
}

export const LoginButton: React.FC<LoginButtonProps> = ({ 
  callbackUrl,
  className = 'w-full mb-6 flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-white bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
}) => {
  return (
    <RainbowButton
      onClick={() => signIn('google', { callbackUrl: callbackUrl || window.location.href })}
      className={className}
    >
      <Image
        src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
        alt="Google logo"
        width={20}
        height={20}
        className="mr-2"
      />
      Sign in with Google
    </RainbowButton>
  );
}; 