import { Routes } from "@angular/router";
import { ContentOverviewComponent } from "./content-overview/content-overview.component";
import { DraftsComponent } from "./drafts/drafts.component";
import { GeneratedPostsComponent } from "./generated-posts/generated-posts.component";
import { ReviewComponent } from "./review/review.component";
import { DraftDetailComponent } from "./draft-detail/draft-detail.component";
import { DraftReviewDetailComponent } from "./draft-review-detail/draft-review-detail.component";

export const CONTENT_ROUTES: Routes = [
  { path: '', redirectTo: 'content/drafts', pathMatch: 'full' },
  {
    path: '', component: ContentOverviewComponent, children: [
      { path: 'drafts', component: DraftsComponent},
      { path: 'drafts/:id', component: DraftDetailComponent },
      { path: 'review', component: ReviewComponent },
      { path: 'review/:id', component: DraftReviewDetailComponent },
    ]
  },
];
