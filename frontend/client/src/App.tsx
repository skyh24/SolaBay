import './App.css'
import HomePage from './pages/index'
import ProductList from './pages/product-list'
import AddProduct from './pages/add-product'

// Import Remix icon library
import 'remixicon/fonts/remixicon.css'

// Import routing components
import { BrowserRouter, Routes, Route } from 'react-router-dom'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/product-list" element={<ProductList />} />
        <Route path="/add-product" element={<AddProduct />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
