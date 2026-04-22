import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {BehaviorSubject} from "rxjs";
import {Router} from "@angular/router";
import {SignUpRequest} from "../model/sign-up.request";
import {SignUpResponse} from "../model/sign-up.response";
import {SignInRequest} from "../model/sign-in.request";
import {SignInResponse} from "../model/sign-in.response";
import {environment} from '../../../../environments/environment';
import {SessionService} from '../../../shared/services/session.service';

/**
 * Service for handling authentication operations.
 * @summary
 * This service is responsible for handling authentication operations like sign-up, sign-in, and sign-out.
 */
@Injectable({providedIn: 'root'})
export class AuthenticationService {
  basePath: string = `${environment.serverBaseUrlBackend}`;
  httpOptions = {headers: new HttpHeaders({'Content-Type': 'application/json'})};

  private signedIn: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private signedInUserId: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  private signedInUsername: BehaviorSubject<string> = new BehaviorSubject<string>('');
  private signedInRole: BehaviorSubject<number> = new BehaviorSubject<number>(0);

  /**
   * Constructor for the AuthenticationService.
   * @param router The router service.
   * @param http The HttpClient service.
   * @param sessionService The SessionService for managing user sessions.
   */
  constructor(private router: Router, private http: HttpClient, private sessionService: SessionService) {
  }

  get isSignedIn() {
    return this.signedIn.asObservable();
  }

  get currentUserId() {
    return this.signedInUserId.asObservable();
  }

  get currentUsername() {
    return this.signedInUsername.asObservable();
  }

  get currentUserRole() {
    return this.signedInRole.asObservable();  // Getter para el rol
  }

  /**
   * Sign up a new user.
   * @summary
   * This method sends a POST request to the server with the user's username and password.
   * If the request is successful, the user's id and username are logged and the user is navigated to the sign-in page.
   * If the request fails, an error message is logged and the user is navigated to the sign-up page.
   * @param signUpRequest The {@link SignUpRequest} object containing the user's username and password.
   * @returns The {@link SignUpResponse} object containing the user's id and username.
   */
  signUp(signUpRequest: SignUpRequest) {
    return this.http.post<SignUpResponse>(`${this.basePath}/authentication/sign-up`, signUpRequest, this.httpOptions)
      .subscribe({
        next: (response) => {
          console.log(`Signed up as ${response.username} with id ${response.id}`);
          this.router.navigate(['/sign-in']).then();
        },
        error: (error) => {
          console.error(`Error while signing up: ${error}`);
          this.router.navigate(['/sign-up']).then();
        }
      });
  }

  /**
   * Sign in a user.
   * @summary
   * This method sends a POST request to the server with the user's username and password.
   * If the request is successful, the signedIn, signedInUserId, and signedInUsername are set to true,
   * the user's id, and the user's username respectively.
   * The token is stored in the local storage and the user is navigated to the home page.
   * If the request fails, the signedIn, signedInUserId, and signedInUsername are set to false, 0, and
   * an empty string respectively.
   * An error message is logged and the user is navigated to the sign-in page.
   * @param signInRequest The {@link SignInRequest} object containing the user's username and password.
   * @returns The {@link SignInResponse} object containing the user's id, username, and token.
   */
  signIn(signInRequest: SignInRequest) {
    console.log(signInRequest);
    return this.http.post<SignInResponse>(`${this.basePath}/authentication/sign-in`, signInRequest, this.httpOptions)
      .subscribe({
        next: (response) => {
          console.log("Sign-in successful:", response);
          this.signedIn.next(true);
          this.signedInUserId.next(response.id);
          this.signedInUsername.next(response.username);
          this.signedInRole.next(response.roleId);
          localStorage.setItem('user_id', response.id.toString());
          localStorage.setItem('token', response.token);
          localStorage.setItem('role', response.roleId.toString());
          this.sessionService.setRoleId(response.roleId);
          this.sessionService.setProfileId(response.id);
          console.log(`Signed in as ${response.username} with token ${response.token} and role ${response.roleId}`);
          this.router.navigate(['/']).then();
        },
        error: (error) => {
          this.signedIn.next(false);
          this.signedInUserId.next(0);
          this.signedInUsername.next('');
          this.signedInRole.next(0);  // Reset role on error
          console.error(`Error while signing in: ${error}`);
          this.router.navigate(['/sign-in']).then();
        }
      });
  }

  /**
   * Sign out the user.
   * @summary
   * This method sets the signedIn, signedInUserId, and signedInUsername to their default values,
   * removes the token from the local storage, and navigates to the sign-in page.
   */
  signOut() {
    this.signedIn.next(false);
    this.signedInUserId.next(0);
    this.signedInUsername.next('');
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user_id');
    this.sessionService.clearAll();
    this.router.navigate(['/sign-in']).then();
  }

}
