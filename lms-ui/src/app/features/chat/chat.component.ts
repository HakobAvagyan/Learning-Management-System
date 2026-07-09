import {
  Component, OnInit, OnDestroy, AfterViewChecked,
  ElementRef, ViewChild, inject, signal, computed
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { ChatService, ChatMessagePayload } from '../../core/services/chat.service';

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

  private readonly auth   = inject(AuthService);
  readonly chatSvc        = inject(ChatService);

  readonly isOpen   = signal(false);
  readonly newText  = signal('');
  readonly loading  = signal(false);

  readonly currentUser = computed(() => this.auth.currentUser());
  readonly isAdmin     = computed(() =>
    this.currentUser()?.roles?.includes('ROLE_ADMIN') ?? false
  );


  readonly recipientId = computed(() => this.isAdmin() ? ADMIN_ID : ADMIN_ID);

  ngOnInit(): void {
    const user = this.currentUser();
    if (!user) return;

    const token = this.auth.getToken()!;
    this.chatSvc.connect(user.id, token);

    this.loading.set(true);
    this.chatSvc.loadHistory(ADMIN_ID).subscribe({
      next: history => {
        this.chatSvc.messages.set(history);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  toggle(): void {
    this.isOpen.update(v => !v);
    if (this.isOpen()) this.chatSvc.clearUnread();
  }

  send(): void {
    const text = this.newText().trim();
    const user = this.currentUser();
    if (!text || !user) return;

    this.chatSvc.send({
      senderId:    user.id,
      senderName:  user.username,
      recipientId: ADMIN_ID,
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

  ngAfterViewChecked(): void {
    this.scrollAnchor?.nativeElement.scrollIntoView({ behavior: 'smooth' });
  }

  ngOnDestroy(): void {
    this.chatSvc.disconnect();
  }
}