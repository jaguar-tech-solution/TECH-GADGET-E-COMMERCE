import { Link } from "react-router-dom"
import {Store, HelpCircle, Cpu} from "lucide-react"
function RegisterBar({
  children, onBackToStore = () => {}, onSupportClick =() =>{}
}) {
  return (
     <>
     <div className="min-h-screen flex flex-col bg-page text-ink font-sans">
      <header className="w-ful h-storefront-header bg-surface border-b border-border px-lg tablet:px-2xl flex items-center justify-between">
       <Link to="/" className="flex flex-col">
              <span className="w-8 h-8 rounded-e-md bg-brand-primary text-ink-on-primary flex items-center justify-center">
                <Cpu className="w-4 h-4 text-brand-accent" aria-hidden="true"></Cpu>
              </span>
           <span>The Gadget Store</span>
       </Link>
       <nav aria-label="Utility navigation" className="flex items-center gap-lg">
          <button
            type="button"
            onClick={onBackToStore}
            className="inline-flex items-center gap-xs text-supporting font-medium text-ink-secondary hover:text-ink transition-colors duration-fast min-h-touch-min px-sm rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
          >
            <Store className="w-4 h-4" aria-hidden="true" />
            <span>Back to Store</span>
          </button>

          <span className="h-4 w-px bg-border" aria-hidden="true" />

          <button
            type="button"
            onClick={onSupportClick}
            className="inline-flex items-center gap-xs text-supporting font-medium text-ink-secondary hover:text-ink transition-colors duration-fast min-h-touch-min px-sm rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
          >
            <HelpCircle className="w-4 h-4" aria-hidden="true" />
            <span>Support</span>
          </button>
        </nav>

      </header>
      
        <main className="flex-1 flex flex-col items-center justify-center px-lg py-2xl">{children}</main>
        {/* Registration footer */}
        <footer className="w-full bg-surface border-t border-border px-lg tablet:px-2xl py-lg text-label text-ink-secondary flex flex-col tablet:flex-row items-center justify-between gap-md">
        <p>© 2026 The Gadget Store Inc. Hardware Security &amp; Encryption Standard.</p>
        <div className="flex items-center gap-xl">
          <a href="/privacy" className="hover:text-ink transition-colors">
            Privacy Policy
          </a>
          <a href="/terms" className="hover:text-ink transition-colors">
            Terms of Service
          </a>
          <a href="/security" className="hover:text-ink transition-colors">
            Security Center
          </a>
        </div>
      </footer>
     </div>
    
    
    </>
  )
}

export default RegisterBar