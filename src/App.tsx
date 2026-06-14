import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  ShoppingCart, 
  Search, 
  SearchCode, 
  User, 
  Sparkles, 
  Heart, 
  HelpCircle, 
  Phone, 
  ChevronDown, 
  SlidersHorizontal,
  LayoutGrid, 
  Smartphone, 
  Shirt, 
  Home,
  Clock,
  ArrowRight,
  X,
  Gift,
  Dumbbell
} from 'lucide-react';

import { Product, CartItem, Order } from './types';
import { PRODUCTS, CATEGORIES } from './data';
import { ProductCard } from './components/ProductCard';
import { ProductDetailsModal } from './components/ProductDetailsModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderReceipt } from './components/OrderReceipt';
import { PromoBanner } from './components/PromoBanner';
import { LuckyWheelModal } from './components/LuckyWheelModal';
import { LuckyGiftWheelModal } from './components/LuckyGiftWheelModal';

const whiteBearLogo = "/src/assets/images/white_bear_logo_1781370129813.jpg";

export default function App() {
  // Navigation & Catalog Filters states
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('default');

  // Shopping Cart & Order list states
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);

  // Modals controllers
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isLuckyWheelOpen, setIsLuckyWheelOpen] = useState(false);
  const [isLuckyGiftWheelOpen, setIsLuckyGiftWheelOpen] = useState(false);
  const [wonFreeGift, setWonFreeGift] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [couponCode, setCouponCode] = useState('');

  // Interactive Personal Order Tracking lookups states
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [trackPhone, setTrackPhone] = useState('');
  const [foundOrders, setFoundOrders] = useState<Order[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  // Load and Save to local storage for realistic state caching
  useEffect(() => {
    const cachedCart = localStorage.getItem('hanekhaipheng_cart');
    const cachedOrders = localStorage.getItem('hanekhaipheng_orders');
    if (cachedCart) {
      try {
        setCart(JSON.parse(cachedCart));
      } catch (err) {
        console.error('Error loading cart', err);
      }
    }
    if (cachedOrders) {
      try {
        setOrders(JSON.parse(cachedOrders));
      } catch (err) {
        console.error('Error loading orders', err);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('hanekhaipheng_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('hanekhaipheng_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    if (isCheckoutOpen) {
      const storedUser = localStorage.getItem('hanekhaipheng_registered_user');
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          if (parsed && parsed.phone) {
            const storedGift = localStorage.getItem(`hanekhaipheng_won_free_gift_${parsed.phone}`);
            if (storedGift) {
              const parsedGift = JSON.parse(storedGift);
              if (parsedGift && parsedGift.isPrize) {
                setWonFreeGift(parsedGift.label);
                return;
              }
            }
          }
        } catch (e) {
          console.error(e);
        }
      }
      setWonFreeGift('');
    }
  }, [isCheckoutOpen]);

  // Utility formatter
  const formatKip = (price: number) => {
    return price.toLocaleString('en-US') + ' ກີບ';
  };

  // Add Item to Shopping Cart
  const handleAddToCart = (product: Product, quantity: number = 1) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.product.id === product.id);
      if (existing) {
        return prevCart.map((item) =>
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + quantity } 
            : item
        );
      }
      return [...prevCart, { product, quantity }];
    });
  };

  // Edit quantity directly inside shopping cart
  const handleUpdateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveCartItem(productId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  // Delete product from shopping cart
  const handleRemoveCartItem = (productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.product.id !== productId));
  };

  // Open Details Modal triggers
  const handleViewDetails = (product: Product) => {
    setSelectedProduct(product);
    setIsDetailsOpen(true);
  };

  // Trigger Checkout Transition with discounts applied
  const handleProceedToCheckout = (discount: number, code: string) => {
    setAppliedDiscount(discount);
    setCouponCode(code);
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  // Create Order process
  const handleSubmitNewOrder = (orderData: Partial<Order>) => {
    const fullOrder: Order = {
      id: 'LM' + Math.floor(100000 + Math.random() * 900000),
      date: new Date().toLocaleDateString('lo-LA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }) + ' ' + new Date().toLocaleTimeString('lo-LA', { hour: '2-digit', minute: '2-digit' }),
      status: 'pending',
      ...orderData,
    } as Order;

    setOrders((prev) => [fullOrder, ...prev]);
    setActiveOrder(fullOrder);
    setCart([]); // Clear shopping cart
    setIsCheckoutOpen(false);
  };

  // Personal orders tracking scanner
  const handleTrackPhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setHasSearched(true);
    if (!trackPhone) return;

    // Filter local storage database matching input phone sequence
    const filtered = orders.filter(
      (ord) => ord.customerPhone.trim().replace(/\s+/g, '').includes(trackPhone.trim().replace(/\s+/g, ''))
    );
    setFoundOrders(filtered);
  };

  // Filter & Sort core process
  const filteredProducts = PRODUCTS.filter((product) => {
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
    return 0; // default (no sorting change)
  });

  // Helpers to get static mapping categories icons
  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'LayoutGrid': return <LayoutGrid size={18} />;
      case 'Smartphone': return <Smartphone size={18} />;
      case 'Shirt': return <Shirt size={18} />;
      case 'Sparkles': return <Sparkles size={18} />;
      case 'Home': return <Home size={18} />;
      case 'Dumbbell': return <Dumbbell size={18} />;
      default: return <LayoutGrid size={18} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans relative" id="market-root">
      
      {/* 1. Global Announcement Ticker */}
      <div className="bg-slate-900 border-b border-slate-850 px-4 py-1.5 text-center text-white text-[11px] font-bold tracking-normal flex items-center justify-center gap-2">
        <span className="inline-block bg-rose-500 text-white uppercase text-[8px] font-stone px-1.5 py-0.5 rounded-sm animate-pulse">
          HOT DEALS
        </span>
        <span>ຫຼຸດລາຄາສິນຄ້າທຸກຊະນິດ ສູງສຸດ 70% ພ້ອມສົ່ງດ່ວນຜ່ານ HAL & Anousith ທົ່ວປະເທດ!</span>
      </div>

      {/* 2. Primary Navigation Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* Brand Logo */}
          <div 
            className="flex items-center gap-2 cursor-pointer" 
            onClick={() => {
              setActiveOrder(null);
              setSelectedCategory('all');
              setSearchQuery('');
            }}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden shadow-md shadow-slate-200 border border-slate-100 bg-white">
              <img 
                src={whiteBearLogo} 
                alt="ຮ້านຂາຍແພງ Logo" 
                className="w-full h-full object-cover animate-fade-in"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-base font-black text-slate-900 flex items-center leading-none font-sans">
                ຮ້ານຂາຍແພງ
              </h1>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                premium marketplace
              </span>
            </div>
          </div>

          {/* Core Search Filter Bar */}
          <div className="flex-1 max-w-md relative">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
              <Search size={16} />
            </div>
            <input
              type="text"
              placeholder="ຄົ້ນຫາສິນຄ້າ, ຍີ່ຫໍ້, ລາຍລະອຽດ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-10 pr-4 py-2.5 bg-slate-100 focus:bg-white border border-transparent focus:border-slate-300 rounded-2xl focus:outline-none transition-all placeholder:text-slate-400 text-slate-800 font-medium"
            />
          </div>

          {/* Action Trigger Handlers */}
          <div className="flex items-center gap-3">
            {/* Order Tracking Button */}
            <button
              onClick={() => {
                setIsTrackingOpen(true);
                setHasSearched(false);
                setTrackPhone('');
                setFoundOrders([]);
              }}
              className="hidden md:flex items-center gap-1.5 px-3.5 py-2 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl border border-slate-100/80 transition-all cursor-pointer"
              id="track-order-button"
            >
              <Clock size={15} className="text-rose-500" />
              <span>ຕິດຕາມອໍເດີ</span>
            </button>

            {/* Spinning Wheel Coupon Widget Trigger Button */}
            <button
              onClick={() => setIsLuckyWheelOpen(true)}
              className="hidden lg:flex items-center gap-1.5 px-3.5 py-2 bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-600 text-xs font-black rounded-xl cursor-pointer transition-all hover:scale-[1.03] active:scale-[0.97]"
              id="lucky-wheel-nav-trigger"
            >
              <Sparkles size={14} className="text-amber-500 animate-spin" style={{ animationDuration: '6s' }} />
              <span>ໝຸນວົງລໍ້ສ່ວນຫຼຸດ</span>
            </button>

            {/* Lucky Free Gift Wheel Trigger Button */}
            <button
              onClick={() => setIsLuckyGiftWheelOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-red-50 to-amber-50 border border-red-200 hover:from-red-100 hover:to-amber-100 text-red-650 text-xs font-black rounded-xl cursor-pointer transition-all hover:scale-[1.03] active:scale-[0.97]"
              id="lucky-gift-wheel-nav-trigger"
            >
              <Gift size={14} className="text-red-500 animate-bounce" />
              <span>ລຸ້ນຮັບຂອງຟຣີ 🎁</span>
            </button>

            {/* Shopping Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 bg-slate-900 text-white hover:bg-slate-850 hover:scale-105 active:scale-95 rounded-xl transition-all cursor-pointer shadow-md shadow-slate-900/10 flex items-center"
              id="header-cart-btn"
              title="ເປີດຕູ້ສິນຄ້າ"
            >
              <ShoppingCart size={18} />
              {cart.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white font-sans text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full animate-bounce">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* 3. Main Stage Content View */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Render Single Order Receipt Screen if requested */}
        {activeOrder ? (
          <div className="py-4">
            <OrderReceipt 
              order={activeOrder} 
              onNewOrder={() => setActiveOrder(null)} 
            />
          </div>
        ) : (
          /* Normal Catalog Shop Browsing Main Page */
          <>
            {/* Promo code highlight top banner */}
            <PromoBanner />

            {/* Interactive Category Horizontal Scroller Grid */}
            <div className="mb-8 overflow-x-auto pb-2 scrollbar-none" id="categories-container">
              <div className="flex gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-2xl border transition-all cursor-pointer whitespace-nowrap ${
                      selectedCategory === cat.id
                        ? 'bg-slate-900 text-white border-slate-900 shadow-md shadow-slate-950/10 scale-[1.02]'
                        : 'bg-white text-slate-600 border-slate-100 hover:border-slate-300 shadow-3xs'
                    }`}
                  >
                    <span className={selectedCategory === cat.id ? 'text-amber-400' : 'text-slate-400'}>
                      {getCategoryIcon(cat.icon)}
                    </span>
                    <span>{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Catalog Control Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6" id="catalog-controls">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                  <span>ລາຍການສິນຄ້າແນະນຳ</span>
                  <span className="text-xs bg-rose-50 border border-rose-100 text-rose-500 px-2 py-0.5 rounded-md font-bold">
                    {sortedProducts.length} ລາຍການ
                  </span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">ຫຼາກຫຼາຍສິນຄ້າຄຸນນະພາບສູງ ຮັບປະກັນຂອງແທ້ 100%</p>
              </div>

              {/* Sorting triggers */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold bg-white px-3 py-1.5 rounded-xl border border-slate-100">
                  <SlidersHorizontal size={14} />
                  <span>ຈັດລຽງຕາມ:</span>
                </div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-white border border-slate-100 hover:border-slate-300 text-xs font-semibold rounded-xl py-1.5 px-3 focus:outline-none cursor-pointer"
                >
                  <option value="default">ແນະນຳ (Default)</option>
                  <option value="price-asc">ລາຄາ: ຕ່ຳ ຫາ ສູງ</option>
                  <option value="price-desc">ລາຄາ: ສູງ ຫາ ຕ່ຳ</option>
                  <option value="name-asc">ຊື່ສິນຄ້າ: A-Z</option>
                </select>
              </div>
            </div>

            {/* Products grid display panel */}
            {sortedProducts.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-2xs max-w-md mx-auto my-12">
                <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 mx-auto mb-4">
                  <SearchCode size={28} />
                </div>
                <h3 className="font-bold text-slate-800 text-sm mb-1.5">ບໍ່ພົບສິນຄ້າທີ່ຄົ້ນຫາ</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  ພວກເຮົາບໍ່ພົບສິນຄ້າທີ່ກົງກັບຄຳຄົ້ນຫາ "{searchQuery}". ກະລຸນາລອງປ່ຽນຄຳຄົ້ນຫາ ຫຼື ເລືອກໝວດໝູ່ໃຫມ່.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                  }}
                  className="mt-6 px-4 py-2 bg-slate-900 text-white hover:bg-rose-500 text-xs font-bold rounded-xl transition-all shadow-md"
                >
                  ລ້າງການຄົ້ນຫາທັງໝົດ
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6" id="products-grid-catalog">
                {sortedProducts.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    onAddToCart={(prod) => handleAddToCart(prod, 1)}
                    onViewDetails={handleViewDetails}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* 4. Modular Interactive Drawers and Overlays */}
      
      {/* Product Details Drawer/Modal */}
      <ProductDetailsModal
        product={selectedProduct}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        onAddToCart={(p, qty) => handleAddToCart(p, qty)}
      />

      {/* Shopping Cart Slider Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cart}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onCheckout={handleProceedToCheckout}
        preappliedDiscount={appliedDiscount}
        preappliedCode={couponCode}
      />

      {/* Checkout Processing Overlay/Wizard */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cart}
        appliedDiscount={appliedDiscount}
        couponCode={couponCode}
        freeGift={wonFreeGift}
        onSubmitOrder={handleSubmitNewOrder}
      />

      {/* Lucky Spin Wheel Modal Overlay */}
      <LuckyWheelModal
        isOpen={isLuckyWheelOpen}
        onClose={() => setIsLuckyWheelOpen(false)}
        onApplyDiscount={(discount, promoCode) => {
          setAppliedDiscount(discount);
          setCouponCode(promoCode);
        }}
      />

      {/* Lucky Free Gift Wheel Modal Overlay */}
      <LuckyGiftWheelModal
        isOpen={isLuckyGiftWheelOpen}
        onClose={() => setIsLuckyGiftWheelOpen(false)}
      />

      {/* Order Tracker lookup Screen overlay popup modal */}
      {isTrackingOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl relative border border-slate-100 overflow-hidden" id="tracker-overlay-modal">
            {/* Header Control banner */}
            <div className="bg-slate-900 p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock size={18} className="text-rose-400" />
                <span className="font-bold text-sm block">ຕິດຕາມ ແລະ ກວດສອບອໍເດີ</span>
              </div>
              <button 
                onClick={() => setIsTrackingOpen(false)}
                className="p-1 hover:bg-slate-800 text-slate-350 rounded-lg transition-colors cursor-pointer"
                title="ປິດ"
              >
                <X size={18} />
              </button>
            </div>

            {/* Core tracking form */}
            <div className="p-6">
              <p className="text-xs text-slate-500 mb-4 leading-normal">
                ປ້ອນເບີໂທລະສັບທີ່ທ່ານໃຊ້ໃນການສັ່ງຊື້ສິນຄ້າ ເພື່ອຄົ້ນຫາປະຫວັດບິນ ແລະ ສະຖານະການຈັດສົ່ງຫຼ້າສຸດ.
              </p>

              <form onSubmit={handleTrackPhoneSubmit} className="flex gap-2 mb-6">
                <input
                  type="text"
                  required
                  placeholder="ໃສ່ເບີໂທລະສັບ (ເຊັ່ນ: 020...)"
                  value={trackPhone}
                  onChange={(e) => setTrackPhone(e.target.value)}
                  className="flex-1 text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  ຄົ້ນຫາບິນ
                </button>
              </form>

              {/* tracking results feedback list */}
              {hasSearched && (
                <div className="space-y-3">
                  <h4 className="text-[11px] uppercase tracking-wider font-extrabold text-slate-400">
                    ຜົນການຄົ້ນຫາ ({foundOrders.length} ບິນ)
                  </h4>
                  {foundOrders.length === 0 ? (
                    <div className="text-center py-4 text-slate-400 text-xs">
                      ໝາຍເລກນີ້ ຍັງບໍ່ທັນມີປະຫວັດການສັ່ງຊື້ເທື່ອ
                    </div>
                  ) : (
                    <div className="space-y-2.5 max-h-48 overflow-y-auto">
                      {foundOrders.map((ord) => (
                        <div 
                          key={ord.id} 
                          className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center justify-between cursor-pointer hover:border-slate-300 transition-colors"
                          onClick={() => {
                            setActiveOrder(ord);
                            setIsTrackingOpen(false);
                          }}
                        >
                          <div>
                            <span className="text-xs font-mono font-bold text-slate-800">#{ord.id}</span>
                            <span className="block text-[10px] text-slate-400">{ord.date}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-bold block text-rose-500">{formatKip(ord.total)}</span>
                            <span className="inline-block text-[9px] font-black uppercase text-white bg-slate-405 bg-emerald-500 px-1.5 py-0.5 rounded-md mt-0.5">
                              {ord.status === 'confirmed' ? 'ກວດສອບແລ້ວ' : 'ລໍຖ້າການຢືນຢັນ'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 5. Desktop-Precision Humid Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden bg-white border border-slate-700">
                <img 
                  src={whiteBearLogo} 
                  alt="ຮ້ານຂາຍແພງ Logo" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="font-black text-sm">ຮ້ານຂາຍແພງ</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-normal">
              ແພລັດຟອມຊື້-ຂາຍສິນຄ້າອອນໄລນ໌ຊັ້ນນຳ ແລະ ມີຄຸນນະພາບດີທີ່ສຸດສຳລັບຕະຫຼາດລາວ ເນັ້ນຄວາມປອດໄພ ແລະ ການຈັດສົ່ງທີ່ວ່ອງໄວ.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="text-white font-extrabold text-xs uppercase tracking-wider">ບໍລິສັດຂົນສົ່ງຮ່ວມງານ</h4>
            <ul className="space-y-1 text-slate-450 text-[11px]">
              <li>• ຂົນສົ່ງ ຮຸ່ງອາລຸນ (HAL Logistics)</li>
              <li>• ຂົນສົ່ງ ອານຸສິດ (Anousith Express)</li>
              <li>• ຂົນສົ່ງ ມີໄຊ (Mixay Express)</li>
              <li>• ຂົນສົ່ງ ຝາກຄິວລົດ ແລະ ອື່ນໆ</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="text-white font-extrabold text-xs uppercase tracking-wider">ຊ່ອງທາງການຊຳລະເງິນ</h4>
            <ul className="space-y-1 text-slate-450 text-[11px]">
              <li>• BCEL One (ໂອນຜ່ານຄິວອານ)</li>
              <li>• ໂອນຜ່ານທະນາຄານອື່ນໆ</li>
              <li>• ເກັບເງິນປາຍທາງ (COD)</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="text-white font-extrabold text-xs uppercase tracking-wider">ຕິດຕໍ່ສອບຖາມ</h4>
            <div className="text-[11px] text-slate-400 space-y-1">
              <p className="flex items-center gap-1.5">
                <Phone size={12} className="text-rose-500" />
                <span>WhatsApp: +856 20 9542 0929</span>
              </p>
              <p>📍 ນະຄອນຫຼວງວຽງຈັນ, ສປປ ລາວ</p>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-850 py-4 text-center text-slate-500 text-[10px]">
          <p>© 2026 ຮ້ານຂາຍແພງ Premium. All rights reserved. Designed and optimized for the Lao Commerce Ecosystem.</p>
        </div>
      </footer>

      {/* Floating Marketing Lucky Spin reward widgets */}
      <div className="fixed bottom-6 right-6 z-45 flex flex-col gap-3">
        {/* Floating Lucky Gift Wheel button */}
        <button
          onClick={() => setIsLuckyGiftWheelOpen(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white rounded-full pl-3 pr-4 py-3 shadow-2xl cursor-pointer select-none transition-all duration-300 hover:scale-[1.04] active:scale-95 group animate-pulse"
          id="floating-lucky-gift-wheel-btn"
        >
          <div className="w-8 h-8 rounded-full bg-yellow-405 bg-yellow-400 flex items-center justify-center text-red-650 font-bold shadow-sm">
            <Gift size={13} className="text-red-700 animate-bounce" />
          </div>
          <div className="text-left font-sans">
            <span className="block text-[8px] text-yellow-250 text-yellow-200 font-extrabold uppercase tracking-wider leading-none">
              Super Gift Draw!
            </span>
            <span className="block text-[11px] font-black text-white leading-none mt-1 shadow-xs flex items-center gap-1">
              <span>ລຸ້ນຮັບຂອງຟຣີ</span>
              <span>🎁</span>
            </span>
          </div>
        </button>

        {/* Coupon Discount Lucky Wheel Button */}
        <button
          onClick={() => setIsLuckyWheelOpen(true)}
          className="flex items-center gap-2 bg-slate-900 hover:bg-rose-600 border border-slate-800 text-white rounded-full pl-3 pr-4 py-3 shadow-2xl cursor-pointer select-none transition-all duration-300 hover:scale-[1.04] active:scale-95 group"
          id="floating-lucky-wheel-btn"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400 to-rose-500 flex items-center justify-center text-white font-bold animate-spin" style={{ animationDuration: '10s' }}>
            <Sparkles size={14} className="text-white" />
          </div>
          <div className="text-left font-sans">
            <span className="block text-[8px] text-amber-300 font-extrabold uppercase tracking-wider leading-none">
              Marketing Coupon!
            </span>
            <span className="block text-[11px] font-black text-white leading-none mt-1 shadow-xs flex items-center gap-1">
              <span>ໝຸນວົງລໍ້ຮັບສ່ວນຫຼຸດ</span>
              <span>🎡</span>
            </span>
          </div>
        </button>
      </div>
    </div>
  );
}
