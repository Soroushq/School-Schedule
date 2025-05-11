export const dynamic = 'force-static';

import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/welcome');
}
