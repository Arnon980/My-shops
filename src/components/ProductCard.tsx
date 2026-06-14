import React from 'react';
import { ShoppingCart, Eye, Star } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onViewDetails: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onViewDetails,
}) => {
  // Format price with thousands separators
  const formatKip = (price: number) => {
    return price.toLocaleString('en-US') + ' ກີບ';
  };

  return (
    <div 
      className="group bg-white rounded-2xl overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 border border-slate-100 flex flex-col h-full relative"
      id={`product-card-${product.id}`}
    >
      {/* Badges/Tags */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 items-start">
        {product.originalPrice && product.originalPrice > product.price && (
          <span 
            className="px-2.5 py-1 text-[10px] font-black uppercase text-white bg-gradient-to-r from-red-600 to-amber-500 rounded-xl shadow-md flex items-center gap-1 animate-pulse"
            id={`discount-badge-${product.id}`}
          >
            <span>🔥 HOT</span>
            <span>-{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%</span>
          </span>
        )}
        {product.badge && (
          <span 
            className="px-2.5 py-1 text-[10px] font-black text-rose-600 bg-rose-50 rounded-xl shadow-2xs border border-rose-100"
            id={`product-badge-${product.id}`}
          >
            {product.badge}
          </span>
        )}
      </div>
      
      {/* Product Image Gallery Wrapper */}
      <div className="relative pt-[100%] bg-slate-50 overflow-hidden cursor-pointer" onClick={() => onViewDetails(product)}>
        <img
          src={product.image}
          alt={product.name}
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(product);
            }}
            className="p-2 bg-white text-slate-800 rounded-full hover:bg-slate-100 transition-colors shadow-sm"
            title="ເບິ່ງລາຍລະອຽດ"
            id={`view-btn-${product.id}`}
          >
            <Eye size={18} />
          </button>
        </div>
      </div>

      {/* Product Details */}
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex items-center gap-1.5 mb-1.5">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 bg-slate-100 px-2 py-0.5 rounded-sm">
            {product.brand}
          </span>
          {product.countSold && (
            <span className="text-xs text-slate-500 inline-block ml-auto">
              {product.countSold}
            </span>
          )}
        </div>

        <h3 
          className="font-medium text-slate-800 text-sm line-clamp-2 mb-2 group-hover:text-amber-600 transition-colors cursor-pointer min-h-[40px]"
          onClick={() => onViewDetails(product)}
        >
          {product.name}
        </h3>

        {/* Rating Star representation */}
        <div className="flex items-center gap-1 mb-3">
          <div className="flex text-amber-400">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={13} fill="currentColor" />
            ))}
          </div>
          <span className="text-xs text-slate-400">(4.9)</span>
        </div>

        {/* Pricing & Add Button */}
        <div className="mt-auto pt-3 border-t border-slate-50 flex items-end justify-between">
          <div className="flex flex-col">
            {product.originalPrice && (
              <span className="text-xs text-slate-400 line-through mb-0.5">
                {formatKip(product.originalPrice)}
              </span>
            )}
            <span className="text-base font-bold text-slate-900 group-hover:text-rose-600 transition-colors">
              {formatKip(product.price)}
            </span>
          </div>

          <button
            onClick={() => onAddToCart(product)}
            className="p-2 rounded-xl bg-slate-900 text-white hover:bg-rose-500 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
            id={`add-to-cart-btn-${product.id}`}
            title="ເພີ່ມລົງຕູ້"
          >
            <ShoppingCart size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
