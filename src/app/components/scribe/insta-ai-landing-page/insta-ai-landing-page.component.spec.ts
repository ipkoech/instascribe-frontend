import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InstaAiLandingPageComponent } from './insta-ai-landing-page.component';

describe('InstaAiLandingPageComponent', () => {
  let component: InstaAiLandingPageComponent;
  let fixture: ComponentFixture<InstaAiLandingPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InstaAiLandingPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InstaAiLandingPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
