import {
  Component, OnInit, OnDestroy, AfterViewChecked,
  ElementRef, ViewChild, inject, signal, computed, effect
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { ChatService, ChatMessagePayload, ConversationSummary } from '../../core/services/chat.service';

const ADMIN_ID = 1;

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
})
export class ChatComponent implements OnInit, OnDestroy, AfterViewChecked {

  @ViewChild('scrollAnchor') private scrollAnchor!: ElementRef;

  private readonly auth = inject(AuthService);
  readonly chatSvc      = inject(ChatService);

  readonly isOpen          = signal(false);
  readonly newText         = signal('');
  readonly loading         = signal(false);
  readonly selectedUserId  = signal<number | null>(null);
  readonly conversations   = signal<ConversationSummary[]>([]);

  readonly currentUser = computed(() => this.auth.currentUser());
  readonly isAdmin     = computed(() =>
    this.currentUser()?.roles?.includes('ROLE_ADMIN') ?? false
  );

  readonly recipientId = computed(() =>
    this.isAdmin() ? (this.selectedUserId() ?? ADMIN_ID) : ADMIN_ID
  );

  readonly visibleMessages = computed(() => {
    const msgs = this.chatSvc.messages();
    if (!this.isAdmin() || this.selectedUserId() === null) return msgs;
    const peer = this.selectedUserId()!;
    const me   = this.currentUser()!.id;
    return msgs.filter(m =>
      (m.senderId === me && m.recipientId === peer) ||
      (m.senderId === peer && m.recipientId === me)
    );
  });

  constructor() {
    // Real-time: update unread badges when a new message arrives via WebSocket
    effect(() => {
      const incoming = this.chatSvc.lastIncoming();
      if (!incoming || !this.isAdmin()) return;
      if (incoming.senderId === this.currentUser()?.id) return;

      this.conversations.update(list => {
        const idx = list.findIndex(c => c.userId === incoming.senderId);
        if (this.selectedUserId() === incoming.senderId) return list;
        if (idx >= 0) {
          return list.map((c, i) =>
            i === idx ? { ...c, unreadCount: c.unreadCount + 1 } : c
          );
        }
        return [...list, { userId: incoming.senderId!, unreadCount: 1 }];
      });
    });
  }

  ngOnInit(): void {
    const user = this.currentUser();
    if (!user) return;

    this.chatSvc.connect(user.id, this.auth.getToken()!);

    if (this.isAdmin()) {
      this.loadConversations();
    } else {
      this.loadHistory(ADMIN_ID);
    }
  }

  selectUser(userId: number): void {
    this.selectedUserId.set(userId);
    this.chatSvc.messages.set([]);
    this.loadHistory(userId);
    this.markAsRead(userId);
  }

  private markAsRead(userId: number): void {
    // Zero-out badge immediately in UI, then persist to server
    this.conversations.update(list =>
      list.map(c => c.userId === userId ? { ...c, unreadCount: 0 } : c)
    );
    this.chatSvc.markAsRead(userId).subscribe();
  }

  backToList(): void {
    this.selectedUserId.set(null);
    this.chatSvc.messages.set([]);
    this.loadConversations();
  }

  toggle(): void {
    this.isOpen.update(v => !v);
    if (this.isOpen()) {
      this.chatSvc.clearUnread();
      if (this.isAdmin() && this.selectedUserId() === null) {
        this.loadConversations();
      }
    }
  }

  send(): void {
    const text = this.newText().trim();
    const user = this.currentUser();
    if (!text || !user) return;
    if (this.isAdmin() && this.selectedUserId() === null) return;

    this.chatSvc.send({
      senderId:    user.id,
      senderName:  user.username,
      recipientId: this.recipientId(),
      content:     text,
      timestamp:   new Date().toISOString(),
    });
    this.newText.set('');
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.send();
    }
  }

  isMine(msg: ChatMessagePayload): boolean {
    return msg.senderId === this.currentUser()?.id;
  }

  private loadHistory(recipientId: number): void {
    this.loading.set(true);
    this.chatSvc.loadHistory(recipientId).subscribe({
      next: history => {
        this.chatSvc.messages.set(history);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  private loadConversations(): void {
    this.chatSvc.loadConversations().subscribe({
      next: ids => this.conversations.set(ids),
      error: () => {},
    });
  }

  ngAfterViewChecked(): void {
    this.scrollAnchor?.nativeElement.scrollIntoView({ behavior: 'smooth' });
  }

  ngOnDestroy(): void {
    this.chatSvc.disconnect();
  }
}