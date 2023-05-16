import { Injectable } from '@angular/core';
import {
  Auth,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  user,
  signOut,
  authState,
  UserCredential,
  User,
  updateProfile,
} from '@angular/fire/auth';
import { concatMap, from, Observable, shareReplay } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  public user$: Observable<User | null>;

  constructor(private auth: Auth, private router: Router) {
    this.user$ = user(this.auth).pipe(shareReplay(1));
  }

  public signInWithGoogle() {
    return signInWithPopup(this.auth, new GoogleAuthProvider())
      .then((result) => {
        this.handleAuthSuccess(result);
      })
      .catch((error) => {
        throw new Error(error.message);
      });
  }

  public signInWithGitHub() {
    return signInWithPopup(this.auth, new GithubAuthProvider())
      .then((result) => {
        this.handleAuthSuccess(result);
      })
      .catch((error) => {
        throw new Error(error.message);
      });
  }

  public login(email: string, password: string) {
    return signInWithEmailAndPassword(this.auth, email, password)
      .then((result) => {
        this.handleAuthSuccess(result);
      })
      .catch((error) => {
        throw new Error(error.message);
      });
  }

  public updateUser(user: Partial<User>): Observable<void> {
    return this.user$.pipe(
      concatMap((currentUser) =>
        from(
          updateProfile(currentUser as User, {
            displayName: user.displayName ?? undefined,
            photoURL: user.photoURL ?? undefined,
          })
        )
      )
    );
  }

  public async logout($event?: Event) {
    if ($event) $event.preventDefault();

    await signOut(this.auth);

    await this.router.navigateByUrl('/login');
  }

  private handleAuthSuccess(result: UserCredential): void {
    authState(this.auth).subscribe((user) => {
      if (user) this.router.navigate(['/']);
    });
  }
}
