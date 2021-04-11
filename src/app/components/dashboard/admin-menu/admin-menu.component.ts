import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, FormControl } from '@angular/forms';
import { User } from 'src/app/model/user';
import { DashboardService } from 'src/app/services/dashboard/dashboard.service';

@Component({
  selector: 'app-admin-menu',
  templateUrl: './admin-menu.component.html',
  styleUrls: ['./admin-menu.component.css']
})
export class AdminMenuComponent implements OnInit {
  adminForm: FormGroup;
  usersArr: User[];
  isPristine: boolean;
  isTouched: boolean;

  constructor(private builder: FormBuilder, private dashboard: DashboardService) { }

  ngOnInit(): void {
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
    var userGroup: FormGroup = this.builder.group({
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
    var changedUsers: User[];
    changedUsers = [];
    for (let index in this.users.controls) {
      if (this.users.controls[index].get('admin').dirty) {
        this.usersArr[index].admin = this.users.controls[index].get('admin').value;
        changedUsers.push(this.usersArr[index]);
      }
    }
    console.log(changedUsers);
    this.dashboard.updateUsers(changedUsers);
  }

  onCheckboxChange(): void {
    this.isPristine = false;
    this.isTouched = true;
  }

}
