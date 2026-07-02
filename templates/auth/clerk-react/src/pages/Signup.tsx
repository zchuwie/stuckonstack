import { SignUp } from "@clerk/clerk-react";

export function Signup() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}>
      <SignUp routing="path" path="/signup" signInUrl="/login" />
    </div>
  );
}
