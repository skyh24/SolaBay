import React from 'react';
import { Link } from 'react-router-dom';

// Define types for props if needed
interface HomePageProps {
  // Add props here if needed
}

const HomePage: React.FC<HomePageProps> = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full">
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
        <div className="h-full overflow-y-auto overflow-x-hidden relative bg-black p-4 pb-24"
             style={{ scrollbarWidth: 'none' }}>
          
          {/* Home Page Content */}
          <div className="flex flex-col items-center justify-center h-full">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold mb-2"
                  style={{
                    background: 'linear-gradient(135deg, #ccff00, #09fbd3)',
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    color: 'transparent'
                  }}>Solana Marketplace</h1>
              <p className="text-white opacity-70">Limited Edition Digital Goods Trading Platform</p>
            </div>
            
            <div className="w-full max-w-md space-y-6">
              {/* Product Market Card */}
              <Link to="/product-list" className="p-6 flex items-center rounded-[16px] bg-[#111111] shadow-md transition-all duration-300 hover:translate-y-[-4px] hover:shadow-lg"
                 style={{
                   boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                   transition: 'all 0.3s ease'
                 }}>
                <div className="w-12 h-12 rounded-full flex items-center justify-center mr-4"
                     style={{
                       background: 'linear-gradient(to right, #ccff00, #09fbd3)'
                     }}>
                  <i className="ri-store-2-line text-2xl text-black"></i>
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">Product Market</h3>
                  <p className="text-white opacity-70 text-sm">Browse and purchase limited edition products</p>
                </div>
              </Link>
              
              {/* My Account Card */}
              <Link to="/my-account" className="p-6 flex items-center rounded-[16px] bg-[#111111] shadow-md transition-all duration-300 hover:translate-y-[-4px] hover:shadow-lg"
                 style={{
                   boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                   transition: 'all 0.3s ease'
                 }}>
                <div className="w-12 h-12 rounded-full flex items-center justify-center mr-4"
                     style={{
                       background: 'linear-gradient(to right, #ff7eb3, #ff758c)'
                     }}>
                  <i className="ri-user-3-line text-2xl text-black"></i>
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">My Account</h3>
                  <p className="text-white opacity-70 text-sm">Manage your profile and transactions</p>
                </div>
              </Link>
              
              {/* Merchant Management Card */}
              <Link to="/add-product" className="p-6 flex items-center rounded-[16px] bg-[#111111] shadow-md transition-all duration-300 hover:translate-y-[-4px] hover:shadow-lg"
                 style={{
                   boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                   transition: 'all 0.3s ease'
                 }}>
                <div className="w-12 h-12 rounded-full flex items-center justify-center mr-4"
                     style={{
                       background: 'linear-gradient(to right, #7f7fd5, #91eae4)'
                     }}>
                  <i className="ri-settings-3-line text-2xl text-black"></i>
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">Merchant Management</h3>
                  <p className="text-white opacity-70 text-sm">Create and manage your products</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;