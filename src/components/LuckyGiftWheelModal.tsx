import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Gift, Sparkles, User, ShieldCheck, ArrowRight, RefreshCw, Key, Settings, Sliders, AlertCircle, CheckCircle } from 'lucide-react';

interface LuckyGiftWheelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAwardFreeGift?: (giftName: string) => void;
}

interface GiftSegment {
  id: string;
  label: string;
  isPrize: boolean;
  color: string;
  icon: string;
}

// 6 segments: 3 prizes, 3 "no luck" segments to alternate and make it hard
const giftSegments: GiftSegment[] = [
  { id: '1', label: 'ຄັນເບັດຕົກປາຄົບເຊັດ', isPrize: true, color: '#DC2626', icon: '🎣' }, // Red
  { id: '2', label: 'ບໍ່ມີໂຊກເທື່ອ', isPrize: false, color: '#475569', icon: '💨' },     // Slate
  { id: '3', label: 'ເຫຍື້ອປອມກົບຢາງ', isPrize: true, color: '#16A34A', icon: '🐸' },    // Green
  { id: '4', label: 'ລອງໃໝ່ອີກຄັ້ງ', isPrize: false, color: '#475569', icon: '🍀' },    // Slate
  { id: '5', label: 'ເສື່ອໂຢຄະ Premium', isPrize: true, color: '#7C3AED', icon: '🧘' }, // Purple
  { id: '6', label: 'ໂຊກດີຄັ້ງໜ້າ', isPrize: false, color: '#475569', icon: '🍂' },      // Slate
];

export const LuckyGiftWheelModal: React.FC<LuckyGiftWheelModalProps> = ({
  isOpen,
  onClose,
  onAwardFreeGift,
}) => {
  // Navigation registration & session
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
  const [wonSegment, setWonSegment] = useState<GiftSegment | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [resetError, setResetError] = useState('');

  // Admin/Owner Control Panel states
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [adminPin, setAdminPin] = useState('');
  const [adminError, setAdminError] = useState('');
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  // Persistent Admin config (saved in localStorage)
  const [winMode, setWinMode] = useState<'probability' | 'force_segment'>('probability');
  const [winProbability, setWinProbability] = useState<number>(1); // default 1% (very lock/hard)
  const [forcedSegmentId, setForcedSegmentId] = useState<string>('2'); // default forced to 'ບໍ່ມີໂຊກເທື່ອ'

  // Load registered user & owner configurations
  useEffect(() => {
    if (isOpen) {
      setResetError('');
      setRegError('');
      setAdminError('');
      
      // Load user
      const storedUser = localStorage.getItem('hanekhaipheng_registered_user');
      if (storedUser) {
        setIsRegistered(true);
        const parsed = JSON.parse(storedUser);
        setUserName(parsed.name || '');
        setUserPhone(parsed.phone || '');

        const storedPrize = localStorage.getItem(`hanekhaipheng_won_free_gift_${parsed.phone}`);
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

      // Load Owner control settings
      const savedWinMode = localStorage.getItem('hanekhaipheng_gift_win_mode');
      const savedWinProb = localStorage.getItem('hanekhaipheng_gift_win_probability');
      const savedForcedId = localStorage.getItem('hanekhaipheng_gift_forced_id');

      if (savedWinMode) setWinMode(savedWinMode as any);
      if (savedWinProb) setWinProbability(Number(savedWinProb));
      if (savedForcedId) setForcedSegmentId(savedForcedId);

      setShowCelebration(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Handle new user register
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
      const storedPrize = localStorage.getItem(`hanekhaipheng_won_free_gift_${cleanedPhone}`);
      if (storedPrize) {
        setWonSegment(JSON.parse(storedPrize));
        setHasSpun(true);
      }
    }, 800);
  };

  // Safe Owner control bypass PIN verify
  const handleUnlockAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError('');
    // Master secret PIN "9999" or "1234"
    if (adminPin === '1234' || adminPin === '9999') {
      setIsAdminUnlocked(true);
      setAdminPin('');
    } else {
      setAdminError('ລະຫັດ PIN ບໍ່ຖືກຕ້ອງ!');
    }
  };

  // Save current owner configs
  const saveOwnerConfigs = (mode: 'probability' | 'force_segment', prob: number, forcedId: string) => {
    setWinMode(mode);
    setWinProbability(prob);
    setForcedSegmentId(forcedId);
    localStorage.setItem('hanekhaipheng_gift_win_mode', mode);
    localStorage.setItem('hanekhaipheng_gift_win_probability', prob.toString());
    localStorage.setItem('hanekhaipheng_gift_forced_id', forcedId);
  };

  // Handle actual spin trigger with strict owner restriction logic
  const handleSpin = () => {
    if (isSpinning || hasSpun) return;

    setIsSpinning(true);

    let targetSegmentIndex = 1; // Default fallback to a "no luck" segment (index 1)

    // Execute the restricted owner-configured calculation algorithms
    if (winMode === 'force_segment') {
      // 1. Forced segment mode: Absolute lock
      const idx = giftSegments.findIndex(seg => seg.id === forcedSegmentId);
      targetSegmentIndex = idx !== -1 ? idx : 1;
    } else {
      // 2. Probability model mode: Check if user wins lucky draw (default very small 1% or configured)
      const roll = Math.random() * 100; // 0 to 100
      if (roll < winProbability) {
        // Roll falls within win probability, reward them one of the prizes!
        const prizes = giftSegments.filter(s => s.isPrize);
        const randomPrize = prizes[Math.floor(Math.random() * prizes.length)];
        const idx = giftSegments.findIndex(s => s.id === randomPrize.id);
        targetSegmentIndex = idx !== -1 ? idx : 1;
      } else {
        // Did not hit the small probability: force land on one of the non-prize segments
        const noPrizes = giftSegments.filter(s => !s.isPrize);
        const randomNoPrize = noPrizes[Math.floor(Math.random() * noPrizes.length)];
        const idx = giftSegments.findIndex(s => s.id === randomNoPrize.id);
        targetSegmentIndex = idx !== -1 ? idx : 1;
      }
    }

    const selectedSegment = giftSegments[targetSegmentIndex];

    // Calculate rotation to make target segment land centered at the top pointer (0 or 360)
    // There are 6 segments, so each sector is 60 degrees.
    // Index i is from i * 60 to (i+1)*60. Center is i * 60 + 30.
    // To align index `i` with 12 o'clock, rotate by: 360 - (i * 60 + 30)
    const segmentAngle = 360 / giftSegments.length;
    const targetAngle = 360 - (targetSegmentIndex * segmentAngle + (segmentAngle / 2));
    const totalRotation = 2880 + targetAngle; // 8 full spins + offset
    setSpinRotation(totalRotation);

    setTimeout(() => {
      setIsSpinning(false);
      setHasSpun(true);
      setWonSegment(selectedSegment);
      setShowCelebration(true);

      // Write spin history to lock user from spam abuse
      localStorage.setItem(`hanekhaipheng_won_free_gift_${userPhone}`, JSON.stringify(selectedSegment));

      // Trigger free gift callback if they hit a real prize
      if (selectedSegment.isPrize && onAwardFreeGift) {
        onAwardFreeGift(selectedSegment.label);
      }
    }, 4000);
  };

  // Free gift reset (Limit: Once a week, owner lock rules still apply)
  const handleResetGiftSpin = () => {
    setResetError('');
    const lastReset = localStorage.getItem(`hanekhaipheng_free_gift_last_reset_${userPhone}`);
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

        setResetError(`ຂໍອະໄພ, ທ່ານສາມາດຣີເຊັດສິດໝຸນວົງລໍ້ຂອງຂວັນໄດ້ພຽງແຕ່ 1 ຄັ້ງຕໍ່ອາທິດເທົ່ານັ້ນ! (ເຫຼືອເວລາ: ${timeString})`);
        return;
      }
    }

    localStorage.removeItem(`hanekhaipheng_won_free_gift_${userPhone}`);
    localStorage.setItem(`hanekhaipheng_free_gift_last_reset_${userPhone}`, now.toString());
    setHasSpun(false);
    setWonSegment(null);
    setSpinRotation(0);
    setShowCelebration(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ type: 'spring', duration: 0.5 }}
        className="bg-white rounded-3xl max-w-md w-full shadow-2xl relative border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header - Styled with deep rich red-gold gradients for maximum marketing excitement */}
        <div className="bg-gradient-to-r from-red-600 to-amber-600 px-6 py-4.5 text-white flex items-center justify-between relative overflow-hidden">
          <div className="absolute right-[-10px] top-[-10px] w-36 h-36 bg-amber-300/10 rounded-full blur-2xl" />
          <div className="flex items-center gap-2.5 z-10">
            <div className="w-9 h-9 bg-yellow-400 rounded-xl flex items-center justify-center text-red-600 shadow-md">
              <Gift size={20} className="animate-pulse" />
            </div>
            <div>
              <h3 className="font-sans font-black text-xs sm:text-sm tracking-wide flex items-center gap-1">
                <span>ວົງລໍ້ລຸ້ນຂອງຂວັນຟຣີ! (Super Gift Draw)</span>
                <Sparkles size={14} className="text-yellow-300" />
              </h3>
              <p className="text-[10px] text-red-100 font-medium font-sans">ຫມຸນວົງລໍ້ລຸ້ນຮັບສິນຄ້າອຸປະກອນກິລາ ແລະ ຂອງແຖມຟຣີ</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/10 text-red-100 hover:text-white rounded-xl transition-all cursor-pointer z-10"
            title="ປິດ"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content View Body */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col justify-start items-center">
          
          {!isRegistered ? (
            /* USER REGISTER FORM */
            <form onSubmit={handleRegister} className="w-full space-y-4">
              <div className="text-center space-y-2 mb-4">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto text-red-600">
                  <User size={30} />
                </div>
                <h4 className="font-extrabold text-slate-800 font-sans text-base">ລົງທະບຽນລຸ້ນຮັບຂອງລາງວັນຟຣີ</h4>
                <p className="text-xs text-slate-400 max-w-xs mx-auto leading-normal">
                  ປ້ອນຂໍ້ມູນສະມາຊິກເພື່ອຮັບສິດໝຸນວົງລໍ້ Super Gift. ໂຊກໃຫຍ່ອາດຈະເປັນຂອງທ່ານ!
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
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wide">ຊື່ ແລະ ນາມສະກຸນ</label>
                  <input
                    type="text"
                    required
                    placeholder="ໃສ່ຊື່ແທ້ຂອງທ່ານ"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-350 rounded-xl focus:outline-none transition-all placeholder:text-slate-450 text-slate-800 font-semibold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wide">ເບີໂທລະສັບ (WhatsApp)</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-450 font-mono text-xs font-bold leading-none select-none">
                      +856 20
                    </span>
                    <input
                      type="tel"
                      required
                      placeholder="9xxxxxxx"
                      value={userPhone}
                      onChange={(e) => setUserPhone(e.target.value.replace(/\D/g, ''))}
                      className="w-full text-xs pl-[72px] pr-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-350 rounded-xl focus:outline-none transition-all placeholder:text-slate-350 font-mono text-slate-800 font-semibold"
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
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-350 rounded-xl focus:outline-none transition-all placeholder:text-slate-305 font-mono text-slate-800 font-semibold"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-1.5 py-3 bg-gradient-to-r from-red-650 to-amber-600 hover:from-red-600 hover:to-amber-500 text-white font-extrabold text-xs rounded-xl shadow-md transition-all active:scale-98 disabled:opacity-60 cursor-pointer"
              >
                {loading ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>ກຳລັງສ້າງບັນຊີ...</span>
                  </>
                ) : (
                  <>
                    <span>ລົງທະບຽນ ແລະ ໄປສ່ຽງໂຊກຂອງຟຣີ</span>
                    <ArrowRight size={14} />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* ENTRANT SPIN CHANCE WHEEL */
            <div className="w-full flex flex-col items-center">
              
              {!hasSpun ? (
                <div className="text-center space-y-1 mb-5">
                  <span className="text-[10px] uppercase font-black tracking-widest text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100">
                    🔥 ພົບເຫັນສິດທິພິເສດ!
                  </span>
                  <h4 className="font-extrabold text-slate-800 font-sans text-base pt-1">
                    ຍິນດີຕ້ອນຮັບ, <span className="text-red-600">{userName}</span>
                  </h4>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto leading-normal">
                    ກົດປຸ່ມ <strong className="text-red-600 font-sans">SPIN</strong> ເພື່ອລຸ້ນຮັບຂອງແຖມອຸປະກອນກິລາພຣີມ່ຽມຟຣີ!
                  </p>
                </div>
              ) : (
                <div className="text-center space-y-1 mb-5">
                  <span className="text-[10px] uppercase font-black tracking-widest text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                    🎯 ຫມຸນວົງລໍ້ສຳເລັດແລ້ວ
                  </span>
                  <p className="text-xs text-slate-450 mt-1">ຜົນການໝຸນສ່ຽງໂຊກຂອງທ່ານຄື:</p>
                </div>
              )}

              {/* SPINNING CANVAS SVG */}
              <div className="relative w-64 h-64 flex items-center justify-center select-none" id="gift-wheel-container">
                
                {/* Red Outer Rim */}
                <div className="absolute inset-0 rounded-full border-[10px] border-red-700 shadow-xl z-10 flex items-center justify-center p-0.5 bg-slate-900 border-spacing-2">
                  {/* Blinking yellow neon nodes */}
                  {Array.from({ length: 12 }).map((_, i) => {
                    const angle = i * 30;
                    const r = 114;
                    const x = r * Math.sin((angle * Math.PI) / 180);
                    const y = -r * Math.cos((angle * Math.PI) / 180);
                    return (
                      <div
                        key={i}
                        className={`absolute w-2 h-2 rounded-full transition-colors duration-300 ${
                          isSpinning 
                            ? (i % 2 === 0 ? 'bg-yellow-300 shadow-xs shadow-yellow-200' : 'bg-amber-400')
                            : 'bg-yellow-400'
                        }`}
                        style={{ transform: `translate(${x}px, ${y}px)` }}
                      />
                    );
                  })}
                </div>

                {/* Arrow pointer indicator top center */}
                <div className="absolute top-[-10px] left-1/2 -translate-x-1/2 z-30">
                  <svg width="24" height="28" viewBox="0 0 24 28" fill="none" className="drop-shadow-md">
                    <path d="M12 28L24 6H0L12 28Z" fill="#DC2626" />
                    <path d="M12 23L20 7H4L12 23Z" fill="#FBBF24" />
                  </svg>
                </div>

                {/* Wheel Disk SVG */}
                <motion.div
                  className="w-[220px] h-[220px] rounded-full overflow-hidden relative border border-slate-700/10 z-10"
                  style={{ transformOrigin: 'center center' }}
                  animate={{ rotate: spinRotation }}
                  transition={
                    isSpinning 
                      ? { ease: 'easeOut', duration: 4 } 
                      : { type: 'just' }
                  }
                >
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    {giftSegments.map((seg, idx) => {
                      const segmentAngle = 360 / giftSegments.length; // 60 degrees
                      const startAngle = idx * segmentAngle - 90;
                      const endAngle = startAngle + segmentAngle;

                      // Polar coords
                      const rad = Math.PI / 180;
                      const x1 = 50 + 50 * Math.cos(startAngle * rad);
                      const y1 = 50 + 50 * Math.sin(startAngle * rad);
                      const x2 = 50 + 50 * Math.cos(endAngle * rad);
                      const y2 = 50 + 50 * Math.sin(endAngle * rad);

                      const pathData = `M 50 50 L ${x1} ${y1} A 50 50 0 0 1 ${x2} ${y2} Z`;

                      const midAngle = startAngle + segmentAngle / 2;
                      const textX = 50 + 28 * Math.cos(midAngle * rad);
                      const textY = 50 + 28 * Math.sin(midAngle * rad);

                      return (
                        <g key={idx}>
                          <path d={pathData} fill={seg.color} stroke="#ffffff" strokeWidth="1.2" />
                          <g transform={`translate(${textX}, ${textY}) rotate(${midAngle + 90})`}>
                            <text
                              x="0"
                              y="-2"
                              fill="#ffffff"
                              fontSize="3.8"
                              fontWeight="bold"
                              textAnchor="middle"
                              className="font-sans tracking-tight"
                            >
                              {seg.icon}
                            </text>
                            <text
                              x="0"
                              y="3"
                              fill={seg.isPrize ? '#FFFF66' : '#E2E8F0'}
                              fontSize="2.4"
                              fontWeight="black"
                              textAnchor="middle"
                              className="font-sans select-none"
                            >
                              {seg.label}
                            </text>
                          </g>
                        </g>
                      );
                    })}
                  </svg>
                </motion.div>

                {/* Central trigger button circle */}
                <div className="absolute w-14 h-14 bg-red-650 rounded-full border-4 border-white shadow-lg z-20 flex items-center justify-center">
                  <button
                    disabled={isSpinning || hasSpun}
                    onClick={handleSpin}
                    className="w-full h-full bg-red-605 rounded-full bg-gradient-to-tr from-red-700 to-amber-500 hover:scale-105 active:scale-95 disabled:from-slate-705 disabled:to-slate-800 disabled:text-slate-400 text-white font-sans text-[10px] font-black uppercase transition-all flex items-center justify-center flex-col shadow-inner cursor-pointer"
                  >
                    <span>SPIN</span>
                  </button>
                </div>
              </div>

              {/* CELEBRATION OR MISSED OUTCOME BANNER */}
              <AnimatePresence>
                {showCelebration && wonSegment && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`w-full mt-6 p-4 rounded-2xl text-center space-y-2 border shadow-xs relative overflow-hidden ${
                      wonSegment.isPrize 
                        ? 'bg-emerald-50 border-emerald-100 text-emerald-800' 
                        : 'bg-slate-50 border-slate-100 text-slate-750'
                    }`}
                  >
                    {wonSegment.isPrize ? (
                      <>
                        <div className="absolute left-2 top-2 text-emerald-400 text-sm animate-bounce">🎁</div>
                        <div className="absolute right-2 top-2 text-emerald-400 text-sm animate-bounce delay-150">✨</div>
                        <div>
                          <span className="text-[9px] bg-emerald-600 text-white font-black px-2 py-0.5 rounded-full inline-block mb-1.5 uppercase tracking-wide">
                            ຍິນດີໃຫຍ່ພິເສດ!
                          </span>
                          <h5 className="text-sm font-extrabold flex items-center justify-center gap-1.5">
                            <span>ທ່ານຊະນະ:</span>
                            <strong className="text-emerald-700 font-black">{wonSegment.icon} {wonSegment.label}</strong>
                          </h5>
                          <p className="text-[11px] text-emerald-650 leading-relaxed mt-1.5 font-medium">
                            ຂອງຂວັນຟຣີນີ້ ໄດ້ຖືກ <strong className="text-slate-900 border-b border-dashed border-emerald-600">ຈັດເຂົ້າໃນລະບົບບິນອໍເດີຂອງທ່ານ</strong> ແລ້ວ! ເຈົ້າຂອງຮ້ານຈະຕິດຕໍ່ໄປພ້ອມສິນຄ້າຫຼັກ.
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <span className="text-[9px] bg-slate-500 text-white font-black px-2 py-0.5 rounded-full inline-block mb-1">
                            ໂຊກບໍ່ດີເທື່ອ
                          </span>
                          <h5 className="text-sm font-extrabold text-slate-800">
                            ລອງອີກຄັ້ງໃນອາທິດໜ້າ! {wonSegment.icon}
                          </h5>
                          <p className="text-[11px] text-slate-500 leading-relaxed mt-1">
                            {wonSegment.label}. ທ່ານສາມາດກັບມາຣີເຊັດວົງລໍ້ເພື່ອສ່ຽງໂຊກໃໝ່ໄດ້ໃນອາທິດໜ້າ!
                          </p>
                        </div>
                      </>
                    )}

                    <div className="flex gap-2 justify-center pt-1">
                      <button
                        onClick={onClose}
                        className="py-1.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                      >
                        ຕົກລົງ
                      </button>
                      <button
                        onClick={handleResetGiftSpin}
                        className="py-1.5 px-2 bg-slate-150 hover:bg-slate-200 text-slate-500 font-medium text-xs rounded-xl transition-colors cursor-pointer"
                        title="ຣີເຊັດ (Demo/1 ຄັ້ງຕໍ່ອາທິດ)"
                      >
                        <RefreshCw size={12} />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {hasSpun && !showCelebration && wonSegment && (
                <div className="mt-5 text-center bg-slate-50 p-4 rounded-2xl border border-slate-100 w-full animate-fade-in space-y-2">
                  <p className="text-xs text-slate-700">
                    🎯 ທ່ານໄດ້ສ່ຽງໂຊກແລ້ວ: <strong className="text-red-600 font-extrabold">{wonSegment.icon} {wonSegment.label}</strong>
                  </p>
                  {wonSegment.isPrize ? (
                    <p className="text-[10px] text-emerald-600 font-bold">
                      🎉 ລະບົບໄດ້ບັນທຶກຂອງແຖມຟຣີນີ້ໄວ້ກັບເບີໂທຂອງທ່ານແລ້ວ!
                    </p>
                  ) : (
                    <p className="text-[10px] text-slate-400">
                      ທ່ານຫມຸນໄດ້ segment ບໍ່ມີລາງວັນ. ສາມາດລຸ້ນໃໝ່ໄດ້ໃນອາທິດໜ້າ!
                    </p>
                  )}
                  <div className="flex gap-2 justify-center pt-1">
                    <button
                      onClick={onClose}
                      className="py-1 px-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-[10px] rounded-lg transition-colors cursor-pointer"
                    >
                      ຊື້ເຄື່ອງຕໍ່
                    </button>
                    <button
                      onClick={handleResetGiftSpin}
                      className="py-1 px-1.5 bg-slate-100 text-slate-400 hover:bg-slate-200 rounded-lg transition-colors"
                      title="ຣີເຊັດວົງລໍ້ (Demo/1 ຄັ້ງຕໍ່ອາທິດ)"
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

          {/* SECRET SHOP OWNER SETTINGS SECTION: "လော့เอาไว่ไม่ให้ได้ง่าย เพราะฉันจะกำหนดเอง" */}
          <div className="w-full mt-8 pt-5 border-t border-slate-100">
            {!showAdminPanel ? (
              <button
                onClick={() => setShowAdminPanel(true)}
                className="mx-auto flex items-center gap-1.5 text-[9px] text-slate-400 hover:text-red-500 font-extrabold transition-colors uppercase tracking-widest cursor-pointer group"
              >
                <Settings size={11} className="group-hover:rotate-45 transition-transform" />
                <span>🔐 ເຄື່ອງມືເຈົ້າຂອງຮ້ານ (Shop Owner Panel)</span>
              </button>
            ) : (
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-3.5 relative">
                <button
                  onClick={() => setShowAdminPanel(false)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X size={14} />
                </button>
                
                <h5 className="text-[11px] font-black text-slate-700 flex items-center gap-1">
                  <Sliders size={13} className="text-red-600" />
                  <span>ແຜງຄວບຄຸມການລັອກວົງລໍ້ຂອງຂວັນ</span>
                </h5>

                {!isAdminUnlocked ? (
                  /* Owner Authentication form */
                  <form onSubmit={handleUnlockAdmin} className="space-y-2">
                    <p className="text-[10px] text-slate-450">ປ້ອນລະຫັດ PIN ຂອງຮ້ານເພື່ອປັບປ່ຽນອັດຕາຊະນະ (PIN: 1234)</p>
                    {adminError && <p className="text-[9px] text-red-500 font-bold">{adminError}</p>}
                    <div className="flex gap-2">
                      <input
                        type="password"
                        placeholder="••••"
                        maxLength={4}
                        value={adminPin}
                        onChange={(e) => setAdminPin(e.target.value.replace(/\D/g, ''))}
                        className="w-20 text-xs px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-center font-mono focus:outline-none"
                      />
                      <button
                        type="submit"
                        className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-[10px] font-bold cursor-pointer"
                      >
                        ຢືນຢັນ PIN
                      </button>
                    </div>
                  </form>
                ) : (
                  /* Authenticated Owner Configuration settings */
                  <div className="space-y-4 text-xs">
                    <div className="space-y-1">
                      <label className="block text-[9px] font-extrabold text-slate-500 uppercase">ຮູບແບບການອອກລາງວັນ:</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => saveOwnerConfigs('probability', winProbability, forcedSegmentId)}
                          className={`py-1 px-2 border rounded-lg text-[10px] font-bold text-center cursor-pointer transition-all ${
                            winMode === 'probability' 
                              ? 'bg-red-50 border-red-200 text-red-600 shadow-xs' 
                              : 'bg-white border-slate-200 text-slate-600'
                          }`}
                        >
                          💸 ຕັ້ງຕາມ % ໂອກາດຊະນະ
                        </button>
                        <button
                          type="button"
                          onClick={() => saveOwnerConfigs('force_segment', winProbability, forcedSegmentId)}
                          className={`py-1 px-2 border rounded-lg text-[10px] font-bold text-center cursor-pointer transition-all ${
                            winMode === 'force_segment' 
                              ? 'bg-red-50 border-red-200 text-red-600 shadow-xs' 
                              : 'bg-white border-slate-200 text-slate-600'
                          }`}
                        >
                          🔒 ລັອກຜົນການຫມຸນ 100%
                        </button>
                      </div>
                    </div>

                    {winMode === 'probability' ? (
                      <div className="space-y-2 bg-white p-2.5 rounded-xl border border-slate-100">
                        <div className="flex justify-between items-center text-[10px] font-bold text-slate-600">
                          <span>ຕັ້ງ % ໂອກາດຊະນະຂອງລາງວັນ:</span>
                          <span className="text-red-600 font-mono text-xs">{winProbability}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="1"
                          value={winProbability}
                          onChange={(e) => saveOwnerConfigs('probability', Number(e.target.value), forcedSegmentId)}
                          className="w-full accent-red-600 h-1 bg-slate-100 rounded-lg cursor-pointer"
                        />
                        <p className="text-[9px] text-slate-400 italic">
                          (ຕັ້ງເປັນ 1% (ຫຼຸດລົງຍາກທີ່ສຸດ) ຫລື 0% ເພື່ອລັອກບໍ່ໃຫ້ໄດ້ລາງວັນເລີຍ)
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2 bg-white p-2.5 rounded-xl border border-slate-100">
                        <label className="block text-[10px] font-extrabold text-slate-500 uppercase">ເລືອກ Segment ທີ່ຕ້ອງການລັອກໃຫ້ຊະນະ:</label>
                        <select
                          value={forcedSegmentId}
                          onChange={(e) => saveOwnerConfigs('force_segment', winProbability, e.target.value)}
                          className="w-full text-[10px] font-bold py-1.5 px-2 bg-slate-55 border border-slate-200 focus:outline-none rounded-lg text-slate-700 cursor-pointer"
                        >
                          {giftSegments.map((seg) => (
                            <option key={seg.id} value={seg.id}>
                              {seg.icon} {seg.label} {seg.isPrize ? '(🎁 ລາງວັນຊະນະ)' : '(❌ ບໍ່ໄດ້ຫຍັງ)'}
                            </option>
                          ))}
                        </select>
                        <p className="text-[9px] text-slate-450 leading-relaxed font-semibold text-amber-600">
                          🛎️ ທຸກຄັ້ງທີ່ລູກຄ້າກົດ SPIN, ວົງລໍ້ຈະຖືກບັງຄັບໃຫ້ຫມຸນມາຕົກໃສ່ຜົນລັບທີ່ທ່ານເລືອກໄວ້ຢູ່ບ່ອນນີ້ທັນທີ!
                        </p>
                      </div>
                    )}

                    <div className="bg-emerald-50 text-emerald-800 text-[10px] p-2 rounded-xl flex items-center gap-1.5 font-semibold">
                      <CheckCircle size={12} className="text-emerald-600" />
                      <span>ບັນທຶກການຕັ້ງຄ່າລັອກວົງລໍ້ອັດຕະໂນມັດແລ້ວ!</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>

        {/* Footer info badge */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-medium select-none">
          <span className="flex items-center gap-1">
            <ShieldCheck size={12} className="text-emerald-500" />
            <span>ລະບົບສຸ່ມລາງວັນປອດໄພ</span>
          </span>
          <span>ຮ້ານຂາຍແພງ 2026</span>
        </div>
      </motion.div>
    </div>
  );
};
