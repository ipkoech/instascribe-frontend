import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostsOverviewComponent } from './posts-overview.component';

describe('PostsOverviewComponent', () => {
  let component: PostsOverviewComponent;
  let fixture: ComponentFixture<PostsOverviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PostsOverviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PostsOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
