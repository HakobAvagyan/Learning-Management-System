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

@Injectable({ providedIn: 'root' })
export class ChatService {
  readonly messages   = signal<ChatMessagePayload[]>([]);
  readonly connected  = signal(false);
  readonly unreadCount = signal(0);

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

        this.client!.subscribe(`/user/${userId}/queue/messages`, (msg: IMessage) => {
          const payload: ChatMessagePayload = JSON.parse(msg.body);
          this.messages.update(list => [...list, payload]);
          this.unreadCount.update(n => n + 1);
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

  loadConversations(): Observable<number[]> {
    return this.http.get<number[]>('/api/chat/conversations');
  }

  clearUnread(): void {
    this.unreadCount.set(0);
  }

  disconnect(): void {
    this.client?.deactivate();
    this.connected.set(false);
  }
}