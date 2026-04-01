import { Routes, Route } from "react-router-dom"
import Header from "./components/Header"
import Heading from "./components/Heading"
import Main from "./components/Main"
import About from "./components/About"
import Footer from "./components/Footer"
import ErrTablet from "./components/ErrTablet"

const App = () => {
  return (
    <section>
      <ErrTablet />
      <Header />
      <Heading />
      <Main />
      <About />
      <Footer />
    </section>
  )
}


export default App