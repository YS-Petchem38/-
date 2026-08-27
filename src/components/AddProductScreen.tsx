import React, { useState, useRef } from 'react';
import { ImagePlus, TrendingDown, Store, Bell, Check, X, Sparkles, Link, Upload, ArrowLeft } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Product } from '../types';
import { PRESET_SAMPLE_ITEMS } from '../data/mockData';
import { formatToISODate, formatToKoreanFullDate, formatToShortDate } from '../utils/pricePredictor';

interface AddProductScreenProps {
  onAddProduct: (newProduct: Product) => void;
  onCancel: () => void;
}

export const AddProductScreen: React.FC<AddProductScreenProps> = ({
  onAddProduct,
  onCancel,
}) => {
  const [productName, setProductName] = useState('');
  const [currentPriceStr, setCurrentPriceStr] = useState('');
  const [targetPriceStr, setTargetPriceStr] = useState('');
  const [shoppingMall, setShoppingMall] = useState('');
  const [brand, setBrand] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUrlModalOpen, setIsUrlModalOpen] = useState(false);
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // File upload handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setImagePreview(result);
        setImageUrl(result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Select sample preset
  const handleSelectPreset = (preset: typeof PRESET_SAMPLE_ITEMS[0]) => {
    setProductName(preset.name);
    setBrand(preset.brand);
    setCurrentPriceStr(preset.price.toLocaleString());
    setTargetPriceStr(preset.target.toLocaleString());
    setShoppingMall(preset.mall);
    setImagePreview(preset.image);
    setImageUrl(preset.image);
  };

  const handlePriceInput = (val: string, setter: (v: string) => void) => {
    const numbersOnly = val.replace(/[^0-9]/g, '');
    if (!numbersOnly) {
      setter('');
      return;
    }
    const num = parseInt(numbersOnly, 10);
    setter(num.toLocaleString());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const currentPrice = parseInt(currentPriceStr.replace(/[^0-9]/g, ''), 10);
    const targetPrice = parseInt(targetPriceStr.replace(/[^0-9]/g, ''), 10);

    if (!productName.trim()) {
      alert('상품명을 입력해주세요.');
      return;
    }
    if (!currentPrice || currentPrice <= 0) {
      alert('현재 상품 가격을 입력해주세요.');
      return;
    }
    if (!targetPrice || targetPrice <= 0) {
      alert('목표 가격을 입력해주세요.');
      return;
    }

    setIsSubmitting(true);

    const defaultImage =
      imageUrl ||
      imagePreview ||
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDk4l_Irlb7GyLGhmUP-OBDUArPydR0i4kqARlfP1trZTlLASd3MHWQb7B4CfBsW_lYp81HOgXZqX7gzGT2uF6a6zO8BhgaRU0jzrgPRGmzZ1QQVU8nZQ3VIfiMuj5Vsc9bvtWccGgV10FSPXnVVC5Oanoeb1YyYGtZJeR0bcra-FtJhCspeOvOVJWF_sCyYkexTTDfKqnlAiuSMkCAumblSsVKyoFjJoJlNfAOB7hvIvAcF6hVuAAB5w';

    const now = new Date();
    const pastDate = new Date();
    pastDate.setDate(now.getDate() - 14);

    const newProduct: Product = {
      id: `prod-${Date.now()}`,
      brand: brand.trim() || 'CUSTOM',
      name: productName.trim(),
      imageUrl: defaultImage,
      originalPrice: currentPrice,
      currentPrice: currentPrice,
      targetPrice: targetPrice,
      mall: shoppingMall.trim() || '온라인 쇼핑몰',
      mallUrl: shoppingMall.startsWith('http') ? shoppingMall : undefined,
      isAlertActive: true,
      createdAt: formatToISODate(now),
      history: [
        {
          date: formatToISODate(pastDate),
          displayDate: formatToShortDate(pastDate),
          fullDate: formatToKoreanFullDate(pastDate),
          price: Math.round((currentPrice * 1.08) / 1000) * 1000,
          source: '등록 이전가',
          note: '이전 판매가',
        },
        {
          date: formatToISODate(now),
          displayDate: `오늘 (${formatToShortDate(now)})`,
          fullDate: formatToKoreanFullDate(now),
          price: currentPrice,
          source: '사용자 등록',
          note: '알림 등록 시점 가격',
        },
      ],
    };

    // Confetti effect
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.7 },
      });
    } catch {
      // ignore
    }

    setTimeout(() => {
      onAddProduct(newProduct);
      setIsSubmitting(false);
    }, 400);
  };

  return (
    <div id="add-product-screen" className="flex flex-col gap-6 pb-28 max-w-md mx-auto">
      {/* Top title */}
      <section className="pt-2">
        <div className="flex items-center justify-between">
          <h2 className="font-syne text-[26px] font-bold text-[#0b1c30] tracking-tight">
            상품 추가
          </h2>
          <button
            type="button"
            onClick={onCancel}
            className="text-xs text-slate-400 hover:text-slate-700 px-2 py-1 rounded-md"
          >
            취소
          </button>
        </div>
        <p className="text-[14px] text-[#424754] mt-1">
          알림을 받고 싶은 상품 정보를 입력해주세요.
        </p>
      </section>

      {/* Preset quick loader for convenience */}
      <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold text-[#0058be] flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> 빠른 예시 불러오기
          </span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {PRESET_SAMPLE_ITEMS.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelectPreset(item)}
              className="text-xs bg-white text-slate-700 border border-blue-200 px-2.5 py-1.5 rounded-lg whitespace-nowrap hover:bg-blue-500 hover:text-white transition-all shadow-2xs font-medium"
            >
              {item.name.split(' ')[0]} {item.name.split(' ')[1]}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* Image Upload Area */}
        <section className="flex flex-col gap-2">
          <label className="text-[13px] font-semibold text-[#0b1c30]">
            상품 이미지
          </label>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />

          <div
            id="image-dropzone"
            onClick={() => fileInputRef.current?.click()}
            className="w-full aspect-[4/3] rounded-3xl border-2 border-dashed border-[#c2c6d6] bg-[#eff4ff]/60 flex flex-col items-center justify-center cursor-pointer hover:border-[#0058be] hover:bg-[#e5eeff] transition-all group relative overflow-hidden"
          >
            {imagePreview ? (
              <>
                <img
                  src={imagePreview}
                  alt="미리보기"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    className="px-3 py-1.5 bg-white text-slate-900 rounded-lg text-xs font-semibold shadow-md flex items-center gap-1"
                  >
                    <Upload className="w-3.5 h-3.5" /> 변경
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setImagePreview(null);
                      setImageUrl('');
                    }}
                    className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-semibold shadow-md flex items-center gap-1"
                  >
                    <X className="w-3.5 h-3.5" /> 삭제
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center text-center p-4">
                <div className="w-14 h-14 rounded-2xl bg-white shadow-xs flex items-center justify-center text-[#727785] group-hover:text-[#0058be] group-hover:scale-110 transition-all mb-2">
                  <ImagePlus className="w-7 h-7 stroke-[1.8]" />
                </div>
                <span className="text-[14px] font-semibold text-[#727785] group-hover:text-[#0058be] transition-colors">
                  이미지 업로드
                </span>
                <span className="text-[11px] text-slate-400 mt-0.5">
                  클릭하여 기기 사진 선택 또는 링크 입력
                </span>
              </div>
            )}
          </div>

          {/* Direct URL input button */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setIsUrlModalOpen(!isUrlModalOpen)}
              className="text-[11px] text-[#0058be] hover:underline flex items-center gap-1 font-medium"
            >
              <Link className="w-3 h-3" /> 이미지 URL 직접 입력
            </button>
          </div>

          {isUrlModalOpen && (
            <div className="flex gap-2 mt-1">
              <input
                type="url"
                placeholder="https://..."
                value={customUrlInput}
                onChange={(e) => setCustomUrlInput(e.target.value)}
                className="flex-1 h-10 px-3 text-xs bg-[#f1f5f9] rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => {
                  if (customUrlInput) {
                    setImagePreview(customUrlInput);
                    setImageUrl(customUrlInput);
                    setIsUrlModalOpen(false);
                  }
                }}
                className="px-3 bg-[#0058be] text-white text-xs font-semibold rounded-lg hover:bg-blue-700"
              >
                적용
              </button>
            </div>
          )}
        </section>

        {/* Input Fields */}
        <section className="flex flex-col gap-4">
          {/* Product Name */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="productName" className="text-[13px] font-semibold text-[#0b1c30] ml-1">
              상품명
            </label>
            <input
              id="productName"
              type="text"
              required
              placeholder="예: 무선 노이즈 캔슬링 헤드폰"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className="h-[56px] rounded-xl bg-[#F1F5F9] border border-transparent px-4 font-normal text-sm text-[#0b1c30] placeholder:text-slate-400 focus:bg-white focus:border-[#0058be] focus:ring-2 focus:ring-[#0058be]/20 transition-all outline-none"
            />
          </div>

          {/* Current Price */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="currentPrice" className="text-[13px] font-semibold text-[#0b1c30] ml-1">
              상품 가격 (현재가)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-syne font-bold text-base text-[#424754]">
                ₩
              </span>
              <input
                id="currentPrice"
                type="text"
                required
                placeholder="0"
                value={currentPriceStr}
                onChange={(e) => handlePriceInput(e.target.value, setCurrentPriceStr)}
                className="h-[56px] rounded-xl bg-[#F1F5F9] border border-transparent px-4 pl-10 font-syne font-bold text-[18px] text-[#0b1c30] placeholder:text-slate-400 focus:bg-white focus:border-[#0058be] focus:ring-2 focus:ring-[#0058be]/20 transition-all outline-none w-full"
              />
            </div>
          </div>

          {/* Target Price */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="targetPrice" className="text-[13px] font-semibold text-[#0b1c30] ml-1">
              목표 가격
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-syne font-bold text-base text-[#006c49]">
                ₩
              </span>
              <input
                id="targetPrice"
                type="text"
                required
                placeholder="희망하는 가격을 입력하세요"
                value={targetPriceStr}
                onChange={(e) => handlePriceInput(e.target.value, setTargetPriceStr)}
                className="h-[56px] rounded-xl bg-[#F1F5F9] border border-transparent px-4 pl-10 pr-12 font-syne font-bold text-[18px] text-[#0b1c30] placeholder:text-slate-400 focus:bg-white focus:border-[#006c49] focus:ring-2 focus:ring-[#006c49]/20 transition-all outline-none w-full"
              />
              <TrendingDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#006c49]" />
            </div>
            <p className="text-[12px] text-[#424754] ml-1 mt-0.5">
              이 가격 이하로 떨어지면 알림을 보내드려요.
            </p>
          </div>

          {/* Shopping Mall */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="shoppingMall" className="text-[13px] font-semibold text-[#0b1c30] ml-1">
              쇼핑몰 링크 또는 이름
            </label>
            <div className="relative">
              <Store className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                id="shoppingMall"
                type="text"
                placeholder="쇼핑몰을 입력하세요 (예: 쿠팡, 네이버)"
                value={shoppingMall}
                onChange={(e) => setShoppingMall(e.target.value)}
                className="h-[56px] rounded-xl bg-[#F1F5F9] border border-transparent px-4 pl-12 font-normal text-sm text-[#0b1c30] placeholder:text-slate-400 focus:bg-white focus:border-[#0058be] focus:ring-2 focus:ring-[#0058be]/20 transition-all outline-none w-full"
              />
            </div>
          </div>
        </section>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            id="btn-submit-alert"
            disabled={isSubmitting}
            className="w-full h-[56px] bg-[#0058be] text-white rounded-full font-bold text-[15px] flex items-center justify-center gap-2 hover:bg-blue-700 active:scale-[0.98] transition-all shadow-[0px_10px_20px_rgba(59,130,246,0.25)] cursor-pointer"
          >
            <Bell className="w-5 h-5 stroke-[2.2]" />
            <span>{isSubmitting ? '알림 등록 중...' : '가격 알림 받기'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
