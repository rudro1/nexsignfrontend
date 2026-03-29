// src/hooks/useSocket.jsx
import { useEffect, useRef, useCallback, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '@/lib/AuthContext';

const SOCKET_URL = import.meta.env.VITE_API_BASE_URL?.replace('/api', '')
  || 'https://nextsignbackendfinal.vercel.app';

// ─── Singleton socket instance ────────────────────────────────
let globalSocket = null;

export default function useSocket() {
  const { user, isAuthenticated } = useAuth();
  const socketRef = useRef(null);
  const [connected,   setConnected]   = useState(false);
  const [lastEvent,   setLastEvent]   = useState(null);

  // ── Connect ──────────────────────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    // Reuse existing connection
    if (globalSocket?.connected) {
      socketRef.current = globalSocket;
      setConnected(true);
      return;
    }

    const socket = io(SOCKET_URL, {
      transports:       ['websocket', 'polling'],
      withCredentials:  true,
      reconnection:     true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      timeout:          10000,
      auth: {
        userId: user._id || user.uid,
      },
    });

    globalSocket     = socket;
    socketRef.current = socket;

    // ── Core events ────────────────────────────────────────────
    socket.on('connect', () => {
      setConnected(true);
      if (import.meta.env.DEV) {
        console.log('%c🔌 Socket connected', 'color:#10b981;font-weight:bold', socket.id);
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
      if (import.meta.env.DEV) {
        console.warn('Socket error:', err.message);
      }
    });

    // ── Join user room ─────────────────────────────────────────
    socket.emit('join', {
      userId: user._id || user.uid,
      role:   user.role,
    });

    return () => {
      // Don't disconnect — keep singleton alive
      // Only cleanup listeners added in this hook
    };
  }, [isAuthenticated, user]);

  // ── Disconnect on logout ───────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated && globalSocket) {
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
    return () => socket.off(event, handler);
  }, []);

  // ── Unsubscribe ────────────────────────────────────────────
  const off = useCallback((event, handler) => {
    socketRef.current?.off(event, handler);
  }, []);

  // ── Emit event ─────────────────────────────────────────────
  const emit = useCallback((event, data) => {
    if (!socketRef.current?.connected) {
      if (import.meta.env.DEV) console.warn('Socket not connected, cannot emit:', event);
      return;
    }
    socketRef.current.emit(event, data);
  }, []);

  // ── Join a document room ───────────────────────────────────
  const joinDocument = useCallback((documentId) => {
    emit('join-document', { documentId });
  }, [emit]);

  // ── Leave a document room ──────────────────────────────────
  const leaveDocument = useCallback((documentId) => {
    emit('leave-document', { documentId });
  }, [emit]);

  // ── Join a template session room ───────────────────────────
  const joinTemplate = useCallback((templateId) => {
    emit('join-template', { templateId });
  }, [emit]);

  return {
    socket:        socketRef.current,
    connected,
    lastEvent,
    on,
    off,
    emit,
    joinDocument,
    leaveDocument,
    joinTemplate,
  };
}