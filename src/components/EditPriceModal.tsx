import React, { useState } from 'react';
import { X, TrendingDown, Check } from 'lucide-react';
import { Product } from '../types';

interface EditPriceModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedTarget: number, updatedCurrent: number) => void;
}

export const EditPriceModal: React.FC<EditPriceModalProps> = ({
  product,
  isOpen,
  onClose,
  onSave,
}) => {
  const [targetStr, setTargetStr] = useState(product.targetPrice.toLocaleString());
  const [currentStr, setCurrentStr] = useState(product.currentPrice.toLocaleString());

  if (!isOpen) return null;

  const handlePriceInput = (val: string, setter: (v: string) => void) => {
    const numbersOnly = val.replace(/[^0-9]/g, '');
    if (!numbersOnly) {
      setter('');
      return;
    }
    const num = parseInt(numbersOnly, 10);
    setter(num.toLocaleString());
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const newTarget = parseInt(targetStr.replace(/[^0-9]/g, ''), 10);
    const newCurrent = parseInt(currentStr.replace(/[^0-9]/g, ''), 10);

    if (newTarget > 0) {
      onSave(newTarget, newCurrent > 0 ? newCurrent : product.currentPrice);
      onClose();
    }
  };

  return (
    <div
      id="edit-price-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn"
    >
      <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 relative">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-syne text-lg font-bold text-[#0b1c30]">
            목표 가격 수정
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-500 mb-4 line-clamp-1">
          {product.name}
        </p>

        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700">현재 가격</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-syne font-bold text-sm text-slate-400">
                ₩
              </span>
              <input
                type="text"
                value={currentStr}
                onChange={(e) => handlePriceInput(e.target.value, setCurrentStr)}
                className="w-full h-12 bg-slate-100 rounded-xl pl-9 pr-4 text-sm font-syne font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700">새 목표 가격</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-syne font-bold text-sm text-emerald-600">
                ₩
              </span>
              <input
                type="text"
                value={targetStr}
                onChange={(e) => handlePriceInput(e.target.value, setTargetStr)}
                className="w-full h-12 bg-slate-100 rounded-xl pl-9 pr-10 text-sm font-syne font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
              />
              <TrendingDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600" />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-11 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200"
            >
              취소
            </button>
            <button
              type="submit"
              className="flex-1 h-11 rounded-xl bg-[#0058be] text-white font-bold text-xs hover:bg-blue-700 shadow-md shadow-blue-500/20"
            >
              저장하기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
