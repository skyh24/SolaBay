import './App.css'
import HomePage from './pages/index'
import ProductList from './pages/product-list'
import AddProduct from './pages/add-product'
import ProductDetails from './pages/product-details'
import MyAccount from './pages/my-account'

// Import Remix icon library
import 'remixicon/fonts/remixicon.css'

// Import routing components
import { BrowserRouter, Routes, Route } from 'react-router-dom'

// Import Wallet Context Provider
import WalletContextProvider from './context/WalletContextProvider'

function App() {
  return (
    <WalletContextProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/product-list" element={<ProductList />} />
          <Route path="/add-product" element={<AddProduct />} />
          <Route path="/product-detail/:id" element={<ProductDetails />} />
          <Route path="/my-account" element={<MyAccount />} />
        </Routes>
      </BrowserRouter>
    </WalletContextProvider>
  )
}

export default App
