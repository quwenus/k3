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
    <div className="min-h-dvh flex flex-col">
      <ErrTablet />

      <Header />

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/warranty" element={<WarrantyPage />} />
          <Route path="/catalog" element={<CatalogPage />} />
          <Route path="/catalog/car" element={<CatalogCarPage />} />
        </Routes>
      </main>

      <Footer />
    </div>
  )
}


export default App