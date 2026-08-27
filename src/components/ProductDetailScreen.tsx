import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  ArrowDown,
  ArrowUp,
  Bell,
  BellOff,
  Edit3,
  Trash2,
  ExternalLink,
  Zap,
  CheckCircle2,
  TrendingDown,
  Calendar,
  Sparkles,
  ShieldCheck,
  Tag,
  Clock,
  ChevronRight,
  HelpCircle,
  BarChart3,
  Layers,
  Activity,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Product, PriceHistoryPoint, ForecastDataPoint } from '../types';
import {
  predictUpcomingWeekPrice,
  formatToKoreanFullDate,
  formatToShortDate,
  formatToShortDateWithDay,
  formatToISODate
} from '../utils/pricePredictor';

interface ProductDetailScreenProps {
  product: Product;
  onBack: () => void;
  onUpdateProduct: (updated: Product) => void;
  onDeleteProduct: (productId: string) => void;
  onOpenEditModal: (product: Product) => void;
  onSimulatePriceDrop: (productId: string) => void;
}

type ChartViewMode = 'history' | 'forecast' | 'combined';
type PredictionModelType = 'standard' | 'aggressive_sale' | 'conservative';

export const ProductDetailScreen: React.FC<ProductDetailScreenProps> = ({
  product,
  onBack,
  onUpdateProduct,
  onDeleteProduct,
  onOpenEditModal,
  onSimulatePriceDrop,
}) => {
  const [chartViewMode, setChartViewMode] = useState<ChartViewMode>('combined');
  const [predictionModel, setPredictionModel] = useState<PredictionModelType>('standard');
  const [selectedHistoryIndex, setSelectedHistoryIndex] = useState<number | null>(null);
  const [selectedForecastIndex, setSelectedForecastIndex] = useState<number | null>(null);
  const [showFactorDetail, setShowFactorDetail] = useState(true);

  // Generate 7-day AI forecast based on current product state and selected model
  const prediction = useMemo(() => {
    return predictUpcomingWeekPrice(product, predictionModel);
  }, [product, predictionModel]);

  const discountPercent =
    product.originalPrice > product.currentPrice
      ? Math.round(((product.originalPrice - product.currentPrice) / product.originalPrice) * 100)
      : 0;

  const remainingToGoal = Math.max(0, product.currentPrice - product.targetPrice);
  const isGoalReached = product.currentPrice <= product.targetPrice;

  // Calculate progress percentage from original price down to target price
  const totalDropNeeded = Math.max(1, product.originalPrice - product.targetPrice);
  const currentDrop = Math.max(0, product.originalPrice - product.currentPrice);
  const rawProgress = Math.min(100, Math.round((currentDrop / totalDropNeeded) * 100));
  const progressPercent = isGoalReached ? 100 : Math.max(10, rawProgress);

  const toggleAlert = () => {
    onUpdateProduct({
      ...product,
      isAlertActive: !product.isAlertActive,
    });
  };

  const formatK = (price: number) => {
    if (price >= 1000000) {
      return `₩${(price / 10000).toFixed(0)}만`;
    }
    return `₩${Math.round(price / 1000)}k`;
  };

  // Safe history points with full accurate date info
  const historyPoints: PriceHistoryPoint[] = useMemo(() => {
    if (product.history && product.history.length > 0) {
      return product.history;
    }
    const today = new Date();
    const past1 = new Date(today);
    past1.setDate(today.getDate() - 30);
    const past2 = new Date(today);
    past2.setDate(today.getDate() - 15);

    return [
      {
        date: formatToISODate(past1),
        displayDate: formatToShortDate(past1),
        fullDate: formatToKoreanFullDate(past1),
        price: product.originalPrice,
        source: '최초 등록',
        note: '정상 출시가',
      },
      {
        date: formatToISODate(past2),
        displayDate: formatToShortDate(past2),
        fullDate: formatToKoreanFullDate(past2),
        price: Math.round((product.originalPrice + product.currentPrice) / 2),
        source: '정기 모니터링',
        note: '중간 조정가',
      },
      {
        date: formatToISODate(today),
        displayDate: `오늘 (${formatToShortDate(today)})`,
        fullDate: formatToKoreanFullDate(today),
        price: product.currentPrice,
        source: '실시간 감지',
        note: '현재 실시간 추적가',
      },
    ];
  }, [product.history, product.originalPrice, product.currentPrice]);

  // Combined points for the chart rendering
  const { allPoints, minPrice, maxPrice, priceRange, svgHistoryPoints, svgForecastPoints } = useMemo(() => {
    const forecastPoints = prediction.forecastPoints;

    let pointsToDisplay: Array<{
      date: string;
      displayDate: string;
      fullDate?: string;
      price: number;
      isForecast: boolean;
      minPrice?: number;
      maxPrice?: number;
      confidence?: number;
      factor?: string;
      isLowestPoint?: boolean;
      source?: string;
      note?: string;
    }> = [];

    if (chartViewMode === 'history') {
      pointsToDisplay = historyPoints.map((p) => ({
        ...p,
        displayDate: p.displayDate || p.date,
        isForecast: false,
      }));
    } else if (chartViewMode === 'forecast') {
      // Include current point as bridge anchor
      const lastHistory = historyPoints[historyPoints.length - 1];
      pointsToDisplay = [
        {
          date: lastHistory.date,
          displayDate: '현재 (D-Day)',
          fullDate: lastHistory.fullDate || lastHistory.date,
          price: lastHistory.price,
          isForecast: false,
          note: '현재 기준 시점',
        },
        ...forecastPoints.map((f) => ({
          date: f.date,
          displayDate: f.displayDate,
          fullDate: `${f.date} (${f.displayDate})`,
          price: f.predictedPrice,
          isForecast: true,
          minPrice: f.minPrice,
          maxPrice: f.maxPrice,
          confidence: f.confidence,
          factor: f.factor,
          isLowestPoint: f.isLowestPoint,
        })),
      ];
    } else {
      // Combined: all history + forecast
      const hist = historyPoints.map((p) => ({
        ...p,
        displayDate: p.displayDate || p.date,
        isForecast: false,
      }));

      const fore = forecastPoints.map((f) => ({
        date: f.date,
        displayDate: f.displayDate,
        fullDate: `${f.date} (${f.displayDate})`,
        price: f.predictedPrice,
        isForecast: true,
        minPrice: f.minPrice,
        maxPrice: f.maxPrice,
        confidence: f.confidence,
        factor: f.factor,
        isLowestPoint: f.isLowestPoint,
      }));

      pointsToDisplay = [...hist, ...fore];
    }

    const allPrices = pointsToDisplay.map((p) => p.price);
    if (chartViewMode !== 'history') {
      prediction.forecastPoints.forEach((f) => {
        allPrices.push(f.minPrice, f.maxPrice);
      });
    }
    allPrices.push(product.targetPrice);

    const min = Math.min(...allPrices) * 0.96;
    const max = Math.max(...allPrices) * 1.04;
    const range = max - min || 1;

    const totalCount = pointsToDisplay.length;

    // SVG coordinates calculation (100 width, 46 height)
    const svgAll = pointsToDisplay.map((pt, i) => {
      const x = (i / Math.max(1, totalCount - 1)) * 90 + 5;
      const y = 40 - ((pt.price - min) / range) * 32;
      const yMin = pt.minPrice ? 40 - ((pt.minPrice - min) / range) * 32 : y;
      const yMax = pt.maxPrice ? 40 - ((pt.maxPrice - min) / range) * 32 : y;
      return {
        ...pt,
        x,
        y,
        yMin,
        yMax,
        index: i,
      };
    });

    const histSvg = svgAll.filter((p) => !p.isForecast);
    const foreSvg = svgAll.filter((p) => p.isForecast);

    // If forecast exists and we have history, bridge the last history to the first forecast
    if (foreSvg.length > 0 && histSvg.length > 0) {
      // Connect bridge
    }

    return {
      allPoints: svgAll,
      minPrice: min,
      maxPrice: max,
      priceRange: range,
      svgHistoryPoints: histSvg,
      svgForecastPoints: foreSvg,
    };
  }, [chartViewMode, historyPoints, prediction, product.targetPrice]);

  // Construct SVG paths
  const historyPathD = useMemo(() => {
    if (svgHistoryPoints.length === 0) return '';
    return svgHistoryPoints.reduce((acc, curr, idx) => {
      return idx === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`;
    }, '');
  }, [svgHistoryPoints]);

  const historyAreaD = useMemo(() => {
    if (svgHistoryPoints.length === 0) return '';
    const first = svgHistoryPoints[0];
    const last = svgHistoryPoints[svgHistoryPoints.length - 1];
    return `${historyPathD} L ${last.x} 43 L ${first.x} 43 Z`;
  }, [historyPathD, svgHistoryPoints]);

  const forecastPathD = useMemo(() => {
    if (svgForecastPoints.length === 0) return '';
    // Start from last history point if combined
    const startPoint =
      chartViewMode === 'combined' && svgHistoryPoints.length > 0
        ? svgHistoryPoints[svgHistoryPoints.length - 1]
        : null;

    let path = startPoint ? `M ${startPoint.x} ${startPoint.y}` : '';
    svgForecastPoints.forEach((curr, idx) => {
      if (idx === 0 && !startPoint) {
        path = `M ${curr.x} ${curr.y}`;
      } else {
        path += ` L ${curr.x} ${curr.y}`;
      }
    });
    return path;
  }, [svgForecastPoints, svgHistoryPoints, chartViewMode]);

  // Confidence Interval Band Polygon
  const confidenceAreaD = useMemo(() => {
    if (svgForecastPoints.length === 0) return '';
    const startPoint =
      chartViewMode === 'combined' && svgHistoryPoints.length > 0
        ? svgHistoryPoints[svgHistoryPoints.length - 1]
        : null;

    // Top curve (minPrice = lower price = larger y in SVG, maxPrice = higher price = smaller y)
    let topPath = startPoint ? `M ${startPoint.x} ${startPoint.y}` : '';
    svgForecastPoints.forEach((p, idx) => {
      if (idx === 0 && !startPoint) {
        topPath = `M ${p.x} ${p.yMax}`;
      } else {
        topPath += ` L ${p.x} ${p.yMax}`;
      }
    });

    // Bottom curve (in reverse)
    let bottomPath = '';
    for (let i = svgForecastPoints.length - 1; i >= 0; i--) {
      const p = svgForecastPoints[i];
      bottomPath += ` L ${p.x} ${p.yMin}`;
    }
    if (startPoint) {
      bottomPath += ` L ${startPoint.x} ${startPoint.y}`;
    }

    return `${topPath} ${bottomPath} Z`;
  }, [svgForecastPoints, svgHistoryPoints, chartViewMode]);

  // Target price horizontal guide line
  const targetLineY = 40 - ((product.targetPrice - minPrice) / priceRange) * 32;

  // Selected item inspector details
  const activeInspectorItem = useMemo(() => {
    if (selectedForecastIndex !== null && prediction.forecastPoints[selectedForecastIndex]) {
      return {
        type: 'forecast' as const,
        data: prediction.forecastPoints[selectedForecastIndex],
      };
    }
    if (selectedHistoryIndex !== null && historyPoints[selectedHistoryIndex]) {
      return {
        type: 'history' as const,
        data: historyPoints[selectedHistoryIndex],
      };
    }
    return null;
  }, [selectedForecastIndex, selectedHistoryIndex, prediction.forecastPoints, historyPoints]);

  return (
    <div id="product-detail-screen" className="flex flex-col gap-5 pb-32 max-w-md mx-auto animate-fadeIn">
      {/* Top back navigation */}
      <div className="flex items-center justify-between pt-1">
        <button
          onClick={onBack}
          aria-label="뒤로가기"
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#0058be] px-2 py-1.5 -ml-2 rounded-lg transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>목록으로 돌아가기</span>
        </button>

        {isGoalReached && (
          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5" /> 목표 도달 완료
          </span>
        )}
      </div>

      {/* Large Product Image Header */}
      <div className="relative">
        <div className="w-full aspect-[4/3] rounded-2xl bg-[#eff4ff] border border-[#e2e8f0] relative overflow-hidden shadow-sm">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

          {product.mall && (
            <div className="absolute bottom-3 left-3 bg-black/75 backdrop-blur-xs text-white text-[11px] font-medium px-2.5 py-1 rounded-lg flex items-center gap-1">
              <Tag className="w-3 h-3 text-blue-300" />
              <span>판매처: {product.mall}</span>
            </div>
          )}

          {/* Registration Date badge */}
          <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-xs text-slate-200 text-[10px] font-medium px-2.5 py-1 rounded-full flex items-center gap-1">
            <Calendar className="w-3 h-3 text-blue-300" />
            <span>추적시작 {product.createdAt || '2026.06.01'}</span>
          </div>
        </div>
      </div>

      {/* Product Info Area */}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-start gap-3">
          <div className="flex flex-col">
            {product.brand && (
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                {product.brand}
              </span>
            )}
            <h2 className="font-syne text-[22px] font-bold text-[#0b1c30] leading-tight">
              {product.name}
            </h2>
          </div>
        </div>

        {/* Price Display */}
        <div className="flex items-end gap-3 mt-1">
          <span
            className={`font-syne text-[26px] font-extrabold tracking-tight ${
              isGoalReached ? 'text-[#ba1a1a]' : 'text-[#0b1c30]'
            }`}
          >
            ₩{product.currentPrice.toLocaleString()}
          </span>

          {discountPercent > 0 && (
            <span className="text-sm text-slate-400 line-through mb-1">
              ₩{product.originalPrice.toLocaleString()}
            </span>
          )}

          {discountPercent > 0 && (
            <div className="bg-[#6cf8bb] text-[#00714d] px-3 py-1 rounded-full font-bold text-xs ml-auto mb-1 flex items-center gap-1 shadow-2xs font-syne">
              <ArrowDown className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>{discountPercent}%</span>
            </div>
          )}
        </div>
      </div>

      {/* Target Price & Progress Indicator Card */}
      <div className="bg-white border border-[#e2e8f0] rounded-2xl p-4.5 flex flex-col gap-3 relative overflow-hidden shadow-xs">
        <div className="absolute -right-8 -top-8 w-28 h-28 bg-blue-100/50 rounded-full blur-xl pointer-events-none" />

        <div className="flex justify-between items-end relative z-10">
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-slate-500 mb-0.5">목표 가격</span>
            <span className="font-syne text-[22px] font-extrabold text-[#0058be]">
              ₩{product.targetPrice.toLocaleString()}
            </span>
          </div>

          <div className="flex flex-col items-end">
            <span className="text-xs font-semibold text-slate-500 mb-0.5">
              {isGoalReached ? '목표 달성 상태' : '남은 금액'}
            </span>
            <span
              className={`font-syne text-[15px] font-bold ${
                isGoalReached ? 'text-emerald-600' : 'text-slate-800'
              }`}
            >
              {isGoalReached ? '🎉 목표가 달성됨' : `₩${remainingToGoal.toLocaleString()}`}
            </span>
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="w-full h-3 bg-[#e5eeff] rounded-full overflow-hidden relative z-10">
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out ${
              isGoalReached ? 'bg-emerald-500' : 'bg-[#0058be]'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="flex justify-between w-full text-[11px] text-slate-400 font-medium px-0.5 relative z-10">
          <span>최초: {formatK(product.originalPrice)}</span>
          <span>현재: {formatK(product.currentPrice)}</span>
          <span className="text-[#0058be] font-bold">목표: {formatK(product.targetPrice)}</span>
        </div>
      </div>

      {/* AI 1-Week Smart Prediction Banner / Recommendation Signal */}
      <div className="bg-gradient-to-br from-[#0b1c30] to-[#142d4c] text-white rounded-2xl p-4.5 shadow-md flex flex-col gap-3 relative overflow-hidden">
        {/* Glow decoration */}
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-[#0058be]/40 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-28 h-28 bg-[#6cf8bb]/20 rounded-full blur-xl pointer-events-none" />

        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-blue-500/20 text-cyan-300 rounded-lg border border-cyan-400/30">
              <Sparkles className="w-4 h-4" />
            </span>
            <div>
              <span className="text-[11px] text-cyan-200 font-bold uppercase tracking-wider block">
                AI 빅데이터 시세 예측 엔진
              </span>
              <h3 className="text-sm font-bold text-white">
                향후 1주일 (7일) 가격 전망
              </h3>
            </div>
          </div>

          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-white/10 text-cyan-300 border border-white/10">
            {prediction.recommendationBadge}
          </span>
        </div>

        {/* Buying Advice Highlight */}
        <div className="bg-white/10 backdrop-blur-xs rounded-xl p-3 border border-white/10 flex flex-col gap-1.5 relative z-10">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-cyan-300 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> {prediction.recommendationTitle}
            </span>
            <span className="text-[11px] text-slate-300 font-medium">
              신뢰도 {prediction.confidenceScore}%
            </span>
          </div>

          <p className="text-[12px] text-slate-200 leading-relaxed">
            {prediction.recommendationDesc}
          </p>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 gap-2 mt-1 pt-2 border-t border-white/10 text-xs">
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400">예상 최저가 도달일</span>
              <span className="font-syne font-bold text-white text-[13px] flex items-center gap-1">
                📅 {prediction.lowestPredictedDisplayDate}
                <span className="text-cyan-300 text-[12px]">
                  (₩{prediction.lowestPredictedPrice.toLocaleString()})
                </span>
              </span>
            </div>

            <div className="flex flex-col items-end">
              <span className="text-[10px] text-slate-400">예상 추가 절약액</span>
              <span className="font-syne font-bold text-[#6cf8bb] text-[13px]">
                {prediction.potentialSavings > 0
                  ? `-₩${prediction.potentialSavings.toLocaleString()} (-${prediction.potentialSavingsPercent}%)`
                  : '현재 최저가 구간'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Price Chart with Accurate Dates & AI 1-Week Prediction */}
      <div className="bg-white border border-[#e2e8f0] rounded-2xl p-4.5 flex flex-col gap-3.5 shadow-xs">
        {/* Chart Header & View Mode Switch */}
        <div className="flex flex-col gap-2.5">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-[#0058be]" />
              <h3 className="text-sm font-bold text-[#0b1c30]">
                가격 변동 & 1주일 예측 차트
              </h3>
            </div>

            {/* Model Scenario Switch */}
            <div className="relative">
              <select
                id="prediction-model-select"
                aria-label="예측 모델 선택"
                value={predictionModel}
                onChange={(e) => setPredictionModel(e.target.value as PredictionModelType)}
                className="text-[11px] font-semibold text-[#0058be] bg-blue-50/80 border border-blue-200 rounded-lg px-2 py-1 outline-none cursor-pointer focus:ring-1 focus:ring-blue-400"
              >
                <option value="standard">🤖 AI 복합 예측</option>
                <option value="aggressive_sale">⚡ 특가 집중 모드</option>
                <option value="conservative">🛡️ 보수적 시세 모드</option>
              </select>
            </div>
          </div>

          {/* View Mode Buttons (과거 기록 / 7일 예측 / 통합 뷰) */}
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold text-slate-600 gap-1">
            <button
              onClick={() => {
                setChartViewMode('combined');
                setSelectedHistoryIndex(null);
                setSelectedForecastIndex(null);
              }}
              className={`flex-1 py-1.5 rounded-lg text-center transition-all ${
                chartViewMode === 'combined'
                  ? 'bg-white text-[#0058be] shadow-xs font-bold'
                  : 'hover:text-slate-900'
              }`}
            >
              통합 추이 (전체)
            </button>
            <button
              onClick={() => {
                setChartViewMode('history');
                setSelectedForecastIndex(null);
              }}
              className={`flex-1 py-1.5 rounded-lg text-center transition-all ${
                chartViewMode === 'history'
                  ? 'bg-white text-[#0058be] shadow-xs font-bold'
                  : 'hover:text-slate-900'
              }`}
            >
              과거 기록
            </button>
            <button
              onClick={() => {
                setChartViewMode('forecast');
                setSelectedHistoryIndex(null);
              }}
              className={`flex-1 py-1.5 rounded-lg text-center transition-all flex items-center justify-center gap-1 ${
                chartViewMode === 'forecast'
                  ? 'bg-white text-[#0058be] shadow-xs font-bold'
                  : 'hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3 h-3 text-cyan-600" />
              <span>1주일 예측</span>
            </button>
          </div>
        </div>

        {/* Selected Data Point Inspector Card */}
        {activeInspectorItem && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-3 text-xs flex flex-col gap-1.5 animate-fadeIn">
            <div className="flex justify-between items-center font-bold">
              <span className="text-slate-700 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#0058be]" />
                {activeInspectorItem.type === 'history'
                  ? activeInspectorItem.data.fullDate || activeInspectorItem.data.date
                  : `${activeInspectorItem.data.date} (${activeInspectorItem.data.displayDate})`}
              </span>
              <span className="font-syne text-[15px] font-extrabold text-[#0058be]">
                ₩
                {(activeInspectorItem.type === 'history'
                  ? activeInspectorItem.data.price
                  : activeInspectorItem.data.predictedPrice
                ).toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between items-center text-[11px] text-slate-500 pt-1 border-t border-blue-100">
              <span>
                {activeInspectorItem.type === 'history'
                  ? `기록 출처: ${activeInspectorItem.data.source || '정기 모니터링'}`
                  : `예측 근거: ${activeInspectorItem.data.factor}`}
              </span>
              {activeInspectorItem.type === 'forecast' && (
                <span className="text-emerald-700 font-semibold">
                  신뢰도 {activeInspectorItem.data.confidence}%
                </span>
              )}
              {activeInspectorItem.type === 'history' && activeInspectorItem.data.note && (
                <span className="text-blue-700 font-semibold">{activeInspectorItem.data.note}</span>
              )}
            </div>
          </div>
        )}

        {/* SVG Graph Canvas */}
        <div className="w-full h-44 relative flex flex-col justify-end pt-2">
          <svg
            className="w-full h-36 overflow-visible"
            viewBox="0 0 100 46"
            preserveAspectRatio="none"
          >
            <defs>
              {/* Blue gradient for past history */}
              <linearGradient id="historyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#0058be" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#0058be" stopOpacity="0.0" />
              </linearGradient>

              {/* Cyan / Violet gradient for forecast confidence band */}
              <linearGradient id="forecastBandGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.28" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.08" />
              </linearGradient>
            </defs>

            {/* Target Price Horizontal Guide Line */}
            {targetLineY >= 0 && targetLineY <= 46 && (
              <g>
                <line
                  x1="0"
                  x2="100"
                  y1={targetLineY}
                  y2={targetLineY}
                  stroke="#00714d"
                  strokeDasharray="2,2"
                  strokeWidth="0.75"
                />
                <text
                  x="98"
                  y={targetLineY - 1.5}
                  textAnchor="end"
                  fill="#00714d"
                  fontSize="2.8"
                  fontWeight="bold"
                >
                  목표 ₩{formatK(product.targetPrice)}
                </text>
              </g>
            )}

            {/* Future Confidence Interval Area (if forecast shown) */}
            {confidenceAreaD && (
              <path d={confidenceAreaD} fill="url(#forecastBandGradient)" />
            )}

            {/* Past History Area Fill */}
            {historyAreaD && chartViewMode !== 'forecast' && (
              <path d={historyAreaD} fill="url(#historyGradient)" />
            )}

            {/* Past Line (Solid Blue) */}
            {historyPathD && (
              <path
                d={historyPathD}
                fill="none"
                stroke="#0058be"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Forecast Line (Dashed Cyan / Indigo) */}
            {forecastPathD && (
              <path
                d={forecastPathD}
                fill="none"
                stroke="#0284c7"
                strokeWidth="2"
                strokeDasharray="2,1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Historical Data Points */}
            {svgHistoryPoints.map((pt, idx) => {
              const isLast = idx === svgHistoryPoints.length - 1;
              const isSelected = selectedHistoryIndex === idx;

              return (
                <g
                  key={`hist-${idx}`}
                  className="cursor-pointer group"
                  onClick={() => {
                    setSelectedHistoryIndex(idx);
                    setSelectedForecastIndex(null);
                  }}
                >
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={isSelected ? '3.8' : isLast ? '3' : '2'}
                    className={
                      isSelected
                        ? 'fill-[#0058be] stroke-white stroke-[1]'
                        : isLast
                        ? 'fill-[#0058be]'
                        : 'fill-white stroke-[#0058be]'
                    }
                    strokeWidth={isLast ? '0' : '1.5'}
                  />
                  {isLast && (
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r="5.5"
                      className="fill-[#0058be] opacity-30 animate-ping pointer-events-none"
                    />
                  )}
                </g>
              );
            })}

            {/* Forecast Data Points */}
            {svgForecastPoints.map((pt, idx) => {
              const isSelected = selectedForecastIndex === idx;
              const isLowest = pt.isLowestPoint;

              return (
                <g
                  key={`fore-${idx}`}
                  className="cursor-pointer"
                  onClick={() => {
                    setSelectedForecastIndex(idx);
                    setSelectedHistoryIndex(null);
                  }}
                >
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={isSelected ? '4' : isLowest ? '3.2' : '2.2'}
                    className={
                      isLowest
                        ? 'fill-[#059669] stroke-white stroke-[1]'
                        : isSelected
                        ? 'fill-[#0284c7] stroke-white stroke-[1]'
                        : 'fill-white stroke-[#0284c7]'
                    }
                    strokeWidth="1.6"
                  />
                  {isLowest && (
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r="5"
                      className="fill-emerald-500 opacity-30 animate-pulse pointer-events-none"
                    />
                  )}
                </g>
              );
            })}
          </svg>

          {/* Accurate Date Labels along the X-Axis */}
          <div className="w-full flex justify-between items-center text-[10px] text-slate-500 pt-2 px-1 border-t border-slate-100 font-medium">
            {allPoints.length <= 6
              ? allPoints.map((p, i) => (
                  <span
                    key={i}
                    className={`truncate text-center ${
                      p.isForecast ? 'text-cyan-700 font-semibold' : 'text-slate-600'
                    }`}
                  >
                    {p.displayDate.replace(' (', '\n(')}
                  </span>
                ))
              : // Pick 4-5 representative date points if list is long
                [
                  allPoints[0],
                  allPoints[Math.floor(allPoints.length * 0.33)],
                  allPoints[Math.floor(allPoints.length * 0.66)],
                  allPoints[allPoints.length - 1],
                ].map((p, i) => (
                  <span
                    key={i}
                    className={`truncate text-center ${
                      p.isForecast ? 'text-cyan-700 font-semibold' : 'text-slate-600'
                    }`}
                  >
                    {p.displayDate}
                  </span>
                ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap justify-between items-center text-[11px] text-slate-500 pt-2 border-t border-slate-100 gap-y-1">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-1 bg-[#0058be] rounded-full inline-block" /> 실측 추적 가격
          </span>
          <span className="flex items-center gap-1.5 text-cyan-700 font-semibold">
            <span className="w-2.5 h-1 bg-cyan-500 border-t border-dashed inline-block" /> AI 1주일 예측선
          </span>
          <span className="flex items-center gap-1 text-emerald-700 font-medium">
            <span className="w-2.5 h-0.5 bg-emerald-600 inline-block border-t border-dashed" /> 목표가선
          </span>
        </div>
      </div>

      {/* 7-Day Day-by-Day Forecast Slider / Cards (일자별 7일 가격 예측 타임라인) */}
      <div className="bg-white border border-[#e2e8f0] rounded-2xl p-4 flex flex-col gap-3 shadow-xs">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-[#0b1c30] flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-[#0058be]" />
            <span>앞으로 7일간 일자별 상세 예측</span>
          </h4>
          <span className="text-[11px] text-slate-400">클릭하여 일자별 분석 확인</span>
        </div>

        {/* Horizontal scroll of 7 future days */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {prediction.forecastPoints.map((day, idx) => {
            const isSelected = selectedForecastIndex === idx;
            const diffFromCurrent = day.predictedPrice - product.currentPrice;
            const isDrop = diffFromCurrent < 0;

            return (
              <div
                key={day.date}
                onClick={() => {
                  setSelectedForecastIndex(idx);
                  setSelectedHistoryIndex(null);
                }}
                className={`min-w-[105px] p-2.5 rounded-xl border flex flex-col gap-1 cursor-pointer transition-all ${
                  isSelected
                    ? 'border-[#0058be] bg-blue-50/90 shadow-xs ring-2 ring-blue-500/20'
                    : day.isLowestPoint
                    ? 'border-emerald-300 bg-emerald-50/50 hover:bg-emerald-50'
                    : 'border-slate-200 bg-slate-50/60 hover:bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-700">
                    {day.displayDate}
                  </span>
                  {day.isLowestPoint && (
                    <span className="text-[9px] font-extrabold bg-emerald-600 text-white px-1.5 py-0.2 rounded-full">
                      최저
                    </span>
                  )}
                </div>

                <span className="font-syne font-extrabold text-[13px] text-[#0b1c30]">
                  ₩{day.predictedPrice.toLocaleString()}
                </span>

                <div className="flex items-center justify-between text-[10px] pt-1 border-t border-slate-200/60">
                  <span
                    className={`font-semibold flex items-center ${
                      isDrop
                        ? 'text-emerald-700'
                        : diffFromCurrent > 0
                        ? 'text-red-600'
                        : 'text-slate-500'
                    }`}
                  >
                    {isDrop ? (
                      <>
                        <ArrowDown className="w-2.5 h-2.5" />
                        {Math.abs(diffFromCurrent).toLocaleString()}
                      </>
                    ) : diffFromCurrent > 0 ? (
                      <>
                        <ArrowUp className="w-2.5 h-2.5" />
                        {diffFromCurrent.toLocaleString()}
                      </>
                    ) : (
                      '변동 없음'
                    )}
                  </span>
                  <span className="text-slate-400 font-medium">{day.confidence}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* AI Market Factors & Data Analytics (빅데이터 예측 분석 근거) */}
      <div className="bg-white border border-[#e2e8f0] rounded-2xl p-4 flex flex-col gap-3 shadow-xs">
        <button
          onClick={() => setShowFactorDetail(!showFactorDetail)}
          className="flex items-center justify-between w-full text-left"
        >
          <div className="flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-[#0058be]" />
            <h4 className="text-xs font-bold text-[#0b1c30]">
              빅데이터 예측 분석 근거 ({prediction.marketFactors.length}개 지표)
            </h4>
          </div>
          <span className="text-xs text-[#0058be] font-semibold">
            {showFactorDetail ? '접기' : '자세히 보기'}
          </span>
        </button>

        {showFactorDetail && (
          <div className="grid grid-cols-1 gap-2.5 pt-1 animate-fadeIn">
            {prediction.marketFactors.map((factor) => (
              <div
                key={factor.id}
                className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex items-start gap-2.5"
              >
                <div className="p-1.5 bg-white rounded-lg border border-slate-200 text-[#0058be] mt-0.5 shadow-2xs">
                  {factor.icon === 'tag' && <Tag className="w-3.5 h-3.5" />}
                  {factor.icon === 'trending' && <TrendingDown className="w-3.5 h-3.5" />}
                  {factor.icon === 'calendar' && <Calendar className="w-3.5 h-3.5" />}
                  {factor.icon === 'sparkles' && <Sparkles className="w-3.5 h-3.5" />}
                </div>

                <div className="flex-1 flex flex-col">
                  <span className="text-xs font-bold text-slate-800">{factor.title}</span>
                  <p className="text-[11px] text-slate-500 leading-snug mt-0.5">
                    {factor.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Alert Toggle Switch */}
      <div className="bg-white border border-[#e2e8f0] rounded-2xl p-4 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              product.isAlertActive
                ? 'bg-blue-50 text-[#0058be]'
                : 'bg-slate-100 text-slate-400'
            }`}
          >
            {product.isAlertActive ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
          </div>
          <div>
            <span className="text-sm font-bold text-[#0b1c30] block">목표 가격 알림</span>
            <span className="text-xs text-slate-500">목표 가격에 도달하면 푸시 알림 받기</span>
          </div>
        </div>

        <button
          id="toggle-alert-switch"
          onClick={toggleAlert}
          role="switch"
          aria-checked={product.isAlertActive}
          className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${
            product.isAlertActive ? 'bg-[#0058be]' : 'bg-slate-300'
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out mt-0.5 ml-0.5 ${
              product.isAlertActive ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* Real-time Simulator Test Feature */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/70 rounded-2xl p-3.5 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-[#0058be]" />
          <div>
            <span className="text-xs font-bold text-slate-800 block">가격 변동 시뮬레이션</span>
            <span className="text-[11px] text-slate-500">가격 하락 이벤트를 즉시 테스트합니다</span>
          </div>
        </div>

        <button
          id="btn-simulate-drop"
          onClick={() => onSimulatePriceDrop(product.id)}
          className="px-3 py-1.5 bg-[#0058be] text-white text-xs font-bold rounded-xl hover:bg-blue-700 active:scale-95 transition-all shadow-xs cursor-pointer"
        >
          📉 가격 하락 발생!
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-1">
        <button
          id="btn-edit-price"
          onClick={() => onOpenEditModal(product)}
          className="flex-1 h-12 bg-white border border-slate-300 text-slate-800 rounded-xl font-bold text-sm hover:bg-slate-50 active:scale-98 transition-all flex items-center justify-center gap-2 shadow-2xs cursor-pointer"
        >
          <Edit3 className="w-4 h-4 text-slate-600" />
          <span>가격 수정</span>
        </button>

        <button
          id="btn-delete-product"
          onClick={() => {
            if (confirm(`'${product.name}' 알림을 삭제하시겠습니까?`)) {
              onDeleteProduct(product.id);
            }
          }}
          className="flex-1 h-12 bg-red-50 border border-red-200 text-red-600 rounded-xl font-bold text-sm hover:bg-red-100 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Trash2 className="w-4 h-4" />
          <span>상품 삭제</span>
        </button>
      </div>

      {/* Store Link button */}
      {product.mallUrl && (
        <a
          href={product.mallUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-slate-800 transition-colors shadow-sm"
        >
          <span>{product.mall} 바로가기</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      )}
    </div>
  );
};
