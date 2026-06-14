import React, { useState } from 'react';
import { X, ShoppingBag, Check, ShieldAlert, Heart, Truck } from 'lucide-react';
import { Product } from '../types';

interface ProductDetailsModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
}

export const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({
  product,
  isOpen,
  onClose,
  onAddToCart,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [isWished, setIsWished] = useState(false);
  const [showAddedAlert, setShowAddedAlert] = useState(false);

  if (!isOpen || !product) return null;

  const formatKip = (price: number) => {
    return price.toLocaleString('en-US') + ' ກີບ';
  };

  const handleAddToCart = () => {
    onAddToCart(product, quantity);
    setShowAddedAlert(true);
    setTimeout(() => {
      setShowAddedAlert(false);
      onClose();
    }, 1500);
  };

  // Extract list of options (e.g. from comma-separated string)
  const optionsList = product.options 
    ? product.options.split(': ')[1]?.split(', ') || [] 
    : [];
  const optionTitle = product.options ? product.options.split(': ')[0] : 'ຕົວເລືອກ';

  // Set default option if empty state
  if (optionsList.length > 0 && !selectedOption) {
    setSelectedOption(optionsList[0]);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div 
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative border border-slate-100 flex flex-col md:flex-row"
        id="product-details-modal"
      >
        {/* Close Button Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-white/80 hover:bg-white text-slate-700 rounded-full shadow-md hover:shadow-lg transition-all border border-slate-100 focus:outline-none"
          id="close-details-modal"
          title="ປິດ"
        >
          <X size={20} />
        </button>

        {/* Product Images Side */}
        <div className="md:w-1/2 relative bg-slate-50 flex items-center justify-center p-4">
          <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5 items-start">
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="px-2.5 py-1 text-[10px] font-black uppercase text-white bg-gradient-to-r from-red-600 to-amber-500 rounded-xl shadow-md flex items-center gap-1 animate-pulse">
                <span>🔥 HOT</span>
                <span>-{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%</span>
              </span>
            )}
            {product.badge && (
              <span className="px-2.5 py-1 text-[10px] font-black text-rose-600 bg-rose-50 rounded-xl shadow-2xs border border-rose-100">
                {product.badge}
              </span>
            )}
          </div>
          <img
            src={product.image}
            alt={product.name}
            referrerPolicy="no-referrer"
            className="w-full aspect-square object-cover rounded-2xl shadow-xs"
          />
        </div>

        {/* Product Details Side */}
        <div className="md:w-1/2 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold text-rose-600 uppercase bg-rose-50 px-2 py-0.5 rounded-md">
                {product.brand}
              </span>
              <span className="text-xs text-slate-400">|</span>
              <span className="text-xs text-slate-500 font-medium">
                {product.category === 'electronics' ? 'ເຄື່ອງອີເລັກໂທຣນິກ' : 
                 product.category === 'fashion' ? 'ເສື້ອຜ້າ & ແຟຊັ່ນ' : 
                 product.category === 'cosmetics' ? 'ຄວາມງາມ & ເຄື່ອງສຳອາງ' : 
                 product.category === 'sports' ? 'ອຸປະກອນກິລາ' : 'ເຄື່ອງໃຊ້ໃນເຮືອນ'}
              </span>
            </div>

            <h2 className="text-xl font-bold text-slate-900 mb-2 leading-snug">
              {product.name}
            </h2>

            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-2xl font-black text-rose-600">
                {formatKip(product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-sm text-slate-400 line-through">
                  {formatKip(product.originalPrice)}
                </span>
              )}
            </div>

            <p className="text-sm text-slate-600 mb-5 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100/50">
              {product.description || 'ບໍ່ມີຄຳອະທິບາຍສິນຄ້າ.'}
            </p>

            {/* Options Selector */}
            {optionsList.length > 0 && (
              <div className="mb-5">
                <span className="block text-xs font-bold text-slate-700 uppercase mb-2">
                  ເລືອກ {optionTitle}
                </span>
                <div className="flex flex-wrap gap-2">
                  {optionsList.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setSelectedOption(opt)}
                      className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                        selectedOption === opt
                          ? 'border-rose-500 bg-rose-50 text-rose-700 font-semibold'
                          : 'border-slate-200 hover:border-slate-300 text-slate-600'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="mb-6">
              <span className="block text-xs font-bold text-slate-700 uppercase mb-2">
                ຈຳນວນທີ່ຕ້ອງການ
              </span>
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3.5 py-2 text-slate-600 hover:bg-slate-50 transition-colors font-bold"
                  >
                    -
                  </button>
                  <span className="px-4 py-2 text-slate-800 font-bold min-w-10 text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3.5 py-2 text-slate-600 hover:bg-slate-50 transition-colors font-bold"
                  >
                    +
                  </button>
                </div>
                {product.countSold && (
                  <span className="text-xs text-slate-400">
                    ({product.countSold})
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Delivery Note & Actions */}
          <div className="mt-auto border-t border-slate-100 pt-4">
            <div className="flex items-center gap-2 mb-4 text-xs text-teal-600 bg-teal-50 p-2.5 rounded-xl border border-teal-100">
              <Truck size={14} />
              <span>ພ້ອມສົ່ງທົ່ວປະເທດຜ່ານລະບົບຂົນສົ່ງ HAL, Anousith, Mixay</span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleAddToCart}
                disabled={showAddedAlert}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold font-sans text-sm shadow-md cursor-pointer transition-all ${
                  showAddedAlert
                    ? 'bg-emerald-500 text-white shadow-emerald-200'
                    : 'bg-rose-600 text-white hover:bg-rose-500 shadow-rose-200'
                }`}
                id="add-to-cart-confirm"
              >
                {showAddedAlert ? (
                  <>
                    <Check size={18} />
                    <span>ເພີ່ມສຳເລັດແລ້ວ!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag size={18} />
                    <span>ເພີ່ມລົງໃນກະຕ່າ</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setIsWished(!isWished)}
                className={`p-3 rounded-xl border transition-all ${
                  isWished 
                    ? 'border-rose-200 bg-rose-50 text-rose-500' 
                    : 'border-slate-200 text-slate-400 hover:text-slate-600'
                }`}
                title="ຖືກໃຈ"
              >
                <Heart size={18} fill={isWished ? 'currentColor' : 'none'} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
