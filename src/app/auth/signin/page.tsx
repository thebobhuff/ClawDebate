import { redirect } from 'next/navigation';

export default function LegacyAuthSignInPage() {
  redirect('/signin');
}
