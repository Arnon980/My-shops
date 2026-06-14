import React, { useState } from 'react';
import { X, Trash2, ShoppingCart, Ticket, ArrowRight, CornerDownRight } from 'lucide-react';
import { CartItem } from '../types';

const SPIN_COUPONS: { [key: string]: number } = {
  'BEAR10K': 10000,
  'BEAR7K': 7000,
  'BEAR5K': 5000,
  'BEAR3K': 3000,
  'BEAR2K': 2000,
};

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onCheckout: (appliedDiscount: number, couponCode: string) => void;
  preappliedDiscount?: number;
  preappliedCode?: string;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
  preappliedDiscount = 0,
  preappliedCode = '',
}) => {
  const [coupon, setCoupon] = React.useState('');
  const [couponApplied, setCouponApplied] = React.useState(false);
  const [couponError, setCouponError] = React.useState('');

  // Automatically apply preapplied coupon when passed down
  React.useEffect(() => {
    if (preappliedCode && preappliedDiscount > 0) {
      setCoupon(preappliedCode);
      setCouponApplied(true);
    }
  }, [preappliedCode, preappliedDiscount]);

  if (!isOpen) return null;

  const formatKip = (price: number) => {
    return price.toLocaleString('en-US') + ' ກີບ';
  };

  const getSubtotal = () => {
    return cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  };

  const getDiscount = () => {
    const code = coupon.trim().toUpperCase();
    if (couponApplied) {
      if (code === 'LAO2026') {
        return getSubtotal() >= 200000 ? 50000 : 0;
      }
      if (SPIN_COUPONS[code] !== undefined) {
        return SPIN_COUPONS[code];
      }
    }
    return 0;
  };

  const handleApplyCoupon = () => {
    setCouponError('');
    const code = coupon.trim().toUpperCase();
    if (code === 'LAO2026') {
      if (getSubtotal() < 200000) {
        setCouponError('ຍອດສັ່ງຊື້ຕ້ອງຮອດ 200,000 ກີບ ຂຶ້ນໄປຈຶ່ງໃຊ້ຄູປອງນີ້ໄດ້');
        return;
      }
      setCouponApplied(true);
    } else if (SPIN_COUPONS[code] !== undefined) {
      setCouponApplied(true);
    } else {
      setCouponError('ລະຫັດຄູປອງບໍ່ຖືກຕ້ອງ!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Cart Container */}
      <div 
        className="relative w-full max-w-md bg-white h-full flex flex-col shadow-2xl border-l border-slate-100 z-10 animate-slide-left"
        id="cart-drawer-container"
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-2">
            <ShoppingCart size={20} className="text-rose-400" />
            <span className="font-bold text-lg font-sans">ກະຕ່າສິນຄ້າຂອງທ່ານ</span>
            <span className="bg-rose-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {cartItems.reduce((acc, i) => acc + i.quantity, 0)}
            </span>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer"
            id="close-cart-drawer"
            title="ປິດ"
          >
            <X size={20} />
          </button>
        </div>

        {/* Cart items list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-4 animate-bounce">
                <ShoppingCart size={28} />
              </div>
              <p className="text-slate-700 font-semibold mb-1">ກະຕ່າຂອງທານຍັງຫວ່າງເປົ່າ</p>
              <p className="text-xs text-slate-400 max-w-xs">ເລືອກເບິ່ງສິນຄ້າທີ່ໜ້າສົນໃຈໃນຮ້ານຄ້ານຳພວກເຮົາ ແລ້ວເພີ່ມລົງໃນກະຕ່າຂອງທ່ານ!</p>
              <button
                onClick={onClose}
                className="mt-6 px-5 py-2 bg-slate-900 hover:bg-rose-600 text-white font-medium text-xs rounded-xl transition-all shadow-sm"
              >
                ກັບໄປໜ້າຮ້ານ
              </button>
            </div>
          ) : (
            cartItems.map((item) => (
              <div 
                key={item.product.id}
                className="flex gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100/50 hover:bg-slate-100/30 transition-all group relative"
                id={`cart-item-${item.product.id}`}
              >
                {/* Thumb */}
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-white border border-slate-100 flex-shrink-0">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 flex flex-col justify-between min-w-0">
                  <div>
                    <h4 className="text-xs font-semibold text-slate-800 line-clamp-1 mb-0.5">
                      {item.product.name}
                    </h4>
                    <span className="text-[10px] text-slate-400 uppercase font-bold">
                      {item.product.brand}
                    </span>
                  </div>

                  {/* Quantity Actions */}
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center border border-slate-200 bg-white rounded-lg overflow-hidden">
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                        className="px-2 py-0.5 text-slate-500 hover:bg-slate-50 text-xs font-bold"
                      >
                        -
                      </button>
                      <span className="px-2 text-slate-700 text-xs font-bold min-w-5 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                        className="px-2 py-0.5 text-slate-500 hover:bg-slate-50 text-xs font-bold"
                      >
                        +
                      </button>
                    </div>

                    <span className="text-xs font-bold text-slate-800">
                      {formatKip(item.product.price * item.quantity)}
                    </span>
                  </div>
                </div>

                {/* Delete Button */}
                <button
                  onClick={() => onRemoveItem(item.product.id)}
                  className="absolute top-2 right-2 p-1 text-slate-300 hover:text-rose-500 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                  title="ລົບ"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Bottom Panel */}
        {cartItems.length > 0 && (
          <div className="p-4 border-t border-slate-100 bg-slate-50 space-y-4">
            {/* Promo code entry */}
            <div className="space-y-1.5" id="cart-promo-container">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Ticket size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="ໃສ່ຄູປອງ (ເຊັ່ນ: LAO2026)"
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value)}
                    disabled={couponApplied}
                    className="w-full text-xs pl-9 pr-3 py-2 border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-rose-500 disabled:bg-slate-100/50 disabled:text-slate-400 font-medium uppercase"
                  />
                </div>
                <button
                  onClick={handleApplyCoupon}
                  disabled={couponApplied || !coupon}
                  className="px-3 py-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  {couponApplied ? 'ໃຊ້ແລ້ວ' : 'ຢືນຢັນ'}
                </button>
              </div>

              {couponApplied && (
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 font-semibold bg-emerald-50 px-2.5 py-1 rounded-lg">
                  <CornerDownRight size={12} />
                  <span>
                    {coupon.trim().toUpperCase() === 'LAO2026'
                      ? 'ຄູປອງສຳເລັດແລ້ວ: ຫຼຸດເພີ່ມ 50,000 ກີບ (ຍອດຊື້ຄົບ 200K)'
                      : `ຄູປອງວົງລໍ້ສຳເລັດແລ້ວ: ຫຼຸດເພີ່ມ ${formatKip(getDiscount())}`}
                  </span>
                </div>
              )}

              {couponError && (
                <p className="text-[10px] text-rose-500 font-medium pl-1">{couponError}</p>
              )}
            </div>

            {/* Calculations summaries */}
            <div className="space-y-2 border-t border-slate-100 pt-3">
              <div className="flex justify-between text-xs text-slate-600">
                <span>ຄ່າສິນຄ້າລວມ (Subtotal)</span>
                <span className="font-semibold text-slate-800">{formatKip(getSubtotal())}</span>
              </div>
              {couponApplied && (
                <div className="flex justify-between text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                  <span>
                    {coupon.trim().toUpperCase() === 'LAO2026'
                      ? 'ສ່ວນຫຼຸດຄູປອງ (Coupon LAO2026)'
                      : `ສ່ວນຫຼຸດວົງລໍ້ເສດຖີ (${coupon.trim().toUpperCase()})`}
                  </span>
                  <span className="font-bold">- {formatKip(getDiscount())}</span>
                </div>
              )}
              <div className="flex justify-between text-xs text-slate-600">
                <span>ຄ່າຂົນສົ່ງ (Delivery)</span>
                <span className="text-slate-500 text-[11px] font-medium italic">ຄິດໄລ່ຕາມບໍລິສັດຂົນສົ່ງ</span>
              </div>
              
              <div className="flex justify-between items-end border-t border-slate-200 pt-2.5">
                <span className="text-sm font-bold text-slate-800">ຍອດລວມທັງໝົດ (Total)</span>
                <span className="text-lg font-black text-rose-600">
                  {formatKip(Math.max(0, getSubtotal() - getDiscount()))}
                </span>
              </div>
            </div>

            {/* Checkout Action Button */}
            <button
              onClick={() => onCheckout(getDiscount(), couponApplied ? 'LAO2026' : '')}
              className="w-full flex items-center justify-center gap-2 py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-2xl shadow-lg shadow-rose-200 hover:shadow-xl hover:translate-y-[-1px] active:translate-y-[1px] transition-all cursor-pointer font-sans text-sm"
              id="proceed-checkout-btn"
            >
              <span>ດຳເນີນການສັ່ງຊື້</span>
              <ArrowRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
