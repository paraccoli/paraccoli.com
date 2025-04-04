import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useAdminNotification } from '../../contexts/AdminNotificationContext';
import { Disclosure, Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { 
  Bars3Icon, 
  XMarkIcon, 
  BellIcon, 
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  ShieldCheckIcon 
} from '@heroicons/react/24/outline';
import { navigation } from '../../constants/navigation';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const { notifications } = useAdminNotification();
  
  // 管理者向け通知の総数を計算
  const adminNotificationCount = Object.values(notifications).reduce((a, b) => a + b, 0);

  return (
    <Disclosure as="nav" className="bg-white shadow-sm">
      {({ open }) => (
        <>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <div className="flex-shrink-0 flex items-center">
                  <Link to="/">
                    <img 
                      src="/logo.svg" 
                      alt="Paraccoli" 
                      className="h-8 w-auto"
                    />
                  </Link>
                </div>
                <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      to={item.path}
                      className={`${
                        location.pathname === item.path
                          ? 'border-blue-500 text-gray-900'
                          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                      } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:items-center">
                {/* 認証済みの場合のみヘッダーにアイテム表示 */}
                {isAuthenticated ? (
                  <>
                    {/* 管理者バッジ */}
                    {user?.is_admin && (
                      <Link
                        to="/admin"
                        className="relative mr-4 p-1 rounded-full text-gray-600 hover:text-gray-800 focus:outline-none"
                      >
                        <span className="sr-only">管理画面</span>
                        <ShieldCheckIcon className="h-6 w-6" aria-hidden="true" />
                        {adminNotificationCount > 0 && (
                          <span className="absolute top-0 right-0 block h-4 w-4 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center">
                            {adminNotificationCount}
                          </span>
                        )}
                      </Link>
                    )}
                    
                    {/* 通知ベル */}
                    <Link
                      to="/notifications"
                      className="relative mr-4 p-1 rounded-full text-gray-600 hover:text-gray-800 focus:outline-none"
                    >
                      <span className="sr-only">通知</span>
                      <BellIcon className="h-6 w-6" aria-hidden="true" />
                      {/* 通知バッジ（通知がある場合）*/}
                      {user?.unread_notifications > 0 && (
                        <span className="absolute top-0 right-0 block h-4 w-4 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center">
                          {user.unread_notifications}
                        </span>
                      )}
                    </Link>
                    
                    {/* プロフィールドロップダウン */}
                    <Menu as="div" className="relative ml-3">
                      <div>
                        <Menu.Button className="flex rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                          <span className="sr-only">ユーザーメニューを開く</span>
                          <img
                            className="h-8 w-8 rounded-full"
                            src={user?.avatar || '/default-avatar.png'}
                            alt="User avatar"
                          />
                        </Menu.Button>
                      </div>
                      <Transition
                        as={Fragment}
                        enter="transition ease-out duration-200"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                      >
                        <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                          <Menu.Item>
                            {({ active }) => (
                              <div className="px-4 py-2 text-sm text-gray-500 border-b">
                                <div className="font-medium text-gray-900">{user?.username || 'ユーザー'}</div>
                                <div className="truncate">{user?.email || ''}</div>
                              </div>
                            )}
                          </Menu.Item>
                          <Menu.Item>
                            {({ active }) => (
                              <Link
                                to="/profile"
                                className={`${
                                  active ? 'bg-gray-100' : ''
                                } flex items-center px-4 py-2 text-sm text-gray-700`}
                              >
                                <UserCircleIcon className="h-5 w-5 mr-2" aria-hidden="true" />
                                プロフィール
                              </Link>
                            )}
                          </Menu.Item>
                          <Menu.Item>
                            {({ active }) => (
                              <button
                                onClick={logout}
                                className={`${
                                  active ? 'bg-gray-100' : ''
                                } flex w-full items-center px-4 py-2 text-sm text-gray-700`}
                              >
                                <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" aria-hidden="true" />
                                ログアウト
                              </button>
                            )}
                          </Menu.Item>
                        </Menu.Items>
                      </Transition>
                    </Menu>
                  </>
                ) : (
                  <Link
                    to="/login"
                    className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    ログイン
                  </Link>
                )}
              </div>
              <div className="-mr-2 flex items-center sm:hidden">
                {/* モバイルメニューボタン */}
                <Disclosure.Button className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500">
                  <span className="sr-only">メニューを開く</span>
                  {open ? (
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>
            </div>
          </div>

          {/* モバイルメニュー */}
          <Disclosure.Panel className="sm:hidden">
            <div className="pt-2 pb-3 space-y-1">
              {navigation.map((item) => (
                <Disclosure.Button
                  key={item.name}
                  as={Link}
                  to={item.path}
                  className={`${
                    location.pathname === item.path
                      ? 'bg-blue-50 border-blue-500 text-blue-700'
                      : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                  } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
                >
                  {item.name}
                </Disclosure.Button>
              ))}
            </div>

            {/* 認証済みの場合のモバイルメニュー */}
            {isAuthenticated ? (
              <div className="pt-4 pb-3 border-t border-gray-200">
                <div className="flex items-center px-4">
                  <div className="flex-shrink-0">
                    <img
                      className="h-10 w-10 rounded-full"
                      src={user?.avatar || '/default-avatar.png'}
                      alt=""
                    />
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-gray-800">{user?.username || 'ユーザー'}</div>
                    <div className="text-sm font-medium text-gray-500">{user?.email || ''}</div>
                  </div>
                  <Link
                    to="/notifications"
                    className="relative ml-auto flex-shrink-0 p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none"
                  >
                    <span className="sr-only">通知</span>
                    <BellIcon className="h-6 w-6" aria-hidden="true" />
                    {user?.unread_notifications > 0 && (
                      <span className="absolute top-0 right-0 block h-4 w-4 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center">
                        {user.unread_notifications}
                      </span>
                    )}
                  </Link>
                </div>
                <div className="mt-3 space-y-1">
                  <Disclosure.Button
                    as={Link}
                    to="/profile"
                    className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                  >
                    プロフィール
                  </Disclosure.Button>
                  {user?.is_admin && (
                    <Disclosure.Button
                      as={Link}
                      to="/admin"
                      className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                    >
                      管理画面
                    </Disclosure.Button>
                  )}
                  <Disclosure.Button
                    as="button"
                    onClick={logout}
                    className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                  >
                    ログアウト
                  </Disclosure.Button>
                </div>
              </div>
            ) : (
              <div className="pt-4 pb-3 border-t border-gray-200">
                <div className="px-4">
                  <Link
                    to="/login"
                    className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    ログイン
                  </Link>
                </div>
              </div>
            )}
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
};

export default Navbar;