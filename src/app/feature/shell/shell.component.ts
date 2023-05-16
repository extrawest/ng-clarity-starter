import { Component } from '@angular/core';
import { UserService } from '../../core/services/user.service';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import {
  ClrDropdownModule,
  ClrLayoutModule,
  ClrNavigationModule,
  ClrVerticalNavModule,
} from '@clr/angular';
import { CdsBreadcrumbModule } from '@cds/angular';

@Component({
  selector: 'app-shell',
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterOutlet,
    RouterLinkActive,
    ClrVerticalNavModule,
    ClrDropdownModule,
    CdsBreadcrumbModule,
    ClrNavigationModule,
    ClrLayoutModule,
  ],
})
export class ShellComponent {
  public user$ = this.userService.user$;

  constructor(private readonly userService: UserService) {}

  public logout() {
    this.userService.logout();
  }
}
