import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// Define types for the product data
interface PriceHistory {
  timestamp: string;
  price: number;
}

interface Product {
  id: string;
  name: string;
  description: string;
  image: string;
  initialSupply: number;
  currentSupply: number;
  costPrice: number;
  maxPrice: number;
  durationDays: number;
  createdAt: string;
  priceHistory: PriceHistory[];
}

interface ProductListProps {
  // Add props here if needed
}

const ProductList: React.FC<ProductListProps> = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Load products from localStorage
    const loadProducts = () => {
      const storedProducts = JSON.parse(localStorage.getItem('solanaProducts') || '[]');
      setProducts(storedProducts);
      setLoading(false);
    };

    loadProducts();

    // Update prices periodically (every minute for demo)
    const intervalId = setInterval(() => {
      updatePrices();
    }, 60000);

    // Initial price update
    updatePrices();

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  // Update price function (simulate price changes over time)
  const updatePrices = () => {
    if (products.length === 0) return;
    
    const updatedProducts = products.map(product => {
      // Calculate days since product creation
      const createdDate = new Date(product.createdAt);
      const now = new Date();
      const daysPassed = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
      
      // If exceeded duration days, don't update price anymore
      if (daysPassed >= product.durationDays) return product;
      
      // Get latest price
      const latestPrice = product.priceHistory[product.priceHistory.length - 1].price;
      
      // Calculate time decay factor (lower price over time)
      const timeDecay = 1 - (daysPassed / product.durationDays) * 0.5;
      
      // Calculate supply factor (less supply, higher price)
      const supplyFactor = 1 + ((product.initialSupply - product.currentSupply) / product.initialSupply);
      
      // Calculate new price (with random fluctuation)
      let newPrice = latestPrice * timeDecay * supplyFactor;
      
      // Ensure price is between cost price and max price
      newPrice = Math.max(product.costPrice, Math.min(product.maxPrice, newPrice));
      
      // Add to price history
      const updatedProduct = {
        ...product,
        priceHistory: [
          ...product.priceHistory,
          {
            timestamp: now.toISOString(),
            price: newPrice
          }
        ]
      };
      
      return updatedProduct;
    });
    
    // Update state and localStorage
    setProducts(updatedProducts);
    localStorage.setItem('solanaProducts', JSON.stringify(updatedProducts));
  };

  return (
    <div style={{
      backgroundColor: '#f5f7fa',
      fontFamily: "'PingFang SC', 'Helvetica Neue', Arial, sans-serif",
      backgroundImage: 
        `radial-gradient(circle at 10px 10px, rgba(0, 0, 0, 0.05) 2px, transparent 2px),
         radial-gradient(circle at 25px 25px, rgba(0, 0, 0, 0.05) 2px, transparent 2px)`,
      backgroundSize: '30px 30px'
    }}>
      {/* Background grid effect */}
      <div className="page-grid-bg fixed top-0 left-0 right-0 bottom-0 pointer-events-none z-[-1]" 
           style={{
             backgroundImage: `linear-gradient(rgba(99, 102, 241, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(99, 102, 241, 0.03) 1px, transparent 1px)`,
             backgroundSize: '20px 20px'
           }}>
      </div>

      {/* Phone frame */}
      <div className="phone-frame w-[393px] h-[852px] border-[12px] border-[#222] rounded-[48px] overflow-hidden relative bg-black shadow-2xl m-[2rem] mx-auto"
           style={{
             boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 8px 20px -8px rgba(0, 0, 0, 0.3), inset 0 0 20px rgba(255, 255, 255, 0.05)'
           }}>
        <div className="app-content h-full overflow-y-auto overflow-x-hidden relative bg-black"
             style={{ scrollbarWidth: 'none' }}>
          
          {/* Top Navigation Bar */}
          <div className="sticky top-0 z-10 bg-black bg-opacity-90 backdrop-blur-md p-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-white">Product List</h1>
            <div className="flex space-x-4">
              <button className="text-white">
                <i className="ri-search-line text-xl"></i>
              </button>
              <Link to="/admin" className="text-white">
                <i className="ri-add-circle-line text-xl"></i>
              </Link>
            </div>
          </div>
          
          {/* Product List */}
          <div className="p-4 pb-24">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <p className="text-white opacity-70">Loading products...</p>
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-1 gap-6" id="product-container">
                {products.map((product) => {
                  // Get latest price
                  const latestPrice = product.priceHistory[product.priceHistory.length - 1].price;
                  
                  return (
                    <div key={product.id} className="card overflow-hidden"
                         style={{
                           borderRadius: '16px',
                           background: '#111111',
                           boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                           transition: 'all 0.3s ease'
                         }}>
                      <img 
                        className="product-image w-full h-[180px] object-cover rounded-t-[12px]" 
                        src={product.image} 
                        alt={product.name} 
                      />
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="product-name text-lg font-bold text-white">{product.name}</h3>
                          <span 
                            className="price-tag neon-gradient"
                            style={{
                              borderRadius: '20px',
                              padding: '4px 12px',
                              fontWeight: 'bold',
                              color: 'black',
                              background: 'linear-gradient(135deg, #ccff00, #09fbd3)'
                            }}>
                            {latestPrice.toFixed(2)} SOL
                          </span>
                        </div>
                        <p className="product-desc text-white opacity-70 text-sm line-clamp-2 mb-3">{product.description}</p>
                        <div className="flex justify-between items-center">
                          <span className="text-white text-xs opacity-50 product-supply">Remaining: {product.currentSupply}</span>
                          <Link 
                            to={`/product-detail/${product.id}`} 
                            className="product-link text-white flex items-center text-sm hover:text-transparent"
                            style={{
                              background: 'linear-gradient(135deg, #ccff00, #09fbd3)',
                              WebkitBackgroundClip: 'text',
                              backgroundClip: 'text',
                            }}>
                            View Details <i className="ri-arrow-right-s-line ml-1"></i>
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="empty-state flex flex-col items-center justify-center h-[70%] text-center p-5">
                <i className="ri-shopping-bag-line text-6xl text-white opacity-30 mb-4"></i>
                <h3 className="text-xl font-bold text-white mb-2">No Products</h3>
                <p className="text-white opacity-50 mb-6">No products yet, add one now!</p>
                <Link 
                  to="/admin" 
                  className="btn-primary px-6 py-3 rounded-xl font-bold text-black"
                  style={{
                    background: 'linear-gradient(135deg, #ccff00, #09fbd3)',
                    transition: 'all 0.3s ease',
                    color: 'black'
                  }}>
                  Add Product
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductList;