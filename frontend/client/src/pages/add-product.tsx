import React, { useState, useRef } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { Link } from 'react-router-dom';

// Define interfaces for product data
interface PriceHistoryItem {
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
  priceHistory: PriceHistoryItem[];
}

const AddProduct: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Form state
  const [productName, setProductName] = useState<string>('');
  const [productDesc, setProductDesc] = useState<string>('');
  const [initialPrice, setInitialPrice] = useState<number>(1000);
  const [costPrice, setCostPrice] = useState<number>(500);
  const [maxPrice, setMaxPrice] = useState<number>(10000);
  const [initialSupply, setInitialSupply] = useState<number>(100);
  const [durationDays, setDurationDays] = useState<number>(100);
  const [sensitivity, setSensitivity] = useState<number>(0.1);
  
  // Image state
  const [previewImage, setPreviewImage] = useState<string>('https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1587&q=80');
  const [showPlaceholder, setShowPlaceholder] = useState<boolean>(false);
  const [uploadedImageData, setUploadedImageData] = useState<string>('');
  
  // Handle image upload
  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setUploadedImageData(result);
        setPreviewImage(result);
        setShowPlaceholder(false);
        
        // Clear example selection
        if (selectRef.current) {
          selectRef.current.value = '';
        }
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Reference for select element
  const selectRef = useRef<HTMLSelectElement>(null);
  
  // Handle example image selection
  const handleExampleImageChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;
    if (selectedValue) {
      setPreviewImage(selectedValue);
      setShowPlaceholder(false);
      setUploadedImageData('');
      
      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } else {
      setShowPlaceholder(true);
      setPreviewImage('');
    }
  };
  
  // Handle form submission
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    // Check if there is an image
    const imageUrl = uploadedImageData || previewImage;
    if (!imageUrl) {
      alert('Please upload a product image or select an example image!');
      return;
    }
    
    // Create product object
    const product: Product = {
      id: Date.now().toString(),
      name: productName,
      description: productDesc,
      initialPrice,
      costPrice,
      maxPrice,
      initialSupply,
      currentSupply: initialSupply,
      durationDays,
      sensitivity,
      image: imageUrl,
      createdAt: new Date().toISOString(),
      priceHistory: [{
        timestamp: new Date().toISOString(),
        price: initialPrice
      }]
    };
    
    // Save to local storage
    let products: Product[] = JSON.parse(localStorage.getItem('solanaProducts') || '[]');
    products.push(product);
    localStorage.setItem('solanaProducts', JSON.stringify(products));
    
    // Display success message
    alert('Product saved successfully!');
    
    // Reset form
    setProductName('');
    setProductDesc('');
    setInitialPrice(1000);
    setCostPrice(500);
    setMaxPrice(10000);
    setInitialSupply(100);
    setDurationDays(100);
    setSensitivity(0.1);
    setPreviewImage('https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1587&q=80');
    setShowPlaceholder(false);
    setUploadedImageData('');
    
    // Navigate to product list
    // navigate('/product-list');
  };
  
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
        <div className="app-content h-full overflow-y-auto overflow-x-hidden relative bg-black p-4 pb-24"
             style={{ scrollbarWidth: 'none' }}>
          
          <header className="mb-4">
            <h1 className="text-2xl font-bold text-white mb-1">Merchant Admin Panel</h1>
            <p className="text-white opacity-70 text-sm">Create and manage your limited edition products</p>
          </header>
          
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Basic Information Card */}
            <div className="card p-3" style={{ borderRadius: '16px', background: '#111111', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', transition: 'all 0.3s ease' }}>
              <h2 className="text-base font-semibold text-white mb-2">Basic Information</h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-white text-xs mb-1" htmlFor="product-name">Product Name</label>
                  <input 
                    type="text" 
                    id="product-name" 
                    className="w-full p-2 text-white text-sm" 
                    placeholder="Example: Limited Edition Custom Sneakers" 
                    required
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    style={{ backgroundColor: '#111111', border: '1px solid #333333', color: 'white', borderRadius: '8px', transition: 'all 0.3s ease' }}
                  />
                </div>
                <div>
                  <label className="block text-white text-xs mb-1" htmlFor="product-desc">Product Description</label>
                  <textarea 
                    id="product-desc" 
                    className="w-full p-2 text-white text-sm" 
                    rows={2} 
                    placeholder="Describe your product features and highlights..." 
                    required
                    value={productDesc}
                    onChange={(e) => setProductDesc(e.target.value)}
                    style={{ backgroundColor: '#111111', border: '1px solid #333333', color: 'white', borderRadius: '8px', transition: 'all 0.3s ease' }}
                  ></textarea>
                </div>
              </div>
            </div>
            
            {/* Price Settings Card */}
            <div className="card p-3" style={{ borderRadius: '16px', background: '#111111', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', transition: 'all 0.3s ease' }}>
              <h2 className="text-base font-semibold text-white mb-2">Price Settings</h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-white text-xs mb-1" htmlFor="initial-price">Initial Price (SOL)</label>
                  <input 
                    type="number" 
                    id="initial-price" 
                    className="w-full p-2 text-white text-sm" 
                    required
                    value={initialPrice}
                    onChange={(e) => setInitialPrice(parseFloat(e.target.value))}
                    style={{ backgroundColor: '#111111', border: '1px solid #333333', color: 'white', borderRadius: '8px', transition: 'all 0.3s ease' }}
                  />
                </div>
                <div>
                  <label className="block text-white text-xs mb-1" htmlFor="cost-price">Cost Price (SOL)</label>
                  <input 
                    type="number" 
                    id="cost-price" 
                    className="w-full p-2 text-white text-sm" 
                    required
                    value={costPrice}
                    onChange={(e) => setCostPrice(parseFloat(e.target.value))}
                    style={{ backgroundColor: '#111111', border: '1px solid #333333', color: 'white', borderRadius: '8px', transition: 'all 0.3s ease' }}
                  />
                </div>
                <div>
                  <label className="block text-white text-xs mb-1" htmlFor="max-price">Max Price (SOL)</label>
                  <input 
                    type="number" 
                    id="max-price" 
                    className="w-full p-2 text-white text-sm" 
                    required
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(parseFloat(e.target.value))}
                    style={{ backgroundColor: '#111111', border: '1px solid #333333', color: 'white', borderRadius: '8px', transition: 'all 0.3s ease' }}
                  />
                </div>
              </div>
            </div>
            
            {/* Supply Settings Card */}
            <div className="card p-3" style={{ borderRadius: '16px', background: '#111111', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', transition: 'all 0.3s ease' }}>
              <h2 className="text-base font-semibold text-white mb-2">Supply Settings</h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-white text-xs mb-1" htmlFor="initial-supply">Initial Supply</label>
                  <input 
                    type="number" 
                    id="initial-supply" 
                    className="w-full p-2 text-white text-sm" 
                    min="1" 
                    required
                    value={initialSupply}
                    onChange={(e) => setInitialSupply(parseInt(e.target.value))}
                    style={{ backgroundColor: '#111111', border: '1px solid #333333', color: 'white', borderRadius: '8px', transition: 'all 0.3s ease' }}
                  />
                </div>
                <div>
                  <label className="block text-white text-xs mb-1" htmlFor="duration-days">Duration (Days)</label>
                  <input 
                    type="number" 
                    id="duration-days" 
                    className="w-full p-2 text-white text-sm" 
                    min="1" 
                    required
                    value={durationDays}
                    onChange={(e) => setDurationDays(parseInt(e.target.value))}
                    style={{ backgroundColor: '#111111', border: '1px solid #333333', color: 'white', borderRadius: '8px', transition: 'all 0.3s ease' }}
                  />
                </div>
                <div>
                  <label className="block text-white text-xs mb-1" htmlFor="sensitivity">Sensitivity (0.01-1.0)</label>
                  <input 
                    type="number" 
                    id="sensitivity" 
                    className="w-full p-2 text-white text-sm" 
                    min="0.01" 
                    max="1" 
                    step="0.01" 
                    required
                    value={sensitivity}
                    onChange={(e) => setSensitivity(parseFloat(e.target.value))}
                    style={{ backgroundColor: '#111111', border: '1px solid #333333', color: 'white', borderRadius: '8px', transition: 'all 0.3s ease' }}
                  />
                </div>
              </div>
            </div>
            
            {/* Image Upload Card */}
            <div className="card p-3" style={{ borderRadius: '16px', background: '#111111', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', transition: 'all 0.3s ease' }}>
              <h2 className="text-base font-semibold text-white mb-2">Product Image</h2>
              <div className="space-y-4">
                <div className="image-preview h-40 flex items-center justify-center mb-3" style={{ borderRadius: '12px', overflow: 'hidden', border: '1px dashed #333333', backgroundColor: '#111111' }}>
                  {previewImage && !showPlaceholder ? (
                    <img 
                      src={previewImage} 
                      alt="Preview Image" 
                      className="h-full w-full object-cover" 
                    />
                  ) : (
                    <div className="text-white text-center p-2">
                      <i className="ri-image-add-line text-3xl mb-1"></i>
                      <p className="text-sm">Click to upload product image</p>
                    </div>
                  )}
                </div>
                <div className="flex space-x-2">
                  <div className="flex-1">
                    <label className="block text-white text-xs mb-1" htmlFor="product-image-upload">Upload Image</label>
                    <input 
                      type="file" 
                      id="product-image-upload" 
                      accept="image/*" 
                      className="w-full p-1 text-white text-xs bg-gray-800 rounded cursor-pointer"
                      onChange={handleImageUpload}
                      ref={fileInputRef}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-white text-xs mb-1" htmlFor="product-image">Select Example</label>
                    <select 
                      id="product-image" 
                      className="w-full p-2 text-white text-sm"
                      onChange={handleExampleImageChange}
                      ref={selectRef}
                      style={{ backgroundColor: '#111111', border: '1px solid #333333', color: 'white', borderRadius: '8px', transition: 'all 0.3s ease' }}
                    >
                      <option value="">Select Example Image</option>
                      <option value="https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1587&q=80">Limited Edition Sneakers 1</option>
                      <option value="https://images.unsplash.com/photo-1552346154-21d32810aba3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80">Limited Edition Sneakers 2</option>
                      <option value="https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1925&q=80">Limited Edition Sneakers 3</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Save Button */}
            <button 
              type="submit" 
              className="btn-primary w-full py-3 rounded-xl font-bold text-black text-sm"
              style={{ background: 'linear-gradient(135deg, #ccff00, #09fbd3)', transition: 'all 0.3s ease', color: 'black' }}
            >
              Save Product
            </button>
            
            {/* View Product List Link */}
            <div className="text-center mt-2">
              <Link 
                to="/product-list" 
                className="text-white hover:text-transparent text-xs"
                style={{
                  backgroundImage: 'linear-gradient(135deg, #ccff00, #09fbd3)',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  color: 'transparent'
                }}
              >
                View Product List
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddProduct;