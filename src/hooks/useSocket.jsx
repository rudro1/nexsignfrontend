// src/hooks/useSocket.jsx
import { useEffect, useRef, useCallback, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '@/lib/AuthContext';

// ─── Backend URL (without /api) ───────────────────────────────
const SOCKET_URL = (
  import.meta.env.VITE_API_BASE_URL?.replace('/api', '') ||
  'https://nextsignbackendfinal.vercel.app'
).replace(/\/$/, '');

// ─── Singleton socket instance ────────────────────────────────
let globalSocket = null;

export default function useSocket() {
  const { user, isAuthenticated } = useAuth();
  const socketRef               = useRef(null);
  const [connected, setConnected] = useState(false);

  // ── Connect ──────────────────────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    // Reuse existing live connection
    if (globalSocket?.connected) {
      socketRef.current = globalSocket;
      setConnected(true);
      return;
    }

    // Destroy broken socket before creating new one
    if (globalSocket && !globalSocket.connected) {
      globalSocket.removeAllListeners();
      globalSocket.disconnect();
      globalSocket = null;
    }

    // ── Create new socket ──────────────────────────────────────
    const socket = io(SOCKET_URL, {
      // FIX: Vercel serverless does NOT support persistent websockets
      // Adding polling as fallback for better compatibility
      transports:           ['polling', 'websocket'],
      withCredentials:      true,
      reconnection:         true,
      reconnectionDelay:    2000,
      reconnectionDelayMax: 10000,
      reconnectionAttempts: 5,
      timeout:              10000,
    });

    globalSocket      = socket;
    socketRef.current = socket;

    // ── Core events ────────────────────────────────────────────
    socket.on('connect', () => {
      setConnected(true);

      // FIX: Join owner room after connect
      // Backend has 'join:owner' not 'join'
      const userId = user._id || user.uid;
      if (userId) {
        socket.emit('join:owner', userId);
      }

      if (import.meta.env.DEV) {
        console.log(
          '%c🔌 Socket connected',
          'color:#10b981;font-weight:bold',
          socket.id,
        );
      }
    });

    socket.on('disconnect', (reason) => {
      setConnected(false);
      if (import.meta.env.DEV) {
        console.log('%c🔌 Socket disconnected:', 'color:#ef4444', reason);
      }
    });

    socket.on('connect_error', (err) => {
      setConnected(false);
      // Silent in production — no spam in console
      if (import.meta.env.DEV) {
        console.warn('⚠️ Socket connect_error:', err.message);
      }
    });

    return () => {
      // Intentionally NOT disconnecting here
      // Singleton stays alive across component remounts
    };
  }, [isAuthenticated, user]);

  // ── Disconnect on logout ───────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated && globalSocket) {
      globalSocket.removeAllListeners();
      globalSocket.disconnect();
      globalSocket      = null;
      socketRef.current = null;
      setConnected(false);
    }
  }, [isAuthenticated]);

  // ── Subscribe to event ─────────────────────────────────────
  const on = useCallback((event, handler) => {
    const socket = socketRef.current;
    if (!socket) return () => {};
    socket.on(event, handler);
    // Returns cleanup function
    return () => socket.off(event, handler);
  }, []);

  // ── Unsubscribe ────────────────────────────────────────────
  const off = useCallback((event, handler) => {
    socketRef.current?.off(event, handler);
  }, []);

  // ── Emit event ─────────────────────────────────────────────
  const emit = useCallback((event, data) => {
    if (!socketRef.current?.connected) {
      if (import.meta.env.DEV) {
        console.warn('⚠️ Socket not connected, cannot emit:', event);
      }
      return;
    }
    socketRef.current.emit(event, data);
  }, []);

  // ── Join a document room ───────────────────────────────────
  // FIX: Backend uses 'join:document' with plain string id
  const joinDocument = useCallback((documentId) => {
    if (!documentId) return;
    emit('join:document', documentId);
  }, [emit]);

  // ── Leave a document room ──────────────────────────────────
  const leaveDocument = useCallback((documentId) => {
    if (!documentId) return;
    emit('leave:document', documentId);
  }, [emit]);

  // ── Join a template session room ───────────────────────────
  const joinTemplate = useCallback((templateId) => {
    if (!templateId) return;
    emit('join:template', templateId);
  }, [emit]);

  // ── Join owner room ────────────────────────────────────────
  const joinOwner = useCallback((ownerId) => {
    if (!ownerId) return;
    emit('join:owner', ownerId);
  }, [emit]);

  return {
    socket:       socketRef.current,
    connected,
    on,
    off,
    emit,
    joinDocument,
    leaveDocument,
    joinTemplate,
    joinOwner,
  };
}