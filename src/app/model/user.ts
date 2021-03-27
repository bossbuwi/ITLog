export class User {
  username: string;
  password: string;
  isLoggedIn: boolean;
  isAdmin: boolean;

  constructor (){
    this.username = '';
    this.password = '';
    this.isLoggedIn = false;
    this.isAdmin = false;
  }
}
