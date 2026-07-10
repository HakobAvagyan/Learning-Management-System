import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Client, IMessage } from '@stomp/stompjs';
import { Observable } from 'rxjs';

export interface ChatMessagePayload {
  senderId: number;
  senderName: string;
  recipientId: number;
  content: string;
  timestamp: string;
}

export interface ConversationSummary {
  userId: number;
  unreadCount: number;
}

@Injectable({ providedIn: 'root' })
export class ChatService {
  readonly messages     = signal<ChatMessagePayload[]>([]);
  readonly connected    = signal(false);
  readonly unreadCount  = signal(0);
  /** Последнее входящее сообщение — для обновления бейджей в реальном времени */
  readonly lastIncoming = signal<ChatMessagePayload | null>(null);

  private client?: Client;
  private readonly http = inject(HttpClient);

  connect(userId: number, token: string): void {
    if (this.client?.active) return;

    const proto = location.protocol === 'https:' ? 'wss' : 'ws';
    this.client = new Client({
      brokerURL: `${proto}://${location.host}/ws-chat`,
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,

      onConnect: () => {
        this.connected.set(true);

        this.client!.subscribe(`/user/queue/messages`, (msg: IMessage) => {
          const payload: ChatMessagePayload = JSON.parse(msg.body);
          this.messages.update(list => [...list, payload]);
          this.unreadCount.update(n => n + 1);
          this.lastIncoming.set(payload);
        });
      },

      onDisconnect: () => this.connected.set(false),
      onStompError: frame => console.error('STOMP error', frame),
    });

    this.client.activate();
  }

  send(payload: ChatMessagePayload): void {
    if (!this.client?.connected) return;
    this.client.publish({
      destination: '/app/chat.send',
      body: JSON.stringify(payload),
    });
  }

  loadHistory(recipientId: number): Observable<ChatMessagePayload[]> {
    return this.http.get<ChatMessagePayload[]>(`/api/chat/history/${recipientId}`);
  }

  loadConversations(): Observable<ConversationSummary[]> {
    return this.http.get<ConversationSummary[]>('/api/chat/conversations');
  }

  markAsRead(userId: number): Observable<void> {
    return this.http.post<void>(`/api/chat/read/${userId}`, {});
  }

  clearUnread(): void {
    this.unreadCount.set(0);
  }

  disconnect(): void {
    this.client?.deactivate();
    this.connected.set(false);
  }
}