import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/components/header/header.component';
import { ChatComponent } from './features/chat/chat.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, ChatComponent],
  template: `
    <app-header />
    <router-outlet />
    <app-chat />
  `,
})
export class AppComponent {}