import { SignedIn, SignedOut, UserButton, useUser } from "@clerk/clerk-react";
import { Link } from "react-router-dom";

export function Home() {
  const { user } = useUser();

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Welcome to your App</h1>
      <header>
        <SignedOut>
          <p>Please log in to continue.</p>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Link to="/login">Login</Link>
            <Link to="/signup">Signup</Link>
          </div>
        </SignedOut>
        <SignedIn>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <p>Hello, {user?.primaryEmailAddress?.emailAddress}!</p>
            <UserButton afterSignOutUrl="/" />
          </div>
          {/* Waiting folders/features structure can be placed here */}
          <div style={{ marginTop: '2rem', borderTop: '1px solid #ccc', paddingTop: '1rem' }}>
            <h2>Dashboard</h2>
            <p>Your protected content goes here.</p>
          </div>
        </SignedIn>
      </header>
    </div>
  );
}
