import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL
  ?? process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/v1\/?$/, '')
  ?? 'https://api.aqora.sa';

export interface ChatSocketMessage {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
}

let chatSocket: Socket | null = null;

function getToken(): string | null {
  try {
    const raw = localStorage.getItem('aqar-auth');
    if (!raw) return null;
    return JSON.parse(raw)?.state?.token ?? null;
  } catch {
    return null;
  }
}

export function connectChatSocket(): Socket | null {
  const token = getToken();
  if (!token) return null;
  if (chatSocket) {
    chatSocket.auth = { token };
    if (!chatSocket.connected) chatSocket.connect();
    return chatSocket;
  }

  chatSocket = io(`${SOCKET_URL}/chat`, {
    transports: ['websocket'],
    auth: { token },
  });

  chatSocket.on('connect', () => console.log('Chat socket connected'));
  chatSocket.on('connect_error', (e) => console.error('Chat socket error:', e.message));
  chatSocket.on('disconnect', () => console.log('Chat socket disconnected'));

  return chatSocket;
}

export function getChatSocket() {
  return chatSocket;
}

export function disconnectChatSocket() {
  chatSocket?.disconnect();
  chatSocket = null;
}

export function joinChat(chatId: string) {
  chatSocket?.emit('join_chat', chatId);
}

export function leaveChat(chatId: string) {
  chatSocket?.emit('leave_chat', chatId);
}

export function sendChatMessage(chatId: string, content: string): Promise<ChatSocketMessage> {
  return new Promise((resolve, reject) => {
    const socket = chatSocket;
    if (!socket?.connected) {
      reject(new Error('تعذر الاتصال بالمحادثة. تحقق من الإنترنت وحاول مرة أخرى.'));
      return;
    }

    socket.timeout(10_000).emit(
      'send_message',
      { chatId, content },
      (error: Error | null, message: ChatSocketMessage) => {
        if (error) {
          reject(new Error('تعذر إرسال الرسالة. حاول مرة أخرى.'));
          return;
        }
        resolve(message);
      },
    );
  });
}

export function emitTyping(chatId: string) {
  chatSocket?.emit('typing', chatId);
}
