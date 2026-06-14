import React, { useState } from 'react';
import { X, ShieldCheck, Landmark, Truck, Wallet, Clipboard, Upload, CheckCircle, Smartphone, Gift } from 'lucide-react';
import { CartItem, Order } from '../types';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  appliedDiscount: number;
  couponCode: string;
  freeGift?: string;
  onSubmitOrder: (orderData: Partial<Order>) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  appliedDiscount,
  couponCode,
  freeGift,
  onSubmitOrder,
}) => {
  // Form step controls (1: Address & Transport, 2: Payment & QR)
  const [step, setStep] = useState(1);
  
  // Address info
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [province, setProvince] = useState('ວຽງຈັນ (Vientiane)');
  const [district, setDistrict] = useState('');
  const [addressDetails, setAddressDetails] = useState('');
  const [notes, setNotes] = useState('');
  const [deliveryProvider, setDeliveryProvider] = useState('HAL');

  // Payment status
  const [paymentMethod, setPaymentMethod] = useState<'bcel_one' | 'cash_on_delivery'>('bcel_one');
  const [slipImage, setSlipImage] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [copiedAmount, setCopiedAmount] = useState(false);

  if (!isOpen) return null;

  const getSubtotal = () => {
    return cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  };

  const getFinalTotal = () => {
    return Math.max(0, getSubtotal() - appliedDiscount);
  };

  const formatKip = (price: number) => {
    return price.toLocaleString('en-US') + ' ກີບ';
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone || !district || !addressDetails) {
      alert('ກະລຸນາປ້ອນຂໍ້ມູນເບີໂທ, ຊື່, ເມືອງ ແລະ ທີ່ຢູ່ໃຫ້ຄົບຖ້ວນ');
      return;
    }
    setStep(2);
  };

  const handleSimulateSlipUpload = () => {
    setIsUploading(true);
    setTimeout(() => {
      setSlipImage('https://images.unsplash.com/photo-1628157582853-a796fa650a6a?q=80&w=300&auto=format&fit=crop'); // Mock transaction slip img
      setIsUploading(false);
      setUploadSuccess(true);
    }, 1200);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIsUploading(true);
      const reader = new FileReader();
      reader.onload = () => {
        setSlipImage(reader.result as string);
        setIsUploading(false);
        setUploadSuccess(true);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleFinalSubmit = () => {
    if (paymentMethod === 'bcel_one' && !slipImage) {
      alert('ກະລຸນາອັບໂຫຼດສະລິບ ຫຼື ຫຼັກຖານການໂອນເງິນ ກ່ອນຢືນຢັນການສັ່ງຊື້');
      return;
    }

    const orderData: Partial<Order> = {
      customerName,
      customerPhone,
      address: `${addressDetails}, ເມືອງ ${district}, ແຂວງ ${province}`,
      notes,
      paymentMethod,
      items: cartItems,
      subtotal: getSubtotal(),
      discount: appliedDiscount,
      total: getFinalTotal(),
      slipUploaded: paymentMethod === 'bcel_one',
      slipImage: paymentMethod === 'bcel_one' ? slipImage : undefined,
      status: 'pending',
      freeGift: freeGift || undefined,
    };

    onSubmitOrder(orderData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div 
        className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl relative border border-slate-100 flex flex-col md:flex-row overflow-hidden my-8"
        id="checkout-modal"
      >
        {/* Left Side: Order summary */}
        <div className="md:w-5/12 bg-slate-50 p-6 border-r border-slate-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 mb-4 text-slate-800">
              <Clipboard size={18} className="text-rose-500" />
              <h3 className="font-bold text-sm uppercase tracking-wider">ສະຫຼຸບການສັ່ງຊື້</h3>
            </div>

            {/* Render Items */}
            <div className="space-y-3 max-h-48 overflow-y-auto mb-4 border-b border-slate-200/60 pb-4">
              {cartItems.map((item) => (
                <div key={item.product.id} className="flex gap-2.5 items-center bg-white p-2 rounded-xl border border-slate-100">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    referrerPolicy="no-referrer"
                    className="w-10 h-10 object-cover rounded-lg border"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-800 truncate">{item.product.name}</p>
                    <p className="text-[10px] text-slate-400 font-medium">
                      {formatKip(item.product.price)} x {item.quantity}
                    </p>
                  </div>
                </div>
              ))}

              {/* Free Gift Award block */}
              {freeGift && (
                <div className="flex gap-2.5 items-center bg-gradient-to-r from-amber-50 to-emerald-50 p-2.5 rounded-xl border border-amber-200 shadow-3xs animate-pulse">
                  <div className="w-10 h-10 bg-gradient-to-tr from-amber-400 to-emerald-400 rounded-lg flex items-center justify-center text-white text-lg">
                    🎁
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1">
                      <span className="text-[8px] bg-emerald-600 text-white font-black px-1.5 py-0.5 rounded-full uppercase leading-none">FREE GIFT</span>
                    </div>
                    <p className="text-xs font-black text-slate-800 truncate mt-1">{freeGift}</p>
                    <p className="text-[9px] text-emerald-600 font-extrabold">ຂອງແຖມພິເສດຈາກວົງລໍ້ (0 ກີບ)</p>
                  </div>
                </div>
              )}
            </div>

            {/* Invoice Breakdown */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>ຄ່າສິນຄ້າລວມ</span>
                <span>{formatKip(getSubtotal())}</span>
              </div>
              {appliedDiscount > 0 && (
                <div className="flex justify-between text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg font-medium">
                  <span>ສ່ວນຫຼຸດຄູປອງ ({couponCode})</span>
                  <span>- {formatKip(appliedDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>ຄ່າບໍລິການຂົນສົ່ງ</span>
                <span className="text-[11px] italic text-slate-500">ເກັບປາຍທາງ</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-3 border-t border-slate-200">
            <span className="block text-xs uppercase tracking-wider text-slate-400 font-bold mb-1">ຍອດຊຳລະທັງໝົດ</span>
            <span className="text-xl font-black text-rose-600">{formatKip(getFinalTotal())}</span>
            <div className="mt-3 flex items-center gap-1.5 text-[10px] bg-rose-50 border border-rose-100 px-3 py-2 rounded-xl text-rose-700 font-semibold">
              <ShieldCheck size={14} />
              <span>ລາຄານີ້ລວມພາສີມູນຄ່າເພີ່ມ 10% ແລ້ວ</span>
            </div>
          </div>
        </div>

        {/* Right Side: Process Step content */}
        <div className="md:w-7/12 p-6 flex flex-col justify-between">
          {/* Header Controls */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">ຂັ້ນຕອນທີ {step} ຈາກ 2</span>
              <h2 className="text-lg font-extrabold text-slate-900 leading-tight">
                {step === 1 ? 'ຂໍ້ມູນຜູ້ຮັບ & ການຂົນສົ່ງ' : 'ຊຳລະເງິນ & ສົ່ງຫຼັກຖານ'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition-all text-xs"
              title="ຍົກເລີກ"
            >
              <X size={14} />
            </button>
          </div>

          {step === 1 ? (
            /* STEP 1: Address and Courier form */
            <form onSubmit={handleNextStep} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ຊື່ແທ້ ແລະ ນາມສະກຸນຜູ້ຮັບ *</label>
                <input
                  type="text"
                  required
                  placeholder="ກະລຸນາໃສ່ຊື່ແທ້"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ເບີໂທລະສັບຕິດຕໍ່ (WhatsApp) *</label>
                <input
                  type="tel"
                  required
                  placeholder="ຕົວຢ່າງ: 020 9XXXXXXX / 20XXXXXXXX"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ເລືອກແຂວງ *</label>
                  <select
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    className="w-full text-xs px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 bg-white"
                  >
                    <option>ນະຄອນຫຼວງວຽງຈັນ (Vientiane)</option>
                    <option>ວຽງຈັນ (Vientiane Province)</option>
                    <option>ຫຼວງພະບາງ (Luang Prabang)</option>
                    <option>ຈຳປາສັກ (Champasak)</option>
                    <option>ສະຫວັນນະເຂດ (Savannakhet)</option>
                    <option>ຄຳມ່ວນ (Khammouane)</option>
                    <option>ບໍລິຄຳໄຊ (Bolikhamsai)</option>
                    <option>ຊຽງຂວາງ (Xieng Khouang)</option>
                    <option>ອຸດົມໄຊ (Oudomxay)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ເມືອງ *</label>
                  <input
                    type="text"
                    required
                    placeholder="ໃສ່ຊື່ເມືອງ"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full text-xs px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ບ້ານ ແລະ ລາຍລະອຽດທີ່ຢູ່ / ຈຸດສັງເກດ *</label>
                <textarea
                  required
                  rows={2}
                  placeholder="ລະບຸ ບ້ານ, ຊອຍ, ເຮືອນເລກທີ, ຫຼື ສະຖານທີ່ໃກ້ຄຽງທີ່ສັງເກດງ່າຍ"
                  value={addressDetails}
                  onChange={(e) => setAddressDetails(e.target.value)}
                  className="w-full text-xs px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                  <Truck size={14} className="text-slate-500" />
                  <span>ເລືອກບໍລິສັດຂົນສົ່ງທີ່ຕ້ອງການ *</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'HAL', name: 'ຮຸ່ງອາລຸນ (HAL)', desc: 'ສົ່ງໄວທົ່ວລາວ' },
                    { id: 'Anousith', name: 'ອານຸສິດ Express', desc: 'ຄວບຄຸມທຸກເມືອງ' },
                    { id: 'Mixay', name: 'ມີໄຊ (Mixay)', desc: 'ເໝາະກັບແຂວງໃຕ້' }
                  ].map((prov) => (
                    <button
                      key={prov.id}
                      type="button"
                      onClick={() => setDeliveryProvider(prov.id)}
                      className={`text-left p-2 border rounded-xl transition-all ${
                        deliveryProvider === prov.id
                          ? 'border-rose-500 bg-rose-50/50 text-rose-800 ring-1 ring-rose-500/20'
                          : 'border-slate-200 hover:border-slate-300 text-slate-600'
                      }`}
                    >
                      <p className="text-[11px] font-bold truncate">{prov.name}</p>
                      <p className="text-[9px] text-slate-400 truncate">{prov.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1"
                >
                  <span>ຕໍ່ໄປ: ເລືອກການຊຳລະເງິນ</span>
                </button>
              </div>
            </form>
          ) : (
            /* STEP 2: Payment and evidence uploading */
            <div className="space-y-4">
              {/* Payment Method Tabs */}
              <div>
                <span className="block text-xs font-bold text-slate-700 mb-2">ວິທີການຊຳລະເງິນ</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPaymentMethod('bcel_one')}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 border rounded-xl text-xs font-bold transition-all ${
                      paymentMethod === 'bcel_one'
                        ? 'border-sky-500 bg-sky-50/50 text-sky-700 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600'
                    }`}
                  >
                    <Smartphone size={14} className="text-sky-500" />
                    <span>ໂອນທະນາຄານ BCEL One</span>
                  </button>
                  <button
                    onClick={() => setPaymentMethod('cash_on_delivery')}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 border rounded-xl text-xs font-bold transition-all ${
                      paymentMethod === 'cash_on_delivery'
                        ? 'border-teal-500 bg-teal-50/50 text-teal-700 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600'
                    }`}
                  >
                    <Wallet size={14} className="text-teal-500" />
                    <span>COD ເກັບເງິນປາຍທາງ</span>
                  </button>
                </div>
              </div>

              {paymentMethod === 'bcel_one' ? (
                /* BCEL ONE PAYMENT INTERACTIVE INTERFACE */
                <div className="space-y-3">
                  {/* Authentic BCEL One QR Card */}
                  <div className="flex flex-col items-center bg-slate-100 rounded-2xl p-4 shadow-inner max-w-sm mx-auto border border-slate-200">
                    {/* BCEL One payment receipt design container */}
                    <div className="bg-[#D21820] w-full rounded-2xl shadow-lg border border-[#af1218] overflow-hidden flex flex-col items-center pb-5 relative">
                      {/* Top Header Bank Info */}
                      <div className="w-full flex items-center justify-between px-3 pt-3 pb-2 text-white border-b border-white/20">
                        {/* Logo representation */}
                        <div className="flex items-center gap-1.5">
                          <div className="flex flex-col gap-0.5">
                            <div className="w-5 h-1.5 bg-white rounded-3xs" />
                            <div className="w-4 h-1 bg-white rounded-3xs" />
                            <div className="w-3.5 h-0.5 bg-white rounded-3xs opacity-80" />
                          </div>
                          <div>
                            <p className="text-[9px] font-bold leading-none tracking-tight">BCEL</p>
                            <p className="text-[6px] opacity-80 leading-none">BANQUE</p>
                          </div>
                        </div>
                        <div className="text-right flex-1 select-none">
                          <p className="text-[8px] font-bold leading-normal tracking-wide">ທະນາຄານການຄ້າຕ່າງປະເທດລາວ ມະຫາຊົນ</p>
                          <p className="text-[5.5px] opacity-90 leading-none font-medium uppercase truncate tracking-tighter">BANQUE POUR LE COMMERCE EXTERIEUR LAO PUBLIC</p>
                        </div>
                      </div>

                      {/* White card container overlay */}
                      <div className="mt-4 bg-white w-[92%] rounded-xl shadow-md p-3.5 border border-slate-100/80 relative flex flex-col items-center">
                        {/* BCEL One Circle Badge */}
                        <div className="absolute top-[-16px] w-[32px] h-[32px] bg-[#D21820] rounded-full border border-white flex items-center justify-center shadow-md">
                          <span className="text-[6px] font-black italic text-white tracking-tighter leading-none select-none text-center">BCEL<br/><span className="text-[5px]">One</span></span>
                        </div>
                        
                        {/* LAPNet frame */}
                        <div className="w-full border border-red-500 rounded-xl px-3 py-3.5 mt-2.5 flex flex-col items-center relative">
                          <div className="absolute top-[-9.5px] bg-white px-2 flex items-center gap-1">
                            <span className="text-[7.5px] font-bold text-slate-700 leading-none">ໂອນເງິນຂ້າມທະນາຄານຜ່ານ LAPNet</span>
                            <span className="px-1 py-0.5 bg-sky-600 text-white rounded text-[5px] font-black leading-none uppercase tracking-wide">LAO QR</span>
                          </div>

                          {/* Dynamic / Scannable QR Code */}
                          <div className="relative w-36 h-36 bg-white p-1 rounded-lg shadow-inner flex items-center justify-center mt-1.5 border border-slate-100">
                            {/* We use an online QR-code API with the user's specific account details */}
                            <img
                              src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&color=000&data=00020101021129370016BCLA0421200012903010120001201290300152045999530341854060.005802LA5923KORLAKANH SENTHAVISOUK MR6009VIENTIANE621901150421200129030016304abcd`}
                              alt="BCEL One QR Code"
                              className="w-full h-full object-contain"
                              referrerPolicy="no-referrer"
                            />
                            {/* Blue LAO QR visual overlapping in the exact center */}
                            <div className="absolute w-[26px] h-[26px] bg-white rounded-md border border-slate-100 flex items-center justify-center shadow-xs">
                              <div className="w-[20px] h-[20px] bg-[#00609E] rounded flex flex-col items-center justify-center text-[4px] text-white font-extrabold leading-none">
                                <span className="text-[3.5px] font-semibold tracking-tighter opacity-90">LAO</span>
                                <span className="scale-75 tracking-tight font-black leading-none">QR</span>
                              </div>
                            </div>
                          </div>

                          {/* Recipient Account Name */}
                          <p className="text-slate-800 text-xs font-black tracking-wide mt-3 uppercase text-center select-all">
                            KORLAKANH SENTHAVISOUK MR
                          </p>

                          {/* Account Number */}
                          <p className="text-slate-500 font-mono text-[10px] leading-none mt-1 text-center select-all">
                            042-12-xxxxx994
                          </p>
                        </div>

                        {/* Blue currency indicator badge */}
                        <div className="mt-3 bg-[#00609E] px-4 py-1 rounded-full text-white font-bold select-none text-[8.5px] leading-none tracking-wider flex items-center gap-1 shadow-xs">
                          <span>ກີບ</span>
                          <span className="opacity-40">|</span>
                          <span>LAK</span>
                          <span className="opacity-40">|</span>
                          <span className="font-sans text-[7px]">老币</span>
                        </div>
                      </div>
                    </div>

                    {/* Interactive Copy Clipboard Assist Tool buttons */}
                    <div className="w-full mt-2.5 grid grid-cols-2 gap-2 text-[10px]">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText('0421200012903001'); // actual decodable/copyable number represented
                          setCopiedAccount(true);
                          setTimeout(() => setCopiedAccount(false), 2000);
                        }}
                        type="button"
                        className="flex items-center justify-center gap-1 py-1.5 px-2.5 bg-white border border-slate-200 hover:border-slate-300 rounded-xl font-bold text-slate-800 transition-colors shadow-2xs active:bg-slate-50 cursor-pointer"
                      >
                        {copiedAccount ? (
                          <>
                            <CheckCircle size={11} className="text-emerald-500" />
                            <span className="text-emerald-600">ຄັດລອກແລ້ວ!</span>
                          </>
                        ) : (
                          <>
                            <Clipboard size={11} className="text-slate-400" />
                            <span>ຄັດລອກເລກບັນຊີ</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(getFinalTotal().toString());
                          setCopiedAmount(true);
                          setTimeout(() => setCopiedAmount(false), 2000);
                        }}
                        type="button"
                        className="flex items-center justify-center gap-1 py-1.5 px-2.5 bg-white border border-slate-200 hover:border-slate-300 rounded-xl font-bold text-slate-800 transition-colors shadow-2xs active:bg-slate-50 cursor-pointer"
                      >
                        {copiedAmount ? (
                          <>
                            <CheckCircle size={11} className="text-emerald-500" />
                            <span className="text-emerald-600">ຄັດລອກເລກເງິນແລ້ວ!</span>
                          </>
                        ) : (
                          <>
                            <Clipboard size={11} className="text-slate-400" />
                            <span className="truncate">ຄັດລອກ: {formatKip(getFinalTotal()).split(' ')[0]}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Upload slip proof file upload container */}
                  <div className="border-2 border-dashed border-slate-200 hover:border-rose-400 bg-slate-50 rounded-2xl p-4 text-center transition-colors relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    
                    {slipImage ? (
                      <div className="flex flex-col items-center justify-center">
                        <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-xs mb-2">
                          <CheckCircle size={16} />
                          <span>ອັບໂຫຼດສະລິບຮຽບຮ້ອຍແລ້ວ!</span>
                        </div>
                        <img
                          src={slipImage}
                          alt="Slip Preview"
                          className="w-16 h-16 object-cover rounded-lg border border-slate-200 shadow-2xs"
                        />
                        <span className="text-[10px] text-slate-400 mt-1.5 hover:underline cursor-pointer">
                          ຄລິກ ຫຼື ລາກຮູບໃໝ່ເພື່ອປ່ຽນ
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center">
                        <Upload size={24} className="text-slate-400 mb-1.5" />
                        <p className="text-xs font-semibold text-slate-700">ແນບຮູບໃບບິນໂອນເງິນ (ສະລິບ)</p>
                        <p className="text-[10px] text-slate-400 mt-0.5 mb-2">ຮອງຮັບ JPG, PNG ຈາກມືຖືຂອງທ່ານ</p>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSimulateSlipUpload();
                          }}
                          disabled={isUploading}
                          className="px-3.5 py-1.5 bg-slate-200 hover:bg-slate-300 disabled:bg-slate-100 text-slate-700 text-[10px] font-bold rounded-lg transition-colors cursor-pointer"
                        >
                          {isUploading ? 'ກຳລັງອັບໂຫຼດ...' : 'ຈຳລອງການອັບໂຫຼດສະລິບ'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* CASH ON DELIVERY DETAILS */
                <div className="bg-teal-50 border border-teal-100 p-4 rounded-2xl space-y-2.5">
                  <div className="flex items-center gap-2 text-teal-800">
                    <Truck size={18} />
                    <h4 className="font-bold text-sm">ນະໂຍບາຍເກັບເງິນປາຍທາງ (COD)</h4>
                  </div>
                  <ul className="text-xs text-teal-900 space-y-1.5 list-disc pl-4 leading-normal">
                    <li>ທ່ານຈະຊຳລະໂດຍກົງເປັນເງິນສົດກັບພະນັກງານຂົນສົ່ງເມື່ອສິນຄ້າສົ່ງຮອດທີ່ຢູ່ຂອງທ່ານ.</li>
                    <li>ກະລຸນາກຽມຍອດເງິນໃຫ້ພໍດີ <span className="font-semibold text-rose-600">{formatKip(getFinalTotal())}</span> ເພື່ອຄວາມວ່ອງໄວໃນການຈັດສົ່ງ.</li>
                    <li>ບໍລິສັດຂົນສົ່ງອາດຈະໂທຕິດຕໍ່ຫາກ່ອນເຂົ້າຈັດສົ່ງ 1-2 ຊົ່ວໂມງ ກະລຸນາຮັບສາຍໂທລະສັບ.</li>
                  </ul>
                </div>
              )}

              {/* Step Navigation Actions */}
              <div className="pt-4 border-t border-slate-100 flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold rounded-xl"
                >
                  ກັບຄືນ
                </button>
                <button
                  type="button"
                  onClick={handleFinalSubmit}
                  className="px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-md shadow-rose-200 flex items-center gap-1.5"
                >
                  <ShieldCheck size={14} />
                  <span>ຢືນຢັນການສັ່ງຊື້ສິນຄ້າ</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
