import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';

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

const ProductDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // Wallet integration
  const { publicKey, connected, sendTransaction } = useWallet();
  
  // State variables
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [purchaseQuantity, setPurchaseQuantity] = useState<number>(1);
  const [processingTransaction, setProcessingTransaction] = useState<boolean>(false);
  const [transactionSuccess, setTransactionSuccess] = useState<boolean>(false);
  const [transactionError, setTransactionError] = useState<string>('');
  
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
    // 使用 requestAnimationFrame 确保 DOM 已更新
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
      if (transactionSuccess) {
        setTransactionSuccess(false);
      }
      setTransactionError('');
    }, 300);
  };
  
  // Process purchase with Phantom wallet
  const processPurchase = async () => {
    if (!product || !connected || !publicKey) return;
    if (!showModal) return;
    
    setProcessingTransaction(true);
    setTransactionError('');
    
    try {
      // Create a Solana connection
      const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
      
      // Calculate the total cost in lamports (1 SOL = 1,000,000,000 lamports)
      const latestPrice = getLatestPrice();
      const totalCost = latestPrice * purchaseQuantity * LAMPORTS_PER_SOL;
      
      // Use a valid merchant wallet address - this is a sample devnet address
      // For production, replace with your actual merchant wallet address
      const merchantWallet = new PublicKey('Ga8RmDKHmmd6qv2ygA46ehZrjwLDfgKogx4L6zdTgeBP');
      
      // Create a transaction
      const transaction = new Transaction();
      
      // Add a recent blockhash to the transaction
      const { blockhash } = await connection.getLatestBlockhash('confirmed');
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;
      
      // Add the transfer instruction
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: merchantWallet,
          lamports: Math.floor(totalCost),
        })
      );
      
      // Send the transaction
      console.log('Sending transaction...');
      const signature = await sendTransaction(transaction, connection);
      console.log('Transaction sent with signature:', signature);
      
      // Wait for confirmation
      console.log('Waiting for transaction confirmation...');
      const confirmation = await connection.confirmTransaction(signature, 'confirmed');
      console.log('Transaction confirmed:', confirmation);
      
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
        // Use sensitivity to adjust the random fluctuation
        const randomFactor = 0.95 + (Math.random() * product.sensitivity * 0.1);
        let newPrice = latestPrice * timeDecay * supplyFactor * randomFactor;
        
        // Ensure price is between cost price and max price
        newPrice = Math.max(product.costPrice, Math.min(product.maxPrice, parseFloat(newPrice.toFixed(2))));
        
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
      
      // Reset after 2 seconds
      setTimeout(() => {
        setTransactionSuccess(false);
      }, 2000);
      
    } catch (error) {
      console.error('Transaction error:', error);
      setProcessingTransaction(false);
      
      // Improved error handling with more specific error messages
      let errorMessage = 'Transaction failed';
      if (error instanceof Error) {
        if (error.message.includes('User rejected')) {
          errorMessage = 'Transaction rejected by user';
        } else if (error.message.includes('insufficient funds')) {
          errorMessage = 'Insufficient funds in wallet';
        } else if (error.message.includes('blockhash')) {
          errorMessage = 'Transaction expired. Please try again.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setTransactionError(errorMessage);
    }
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
    <div className="flex flex-col items-center justify-center h-full p-2">
      {/* Background grid effect */}
      <div className="fixed top-0 left-0 right-0 bottom-0 pointer-events-none z-[-1]" 
           style={{
             backgroundImage: `linear-gradient(rgba(99, 102, 241, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(99, 102, 241, 0.03) 1px, transparent 1px)`,
             backgroundSize: '20px 20px'
           }}>
      </div>

      {/* Phone frame */}
      <div className="w-[393px] h-[852px] border-[12px] border-[#222] rounded-[48px] overflow-hidden relative bg-black shadow-2xl m-8"
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
              <div className="chart-container" style={{ position: 'relative', height: '200px', width: '100%', marginBottom: '20px' }}>
                {/* Chart.js style canvas */}
                <canvas 
                  id="price-chart" 
                  ref={(canvas) => {
                    // 当组件挂载和更新时，绘制图表
                    if (canvas && product.priceHistory.length > 0) {
                      const ctx = canvas.getContext('2d');
                      if (ctx) {
                        // 清除画布
                        ctx.clearRect(0, 0, canvas.width, canvas.height);
                        
                        // 设置画布尺寸
                        const dpr = window.devicePixelRatio || 1;
                        canvas.width = canvas.offsetWidth * dpr;
                        canvas.height = canvas.offsetHeight * dpr;
                        ctx.scale(dpr, dpr);
                        
                        // 定义常量
                        const width = canvas.offsetWidth;
                        const height = canvas.offsetHeight;
                        const padding = { top: 20, right: 20, bottom: 30, left: 40 };
                        const chartWidth = width - padding.left - padding.right;
                        const chartHeight = height - padding.top - padding.bottom;
                        
                        // 获取价格数据
                        const prices = product.priceHistory.map(item => item.price);
                        const maxPrice = getMaxPrice();
                        const minPrice = getMinPrice() * 0.95; // 留出一点底部空间
                        const priceRange = maxPrice - minPrice;
                        
                        // 绘制网格线
                        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
                        ctx.lineWidth = 0.5;
                        
                        // 水平网格线
                        for (let i = 0; i <= 4; i++) {
                          const y = padding.top + (chartHeight / 4) * i;
                          ctx.beginPath();
                          ctx.moveTo(padding.left, y);
                          ctx.lineTo(width - padding.right, y);
                          ctx.stroke();
                          
                          // Y轴标签
                          const labelValue = maxPrice - (i / 4) * priceRange;
                          ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
                          ctx.font = '10px Arial';
                          ctx.textAlign = 'right';
                          ctx.fillText(labelValue.toFixed(2), padding.left - 5, y + 3);
                        }
                        
                        // 创建渐变
                        const gradient = ctx.createLinearGradient(0, padding.top, 0, height - padding.bottom);
                        gradient.addColorStop(0, 'rgba(204, 255, 0, 0.5)');
                        gradient.addColorStop(1, 'rgba(9, 251, 211, 0.0)');
                        
                        // 绘制填充区域
                        ctx.beginPath();
                        ctx.moveTo(padding.left, height - padding.bottom);
                        
                        // 添加所有价格点
                        prices.forEach((price, index) => {
                          const x = padding.left + (chartWidth / (prices.length - 1)) * index;
                          const y = padding.top + chartHeight - ((price - minPrice) / priceRange) * chartHeight;
                          ctx.lineTo(x, y);
                        });
                        
                        // 完成填充区域
                        ctx.lineTo(width - padding.right, height - padding.bottom);
                        ctx.closePath();
                        ctx.fillStyle = gradient;
                        ctx.fill();
                        
                        // 绘制折线
                        ctx.beginPath();
                        prices.forEach((price, index) => {
                          const x = padding.left + (chartWidth / (prices.length - 1)) * index;
                          const y = padding.top + chartHeight - ((price - minPrice) / priceRange) * chartHeight;
                          
                          if (index === 0) {
                            ctx.moveTo(x, y);
                          } else {
                            ctx.lineTo(x, y);
                          }
                        });
                        ctx.strokeStyle = '#ccff00';
                        ctx.lineWidth = 2;
                        ctx.lineJoin = 'round';
                        ctx.lineCap = 'round';
                        ctx.stroke();
                        
                        // 绘制数据点
                        prices.forEach((price, index) => {
                          const x = padding.left + (chartWidth / (prices.length - 1)) * index;
                          const y = padding.top + chartHeight - ((price - minPrice) / priceRange) * chartHeight;
                          
                          ctx.beginPath();
                          ctx.arc(x, y, 4, 0, Math.PI * 2);
                          ctx.fillStyle = '#09fbd3';
                          ctx.fill();
                        });
                        
                        // X轴标签
                        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
                        ctx.font = '10px Arial';
                        ctx.textAlign = 'center';
                        prices.forEach((_, index) => {
                          const x = padding.left + (chartWidth / (prices.length - 1)) * index;
                          ctx.fillText(`Day ${index + 1}`, x, height - padding.bottom + 15);
                        });
                      }
                    }
                  }}
                  style={{ width: '100%', height: '100%', backgroundColor: '#111111' }}
                />
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
      
      {/* Phantom Wallet Modal */}
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
                <img src="https://phantom.app/img/phantom-logo.svg" alt="Phantom Wallet" className="h-7 mr-2" />
                <span className="text-white font-medium">Phantom Wallet</span>
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
                <span className="text-white font-medium">{product?.name}</span>
              </div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-gray-400 text-sm">Price</span>
                <span className="text-white font-medium">{getLatestPrice().toFixed(2)} SOL</span>
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
            
            {/* Wallet Connect and Transaction Buttons */}
            <div className="flex flex-col space-y-3">
              {/* Wallet Connect Button */}
              <div className="wallet-adapter-button-container">
                <WalletMultiButton className="wallet-adapter-button wallet-adapter-button-trigger w-full" />
              </div>
              
              {/* Transaction Buttons */}
              <div className="flex space-x-3 mt-3">
                <button 
                  onClick={handleCloseModal} 
                  className="flex-1 py-3 px-4 bg-[#17181D] text-white rounded-lg font-medium border border-gray-700"
                >
                  Cancel
                </button>
                <button 
                  onClick={processPurchase} 
                  className={`flex-1 py-3 px-4 text-white rounded-lg font-medium ${!connected ? 'opacity-50 cursor-not-allowed' : processingTransaction ? 'opacity-75' : ''} ${transactionSuccess ? 'bg-gradient-to-r from-green-500 to-green-700' : 'bg-gradient-to-r from-blue-500 to-blue-700'}`}
                  disabled={!connected || processingTransaction}
                >
                  {!connected ? 'Connect Wallet First' : 
                   processingTransaction ? 'Processing...' : 
                   transactionSuccess ? 'Purchase Successful!' : 
                   `Confirm Payment (${(getLatestPrice() * purchaseQuantity).toFixed(2)} SOL)`}
                </button>
              </div>
              
              {/* Error message */}
              {transactionError && (
                <div className="text-red-500 text-sm mt-2 text-center">
                  Error: {transactionError}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
};

export default ProductDetails;