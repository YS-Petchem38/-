import React, { useState } from 'react';
import { Plus, Search, Sparkles, TrendingDown, Store, CheckCircle2, ChevronRight, Bell, Tag } from 'lucide-react';
import { Product } from '../types';

interface HomeScreenProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onOpenAdd: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  products,
  onSelectProduct,
  onOpenAdd,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'goal' | 'tracking'>('all');

  const filteredProducts = products.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.brand && item.brand.toLowerCase().includes(searchQuery.toLowerCase())) ||
      item.mall.toLowerCase().includes(searchQuery.toLowerCase());

    const isGoalReached = item.currentPrice <= item.targetPrice;
    if (filterMode === 'goal') return matchesSearch && isGoalReached;
    if (filterMode === 'tracking') return matchesSearch && !isGoalReached;
    return matchesSearch;
  });

  const goalCount = products.filter((p) => p.currentPrice <= p.targetPrice).length;

  return (
    <div id="home-screen" className="flex flex-col gap-6 pb-28">
      {/* Welcome Title Section */}
      <section id="welcome-section" className="pt-2">
        <h2 className="font-syne text-[28px] font-bold leading-[1.2] text-[#0b1c30] tracking-tight">
          사고 싶은 상품을<br />
          등록해보세요!
        </h2>
        <p className="text-[15px] text-[#424754] mt-1.5 font-normal">
          원하는 가격이 되면 바로 알려드릴게요.
        </p>
      </section>

      {/* Search & Filter bar */}
      <section id="search-filter-section" className="space-y-3">
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            id="home-search-input"
            type="text"
            placeholder="등록한 상품 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-12 bg-white rounded-xl pl-11 pr-4 text-sm border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0058be] shadow-2xs placeholder:text-slate-400"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar text-xs font-semibold">
          <button
            id="filter-all"
            onClick={() => setFilterMode('all')}
            className={`px-3.5 py-1.5 rounded-full whitespace-nowrap transition-all ${
              filterMode === 'all'
                ? 'bg-[#0058be] text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            전체 ({products.length})
          </button>
          <button
            id="filter-goal"
            onClick={() => setFilterMode('goal')}
            className={`px-3.5 py-1.5 rounded-full whitespace-nowrap transition-all flex items-center gap-1 ${
              filterMode === 'goal'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-50'
            }`}
          >
            <span>🎉 목표 달성</span>
            <span className="bg-emerald-100/40 text-current px-1.5 py-0.2 rounded-full text-[10px]">
              {goalCount}
            </span>
          </button>
          <button
            id="filter-tracking"
            onClick={() => setFilterMode('tracking')}
            className={`px-3.5 py-1.5 rounded-full whitespace-nowrap transition-all ${
              filterMode === 'tracking'
                ? 'bg-[#0058be] text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            추적 중 ({products.length - goalCount})
          </button>
        </div>
      </section>

      {/* Product List Cards */}
      <section id="product-grid" className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredProducts.length === 0 ? (
          <div className="col-span-full bg-white rounded-2xl border border-dashed border-slate-300 p-8 text-center flex flex-col items-center justify-center">
            <Tag className="w-12 h-12 text-slate-300 mb-3 stroke-[1.5]" />
            <h3 className="font-semibold text-slate-700 text-base">등록된 상품이 없습니다</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">
              {searchQuery ? '검색 결과가 없습니다.' : '사고 싶은 상품의 가격 알림을 등록해보세요!'}
            </p>
            <button
              onClick={onOpenAdd}
              className="mt-4 px-5 py-2.5 bg-[#0058be] text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-all"
            >
              + 새 상품 등록하기
            </button>
          </div>
        ) : (
          filteredProducts.map((product) => {
            const isGoalReached = product.currentPrice <= product.targetPrice;
            const hasDiscount = product.originalPrice > product.currentPrice;

            return (
              <article
                key={product.id}
                id={`product-card-${product.id}`}
                onClick={() => onSelectProduct(product)}
                className="bg-white border border-[#e2e8f0] rounded-[16px] overflow-hidden flex flex-col relative group cursor-pointer hover:border-[#0058be] hover:shadow-lg transition-all duration-200 active:scale-[0.99]"
              >
                {/* Goal Reached Badge */}
                {isGoalReached && (
                  <div className="absolute top-3.5 left-3.5 z-10 bg-[#6cf8bb] text-[#00714d] px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm font-semibold text-xs animate-fadeIn">
                    <span className="text-[13px]">🎉</span>
                    <span className="font-syne text-[11px] font-bold">목표 가격 달성!</span>
                  </div>
                )}

                {/* Shopping Mall Tag */}
                <div className="absolute top-3.5 right-3.5 z-10 bg-black/60 backdrop-blur-xs text-white px-2 py-0.5 rounded-md text-[10px] font-medium flex items-center gap-1">
                  <Store className="w-3 h-3" />
                  <span>{product.mall}</span>
                </div>

                {/* Product Image */}
                <div className="h-48 w-full bg-[#f1f5f9] relative overflow-hidden">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                    onError={(e) => {
                      // Fallback image if broken
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                {/* Card Details */}
                <div className="p-4 flex flex-col gap-2.5 justify-between flex-1">
                  <div>
                    {product.brand && (
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-0.5">
                        {product.brand}
                      </span>
                    )}
                    <h3 className="font-semibold text-[14px] text-[#0b1c30] line-clamp-1 leading-snug">
                      {product.name}
                    </h3>
                  </div>

                  <div className="flex justify-between items-end pt-1">
                    <div className="flex flex-col">
                      {hasDiscount && (
                        <span className="text-[12px] text-slate-400 line-through leading-none mb-1">
                          ₩ {product.originalPrice.toLocaleString()}
                        </span>
                      )}
                      <span
                        className={`font-syne text-[20px] font-extrabold leading-none ${
                          isGoalReached ? 'text-[#ba1a1a]' : 'text-[#0b1c30]'
                        }`}
                      >
                        ₩ {product.currentPrice.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex flex-col items-end">
                      <span className="text-[11px] text-slate-400 font-medium">목표가</span>
                      <span className="font-syne text-[14px] font-bold text-[#0b1c30]">
                        ₩ {product.targetPrice.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </section>

      {/* Floating Action Button (FAB) */}
      <button
        id="fab-add-product"
        onClick={onOpenAdd}
        aria-label="새 알림 등록"
        className="fixed bottom-[90px] right-6 w-16 h-16 bg-[#0058be] text-white rounded-full flex items-center justify-center fab-shadow z-40 hover:scale-105 active:scale-95 transition-all shadow-xl hover:bg-blue-700 cursor-pointer"
      >
        <Plus className="w-8 h-8 stroke-[2.5]" />
      </button>
    </div>
  );
};
