import { ShieldCheck, LogIn, UserPlus2, AlertCircleIcon, CheckCircle2 } from "lucide-react";
import AuthButton from "../ui/AuthButton";
import SignUp from "../../auth/SignUp";
import Login from "../../auth/Login";

const Authcard = ({
    mode = "register",
    onModeChange,
    bannerError = "",
    bannerSuccess = "",
    isSubmitting = false,
    onGoogleAuth,

}) => {

    const isRegister = mode = "register";
    return (
        <section aria-labelledby="auth-card-heading" className="w-full max-w-[520px] rounded-xl border-border bg-surface shadow-md overflow-hidden">
            <div className="px-xl py-md bg-surface-subtle border-b border-border flex items-center text-label font-semibold">
                <span className="inline-flex items-center gap-xs text-ink tracking-wide uppercase">
                    <span className="w-2 h-2 rounded-full bg-brand-accent" aria-hidden="true" />
                    Store Security
                </span>

                <span className="inline-flex items-center gap-xs text-ink-secondary">

                    <ShieldCheck className="w-4 h-4 text-brand-secondary" aria-hidden="true" />

                </span>
            </div>
            {/* Card Body */}
            <div className="p-xl table:p-2xl space-y-xl">
                {/* Mode switcher tabs */}
                <div className="grid grid-cols-2 p-xs rounded-lg bg-surface-subtle border border-border"
                    role="tablist"
                    aria-label="Authentication"
                >
                    <button
                        type="button"
                        role="tab"
                        aria-selected={!isRegister}
                        onClick={() => onModeChange("login")}
                        className={`min-h-touch-min rounded-md text-supporting font-semibold inline-flex items-center justify-center gap-xs transition-all duration-fast focus-visible:outline-2 focus-visible:outline-focus-ring ${!isRegister
                            ? "bg-surface text-ink shadow-sm"
                            : "text-ink-secondary hover:text-ink"
                            }`}

                    >
                        <LogIn className="w-4 h-4" aria-hidden="true" />
                        <span>Sign In</span>

                    </button>

                    <button
                        type="button"
                        role="tab"
                        aria-selected={isRegister}
                        onClick={() => onModeChange("register")}
                        className={`min-h-touch-min rounded-md text-supporting font-semibold inline-flex items-center justify-center gap-xs transition-all duration-fast focus-visible:outline-2 focus-visible:outline-focus-ring ${isRegister
                            ? "bg-surface text-ink shadow-sm"
                            : "text-ink-secondary hover:text-ink"
                            }`}
                    >

                        <UserPlus2 className="w-4 h-4" aria-hidden="true" />
                        <span>Create Account</span>

                    </button>

                </div>
                {/* Heading and Subtitle */}
                <div className="space-y-xs">
                    <h1 id="auth-card-heading" className="text-section-heading font-bold text-ink">
                        {isRegister ? "Create your Digi Store Profile" : "Access your Digi store vault"}

                    </h1>
                    <p className="text-supporting text-ink-secondary">
                        {isRegister
                            ? "Set up your account to register devices, and track verified orders."
                            : "Sign in to manage registered devices and verified store orders."}
                    </p>
                </div>
                {bannerError && (
                    <div
                        role="alert"
                        className="p-md rounded-md bg-status-error-bg border border-status-error-border text-status-error-text text-supporting flex items-start gap-sm"
                    >
                        <AlertCircleIcon className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
                        <span>{bannerError}</span>
                    </div>
                )}
                {bannerSuccess && (
                    <div
                        role="status"
                        className="p-md rounded-md bg-status-success-bg border border-status-success-border text-status-success-text text-supporting flex items-start gap-sm"
                    >
                        <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
                        <span>{bannerSuccess}</span>
                    </div>
                )}

                <AuthButton 
                disabled = {isSubmitting}
                onGoogleClick={onGoogleAuth}
                 />

                 {/* Active form */}
                 {isRegister ? (
                    <SignUp 
                     
                    />
                 ) : (
                    <Login/>
                 )}

            </div>

        </section>
    )
}

export default Authcard