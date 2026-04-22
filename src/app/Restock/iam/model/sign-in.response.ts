/**
 * Model for the sign in response.
 */
export class SignInResponse {
  public id: number;
  public username: string;
  public roleId: number;
  public token: string;

  /**
   * Constructor.
   * @param id The user id.
   * @param username The username.
   * @param token The generated token.
   * @param roleId The user role.
   */
  constructor(id: number, username: string, roleId:number, token: string) {
    this.token = token;
    this.username = username;
    this.roleId = roleId;
    this.id = id;
  }
}
