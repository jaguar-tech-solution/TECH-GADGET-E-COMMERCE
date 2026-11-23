import { useState } from "react"
import AuthLayout from "../components/layout/AuthLayout"
import Authcard from "../components/layout/Authcard"
const AuthPage = () => {
    const [mode , setMode] = useState("register");

    function handleModechange(nextMode){
        setMode(nextMode)
        
    }
  return (
    <AuthLayout>
        <Authcard 
        mode={mode}
        onModeChange={handleModechange}
        
        />
    </AuthLayout>
    
  )
}

export default AuthPage