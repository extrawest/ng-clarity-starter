import { Component } from '@angular/core';
import { ClarityModule } from '@clr/angular';
import { loadIcons } from './clarity-icons';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [ClarityModule],
  providers: [],
})
export class AppComponent {
  constructor() {
    loadIcons();
  }
}
