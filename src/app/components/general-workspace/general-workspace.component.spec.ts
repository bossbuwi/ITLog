import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeneralWorkspaceComponent } from './general-workspace.component';

describe('GeneralWorkspaceComponent', () => {
  let component: GeneralWorkspaceComponent;
  let fixture: ComponentFixture<GeneralWorkspaceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GeneralWorkspaceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GeneralWorkspaceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
