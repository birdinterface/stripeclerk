import { SignIn } from '@clerk/nextjs/server';

export default function Home() {
  return (
    <div>
      <h1>Welcome to My App</h1>
      <SignIn />
    </div>
  );
}
