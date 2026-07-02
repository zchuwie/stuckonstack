import { SignIn } from "@clerk/clerk-react";

export function Login() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}>
      <SignIn routing="path" path="/login" signUpUrl="/signup" />
    </div>
  );
}
