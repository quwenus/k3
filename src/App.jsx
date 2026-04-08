import { Routes, Route } from "react-router-dom"
import { useEffect } from "react"

import Header from "./components/Header"
import Footer from "./components/Footer"
import ErrTablet from "./components/ErrTablet"

import MainPage from "./pages/MainPage"
import WarrantyPage from "./pages/WarrantyPage"
import CatalogPage from "./pages/CatalogPage"
import CatalogCarPage from "./pages/CatalogCarPage"

const App = () => {
  return (
    <section>
      <ErrTablet />
      <Header />

      <>
        <Routes>
          <Route path="/" element={<MainPage />}></Route>
          <Route path="/warranty" element={<WarrantyPage />}></Route>
          <Route path="/catalog" element={<CatalogPage />}></Route>
          <Route path="/catalog/car" element={<CatalogCarPage />}></Route>
        </Routes>
      </>

      <Footer />
    </section>
  )
}


export default App