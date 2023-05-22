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
import {
  catchError,
  concatMap,
  filter,
  from,
  map,
  Observable,
  shareReplay,
  switchMap,
  tap,
} from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  public user$: Observable<User | null>;

  constructor(private auth: Auth, private router: Router) {
    this.user$ = user(this.auth).pipe(shareReplay(1));
  }

  public signInWithGoogle(): Observable<User> {
    return from(signInWithPopup(this.auth, new GoogleAuthProvider())).pipe(
      catchError((error) => {
        throw new Error(error.message);
      }),
      switchMap(() => this.handleAuthSuccess())
    );
  }

  public signInWithGitHub(): Observable<User> {
    return from(signInWithPopup(this.auth, new GithubAuthProvider())).pipe(
      catchError((error) => {
        throw new Error(error.message);
      }),
      switchMap(() => this.handleAuthSuccess())
    );
  }

  public login(email: string, password: string): Observable<User> {
    return from(signInWithEmailAndPassword(this.auth, email, password)).pipe(
      catchError((error) => {
        throw new Error(error.message);
      }),
      switchMap(() => this.handleAuthSuccess())
    );
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

  public logout($event?: Event): Observable<void> {
    if ($event) $event.preventDefault();
    return from(signOut(this.auth));
  }

  private handleAuthSuccess(): Observable<User> {
    return authState(this.auth).pipe(
      filter((user) => !!user),
      map((user) => user as User)
    );
  }
}
