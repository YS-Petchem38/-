import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Product, AppNotification, TabType, PriceHistoryPoint } from './types';
import { INITIAL_PRODUCTS, INITIAL_NOTIFICATIONS } from './data/mockData';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { SidebarDrawer } from './components/SidebarDrawer';
import { HomeScreen } from './components/HomeScreen';
import { AddProductScreen } from './components/AddProductScreen';
import { ProductDetailScreen } from './components/ProductDetailScreen';
import { NotificationsScreen } from './components/NotificationsScreen';
import { MyPageScreen } from './components/MyPageScreen';
import { EditPriceModal } from './components/EditPriceModal';
import { formatToISODate, formatToKoreanFullDate, formatToShortDate } from './utils/pricePredictor';

export default function App() {
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('sale_alert_products');
      return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    try {
      const saved = localStorage.getItem('sale_alert_notifications');
      return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  });

  const [currentTab, setCurrentTab] = useState<TabType>('home');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem('sale_alert_products', JSON.stringify(products));
    } catch (e) {
      console.error(e);
    }
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem('sale_alert_notifications', JSON.stringify(notifications));
    } catch (e) {
      console.error(e);
    }
  }, [notifications]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleTabChange = (tab: TabType) => {
    setCurrentTab(tab);
    setSelectedProduct(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddProduct = (newProduct: Product) => {
    setProducts((prev) => [newProduct, ...prev]);

    // If initial price is already at or below target, create celebration notification
    if (newProduct.currentPrice <= newProduct.targetPrice) {
      const goalNotif: AppNotification = {
        id: `notif-${Date.now()}`,
        productId: newProduct.id,
        productName: newProduct.name,
        imageUrl: newProduct.imageUrl,
        type: 'target_hit',
        title: '목표가 도달!',
        currentPrice: newProduct.currentPrice,
        originalPrice: newProduct.originalPrice,
        dropPercentage: Math.max(0, Math.round(((newProduct.originalPrice - newProduct.currentPrice) / newProduct.originalPrice) * 100)),
        timeAgo: '방금',
        timestamp: Date.now(),
        isRead: false,
      };
      setNotifications((prev) => [goalNotif, ...prev]);
    }

    showToast(`'${newProduct.name}' 알림이 등록되었습니다!`);
    setSelectedProduct(newProduct);
  };

  const handleUpdateProduct = (updated: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    if (selectedProduct && selectedProduct.id === updated.id) {
      setSelectedProduct(updated);
    }
    showToast('상품 설정이 변경되었습니다.');
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    setNotifications((prev) => prev.filter((n) => n.productId !== productId));
    setSelectedProduct(null);
    showToast('상품 알림이 삭제되었습니다.');
  };

  const handleSavePrice = (newTarget: number, newCurrent: number) => {
    if (!editingProduct) return;

    const now = new Date();
    const priceChanged = editingProduct.currentPrice !== newCurrent;
    const newPoint: PriceHistoryPoint = {
      date: formatToISODate(now),
      displayDate: `오늘 (${formatToShortDate(now)})`,
      fullDate: formatToKoreanFullDate(now),
      price: newCurrent,
      source: '가격 직접 수정',
      note: priceChanged ? `₩${newCurrent.toLocaleString()}으로 변경` : '목표가 수정',
    };

    const historyEntry = priceChanged
      ? [...(editingProduct.history || []), newPoint]
      : editingProduct.history;

    const updated: Product = {
      ...editingProduct,
      targetPrice: newTarget,
      currentPrice: newCurrent,
      history: historyEntry,
    };

    handleUpdateProduct(updated);
    setEditingProduct(null);

    // If new current price is below target, celebrate!
    if (newCurrent <= newTarget) {
      try {
        confetti({ particleCount: 70, spread: 60 });
      } catch {}
    }
  };

  const handleSimulatePriceDrop = (productId: string) => {
    const targetProd = products.find((p) => p.id === productId);
    if (!targetProd) return;

    // Drop price by 15% or drop to target price
    const dropRate = 0.15;
    const newPrice = Math.round((targetProd.currentPrice * (1 - dropRate)) / 1000) * 1000;
    const dropPercentage = Math.round(((targetProd.originalPrice - newPrice) / targetProd.originalPrice) * 100);
    const isGoalNow = newPrice <= targetProd.targetPrice;

    const now = new Date();
    const newPoint: PriceHistoryPoint = {
      date: formatToISODate(now),
      displayDate: `오늘 (${formatToShortDate(now)})`,
      fullDate: formatToKoreanFullDate(now),
      price: newPrice,
      source: '실시간 가격 하락 감지',
      note: isGoalNow ? '목표가 도달 특가 달성! 🎉' : `-${dropPercentage}% 깜짝 타임세일 발생`,
    };

    const updated: Product = {
      ...targetProd,
      currentPrice: newPrice,
      history: [
        ...(targetProd.history || []),
        newPoint,
      ],
    };

    handleUpdateProduct(updated);

    // Add push notification
    const newNotif: AppNotification = {
      id: `notif-${Date.now()}`,
      productId: updated.id,
      productName: updated.name,
      imageUrl: updated.imageUrl,
      type: isGoalNow ? 'target_hit' : 'price_drop',
      title: isGoalNow ? '목표가 도달!' : '가격이 내려갔어요!',
      currentPrice: newPrice,
      originalPrice: targetProd.originalPrice,
      dropPercentage: Math.max(1, dropPercentage),
      timeAgo: '방금',
      timestamp: Date.now(),
      isRead: false,
    };

    setNotifications((prev) => [newNotif, ...prev]);

    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
      });
    } catch {}

    showToast(`🔔 [가격 하락] ${targetProd.name}: ₩${newPrice.toLocaleString()}원!`);
  };

  const handleSelectNotification = (notif: AppNotification) => {
    // Mark as read
    setNotifications((prev) =>
      prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
    );

    const prod = products.find((p) => p.id === notif.productId);
    if (prod) {
      setSelectedProduct(prod);
    } else {
      showToast('해당 상품 정보를 찾을 수 없습니다.');
    }
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    showToast('모든 알림을 읽음 처리했습니다.');
  };

  const handleClearNotifications = () => {
    if (confirm('모든 알림 내역을 삭제하시겠습니까?')) {
      setNotifications([]);
      showToast('알림 내역이 삭제되었습니다.');
    }
  };

  const handleResetData = () => {
    setProducts(INITIAL_PRODUCTS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setSelectedProduct(null);
    setCurrentTab('home');
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const goalHitCount = products.filter((p) => p.currentPrice <= p.targetPrice).length;

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-[#0b1c30] flex flex-col items-center">
      {/* Container wrapper for mobile & desktop */}
      <div className="w-full max-w-lg bg-[#ffffff] min-h-screen shadow-2xl relative flex flex-col border-x border-[#e2e8f0]/40">
        {/* Top Header */}
        <Header
          onOpenMenu={() => setIsMenuOpen(true)}
          onOpenProfile={() => handleTabChange('mypage')}
          unreadCount={unreadCount}
          currentTab={currentTab}
          onTabChange={handleTabChange}
        />

        {/* Toast Alert Banner */}
        {toastMessage && (
          <div
            id="toast-notification"
            className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-[#0058be] text-white px-4 py-2.5 rounded-2xl text-xs font-bold shadow-xl flex items-center gap-2 animate-bounce max-w-[90vw] text-center"
          >
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 px-5 pt-3 overflow-y-auto">
          {selectedProduct ? (
            <ProductDetailScreen
              product={selectedProduct}
              onBack={() => setSelectedProduct(null)}
              onUpdateProduct={handleUpdateProduct}
              onDeleteProduct={handleDeleteProduct}
              onOpenEditModal={(p) => setEditingProduct(p)}
              onSimulatePriceDrop={handleSimulatePriceDrop}
            />
          ) : (
            <>
              {currentTab === 'home' && (
                <HomeScreen
                  products={products}
                  onSelectProduct={handleSelectProduct}
                  onOpenAdd={() => handleTabChange('add')}
                />
              )}

              {currentTab === 'add' && (
                <AddProductScreen
                  onAddProduct={handleAddProduct}
                  onCancel={() => handleTabChange('home')}
                />
              )}

              {currentTab === 'notifications' && (
                <NotificationsScreen
                  notifications={notifications}
                  onSelectNotification={handleSelectNotification}
                  onMarkAllAsRead={handleMarkAllAsRead}
                  onClearNotifications={handleClearNotifications}
                />
              )}

              {currentTab === 'mypage' && (
                <MyPageScreen
                  products={products}
                  onResetData={handleResetData}
                />
              )}
            </>
          )}
        </main>

        {/* Bottom Navigation Bar */}
        <BottomNav
          currentTab={selectedProduct ? 'home' : currentTab}
          onTabChange={handleTabChange}
          unreadCount={unreadCount}
        />

        {/* Sidebar Drawer */}
        <SidebarDrawer
          isOpen={isMenuOpen}
          onClose={() => setIsMenuOpen(false)}
          currentTab={currentTab}
          onTabChange={handleTabChange}
          productCount={products.length}
          goalHitCount={goalHitCount}
          unreadCount={unreadCount}
        />

        {/* Edit Price Modal */}
        {editingProduct && (
          <EditPriceModal
            product={editingProduct}
            isOpen={!!editingProduct}
            onClose={() => setEditingProduct(null)}
            onSave={handleSavePrice}
          />
        )}
      </div>
    </div>
  );
}
