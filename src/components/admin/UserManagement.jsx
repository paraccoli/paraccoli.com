import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { PlusIcon, MinusIcon, BanknotesIcon, XCircleIcon } from '@heroicons/react/24/outline';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [parcAmount, setParcAmount] = useState(100); // デフォルトPARC量
  const [showParcModal, setShowParcModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [parcAction, setParcAction] = useState('add'); // add または remove

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`https://example.com/api/admin/users?page=${page}&search=${search}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
        setTotalPages(data.total_pages || 1);
      } else {
        toast.error('ユーザー一覧の取得に失敗しました');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('ユーザー情報の読み込み中にエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, search]);

  const handleBanUser = async (userId) => {
    if (!window.confirm('このユーザーをBANしますか？この操作は元に戻せません。')) return;
    
    try {
      const response = await fetch(`https://example.com/api/admin/users/${userId}/ban`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        toast.success('ユーザーをBANしました');
        fetchUsers();
      } else {
        toast.error('ユーザーのBAN処理に失敗しました');
      }
    } catch (error) {
      console.error('Error banning user:', error);
      toast.error('BAN処理中にエラーが発生しました');
    }
  };

  const handleKickUser = async (userId) => {
    if (!window.confirm('このユーザーをキックしますか？')) return;
    
    try {
      const response = await fetch(`https://example.com/api/admin/users/${userId}/kick`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        toast.success('ユーザーをキックしました');
        fetchUsers();
      } else {
        toast.error('ユーザーのキック処理に失敗しました');
      }
    } catch (error) {
      console.error('Error kicking user:', error);
      toast.error('キック処理中にエラーが発生しました');
    }
  };

  const openParcModal = (user, action) => {
    setSelectedUser(user);
    setParcAction(action);
    setShowParcModal(true);
  };

  const handleUpdateParc = async () => {
    if (!selectedUser) return;

    try {
      const response = await fetch(`https://example.com/api/admin/users/${selectedUser._id}/balance`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          action: parcAction,
          amount: parcAmount,
          reason: `管理者による${parcAction === 'add' ? '付与' : '削減'}`
        })
      });

      if (response.ok) {
        toast.success(`${selectedUser.username}に${parcAction === 'add' ? parcAmount + 'PARCを付与' : parcAmount + 'PARCを削減'}しました`);
        setShowParcModal(false);
        fetchUsers();
      } else {
        toast.error('PARC残高の更新に失敗しました');
      }
    } catch (error) {
      console.error('Error updating PARC balance:', error);
      toast.error('PARC残高更新中にエラーが発生しました');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-6 border-b">
        <h2 className="text-xl font-semibold text-gray-800">ユーザー管理</h2>
        <p className="text-sm text-gray-600">全ユーザーの情報確認と管理を行います</p>
      </div>
      
      <div className="p-4">
        <div className="flex mb-4">
          <input
            type="text"
            placeholder="ユーザー名またはIDで検索..."
            className="px-4 py-2 border rounded-lg flex-grow mr-2"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button
            className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600"
            onClick={() => fetchUsers()}
          >
            検索
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center my-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ユーザー</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PARC残高</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">登録日</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img 
                            className="h-10 w-10 rounded-full" 
                            src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=random`} 
                            alt=""
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.username}</div>
                          <div className="text-sm text-gray-500">{user.email || 'No email'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user._id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-amber-100 text-amber-800">
                        {user.balance} PARC
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.created_at).toLocaleDateString('ja-JP')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        className="text-green-600 hover:text-green-900 mr-2"
                        onClick={() => openParcModal(user, 'add')}
                      >
                        <PlusIcon className="h-5 w-5" />
                      </button>
                      <button
                        className="text-amber-600 hover:text-amber-900 mr-2"
                        onClick={() => openParcModal(user, 'remove')}
                      >
                        <MinusIcon className="h-5 w-5" />
                      </button>
                      <button
                        className="text-red-600 hover:text-red-900 mr-2"
                        onClick={() => handleKickUser(user._id)}
                      >
                        <XCircleIcon className="h-5 w-5" />
                      </button>
                      <button
                        className="text-red-800 hover:text-red-900"
                        onClick={() => handleBanUser(user._id)}
                      >
                        <BanknotesIcon className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ページネーション */}
        <div className="flex justify-between items-center mt-6">
          <button
            className="px-4 py-2 border rounded-lg disabled:opacity-50"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
          >
            前へ
          </button>
          <span className="text-sm text-gray-600">
            {page} / {totalPages} ページ
          </span>
          <button
            className="px-4 py-2 border rounded-lg disabled:opacity-50"
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
          >
            次へ
          </button>
        </div>
      </div>

      {/* PARC更新モーダル */}
      {showParcModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">
              {parcAction === 'add' ? 'PARCを付与する' : 'PARCを削減する'}
            </h3>
            <p className="mb-4">
              <span className="font-semibold">{selectedUser.username}</span> に対して
              {parcAction === 'add' ? 'PARCを付与します' : 'PARCを削減します'}
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                PARC量:
              </label>
              <input
                type="number"
                min="1"
                value={parcAmount}
                onChange={(e) => setParcAmount(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowParcModal(false)}
                className="px-4 py-2 border rounded-md"
              >
                キャンセル
              </button>
              <button
                onClick={handleUpdateParc}
                className={`px-4 py-2 rounded-md text-white ${
                  parcAction === 'add' ? 'bg-green-500 hover:bg-green-600' : 'bg-amber-500 hover:bg-amber-600'
                }`}
              >
                {parcAction === 'add' ? '付与する' : '削減する'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;