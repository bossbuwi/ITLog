export class User {
  username: string;
  password: string;
  // isLoggedIn: boolean;
  admin: boolean;

  constructor (){
    this.username = '';
    this.password = '';
    // this.isLoggedIn = false;
    this.admin = false;
  }
}
