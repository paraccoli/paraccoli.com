import React from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const Layout = ({ children }) => {
  const location = useLocation();
  
  // ログイン関連のパスを定義
  const noNavbarPaths = [
    '/login', 
    '/auth/callback',
  ];
  const shouldShowNavbar = !noNavbarPaths.includes(location.pathname);
  
  // すべてのページでフッターを表示
  return (
    <div className="min-h-screen flex flex-col">
      {shouldShowNavbar && <Navbar />}
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;