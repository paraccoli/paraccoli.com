// src/hooks/useAuth.js
import { useAuth as useAuthFromContext } from '../contexts/AuthContext';

// 後方互換性のためにコンテキストからエクスポートされたuseAuthを再エクスポート
export const useAuth = useAuthFromContext;