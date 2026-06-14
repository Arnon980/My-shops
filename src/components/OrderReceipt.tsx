import React from 'react';
import { CheckCircle2, Ticket, Printer, RefreshCw, Landmark, Truck, ArrowRight, ShieldAlert } from 'lucide-react';
import { Order } from '../types';

interface OrderReceiptProps {
  order: Order;
  onNewOrder: () => void;
}

export const OrderReceipt: React.FC<OrderReceiptProps> = ({ order, onNewOrder }) => {
  const formatKip = (price: number) => {
    return price.toLocaleString('en-US') + ' ກີບ';
  };

  return (
    <div className="max-w-xl mx-auto bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden animate-scale-up">
      {/* Visual Header */}
      <div className="bg-gradient-to-br from-emerald-600 to-teal-500 text-white p-8 text-center relative overflow-hidden">
        {/* Background spheres */}
        <div className="absolute right-[-20px] top-[-20px] w-36 h-36 rounded-full bg-white/5" />
        <div className="absolute left-[-20px] bottom-[-20px] w-24 h-24 rounded-full bg-white/5" />

        <div className="inline-flex items-center justify-center p-3 bg-white/10 rounded-full mb-3 mb-2 animate-bounce">
          <CheckCircle2 size={32} className="text-white" />
        </div>
        <h2 className="text-2xl font-black mb-1 font-sans">ສັ່ງຊື້ສິນຄ້າສຳເລັດແລ້ວ!</h2>
        <p className="text-sm text-teal-50 opacity-90">ຂອບໃຈທີ່ເລືອກໃຊ້ບໍລິການ ຮ້ານຂາຍແພງ. ລະຫັດບິນຂອງທ່ານແມ່ນ:</p>
        <span className="inline-block mt-2 font-mono text-xs font-bold leading-none bg-emerald-700/60 text-white select-all px-3 py-1.5 rounded-full border border-white/15">
          #{order.id}
        </span>
      </div>

      {/* Progress Timeline */}
      <div className="p-6 border-b border-slate-100 bg-slate-50">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 text-center">
          ສະຖານະການຈັດສົ່ງຫຼ້າສຸດ
        </h3>
        <div className="flex items-center justify-between max-w-sm mx-auto">
          {[
            { label: 'ຮັບອໍເດີ', desc: 'Pending', active: true },
            { label: 'ກວດສອບສະລິບ', desc: 'Processing', active: order.status === 'confirmed' || order.status === 'processing' },
            { label: 'ພ້ອມສົ່ງເດີນທາງ', desc: 'On Way', active: false },
          ].map((step, idx) => (
            <div key={idx} className="flex flex-col items-center flex-1 relative last:flex-none">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                step.active 
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-100 ring-2 ring-emerald-500/20' 
                  : 'bg-slate-200 text-slate-500'
              }`}>
                {idx + 1}
              </div>
              <span className={`text-[11px] font-bold mt-2 ${step.active ? 'text-slate-800' : 'text-slate-400'}`}>
                {step.label}
              </span>
              <span className="text-[9px] text-slate-400">{step.desc}</span>
              
              {idx < 2 && (
                <div className={`absolute top-4 left-1/2 w-full h-[2px] -z-10 ${
                  order.status === 'confirmed' || (idx === 0 && (order.status === 'processing' || order.status === 'confirmed'))
                    ? 'bg-emerald-400' 
                    : 'bg-slate-200'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Content Details */}
      <div className="p-6 space-y-6">
        <div>
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-2">
            ລາຍລະອຽດຜູ້ຮັບ & ທີ່ຢູ່ຈັດສົ່ງ
          </h4>
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1.5 text-xs text-slate-700">
            <p><strong className="text-slate-900">ຊື່ຜູ້ຮັບ:</strong> {order.customerName}</p>
            <p><strong className="text-slate-900">ເບີຕິດຕໍ່ (WhatsApp):</strong> {order.customerPhone}</p>
            <p><strong className="text-slate-900">ທີ່ຢູ່ຈັດສົ່ງ:</strong> {order.address}</p>
            {order.notes && <p><strong className="text-slate-900">ໝາຍເຫດ:</strong> {order.notes}</p>}
            <p className="flex items-center gap-1 mt-2 text-rose-600 font-semibold bg-rose-50 px-2.5 py-1 rounded-lg w-max">
              <Truck size={12} />
              <span>ຂົນສົ່ງທີ່ເລືອກ: {order.paymentMethod === 'cash_on_delivery' ? 'COD - ' : ''}ສົ່ງຜ່ານບໍລິສັດ</span>
            </p>
          </div>
        </div>

        {/* Invoice Items details listing */}
        <div>
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-2">
            ລາຍການສິນຄ້າໃນບິນ
          </h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {order.items.map((item) => (
              <div key={item.product.id} className="flex justify-between items-center text-xs p-2.5 bg-slate-50 rounded-xl border border-slate-100/50">
                <div className="flex gap-2 items-center min-w-0">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    referrerPolicy="no-referrer"
                    className="w-8 h-8 rounded-md object-cover border"
                  />
                  <span className="font-medium text-slate-800 truncate max-w-[240px]">
                    {item.product.name} <strong className="text-slate-400">x{item.quantity}</strong>
                  </span>
                </div>
                <span className="font-semibold text-slate-800">
                  {formatKip(item.product.price * item.quantity)}
                </span>
              </div>
            ))}

            {/* Render Free Gift inside billing list */}
            {order.freeGift && (
              <div className="flex justify-between items-center text-xs p-2.5 bg-gradient-to-r from-amber-50 to-emerald-50 rounded-xl border border-amber-250">
                <div className="flex gap-2 items-center min-w-0">
                  <div className="w-8 h-8 bg-gradient-to-tr from-amber-400 to-emerald-400 rounded-md flex items-center justify-center text-white text-base">
                    🎁
                  </div>
                  <span className="font-black text-slate-800 truncate max-w-[240px] flex flex-col">
                    <span>{order.freeGift}</span>
                    <span className="text-[9px] text-emerald-600 font-bold leading-none mt-0.5">ຂອງແຖມວົງລໍ້ສ່ຽງໂຊກ</span>
                  </span>
                </div>
                <span className="font-black text-emerald-600">
                  ຟຣີ (0 ກີບ)
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Financial Recap Table */}
        <div className="border-t border-slate-100 pt-4 space-y-2 text-xs">
          <div className="flex justify-between text-slate-600">
            <span>ຄ່າສິນຄ້າລວມ (Subtotal)</span>
            <span>{formatKip(order.subtotal)}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md font-semibold">
              <span>ສ່ວນຫຼຸດຄູປອງ</span>
              <span>- {formatKip(order.discount)}</span>
            </div>
          )}
          <div className="flex justify-between text-slate-600">
            <span>ຄ່າບໍລິການຂົນສົ່ງ (Delivery)</span>
            <span className="italic text-slate-500">ເກັບເງິນປາຍທາງ</span>
          </div>
          <div className="flex justify-between items-baseline border-t border-slate-200 pt-3 font-sans">
            <span className="text-sm font-bold text-slate-900">ຍອດຊຳລະທັງໝົດ (Total Net)</span>
            <span className="text-lg font-black text-rose-600">{formatKip(order.total)}</span>
          </div>
          <div className="flex justify-between items-center border-t border-slate-100 pt-2 text-[10px] text-slate-400">
            <span>ຊຳລະຜ່ານ: {order.paymentMethod === 'bcel_one' ? 'ທະນາຄານ BCEL One' : 'ເກັບເງິນປາຍທາງ (COD)'}</span>
            <span>ວັນທີສັ່ງຊື້: {order.date}</span>
          </div>
        </div>

        {/* Call to Actions buttons */}
        <div className="flex gap-2 pt-2">
          <button
            onClick={() => window.print()}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-semibold rounded-xl bg-white transition-all"
            id="print-receipt-btn"
          >
            <Printer size={14} />
            <span>ພິມໃບບິນ</span>
          </button>
          
          <button
            onClick={onNewOrder}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
            id="back-to-shop-btn"
          >
            <span>ກັບໄປເລືອກຊື້ສິນຄ້າ</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
