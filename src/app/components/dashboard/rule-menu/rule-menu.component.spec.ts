import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RuleMenuComponent } from './rule-menu.component';

describe('RuleMenuComponent', () => {
  let component: RuleMenuComponent;
  let fixture: ComponentFixture<RuleMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RuleMenuComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RuleMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
