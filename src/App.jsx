import { Routes, Route } from "react-router-dom"
import { useEffect } from "react"

import Header from "./components/Header"
import Footer from "./components/Footer"
import ErrTablet from "./components/ErrTablet"

import MainPage from "./pages/MainPage"
import WarrantyPage from "./pages/WarrantyPage"

const App = () => {



  return (
    <section>
      <ErrTablet />
      <Header />

      <>
        <Routes>
          <Route path="/" element={<MainPage />}></Route>
          <Route path="/warranty" element={<WarrantyPage />}></Route>
        </Routes>
      </>

      <Footer />
    </section>
  )
}


export default App