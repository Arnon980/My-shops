import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Gift, Sparkles, User, ShieldCheck, ArrowRight, RefreshCw, Check, AlertCircle } from 'lucide-react';

interface LuckyWheelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyDiscount: (discount: number, promoCode: string) => void;
}

interface WheelSegment {
  label: string;
  value: number;
  code: string;
  color: string;
  icon: string;
}

const segments: WheelSegment[] = [
  { label: 'ສ່ວນຫຼຸດ 10,000 ກີບ', value: 10000, code: 'BEAR10K', color: '#EF4444', icon: '👑' }, // Red (Grand Prize!)
  { label: 'ສ່ວນຫຼຸດ 2,000 ກີບ', value: 2000, code: 'BEAR2K', color: '#3B82F6', icon: '🧧' },  // Blue
  { label: 'ສ່ວນຫຼຸດ 5,000 ກີບ', value: 5000, code: 'BEAR5K', color: '#10B981', icon: '💸' },  // Green
  { label: 'ສ່ວນຫຼຸດ 3,000 ກີບ', value: 3000, code: 'BEAR3K', color: '#F59E0B', icon: '🌟' },  // Amber
  { label: 'ສ່ວນຫຼຸດ 7,000 ກີບ', value: 7000, code: 'BEAR7K', color: '#8B5CF6', icon: '🍀' },  // Purple
];

export const LuckyWheelModal: React.FC<LuckyWheelModalProps> = ({
  isOpen,
  onClose,
  onApplyDiscount,
}) => {
  // Registration form state
  const [isRegistered, setIsRegistered] = useState(false);
  const [userName, setUserName] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [password, setPassword] = useState('');
  const [regError, setRegError] = useState('');
  const [loading, setLoading] = useState(false);

  // Wheel animation states
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinRotation, setSpinRotation] = useState(0);
  const [hasSpun, setHasSpun] = useState(false);
  const [wonSegment, setWonSegment] = useState<WheelSegment | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [resetError, setResetError] = useState('');

  // Check if user is already registered on mount/show
  useEffect(() => {
    if (isOpen) {
      setResetError('');
      const storedUser = localStorage.getItem('hanekhaipheng_registered_user');
      if (storedUser) {
        setIsRegistered(true);
        const parsed = JSON.parse(storedUser);
        setUserName(parsed.name || '');
        setUserPhone(parsed.phone || '');
        
        // If they already spun under this user, we might load or let them spin once per session
        const storedPrize = localStorage.getItem(`hanekhaipheng_won_prize_${parsed.phone}`);
        if (storedPrize) {
          const parsedPrize = JSON.parse(storedPrize);
          setWonSegment(parsedPrize);
          setHasSpun(true);
        } else {
          setHasSpun(false);
          setWonSegment(null);
        }
      } else {
        setIsRegistered(false);
        setHasSpun(false);
        setWonSegment(null);
      }
      setShowCelebration(false);
      setRegError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Handle registration
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');

    if (userName.trim().length < 2) {
      setRegError('ກະລຸນາໃສ່ຊື່ແທ້ໃຫ້ຖືກຕ້ອງ');
      return;
    }

    const cleanedPhone = userPhone.replace(/\s+/g, '');
    if (!/^\d{8,11}$/.test(cleanedPhone)) {
      setRegError('ກະລຸນາໃສ່ເບີໂທລະສັບໃຫ້ຖືກຕ້ອງ (8-11 ຕົວເລກ)');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const userData = { name: userName, phone: cleanedPhone, date: new Date().toISOString() };
      localStorage.setItem('hanekhaipheng_registered_user', JSON.stringify(userData));
      setIsRegistered(true);
      setLoading(false);

      // Check if this specific phone has already spun before
      const storedPrize = localStorage.getItem(`hanekhaipheng_won_prize_${cleanedPhone}`);
      if (storedPrize) {
        setWonSegment(JSON.parse(storedPrize));
        setHasSpun(true);
      }
    }, 800);
  };

  // Spin the wheel trigger
  const handleSpin = () => {
    if (isSpinning || hasSpun) return;

    setIsSpinning(true);

    // Technique/Marketing rule: "ลดสูงสุดคือให้เหลือแค่ 340.000" (meaning max 10k discount)
    // We can distribute the segment landing to make sure it's exciting!
    // Let's pick a random segment index (0 to 4)
    // To make it fun, let's select a random index, e.g., 10,000 (Grand prize) or others
    const randomIndex = Math.floor(Math.random() * segments.length);
    const selected = segments[randomIndex];

    // Calculate rotation: 
    // Segment size is 72 degrees (360 / 5)
    // To center the segment on the pointer at the top (0 degrees):
    // Segment index 0 is from 0 to 72. Center of index 0 is 36 degrees.
    // So to point index `i` at the top, we need rotation of:
    // 360 - (i * 72 + 36)
    const segmentAngle = 360 / segments.length;
    const targetAngle = 360 - (randomIndex * segmentAngle + (segmentAngle / 2));
    
    // Add extra spin turns (e.g. 8 full rotations = 2880 degrees) for the suspension / tension
    const totalRotation = 2880 + targetAngle;
    setSpinRotation(totalRotation);

    setTimeout(() => {
      setIsSpinning(false);
      setHasSpun(true);
      setWonSegment(selected);
      setShowCelebration(true);

      // Store in localStorage tied to their registered phone so they can't multi-spin cheat
      localStorage.setItem(`hanekhaipheng_won_prize_${userPhone}`, JSON.stringify(selected));
      
      // Auto-apply the won coupon to their cart state!
      onApplyDiscount(selected.value, selected.code);
    }, 4000); // 4 seconds animation spin time
  };

  // Reset the session spin if they want to try for demonstration
  const handleDemoReset = () => {
    setResetError('');
    const lastReset = localStorage.getItem(`hanekhaipheng_last_reset_${userPhone}`);
    const now = Date.now();
    const oneWeekInMs = 7 * 24 * 60 * 60 * 1000;

    if (lastReset) {
      const lastResetTime = parseInt(lastReset, 10);
      const timePassed = now - lastResetTime;
      if (timePassed < oneWeekInMs) {
        const timeLeft = oneWeekInMs - timePassed;
        const days = Math.floor(timeLeft / (24 * 60 * 60 * 1000));
        const hours = Math.floor((timeLeft % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
        const minutes = Math.floor((timeLeft % (60 * 60 * 1000)) / (60 * 1000));
        
        let timeString = '';
        if (days > 0) timeString += `${days} ວັນ `;
        if (hours > 0) timeString += `${hours} ຊົ່ວໂມງ `;
        if (days === 0 && hours === 0) {
          timeString += `${minutes} ນາທີ`;
        } else if (minutes > 0) {
          timeString += `${minutes} ນາທີ`;
        }

        setResetError(`ຂໍອະໄພ, ທ່ານສາມາດຣີເຊັດວົງລໍ້ໄດ້ພຽງແຕ່ 1 ຄັ້ງຕໍ່ອາທິດເທົ່ານັ້ນ! (ເຫຼືອເວລາອີກ: ${timeString})`);
        return;
      }
    }

    localStorage.removeItem(`hanekhaipheng_won_prize_${userPhone}`);
    localStorage.setItem(`hanekhaipheng_last_reset_${userPhone}`, now.toString());
    setHasSpun(false);
    setWonSegment(null);
    setSpinRotation(0);
    setShowCelebration(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ type: 'spring', duration: 0.5 }}
        className="bg-white rounded-3xl max-w-md w-full shadow-2xl relative border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header section with white bear colors */}
        <div className="bg-slate-900 px-6 py-4.5 text-white flex items-center justify-between relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute right-0 top-0 w-32 h-32 bg-amber-400/10 rounded-full blur-2xl" />
          <div className="flex items-center gap-2.5 z-10">
            <div className="w-9 h-9 bg-amber-400 rounded-xl flex items-center justify-center text-slate-900 shadow-inner">
              <Gift size={20} className="animate-bounce" />
            </div>
            <div>
              <h3 className="font-sans font-black text-sm tracking-wide flex items-center gap-1">
                <span>ວົງລໍ້ເສດຖີ ຮັບສ່ວນຫຼຸດ!</span>
                <Sparkles size={14} className="text-amber-400" />
              </h3>
              <p className="text-[10px] text-slate-400 font-medium">ສະໝັກສະມາຊິກເພື່ອໝຸນວົງລໍ້ຫຼຸດລາຄາສິນຄ້າ</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-all cursor-pointer z-10"
            title="ປິດ"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col justify-center items-center">
          
          {!isRegistered ? (
            /* STEP 1: Registration Form */
            <form onSubmit={handleRegister} className="w-full space-y-4">
              <div className="text-center space-y-2 mb-4">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-700">
                  <User size={30} />
                </div>
                <h4 className="font-extrabold text-slate-800 font-sans text-base">ລົງທະບຽນສະມາຊິກໃຫມ່</h4>
                <p className="text-xs text-slate-400 max-w-xs mx-auto leading-normal">
                  ສະໝັກສະມາຊິກ ຮ້ານຂາຍແພງ ມື້ນີ້ເພື່ອຮັບສິດໝຸນວົງລໍ້ເສດຖີ ສ່ຽງໂຊກຮັບສ່ວນຫຼຸດສິນຄ້າສູງສຸດ 10,000 ກີບ ທັນທີ!
                </p>
              </div>

              {regError && (
                <div className="bg-rose-50 border border-rose-100 p-3 rounded-xl flex items-center gap-2 text-rose-600 text-xs font-bold">
                  <AlertCircle size={15} className="flex-shrink-0" />
                  <span>{regError}</span>
                </div>
              )}

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wide">ຊື່ ແລະ ນາມສະກຸນ (Full Name)</label>
                  <input
                    type="text"
                    required
                    placeholder="ໃສ່ຊື່ແທ້ຂອງທ່ານ"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-350 rounded-xl focus:outline-none transition-all placeholder:text-slate-400 text-slate-800 font-semibold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wide">ເບີໂທລະສັບ (WhatsApp Phone)</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-xs font-bold leading-none select-none">
                      +856 20
                    </span>
                    <input
                      type="tel"
                      required
                      placeholder="9xxxxxxx"
                      value={userPhone}
                      onChange={(e) => setUserPhone(e.target.value.replace(/\D/g, ''))}
                      className="w-full text-xs pl-[72px] pr-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-350 rounded-xl focus:outline-none transition-all placeholder:text-slate-300 font-mono text-slate-800 font-semibold"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wide">ກຳນົດລະຫັດຜ່ານ (Password)</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-350 rounded-xl focus:outline-none transition-all placeholder:text-slate-300 font-mono text-slate-800 font-semibold"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-1.5 py-3 bg-slate-900 hover:bg-slate-850 text-white font-extrabold text-xs rounded-xl shadow-md transition-all active:scale-98 disabled:opacity-60 cursor-pointer"
              >
                {loading ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>ກຳລັງສ້າງບັນຊີ...</span>
                  </>
                ) : (
                  <>
                    <span>ລົງທະບຽນ ແລະ ໄປໝຸນວົງລໍ້</span>
                    <ArrowRight size={14} />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* STEP 2: The Lucky Spin Wheel Component */
            <div className="w-full flex flex-col items-center">
              
              {!hasSpun ? (
                <div className="text-center space-y-1 mb-5">
                  <span className="text-[10px] uppercase font-black tracking-widest text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                    🎉 ລົງທະບຽນສຳເລັດແລ້ວ!
                  </span>
                  <h4 className="font-extrabold text-slate-800 font-sans text-base pt-1">
                    ສະບາຍດີ, <span className="text-rose-600">{userName}</span>
                  </h4>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto">
                    ກົດປຸ່ມ <strong className="text-slate-800">SPIN</strong> ເພື່ອສ່ຽງໂຊກໝຸນຮັບຄູປອງສ່ວນຫຼຸດສູງສຸດ 10,000 ກີບ!
                  </p>
                </div>
              ) : (
                <div className="text-center space-y-1 mb-5">
                  <span className="text-[10px] uppercase font-black tracking-widest text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                    🎯 ໝຸນວົງລໍ້ສຳເລັດແລ້ວ
                  </span>
                  <h4 className="font-extrabold text-slate-800 font-sans text-base pt-1">
                    ໂຊກຂອງທ່ານຄື:
                  </h4>
                </div>
              )}

              {/* The Spin Wheel Canvas/SVG Area */}
              <div className="relative w-64 h-64 flex items-center justify-center select-none" id="lucky-wheel-container">
                
                {/* Wheel Outer Rim decoration */}
                <div className="absolute inset-0 rounded-full border-[10px] border-slate-900 shadow-xl z-10 flex items-center justify-center p-0.5 bg-slate-800">
                  {/* Neon light nodes blinking decorative dots */}
                  {Array.from({ length: 12 }).map((_, i) => {
                    const angle = i * 30; // 360 / 12
                    const r = 114; // Radius
                    const x = r * Math.sin((angle * Math.PI) / 180);
                    const y = -r * Math.cos((angle * Math.PI) / 180);
                    return (
                      <div
                        key={i}
                        className={`absolute w-2 h-2 rounded-full transition-colors duration-300 ${
                          isSpinning 
                            ? (i % 2 === 0 ? 'bg-amber-400 shadow-xs shadow-amber-300' : 'bg-red-500 shadow-xs shadow-red-300')
                            : 'bg-amber-400'
                        }`}
                        style={{
                          transform: `translate(${x}px, ${y}px)`,
                        }}
                      />
                    );
                  })}
                </div>

                {/* Arrow Pointer indicator strictly pointing at the top center */}
                <div className="absolute top-[-10px] left-1/2 -translate-x-1/2 z-30 transition-transform hover:scale-110">
                  <svg width="24" height="28" viewBox="0 0 24 28" fill="none" className="drop-shadow-md">
                    <path d="M12 28L24 6H0L12 28Z" fill="#D21820" />
                    <path d="M12 23L20 7H4L12 23Z" fill="#F59E0B" />
                  </svg>
                </div>

                {/* Rotating Inner Wheel */}
                <motion.div
                  className="w-[220px] h-[220px] rounded-full overflow-hidden relative border border-slate-700/10 z-10"
                  style={{
                    transformOrigin: 'center center',
                  }}
                  animate={{ rotate: spinRotation }}
                  transition={
                    isSpinning 
                      ? { ease: 'easeOut', duration: 4 } 
                      : { type: 'just' }
                  }
                >
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    {/* Draw segments */}
                    {segments.map((seg, idx) => {
                      const segmentAngle = 360 / segments.length; // 72 degrees
                      const startAngle = idx * segmentAngle - 90; // Align starting angle
                      const endAngle = startAngle + segmentAngle;

                      // Polar to cartesian coords
                      const rad = Math.PI / 180;
                      const x1 = 50 + 50 * Math.cos(startAngle * rad);
                      const y1 = 50 + 50 * Math.sin(startAngle * rad);
                      const x2 = 50 + 50 * Math.cos(endAngle * rad);
                      const y2 = 50 + 50 * Math.sin(endAngle * rad);

                      // SVG path for a sector/slice
                      const pathData = `M 50 50 L ${x1} ${y1} A 50 50 0 0 1 ${x2} ${y2} Z`;

                      // Text positioning: middle of sector radius
                      const midAngle = startAngle + segmentAngle / 2;
                      const textX = 50 + 28 * Math.cos(midAngle * rad);
                      const textY = 50 + 28 * Math.sin(midAngle * rad);

                      return (
                        <g key={idx}>
                          <path d={pathData} fill={seg.color} stroke="#ffffff" strokeWidth="1.2" />
                          <g transform={`translate(${textX}, ${textY}) rotate(${midAngle + 90})`}>
                            {/* Text label vertically aligned */}
                            <text
                              x="0"
                              y="-4"
                              fill="#ffffff"
                              fontSize="4.2"
                              fontWeight="bold"
                              textAnchor="middle"
                              className="font-sans tracking-wide"
                            >
                              {seg.value === 10000 ? '👑 10,000 ກີບ' : `${seg.icon} ${seg.value.toLocaleString()} ກີບ`}
                            </text>
                            <text
                              x="0"
                              y="2"
                              fill="#ffffaa"
                              fontSize="3"
                              fontWeight="extrabold"
                              textAnchor="middle"
                              className="font-mono tracking-tighter opacity-90"
                            >
                              {seg.code}
                            </text>
                          </g>
                        </g>
                      );
                    })}
                  </svg>
                </motion.div>

                {/* Centered Spin Trigger circle hub overlay */}
                <div className="absolute w-14 h-14 bg-slate-900 rounded-full border-4 border-white shadow-lg z-20 flex items-center justify-center">
                  <button
                    disabled={isSpinning || hasSpun}
                    onClick={handleSpin}
                    className="w-full h-full bg-slate-900 rounded-full hover:bg-rose-600 disabled:bg-slate-800 disabled:text-slate-400 text-white font-sans text-[11px] font-black tracking-tighter uppercase transition-colors flex items-center justify-center flex-col shadow-inner select-none cursor-pointer"
                  >
                    <span>SPIN</span>
                  </button>
                </div>
              </div>

              {/* Spin Finish Celebratory Screen layout */}
              <AnimatePresence>
                {showCelebration && wonSegment && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="w-full mt-6 bg-rose-50 border border-rose-100 p-4 rounded-2xl text-center space-y-3 shadow-sm relative overflow-hidden"
                  >
                    {/* Confetti mini dots */}
                    <div className="absolute left-2 top-2 text-rose-300 text-sm animate-bounce">🎈</div>
                    <div className="absolute right-2 top-2 text-rose-300 text-sm animate-bounce delay-200">✨</div>
                    
                    <div>
                      <span className="text-[10px] bg-rose-500 text-white font-bold px-2 py-0.5 rounded-full inline-block mb-1.5 animate-pulse">
                        ຍິນດີນຳທຸກໆທ່ານ!
                      </span>
                      <h5 className="text-sm font-extrabold text-slate-800">
                        ທ່ານໄດ້ຮັບສ່ວນຫຼຸດ <span className="text-rose-600 font-sans text-base block sm:inline">{wonSegment.label}</span>
                      </h5>
                      <p className="text-[11px] text-slate-500 leading-normal mt-1">
                        ລະຫັດຄູປອງຂອງທ່ານຄື <strong className="font-mono bg-white border border-slate-200 px-2 py-0.5 rounded text-rose-500 font-bold select-all">{wonSegment.code}</strong> ເຊິ່ງໄດ້ຖືກ <strong className="text-emerald-600">ນຳໃຊ້ເຂົ້າໃນກະຕ່າໂດຍອັດຕະໂນມັດແລ້ວ!</strong>
                      </p>
                    </div>

                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={onClose}
                        className="py-1.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                      >
                        ຕົກລົງ & ໄປຊື້ສິນຄ້າ
                      </button>
                      <button
                        onClick={handleDemoReset}
                        className="py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-500 font-medium text-xs rounded-xl transition-colors cursor-pointer"
                        title="ຫຼິ້ນອີກຄັ້ງ (Demo)"
                      >
                        <RefreshCw size={12} />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {hasSpun && !showCelebration && wonSegment && (
                <div className="mt-5 text-center bg-slate-50 p-3.5 rounded-2xl border border-slate-100 w-full animate-fade-in">
                  <p className="text-xs text-slate-700">
                    🎉 ທ່ານໄດ້ຮັບສ່ວນຫຼຸດ <strong className="text-rose-600 font-sans">{wonSegment.value.toLocaleString()} ກີບ</strong> ແລ້ວ!
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                    ລະຫັດຄູປອງ: <strong className="font-mono bg-white px-1.5 py-0.5 border border-slate-150 rounded text-slate-700">{wonSegment.code}</strong>. ລະບົບໄດ້ບັນທຶກສິດຂອງທ່ານແລ້ວ.
                  </p>
                  <div className="mt-2.5 flex gap-2 justify-center">
                    <button
                      onClick={onClose}
                      className="py-1 px-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-[10px] rounded-lg transition-colors cursor-pointer"
                    >
                      ຊື້ເຄື່ອງຕໍ່ເລີຍ
                    </button>
                    <button
                      onClick={handleDemoReset}
                      className="py-1 px-1.5 bg-slate-100 text-slate-400 hover:bg-slate-200 rounded-lg transition-colors"
                      title="ຣີເຊັດວົງລໍ້ (Demo)"
                    >
                      <RefreshCw size={10} />
                    </button>
                  </div>
                </div>
              )}

              {resetError && (
                <div className="w-full mt-4 bg-rose-50 border border-rose-100 p-3 rounded-2xl flex items-start gap-2.5 text-rose-700 text-xs font-semibold animate-shake">
                  <AlertCircle size={15} className="flex-shrink-0 text-rose-500 mt-0.5" />
                  <span className="leading-relaxed">{resetError}</span>
                </div>
              )}

            </div>
          )}

        </div>
        
        {/* Safe Badge Footer element */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-medium select-none">
          <span className="flex items-center gap-1">
            <ShieldCheck size={12} className="text-emerald-500" />
            <span>ລະບົບລົງທະບຽນປອດໄພ</span>
          </span>
          <span>ຮ້ານຂາຍແພງ 2026</span>
        </div>
      </motion.div>
    </div>
  );
};
