import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Connection, LAMPORTS_PER_SOL } from '@solana/web3.js';

// 定义交易历史记录的接口
interface Transaction {
  id: string;
  type: 'purchase' | 'sale';
  productName: string;
  amount: number;
  price: number;
  timestamp: string;
  status: 'completed' | 'pending' | 'failed';
}

// 定义用户信息的接口
interface UserProfile {
  username: string;
  joinDate: string;
  purchaseCount: number;
  saleCount: number;
  favoriteProducts: string[];
}

const MyAccount = () => {
  // Wallet integration
  const { publicKey, connected } = useWallet();
  
  // State variables
  const [balance, setBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'transactions' | 'wallet'>('profile');
  const [loading, setLoading] = useState<boolean>(true);

  // Load user data
  useEffect(() => {
    const loadUserData = async () => {
      setLoading(true);
      
      // 模拟从本地存储加载用户数据
      const storedProfile = localStorage.getItem('solanaUserProfile');
      const storedTransactions = localStorage.getItem('solanaTransactions');
      
      // 如果没有用户数据，创建一个默认的用户资料
      if (!storedProfile) {
        const defaultProfile: UserProfile = {
          username: 'Solana User',
          joinDate: new Date().toISOString(),
          purchaseCount: 0,
          saleCount: 0,
          favoriteProducts: []
        };
        localStorage.setItem('solanaUserProfile', JSON.stringify(defaultProfile));
        setUserProfile(defaultProfile);
      } else {
        setUserProfile(JSON.parse(storedProfile));
      }
      
      // 加载交易历史
      if (storedTransactions) {
        setTransactions(JSON.parse(storedTransactions));
      } else {
        // 创建一些模拟的交易历史
        const mockTransactions: Transaction[] = [
          {
            id: '1',
            type: 'purchase',
            productName: 'Limited Edition Sneakers',
            amount: 1,
            price: 2.5,
            timestamp: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
            status: 'completed'
          },
          {
            id: '2',
            type: 'purchase',
            productName: 'Digital Artwork',
            amount: 1,
            price: 1.8,
            timestamp: new Date(Date.now() - 86400000 * 5).toISOString(), // 5 days ago
            status: 'completed'
          }
        ];
        localStorage.setItem('solanaTransactions', JSON.stringify(mockTransactions));
        setTransactions(mockTransactions);
      }
      
      setLoading(false);
    };
    
    loadUserData();
  }, []);
  
  // 获取钱包余额
  useEffect(() => {
    const getBalance = async () => {
      if (connected && publicKey) {
        try {
          const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
          const balance = await connection.getBalance(publicKey);
          setBalance(balance / LAMPORTS_PER_SOL);
        } catch (error) {
          console.error('Error fetching balance:', error);
        }
      }
    };
    
    getBalance();
    
    // 设置定期刷新余额的定时器
    const intervalId = setInterval(getBalance, 30000); // 每30秒刷新一次
    
    return () => clearInterval(intervalId);
  }, [connected, publicKey]);
  
  // 渲染交易历史
  const renderTransactions = () => {
    if (transactions.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-10">
          <i className="ri-exchange-funds-line text-4xl text-white opacity-30 mb-3"></i>
          <p className="text-white opacity-70">No transactions yet</p>
        </div>
      );
    }
    
    return (
      <div className="space-y-3">
        {transactions.map(tx => (
          <div 
            key={tx.id} 
            className="bg-[#111111] rounded-xl p-3 border border-gray-800"
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <span className={`text-xs px-2 py-1 rounded-full ${tx.type === 'purchase' ? 'bg-blue-900 text-blue-200' : 'bg-green-900 text-green-200'}`}>
                  {tx.type === 'purchase' ? 'Purchase' : 'Sale'}
                </span>
                <h3 className="text-white font-medium mt-1">{tx.productName}</h3>
              </div>
              <span 
                className="price-tag"
                style={{
                  borderRadius: '20px',
                  padding: '2px 8px',
                  fontWeight: 'bold',
                  fontSize: '0.875rem',
                  color: 'black',
                  background: 'linear-gradient(135deg, #ccff00, #09fbd3)'
                }}
              >
                {tx.price.toFixed(2)} SOL
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-white opacity-50">
                {new Date(tx.timestamp).toLocaleDateString()} • {new Date(tx.timestamp).toLocaleTimeString()}
              </span>
              <span className={`${tx.status === 'completed' ? 'text-green-400' : tx.status === 'pending' ? 'text-yellow-400' : 'text-red-400'}`}>
                {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
              </span>
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  // 渲染用户资料
  const renderProfile = () => {
    if (!userProfile) return null;
    
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-4 mb-6">
          <div 
            className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-2xl font-bold text-white"
          >
            {userProfile.username.charAt(0)}
          </div>
          <div>
            <h2 className="text-white text-xl font-bold">{userProfile.username}</h2>
            <p className="text-white opacity-50 text-sm">
              Joined {new Date(userProfile.joinDate).toLocaleDateString()}
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#111111] rounded-xl p-3 border border-gray-800">
            <p className="text-white opacity-50 text-xs mb-1">Purchases</p>
            <p className="text-white text-xl font-bold">{userProfile.purchaseCount}</p>
          </div>
          <div className="bg-[#111111] rounded-xl p-3 border border-gray-800">
            <p className="text-white opacity-50 text-xs mb-1">Sales</p>
            <p className="text-white text-xl font-bold">{userProfile.saleCount}</p>
          </div>
        </div>
        
        <div className="bg-[#111111] rounded-xl p-4 border border-gray-800">
          <h3 className="text-white font-medium mb-3">Account Settings</h3>
          <div className="space-y-3">
            <button className="w-full bg-[#1A1A1A] text-white py-2 px-3 rounded-lg text-sm text-left flex justify-between items-center">
              Edit Profile
              <i className="ri-arrow-right-s-line"></i>
            </button>
            <button className="w-full bg-[#1A1A1A] text-white py-2 px-3 rounded-lg text-sm text-left flex justify-between items-center">
              Notification Settings
              <i className="ri-arrow-right-s-line"></i>
            </button>
            <button className="w-full bg-[#1A1A1A] text-white py-2 px-3 rounded-lg text-sm text-left flex justify-between items-center">
              Privacy Settings
              <i className="ri-arrow-right-s-line"></i>
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  // 渲染钱包信息
  const renderWallet = () => {
    return (
      <div className="space-y-4">
        <div className="bg-[#111111] rounded-xl p-4 border border-gray-800">
          <h3 className="text-white font-medium mb-3">Wallet Connection</h3>
          <div className="wallet-adapter-button-container mb-4">
            <WalletMultiButton className="wallet-adapter-button wallet-adapter-button-trigger w-full" />
          </div>
          
          {connected && publicKey ? (
            <div className="mt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-white opacity-70 text-sm">Address</span>
                <span className="text-white text-sm font-mono bg-[#1A1A1A] px-2 py-1 rounded">
                  {publicKey.toString().slice(0, 6)}...{publicKey.toString().slice(-4)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white opacity-70 text-sm">Balance</span>
                <span className="text-white font-medium">{balance.toFixed(4)} SOL</span>
              </div>
            </div>
          ) : (
            <p className="text-white opacity-70 text-sm text-center">Connect your wallet to view balance and transaction history</p>
          )}
        </div>
        
        <div className="bg-[#111111] rounded-xl p-4 border border-gray-800">
          <h3 className="text-white font-medium mb-3">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <button 
              className="bg-[#1A1A1A] text-white py-3 px-4 rounded-lg text-sm flex flex-col items-center justify-center"
              disabled={!connected}
            >
              <i className="ri-send-plane-fill text-xl mb-1"></i>
              Send
            </button>
            <button 
              className="bg-[#1A1A1A] text-white py-3 px-4 rounded-lg text-sm flex flex-col items-center justify-center"
              disabled={!connected}
            >
              <i className="ri-download-fill text-xl mb-1"></i>
              Receive
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  // 渲染加载状态
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-black">
        <p className="text-white">Loading...</p>
      </div>
    );
  }
  
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
          
          {/* Header */}
          <header className="mb-6">
            <div className="flex justify-between items-center mb-1">
              <h1 className="text-2xl font-bold text-white">My Account</h1>
              <Link to="/" className="text-white opacity-70">
                <i className="ri-home-4-line text-xl"></i>
              </Link>
            </div>
            <p className="text-white opacity-70 text-sm">Manage your profile and transactions</p>
          </header>
          
          {/* Tabs */}
          <div className="flex border-b border-gray-800 mb-4">
            <button 
              className={`flex-1 py-2 text-center text-sm font-medium ${activeTab === 'profile' ? 'text-white border-b-2 border-blue-500' : 'text-gray-400'}`}
              onClick={() => setActiveTab('profile')}
            >
              Profile
            </button>
            <button 
              className={`flex-1 py-2 text-center text-sm font-medium ${activeTab === 'transactions' ? 'text-white border-b-2 border-blue-500' : 'text-gray-400'}`}
              onClick={() => setActiveTab('transactions')}
            >
              Transactions
            </button>
            <button 
              className={`flex-1 py-2 text-center text-sm font-medium ${activeTab === 'wallet' ? 'text-white border-b-2 border-blue-500' : 'text-gray-400'}`}
              onClick={() => setActiveTab('wallet')}
            >
              Wallet
            </button>
          </div>
          
          {/* Tab Content */}
          <div className="pb-6">
            {activeTab === 'profile' && renderProfile()}
            {activeTab === 'transactions' && renderTransactions()}
            {activeTab === 'wallet' && renderWallet()}
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default MyAccount;