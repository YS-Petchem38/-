export interface PriceHistoryPoint {
  date: string; // ISO format or key like '2026-08-26'
  displayDate?: string; // Short format e.g. '08/26', '6/15'
  fullDate?: string; // Long formatted date e.g. '2026년 8월 26일 (수)'
  price: number;
  source?: string; // e.g. '정기 모니터링', '가격 변동 감지', '사용자 등록'
  note?: string; // e.g. '여름 정기 세일', '쿠폰 적용가', '역대 최저가 갱신'
}

export interface ForecastDataPoint {
  date: string; // '2026-08-27'
  displayDate: string; // '8/27 (목)'
  dayOffset: number; // 1 to 7
  predictedPrice: number;
  minPrice: number; // Lower bound (90% confidence)
  maxPrice: number; // Upper bound (90% confidence)
  confidence: number; // percentage (e.g. 91)
  factor: string; // e.g. '주말 타임 특가 시작', '카드 청구할인 적용 유력'
  trend: 'down' | 'up' | 'stable';
  isLowestPoint?: boolean;
}

export interface MarketFactor {
  id: string;
  icon: 'trending' | 'calendar' | 'tag' | 'sparkles' | 'shield';
  title: string;
  desc: string;
  impact: 'positive' | 'negative' | 'neutral'; // positive means likely to drop / save money
}

export interface PricePredictionResult {
  forecastPoints: ForecastDataPoint[];
  currentPrice: number;
  lowestPredictedPrice: number;
  lowestPredictedDate: string;
  lowestPredictedDisplayDate: string;
  lowestDayOffset: number;
  potentialSavings: number;
  potentialSavingsPercent: number;
  recommendation: 'BUY_NOW' | 'WAIT_A_FEW_DAYS' | 'MONITOR';
  recommendationTitle: string;
  recommendationBadge: string;
  recommendationDesc: string;
  confidenceScore: number;
  marketFactors: MarketFactor[];
  targetHitPredicted: boolean;
  targetHitDayDisplay?: string;
}

export interface Product {
  id: string;
  brand?: string;
  name: string;
  imageUrl: string;
  originalPrice: number;
  currentPrice: number;
  targetPrice: number;
  mall: string;
  mallUrl?: string;
  isAlertActive: boolean;
  createdAt: string;
  history: PriceHistoryPoint[];
}

export interface AppNotification {
  id: string;
  productId: string;
  productName: string;
  imageUrl: string;
  type: 'price_drop' | 'target_hit';
  title: string;
  currentPrice: number;
  originalPrice: number;
  dropPercentage: number;
  timeAgo: string;
  timestamp: number;
  isRead: boolean;
}

export type TabType = 'home' | 'add' | 'notifications' | 'mypage';
