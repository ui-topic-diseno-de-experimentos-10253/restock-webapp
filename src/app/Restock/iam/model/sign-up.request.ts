/**
 * Model for sign up request
 */
export class SignUpRequest {
  public username: string;
  public password: string;
  public roleId: number;
  /**
   * Constructor.
   * @param username The username.
   * @param password The password.
   * @param roleId The role id.
   */
  constructor(username: string, password: string, roleId: number) {
    this.password = password;
    this.username = username;
    this.roleId = roleId;
  }
}
