import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';

// Define interfaces for product data
interface PriceHistory {
  timestamp: string;
  price: number;
}

interface Product {
  id: string;
  name: string;
  description: string;
  initialPrice: number;
  costPrice: number;
  maxPrice: number;
  initialSupply: number;
  currentSupply: number;
  durationDays: number;
  sensitivity: number;
  image: string;
  createdAt: string;
  priceHistory: PriceHistory[];
}

const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // State variables
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [purchaseQuantity, setPurchaseQuantity] = useState<number>(1);
  const [processingTransaction, setProcessingTransaction] = useState<boolean>(false);
  const [transactionSuccess, setTransactionSuccess] = useState<boolean>(false);
  
  // Refs
  const modalContentRef = useRef<HTMLDivElement>(null);
  
  // Function to handle quantity change
  const handleQuantityChange = (newQuantity: number) => {
    setPurchaseQuantity(Math.max(1, Math.min(newQuantity, product?.currentSupply || 1)));
  };
  
  // Load product data
  useEffect(() => {
    if (!id) {
      navigate('/product-list');
      return;
    }
    
    // Get products from localStorage
    const products: Product[] = JSON.parse(localStorage.getItem('solanaProducts') || '[]');
    const foundProduct = products.find(p => p.id === id);
    
    if (foundProduct) {
      setProduct(foundProduct);
    } else {
      // Product not found, redirect to product list
      navigate('/product-list');
    }
    
    setLoading(false);
  }, [id, navigate]);
  
  // Get latest price from price history
  const getLatestPrice = (): number => {
    if (!product || product.priceHistory.length === 0) return 0;
    return product.priceHistory[product.priceHistory.length - 1].price;
  };
  
  // Handle buy button click
  const handleBuyClick = () => {
    if (!product) return;
    setShowModal(true);
    // 使用requestAnimationFrame确保DOM已更新
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (modalContentRef.current) {
          modalContentRef.current.style.transform = 'translateY(0)';
        }
      });
    });
  };
  
  // Handle close modal
  const handleCloseModal = () => {
    if (modalContentRef.current) {
      modalContentRef.current.style.transform = 'translateY(100%)';
    }
    setTimeout(() => {
      setShowModal(false);
      setProcessingTransaction(false);
      setTransactionSuccess(false);
    }, 300);
  };
  
  // Process purchase
  const processPurchase = () => {
    if (!product) return;
    
    setProcessingTransaction(true);
    
    // Simulate transaction processing
    setTimeout(() => {
      // Transaction successful
      setProcessingTransaction(false);
      setTransactionSuccess(true);
      
      // Update product data
      const products: Product[] = JSON.parse(localStorage.getItem('solanaProducts') || '[]');
      const productIndex = products.findIndex(p => p.id === product.id);
      
      if (productIndex !== -1 && products[productIndex].currentSupply > 0) {
        // Reduce inventory
        products[productIndex].currentSupply -= purchaseQuantity;
        
        // Update product price
        const now = new Date();
        const latestPrice = getLatestPrice();
        const daysPassed = Math.floor((now.getTime() - new Date(product.createdAt).getTime()) / (1000 * 60 * 60 * 24));
        
        // Calculate time decay factor (lower price over time)
        const timeDecay = 1 - (daysPassed / product.durationDays) * 0.5;
        
        // Calculate supply factor (less supply, higher price)
        const supplyFactor = 1 + ((product.initialSupply - products[productIndex].currentSupply) / product.initialSupply);
        
        // Calculate new price (with random fluctuation)
        let newPrice = latestPrice * timeDecay * supplyFactor;
        
        // Ensure price is between cost price and max price
        newPrice = Math.max(product.costPrice, Math.min(product.maxPrice, newPrice));
        
        // Add to price history
        products[productIndex].priceHistory.push({
          timestamp: now.toISOString(),
          price: newPrice
        });
        
        // Save updated products to localStorage
        localStorage.setItem('solanaProducts', JSON.stringify(products));
        
        // Update state
        setProduct(products[productIndex]);
      }
      
      // Close modal after a delay
      setTimeout(() => {
        handleCloseModal();
      }, 800);
    }, 1000);
  };
  
  // 我们使用Day 1, Day 2, Day 3直接在UI中显示，不需要日期转换函数
  
  // Get max and min prices for visualization
  const getMaxPrice = (): number => {
    if (!product || product.priceHistory.length === 0) return 0;
    return Math.max(...product.priceHistory.map(item => item.price));
  };
  
  const getMinPrice = (): number => {
    if (!product || product.priceHistory.length === 0) return 0;
    return Math.min(...product.priceHistory.map(item => item.price));
  };
  
  // 我们只需要formatDate, getMaxPrice 和 getMinPrice函数
  // 用于显示价格历史
  
  // Render loading state or error state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-black">
        <p className="text-white">Loading...</p>
      </div>
    );
  }
  
  if (!product) {
    return (
      <div className="flex justify-center items-center h-screen bg-black">
        <div className="text-center">
          <p className="text-white text-xl mb-4">Product not found</p>
          <Link 
            to="/product-list" 
            className="btn-primary px-6 py-3 rounded-xl font-bold text-black"
            style={{ background: 'linear-gradient(135deg, #ccff00, #09fbd3)' }}
          >
            Back to Products
          </Link>
        </div>
      </div>
    );
  }
  
  // Get latest price
  const latestPrice = getLatestPrice();
  
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
        <div className="app-content h-full overflow-y-auto overflow-x-hidden relative bg-black p-0 pb-24"
             style={{ scrollbarWidth: 'none' }}>
          {/* Product Image Area */}
          <div className="relative h-[300px] overflow-hidden rounded-b-[24px]">
            <Link to="/product-list" className="absolute top-4 left-4 z-10 bg-black bg-opacity-50 rounded-full w-10 h-10 flex items-center justify-center text-white backdrop-blur-md">
              <i className="ri-arrow-left-line"></i>
            </Link>
            <img 
              src={product.image} 
              alt={product.name} 
              className="w-full h-full object-cover" 
            />
          </div>
          
          {/* Product Information Area */}
          <div className="p-4">
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-2xl font-bold text-white">{product.name}</h1>
              <span 
                className="price-tag neon-gradient text-lg"
                style={{
                  borderRadius: '20px',
                  padding: '6px 16px',
                  fontWeight: 'bold',
                  color: 'black',
                  background: 'linear-gradient(135deg, #ccff00, #09fbd3)'
                }}
              >
                {latestPrice.toFixed(2)} SOL
              </span>
            </div>
            
            <p className="text-white opacity-70 text-sm mb-4">{product.description}</p>
            
            {/* Stats Display */}
            <div className="flex justify-between text-center mb-8">
              <div className="stat-item">
                <span className="text-white opacity-50 text-xs mb-1 block">Stock</span>
                <span className="text-white font-bold">{product.currentSupply} / {product.initialSupply}</span>
              </div>
              <div className="stat-item">
                <span className="text-white opacity-50 text-xs mb-1 block">Duration Days</span>
                <span className="text-white font-bold">{product.durationDays}</span>
              </div>
              <div className="stat-item">
                <span className="text-white opacity-50 text-xs mb-1 block">Sensitivity</span>
                <span className="text-white font-bold">{product.sensitivity.toFixed(1)}</span>
              </div>
            </div>
            
            {/* Buy Button */}
            <div className="mt-4 mb-4">
              <button 
                onClick={handleBuyClick}
                className="w-full py-3 rounded-xl font-bold text-black text-lg"
                style={{
                  background: 'linear-gradient(135deg, #ccff00, #09fbd3)',
                  marginBottom: '10px',
                  transition: 'all 0.3s ease'
                }}
                disabled={product.currentSupply <= 0}
              >
                {product.currentSupply > 0 ? 'Buy Now' : 'Sold Out'}
              </button>
            </div>
            
            {/* Price History Card */}
            <div className="price-history-card" style={{ borderRadius: '16px', backgroundColor: '#111111', padding: '16px', marginTop: '16px' }}>
              <h2 className="text-white font-bold mb-4">Price Trend</h2>
              <div className="chart-container" style={{ position: 'relative', height: '220px', width: '100%', backgroundColor: '#111111', marginBottom: '10px' }}>
                <div className="relative h-[180px] w-full">
                  {/* SVG Line Chart */}
                  <svg className="w-full h-full" style={{ overflow: 'visible' }}>
                    {/* 定义渐变 - 从上到下 */}
                    <defs>
                      <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="rgba(204, 255, 0, 0.5)" />
                        <stop offset="100%" stopColor="rgba(9, 251, 211, 0)" />
                      </linearGradient>
                      
                      {/* 定义线条渐变 */}
                      <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#ccff00" />
                        <stop offset="100%" stopColor="#09fbd3" />
                      </linearGradient>
                    </defs>
                    
                    {/* 水平网格线 */}
                    <g className="grid-lines">
                      {[0, 0.25, 0.5, 0.75, 1].map((val, i) => (
                        <line 
                          key={i}
                          x1="0%"
                          y1={`${val * 100}%`}
                          x2="100%"
                          y2={`${val * 100}%`}
                          stroke="rgba(255, 255, 255, 0.1)"
                          strokeWidth="1"
                        />
                      ))}
                    </g>
                    
                    {product.priceHistory.length > 1 && (
                      <>
                        {/* 填充区域 */}
                        <path
                          d={`
                            M ${product.priceHistory.map((record, index) => {
                              const totalPoints = product.priceHistory.length;
                              const x = (index / (totalPoints - 1)) * 100;
                              const maxPrice = getMaxPrice();
                              const minPrice = getMinPrice();
                              const range = maxPrice - minPrice || 1;
                              const normalizedY = (1 - ((record.price - minPrice) / range)) * 100;
                              return `${x}% ${normalizedY}%`;
                            }).join(' L ')}
                            L 100% 100%
                            L 0% 100%
                            Z
                          `}
                          fill="url(#areaGradient)"
                          fillOpacity="0.5"
                        />
                        
                        {/* 折线 */}
                        <path
                          d={`
                            M ${product.priceHistory.map((record, index) => {
                              const totalPoints = product.priceHistory.length;
                              const x = (index / (totalPoints - 1)) * 100;
                              const maxPrice = getMaxPrice();
                              const minPrice = getMinPrice();
                              const range = maxPrice - minPrice || 1;
                              const normalizedY = (1 - ((record.price - minPrice) / range)) * 100;
                              return `${x}% ${normalizedY}%`;
                            }).join(' L ')}
                          `}
                          stroke="#ccff00"
                          strokeWidth="2"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        
                        {/* 绘制点 */}
                        {product.priceHistory.map((record, index) => {
                          const totalPoints = product.priceHistory.length;
                          const x = (index / (totalPoints - 1)) * 100;
                          const maxPrice = getMaxPrice();
                          const minPrice = getMinPrice();
                          const range = maxPrice - minPrice || 1;
                          const normalizedY = (1 - ((record.price - minPrice) / range)) * 100;
                          
                          return (
                            <circle 
                              key={index}
                              cx={`${x}%`}
                              cy={`${normalizedY}%`}
                              r="4"
                              fill="#09fbd3"
                            />
                          );
                        })}
                      </>
                    )}
                  </svg>
                  
                  {/* Y轴标签 */}
                  <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-white opacity-50">
                    <div>{Math.ceil(getMaxPrice()).toFixed(0)}</div>
                    <div></div>
                    <div>{((getMaxPrice() + getMinPrice()) / 2).toFixed(0)}</div>
                    <div></div>
                    <div>{Math.floor(getMinPrice()).toFixed(0)}</div>
                  </div>
                  
                  {/* X轴标签 */}
                  <div className="absolute left-0 right-0 bottom-[-24px] flex justify-between text-xs text-white opacity-50 px-2">
                    {product.priceHistory.map((_, index) => (
                      <div key={index} className="text-center">
                        Day {index + 1}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <p className="text-white opacity-50 text-xs mt-6 mb-1">Product Created On</p>
              <p className="text-white text-sm">
                {new Date(product.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
            
            <div className="mt-6 mb-2 text-center">
              <button 
                onClick={() => navigate('/product-list')} 
                className="text-white opacity-70 text-sm"
              >
                <i className="ri-arrow-left-line mr-1"></i> Back to Product List
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* OKX Wallet Style Transaction Modal */}
      {showModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-80 flex items-end justify-center z-50"
          onClick={handleCloseModal}
          style={{ display: 'flex' }}
        >
          <div 
            ref={modalContentRef}
            className="bg-[#0C0D10] w-full max-w-md rounded-t-xl p-5 border-t border-x border-gray-800 transition-transform duration-300 ease-in-out"
            onClick={(e) => e.stopPropagation()}
            style={{ 
              maxHeight: '85vh', 
              overflowY: 'auto',
              transform: 'translateY(100%)',
              width: '100%'
            }}
          >
            {/* Wallet Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <img src="https://static.okx.com/cdn/assets/imgs/225/C26E05CFD9349799.png" alt="OKX Wallet" className="h-7 mr-2" />
                <span className="text-white font-medium">OKX Wallet</span>
              </div>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-white">
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>
            
            {/* Transaction Details */}
            <div className="bg-[#17181D] rounded-lg p-4 mb-4">
              <div className="flex justify-between items-center mb-3">
                <span className="text-gray-400 text-sm">Transaction Type</span>
                <span className="text-white font-medium">Purchase</span>
              </div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-gray-400 text-sm">Product</span>
                <span className="text-white font-medium">{product.name}</span>
              </div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-gray-400 text-sm">Price</span>
                <span className="text-white font-medium">{latestPrice.toFixed(2)} SOL</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Quantity</span>
                <div className="flex items-center">
                  <button 
                    onClick={() => handleQuantityChange(purchaseQuantity - 1)}
                    className="text-gray-400 hover:text-white px-2"
                    disabled={purchaseQuantity <= 1}
                  >
                    <i className="ri-subtract-line"></i>
                  </button>
                  <span className="text-white font-medium px-2">{purchaseQuantity}</span>
                  <button 
                    onClick={() => handleQuantityChange(purchaseQuantity + 1)}
                    className="text-gray-400 hover:text-white px-2"
                    disabled={purchaseQuantity >= (product?.currentSupply || 1)}
                  >
                    <i className="ri-add-line"></i>
                  </button>
                </div>
              </div>
            </div>
            
            {/* Wallet Information */}
            <div className="bg-[#17181D] rounded-lg p-4 mb-5">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400 text-sm">Payment Method</span>
                <div className="flex items-center">
                  <div className="h-5 w-5 mr-2 bg-[#9945FF] rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">SOL</span>
                  </div>
                  <span className="text-white font-medium">Solana</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Gas Fee</span>
                <span className="text-white font-medium">0.000005 SOL</span>
              </div>
            </div>
            
            {/* Transaction Buttons */}
            <div className="flex space-x-3">
              <button 
                onClick={handleCloseModal} 
                className="flex-1 py-3 px-4 bg-[#17181D] text-white rounded-lg font-medium border border-gray-700"
              >
                Cancel
              </button>
              <button 
                onClick={processPurchase} 
                className={`flex-1 py-3 px-4 text-white rounded-lg font-medium ${processingTransaction ? 'opacity-75' : ''} ${transactionSuccess ? 'bg-gradient-to-r from-green-500 to-green-700' : 'bg-gradient-to-r from-blue-500 to-blue-700'}`}
                disabled={processingTransaction}
              >
                {processingTransaction ? 'Processing...' : transactionSuccess ? 'Transaction successful!' : 'Confirm Payment'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Back to Product List Button */}
      <div className="text-center my-5">
        <button 
          onClick={() => navigate('/products')}
          className="inline-flex items-center text-white opacity-80 hover:opacity-100 transition"
        >
          <i className="ri-arrow-left-line mr-2"></i> Back to Product List
        </button>
      </div>
    </div>
  );
};

export default ProductDetails;