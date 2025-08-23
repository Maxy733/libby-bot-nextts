import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div className="auth-page">
      {/* Left image panel (shown on large screens only) */}
      <div
        className="auth-image-panel"
        style={{ backgroundImage: "url('/Musuem-2_1195x794.webp')" }}
      ></div>

      {/* Right form panel */}
      <div className="auth-form-panel">
        <div className="auth-form-container">
          {/* <div className="auth-logo">
            <h1 className="auth-title">Create Your Account</h1>
            <p className="auth-subtitle">Start exploring our library system</p>
          </div> */}
          <SignUp
            appearance={{
              elements: {
                formButtonPrimary: "auth-button",
              },
            }}
            signInUrl="/sign-in"
            afterSignUpUrl="/"
          />
          <div className="auth-footer-link">
            Already have an account?
            <a href="/sign-in">Sign in</a>
          </div>
        </div>
      </div>
    </div>
  )
}