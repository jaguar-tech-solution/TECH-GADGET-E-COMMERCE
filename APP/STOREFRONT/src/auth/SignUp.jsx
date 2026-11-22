
import { User, Mail, Smartphone, Lock, Eye, EyeOff, RotateCcw, Check, AlertCircle, Loader2, } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../../Context/AuthContext";
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { signupSchema } from "./signupSchema";
import { useNavigate } from 'react-router-dom'
import { PasswordStrengthMeter } from "./PasswordStrengthMeter";

const SignUp = () => {

  const { signup } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [servermsg, setServerMsg] = useState(null)

  console.log(servermsg)
  /*   const handleChange = (e) => {
      setFormData((prev) => ({
        ...prev,
        [e.target.name]: e.target.value,
      }));
    } */
  const { register, control, handleSubmit, formState: { errors, isSubmitting }, } = useForm({
    resolver: zodResolver(signupSchema),
    mode: 'onTouched',//validate fields as soon as the user leaves an input
  })

  //live password checks align
  const password = useWatch({
    control,
    name: 'password',
    defaultValue: ''
  })
  const confirmPassword = useWatch({
    control,
    name: 'confirmPassword',
    defaultValue: '',
  })

  const passwordMatch = confirmPassword.length > 0 && password === confirmPassword;




  const onSubmit = async (data) => {
    console.log("Onsubmit fired" , data);

    setServerMsg(null);

    try {
      await signup({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone || undefined, // Send undefined if left blank
        password: data.password,

      });

      navigate('/home');

    } catch (error) {
      setServerMsg(error.message || "Registration failed. Please try again.");

    }

  }

  return (
    <form onSubmit={handleSubmit(onSubmit , (errs) => console.log("Error", errs))} noValidate className="space-y-lg">
      <div className="mobile-lg:grid-cols-2 gap-md">
        <div>
          <label htmlFor="reg-first-name" className="block text-label font-semibold text-ink mb-xs">
            First Name
          </label>
          <div className="relative">
            <User aria-hidden="true" className="w-4 h-4 text-ink-secondary absolute left-md top-1/2 -translate-y-1/2 pointer-events-none" />
            <input type="text"
              id="reg-first-name"
              autoComplete="given-name"
              placeholder="David"
              {...register("firstName")}
              className=" w-full pl-10 pr-md py-sm rounded-md border border-border bg-surface text-ink"
              required
            />
          </div>
          {/* Error message */}
          {errors.firstName && (
            <p className="mt-xs text-xs text-red-500 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              {errors.firstName.message}
            </p>
          )}

        </div>
      </div>
      <div>
        <label htmlFor="reg-last-name" className="block text-label font-semibold text-ink mb-xs">
          Last Name
        </label>
        <div className="relative">
          <User aria-hidden="true" className="w-4 h-4 text-ink-secondary absolute left-md top-1/2 -translate-y-1/2 pointer-events-none" />
          <input type="text"
            id="reg-last-name"
            autoComplete="family-name"
            placeholder="Oyamo"
            {...register("lastName")}
            className="w-full pl-10 pr-md py-sm rounded-md border border-border bg-surface text-ink"
          />

        </div>
        {/* Error message */}
        {errors.lastName && (
          <p className="mt-xs text-xs text-red-500 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            {errors.lastName.message}
          </p>
        )}

      </div>

      {/* email */}
      <div>
        <div className="flex item-center justify-between mb-xs">
          <label htmlFor="reg-email" className="text-label font-semibold text-ink">
            Work or Personal Email
          </label>

        </div>
        <div className="relative">
          <Mail
            className="w-4 h-4 text-ink-secondary absolute left-md top-1/2 -translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          />
          <input type="email" id="reg-email"
            autoComplete="email"
            placeholder="david@gmail.com"
            {...register('email')}

            className="w-full pl-10 pr-md py-sm rounded-md border border-border bg-surface text-ink"
          />


        </div>
        {/* error displayed */}
        {errors.email && (
          <FieldError message={errors.email.message} />
        )}
      </div>
      {/* Mobile phone Number */}
      <div>
        <div className="flex items-center justify-between mb-xs">
          <label htmlFor="reg-phone" className="text-label font-semibold text-ink">
            Mobile Phone Number{""}
          </label>
          <span className="text-label text-ink-secondary">2FA &amp; Recovery SMS</span>
        </div>
        <div className="relative flex-1">
          <Smartphone
            className="w-4 h-4 text-ink-secondary absolute left-md top-1/2 -translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          />
          <input type="tel" id="reg-phone"
            autoComplete="tel-national"
            placeholder="07 00 00 00 11"
            {...register('phone')}
            required
            className="w-full pl-10 pr-md py-sm rounded-md border border-border bg-surface text-ink"

          />

        </div>
        {/* Phone Errorr */}
        {errors.phone && (
          <FieldError message={errors.phone.message} />
        )}

      </div>

      {/* Password */}
      <div>
        <div className="flex items-center justify-between mb-xs">
          <label htmlFor="reg-password" className="text-label font-semibold text-ink">
            Master Device Password
          </label>
          <span className="text-label text-ink-secondary">Zero-knowledge storage</span>
        </div>

        <div className="relative">
          <Lock
            className="w-4 h-4 text-ink-secondary absolute left-md top-1/2 -translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          />
          <input type={showPassword ? "text" : "password"}
            id="reg-password"
            placeholder="............"
            {...register("password")}
            className="w-full pl-10 pr-md py-sm rounded-md border border-border bg-surface text-ink"
          />
          <button type="button" onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="w-10 h-10 flex items-center justify-center text-ink-secondary hover:text-ink absolute right-1 top-1/2 -translate-y-1/2 rounded-sm focus-visible:outline-2 focus-visible:outline-focus-ring"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}

          </button>

        </div>

        {/* password error */}
        {errors.password && (
          <FieldError message={errors.password.message} />
        )}
      </div>
      {/* Password strength show */}
      <PasswordStrengthMeter password={password} />

      {/* Password confirmation */}
      <div>
        <div className="flex items-center justify-between mb-xs">
          <label htmlFor="reg-confirm-password" className="text-label font-semibold text-ink">
            Confirm Master Password
          </label>

          {/* misMatch and match password */}
          {confirmPassword.length > 0 && (
            <span>

              {passwordMatch ? (
                <span className="inline-flex items-center gap-xs text-label font-semibold text-brand-secondary">
                  <Check className="w-3.5 h-3.5" aria-hidden="true" />
                  Passwords match
                </span>

              ) : (
                <span className="inline-flex items-center gap-xs text-label font-semibold text-status-error-text">
                  <AlertCircle className="w-3.5 h-3.5" aria-hidden="true" />
                  Passwords do not match
                </span>

              )}
            </span>
          )}
        </div>
        <div className="relative">
          <RotateCcw
            className="w-4 h-4 text-ink-secondary absolute left-md top-1/2 -translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          />
          <input type={showConfirm ? "text" : "password"}
            placeholder="........"
            id="reg-confirm-password"
            {...register("confirmPassword")}
            className="w-full pl-10 pr-md py-sm rounded-md border border-border bg-surface text-ink"
          />
          <button
            type="button"
            onClick={() => setShowConfirm((v) => !v)}
            aria-label={showConfirm ? "Hide confirm password" : "Show confirm password"}
            className="w-10 h-10 flex items-center justify-center text-ink-secondary hover:text-ink absolute right-1 top-1/2 -translate-y-1/2 rounded-sm focus-visible:outline-2 focus-visible:outline-focus-ring"
          >
            {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>

        </div>
        {/* confirmaation error */}
        {errors.confirmPassword && <FieldError message={errors.confirmPassword.message} />}
      </div>

      {/* Consent and firmware checkboex */}
      <div className="space-y-md pt-xs">

        {/*  <div>
          <label htmlFor="" className="flex item-start gap-sm cursor-pointer">
            <input type="checkbox"
               id 
            />
            <span className="text-label text-ink-secondary leading-relaxed">
              I agree to the{" "}
              <a href="/terms" className="text-ink-link hover:underline font-medium">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="/privacy" className="text-ink-link hover:underline font-medium">
                Privacy Policy
              </a>
              , including hardware key telemetry and secure end-to-end device sync.
            </span>
          </label>
        
          {errors.terms && (<FieldError message={errors.terms.message} />
          )}
        </div> */}

        {servermsg && (
          <p role="alert" className="text-label text-status-error-text font-medium">
            {servermsg}
          </p>
        )}


        {/* submission btn */}
        <button type="submit"
          className="w-full min-h-touch-min px-xl py-md rounded-md bg-action-primary-bg hover:bg-action-primary-hover active:bg-action-primary-active text-action-primary-text text-button font-semibold inline-flex items-center justify-center gap-sm shadow-sm transition-colors duration-fast disabled:bg-action-disabled-bg disabled:text-action-disabled-text disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
              <span>Creating Account...</span>
            </>

          ) : (
            <>
              <Lock className="w-4 h-4" aria-hidden="true" />
              <span>Create Store Account </span>
            </>
          )}

        </button>

      </div>

    </form>
  )
}

function FieldError({ message }) {
  return (
    <p role="alert" className="mt-xs inline-flex items-center gap-xs text-label text-status-error-text font-medium">
      <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
      <span>{message}</span>
    </p>
  );
}

export default SignUp