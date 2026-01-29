import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

class SocketService {
    private socket: Socket | null = null;
    private listeners: Map<string, Set<Function>> = new Map();

    connect(userId: string) {
        if (this.socket?.connected) return;

        this.socket = io(SOCKET_URL, {
            transports: ['websocket'],
            autoConnect: true
        });

        this.socket.on('connect', () => {
            console.log('[SOCKET] Connected:', this.socket?.id);
            this.socket?.emit('join', userId);
        });

        this.socket.on('disconnect', () => {
            console.log('[SOCKET] Disconnected');
        });

        this.socket.onAny((event, data) => {
            console.log(`[SOCKET] Event: ${event}`, data);
            const eventListeners = this.listeners.get(event);
            if (eventListeners) {
                eventListeners.forEach(cb => cb(data));
            }
        });
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    on(event: string, callback: Function) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event)?.add(callback);

        return () => {
            this.listeners.get(event)?.delete(callback);
        };
    }

    emit(event: string, data: any) {
        this.socket?.emit(event, data);
    }
}

export const socketService = new SocketService();
export default socketService;
