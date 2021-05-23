import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';

import { ConfigNames } from 'src/app/constants/properties';
import { CoreService } from 'src/app/services/core/core.service';
import { LoginService } from 'src/app/services/login/login.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor(private login: LoginService, private router: Router,
    private core: CoreService) {

  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (this.login.getAdminStatus()) {
      return true;
    } else if (this.core.getConfigValue(ConfigNames.CONF_OPEN_REPORTS) == 'Y') {
      return true;
    } else {
      this.router.navigate(['/rules']);
      return false;
    }
  }

}
