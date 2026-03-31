import { Routes, Route } from "react-router-dom"
import Header from "./components/Header"
import Heading from "./components/Heading"
import Main from "./components/Main"
import About from "./components/About"

const App = () => {
  return (
    <section>
      <Header />
      <Heading />
      <Main />
      <About />
    </section>
  )
}


export default App