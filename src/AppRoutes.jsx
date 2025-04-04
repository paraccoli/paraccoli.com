// src/AppRoutes.jsx
import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Layout from './components/layout/Layout';
import RequireAuth from './components/auth/RequireAuth';
import RequireAdmin from './components/shared/RequireAdmin';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// パブリックページ
import DiscordLogin from './components/auth/DiscordLogin';
import LoginCallback from './components/auth/LoginCallback';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import NotFound from './pages/NotFound';

// 保護されたページ
import Home from './pages/Home';
import Profile from './pages/Profile';
import CryptoBot from './pages/CryptoBot';
import GuildBot from './pages/GuildBot';
import Forums from './pages/Forums';
import CreateForumPost from './pages/CreateForumPost';
import ForumPost from './pages/ForumPost';
import Documentation from './pages/Documentation';
import Donate from './pages/Donate';
import FeedbackForm from './pages/FeedbackForm';
import Notifications from './pages/Notifications';
import About from './pages/About';
import Quest from './pages/Quest';
import ExchangeForm from './pages/ExchangeForm';
import CasinoBot from './pages/CasinoBot'; // パスを修正
import Daily from './pages/Daily';

// カジノ関連のページをインポート
import CasinoPlay from './components/Casino/CasinoPlay';
import CasinoLeaderboard from './components/Casino/CasinoLeaderboard';
import CasinoRewards from './components/Casino/CasinoRewards';
import CasinoTutorial from './components/Casino/CasinoTutorial';

// 管理者ページ
import AdminHome from './pages/AdminHome';
import Reports from './components/admin/Reports';
import Feedback from './components/admin/Feedback';
import QuestManagement from './components/admin/QuestManagement';
import ExchangeManagement from './components/admin/ExchangeManagement';
import SecurityLogs from './components/admin/SecurityLogs';
import SecurityLogsDebug from './components/admin/SecurityLogsDebug';
import AdminUsers from './pages/AdminUsers';

// URL Hash要素へのスクロール機能
function ScrollToHashElement() {
  const { hash } = useLocation();
  
  useEffect(() => {
    if (hash) {
      const id = hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [hash]);
  
  return null;
}

const AppRoutes = () => {
  return (
    <Layout>
      <ScrollToHashElement />
      <Routes>
        {/* パブリックルート - ログイン不要 */}
        <Route path="/login" element={<DiscordLogin />} />
        <Route path="/auth/callback" element={<LoginCallback />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/" element={<Home />} />
        
        {/* パブリックでアクセス可能、コンテンツはログイン状態で変化 */}
        <Route path="/crypto" element={<CryptoBot />} />
        <Route path="/guild" element={<GuildBot />} />
        <Route path="/about" element={<About />} />
        <Route path="/casino" element={<CasinoBot />} />

        {/* カジノサブページ */}
        <Route path="/casino/play" element={<CasinoPlay />} />
        <Route path="/casino/leaderboard" element={<CasinoLeaderboard />} />
        <Route path="/casino/rewards" element={<CasinoRewards />} />
        <Route path="/casino/tutorial" element={<CasinoTutorial />} />
        
        {/* プロテクテッドルート - ログイン必須 */}
        <Route path="/forums/posts/new" element={<RequireAuth><CreateForumPost /></RequireAuth>} />
        <Route path="/forums/posts/:postId" element={<RequireAuth><ForumPost /></RequireAuth>} />
        <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
        <Route path="/notifications" element={<RequireAuth><Notifications /></RequireAuth>} />
        <Route path="/donate" element={<RequireAuth><Donate /></RequireAuth>} />
        <Route path="/feedback" element={<RequireAuth><FeedbackForm /></RequireAuth>} />
        <Route path="/quests" element={<RequireAuth><Quest /></RequireAuth>} />
        <Route path="/exchange" element={<RequireAuth><ExchangeForm /></RequireAuth>} />
        <Route path="/docs" element={<RequireAuth><Documentation /></RequireAuth>} />
        <Route path="/forums" element={<RequireAuth><Forums /></RequireAuth>} />
        <Route path="/daily" element={<RequireAuth><Daily /></RequireAuth>} />
        
        {/* 管理者ルート */}
        <Route path="/admin" element={<RequireAdmin><AdminHome /></RequireAdmin>} />
        <Route path="/admin/reports" element={<RequireAdmin><Reports /></RequireAdmin>} />
        <Route path="/admin/feedback" element={<RequireAdmin><Feedback /></RequireAdmin>} />
        <Route path="/admin/quests" element={<RequireAdmin><QuestManagement /></RequireAdmin>} />
        <Route path="/admin/exchange" element={<RequireAdmin><ExchangeManagement /></RequireAdmin>} />
        <Route path="/admin/users" element={<RequireAdmin><AdminUsers /></RequireAdmin>} />
        
        {/* セキュリティログルート - 両方定義 */}
        <Route path="/admin/security-logs" element={<RequireAdmin><SecurityLogs /></RequireAdmin>} />
        <Route path="/admin/securitylogs" element={<RequireAdmin><SecurityLogs /></RequireAdmin>} />
        
        {/* デバッグ用 */}
        <Route path="/admin/security-debug" element={<RequireAdmin><SecurityLogsDebug /></RequireAdmin>} />
        
        {/* 404ルート - 最後に配置 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <ToastContainer position="bottom-right" />
    </Layout>
  );
};

export default AppRoutes;