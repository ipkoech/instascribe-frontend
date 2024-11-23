import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditResponseComponent } from './edit-response.component';

describe('EditResponseComponent', () => {
  let component: EditResponseComponent;
  let fixture: ComponentFixture<EditResponseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditResponseComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditResponseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
