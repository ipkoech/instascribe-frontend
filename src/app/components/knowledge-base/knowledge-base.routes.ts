import { Routes } from "@angular/router";
import { PostsComponent } from "./posts/posts.component";
import { DocsComponent } from "./docs/docs.component";
import { PodcastsComponent } from "./podcasts/podcasts.component";
import { KbOverviewComponent } from "./kb-overview/kb-overview.component";
import { FilesComponent } from "./files/files.component";
import { FilesOverviewComponent } from "./files-overview/files-overview.component";
import { AllFilesComponent } from "./all-files/all-files.component";

export const KNOWLEDGE_BASE_ROUTES: Routes = [
  { path: '', redirectTo: 'knowledge-base/posts', pathMatch: 'full' },
  {
    path: '', component: KbOverviewComponent, children: [
      { path: 'posts', component: PostsComponent },
      {
        path: 'files', component: FilesComponent, children: [
          {
            path: '', component: FilesOverviewComponent, children: [
              { path: 'podcasts', component: PodcastsComponent },
              { path: 'docs', component: DocsComponent },
              { path: 'all', component: AllFilesComponent },
              { path: '', redirectTo: 'all', pathMatch: 'full' },
            ]
          },
        ]
      },
    ]
  },
];
