import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './App.css'
import Home from './pages/Home.jsx'

const appRoutes = createBrowserRouter([
{
  path: "/",
  element: <Home />
}
])
function App() {

  return (
    <>
      <RouterProvider router={appRoutes} />
    </>
  )
}

export default App
