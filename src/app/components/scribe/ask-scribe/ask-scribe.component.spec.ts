import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AskScribeComponent } from './ask-scribe.component';

describe('AskScribeComponent', () => {
  let component: AskScribeComponent;
  let fixture: ComponentFixture<AskScribeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AskScribeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AskScribeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
