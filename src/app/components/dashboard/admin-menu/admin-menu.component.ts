import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { ErrorCodes } from 'src/app/constants/properties';
import { User } from 'src/app/models/user';
import { CoreService } from 'src/app/services/core/core.service';
import { DashboardService } from 'src/app/services/dashboard/dashboard.service';
import { LoggerService } from 'src/app/services/logger/logger.service';

@Component({
  selector: 'app-admin-menu',
  templateUrl: './admin-menu.component.html',
  styleUrls: ['./admin-menu.component.css']
})
export class AdminMenuComponent implements OnInit {
  private className: string = 'AdminMenuComponent';
  FATALERROR: boolean;
  adminForm: FormGroup;
  usersArr: User[];
  isPristine: boolean;
  isTouched: boolean;

  constructor(private builder: FormBuilder, private dashboard: DashboardService,
    private core: CoreService, private log: LoggerService) {

  }

  ngOnInit(): void {
    if (this.core.getStartUpStatus() == ErrorCodes.FATAL_ERROR) {
      this.FATALERROR = true;
    } else {
      this.initializeComponent();
    }
  }

  private initializeComponent(): void {
    this.log.logVerbose(this.className, 'initializeComponent', 'Initializing ' + this.className + '.');
    this.isPristine = true;
    this.isTouched = true;
    this.usersArr = [];
    this.adminForm = this.builder.group({
      users: this.builder.array([])
    });
    this.dashboard.fetchUsers();
    this.dashboard.subscribeUsersFetch().subscribe(status => {
      if (status) {
        this.usersArr = this.dashboard.getUsers();
        for (let user in this.usersArr) {
          this.addUser(this.usersArr[user]);
        }
      }
    });
    this.dashboard.subscribeUsersUpdate().subscribe(status => {
      if (status) {
        this.isPristine = false;
        this.isTouched = false;
      }
    });
  }

  get users(): FormArray {
    return this.adminForm.get('users') as FormArray;
  }

  newUser(username: string, admin: boolean): FormGroup {
    let userGroup: FormGroup = this.builder.group({
      username: [username],
      admin: []
    });
    userGroup.controls['admin'].setValue(admin);
    if (username == 'admin') {
      userGroup.controls['admin'].disable();
    }
    return userGroup;
  }

  addUser(user: User) {
    this.users.push(this.newUser(user.username, user.admin));
  }

  onSubmit() {
    this.log.logVerbose(this.className, 'onSubmit', 'Preparing form for submission.');
    let changedUsers: User[];
    changedUsers = [];
    this.log.logVerbose(this.className, 'onSubmit', 'Reading changed users.');
    for (let index in this.users.controls) {
      if (this.users.controls[index].get('admin').dirty) {
        this.usersArr[index].admin = this.users.controls[index].get('admin').value;
        changedUsers.push(this.usersArr[index]);
      }
    }
    this.dashboard.updateUsers(changedUsers);
  }

  onCheckboxChange(): void {
    this.isPristine = false;
    this.isTouched = true;
  }
}
