import { BrowserRouter, Route , Routes } from 'react-router-dom'
import { AuthContextProvider } from '../Context/AuthProvider'
import Home from './pages/Home'
import AuthPage from './pages/AuthPage'
import './App.css'



function App() {

  return (
    <AuthContextProvider>
     <BrowserRouter>
        <Routes>
          <Route path='/' element= {<Home/>}/>
          <Route path='/auth' element={<AuthPage/>}/>
        </Routes>
     
     </BrowserRouter>
     </AuthContextProvider>
  )
}

export default App
