import {  useCallback, useEffect, useState } from "react"
import { AuthContext } from "./AuthContext"

import api from "../api/api";

const TOKEN_KEY = "AuthToken"


// Pull a readable message out of an Axios error
const getErrorMessage = (error, fallback) =>
  error.response?.data?.message ||
  (error.code === "ECONNABORTED" ? "Request timed out. Try again." : null) ||
  (error.request && !error.response ? "Cannot reach the server." : null) ||
  fallback;
export const AuthContextProvider = ({ children }) => {
    const [user, setUser] = useState();//currently authenticated use object
    const [isLoading, setIsLoading] = useState(true);


    //restore the session on page load
    useEffect(() =>{
        const restoreSession = async () =>{
            const token = localStorage.getItem(TOKEN_KEY);

            if(!token){
                setIsLoading(false);
                return
            }
            try{
                const {data} = await api.get("/me");
             
                setUser(data.user);
            }catch{
                localStorage.removeItem(TOKEN_KEY)
                setUser(null)

            }finally{
                setIsLoading(false)
            }
        };
        restoreSession()
    }, [])
   
    const saveSession = (data) =>{
        localStorage.setItem(TOKEN_KEY, data.token);
        setUser(data.user)

        return data.user
    }
 const signup = useCallback(async (payload) =>{
    try {
         const {data} = await api.post("/register", payload);

         return saveSession(data)
    } catch (error) {
       // throw new Error({cause: getErrorMessage(error, "Invalid email or password.")})
       getErrorMessage(error, "Invalid password or email")
        
    }
 },[])

 const login = useCallback(async({email, password}) =>{
    try {
         const data = await api.post('/login', {email, password});
         return saveSession(data);
    } catch (error) {
        getErrorMessage(error, "Invalid email or password")
        
    }
 }, []);
  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  }, []);

    return (
        <AuthContext.Provider value={{user, isLoading, isAuthenticated:!!user, signup,login,logout}}>
            {children}
        </AuthContext.Provider>
    )
}

