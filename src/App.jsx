import { Routes, Route } from "react-router-dom"

import Header from "./components/Header"
import Footer from "./components/Footer"
import ErrTablet from "./components/ErrTablet"

import MainPage from "./pages/MainPage"
import WarrantyPage from "./pages/WarrantyPage"
import CatalogPage from "./pages/CatalogPage"
import CatalogCarPage from "./pages/CatalogCarPage"
import CatalogMotoPage from "./pages/CatalogMotoPage"

import AdminCreate from "./components/AdminCreate" 
import AdminPanel from "./components/AdminPanel"
import AdminLogin from "./components/AdminLogin"

// Вспомогательный компонент для страниц с хедером и футером
const MainLayout = () => {
  return (
    <div className="min-h-dvh flex flex-col">
      {/* <ErrTablet /> */}
      <Header />
      <main className="flex-1 flex flex-col">
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/warranty" element={<WarrantyPage />} />
          <Route path="/catalog" element={<CatalogPage />} />
          <Route path="/catalog/car" element={<CatalogCarPage />} />
          <Route path="/catalog/moto" element={<CatalogMotoPage />} />
          {/* Поймает все остальные неизвестные страницы */}
          <Route path="*" element={<MainPage />} /> 
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

const App = () => {
  return (
    <Routes>
      {/* Страница админа — без хедера и футера */}
      <Route path="/admin/create" element={<AdminCreate />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/panel" element={<AdminPanel />} />
      {/* Все остальные пути рендерят MainLayout */}
      <Route path="*" element={<MainLayout />} />
    </Routes>
  )
}

export default App;
