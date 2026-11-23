import { Check, Circle } from "lucide-react";


 function evaluatePassword(password = ""){
/* 
    const passwordChecks = [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'One uppercase letter (A-Z)', met: /[A-Z]/.test(password) },
    { label: 'One lowercase letter (a-z)', met: /[a-z]/.test(password) },
    { label: 'One number (0-9)', met: /[0-9]/.test(password) },
  ]; */
    
  const hasMinLength = password.length >= 8;
  const hasNumber = /\d/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);
  const score = [hasMinLength, hasNumber, hasSymbol].filter(Boolean).length;

  return {hasMinLength, hasNumber, hasSymbol, score}
}

export function PasswordStrengthMeter({password}){
    const {hasMinLength, hasNumber, hasSymbol,score} = evaluatePassword(password)
    const labelMap = {
    0: { text: "Enter password", color: "text-ink-secondary", bar: "bg-border" },
    1: { text: "Weak", color: "text-status-error-text", bar: "bg-status-error-text" },
    2: { text: "Moderate", color: "text-status-warning-text", bar: "bg-status-warning-text" },
    3: {
      text: "Strong (256-bit compliant)",
      color: "text-brand-secondary",
      bar: "bg-brand-secondary",
    },
  };

  const status = labelMap[score];

  return(
    <div aria-live="polite" className="p-md rounded-md bg-surface-subtle border border-border space-y-sm">
       <div className="flex items-center justify-between">
        <span className="font-semibold text-ink">Password Strength</span>
        <span className={`font-semibold ${status.color}`}>{status.text}</span>
       </div>
        
        {/* 3-segment meter */}
       <div className="grid grid-cols-3 gap-xs" role="progressbar" aria-valuemax={3} aria-valuemin={0} aria-valuenow={score}>
        {[1,2,3].map((step) =>(
            <span 
             key={step}
             className={`h-1.5 rounded-full transition-colors duration-normal ${
                score >= step ? status.bar : "bg-border"
             }` }
            />
        ))}
       </div>
       <ul className="grid grid-cols-3 gap-xs pt-xs text-label">
        <RuleItem passed={hasMinLength} label= "8+ chars"/>
        <RuleItem passed={hasNumber} label="1 number" />
        <RuleItem passed={hasSymbol} label="1 symbol" />
       </ul>
    </div>
  )
}
function RuleItem({passed, label}){
    return(
      <li className={`inline-flex items-center gap-xs font-medium ${
        passed ? "text-brand-secondary" : "text-ink-secondary"
      }`}>
        {passed ? (
            <Check className="w-3.5 h-3.5 shrink-0" aria-hidden = "true"/>
        ):(
            <Circle className="w-3 h-3 shrink-0" aria-hidden="true"/>
        )}

        <span>{label}</span>
      </li>
    )
}