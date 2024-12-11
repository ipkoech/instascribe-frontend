import { Component } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { ActivatedRoute, Router } from '@angular/router';
import { DraftService } from '../services/draft.service';
import { DraftModel } from '../../../core/interfaces/draft.model';
import { HttpResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MarkdownPipe } from '../../../core/pipes/markdown.pipe';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SnackBarService } from '../../../core/services/snack-bar.service';
import { BreadcrumbService } from '../../../core/services/breadcrumb.service';
import { BreadCrumbComponent } from '../../shared/bread-crumb/bread-crumb.component';

@Component({
  selector: 'app-post-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTabsModule,
    MatIconModule,
    MarkdownPipe,
    MatProgressSpinnerModule,
    BreadCrumbComponent,
  ],
  templateUrl: './post-detail.component.html',
  styleUrl: './post-detail.component.scss',
})
export class PostDetailComponent {
  selectedPlatform: string = 'twitter';
  draft!: DraftModel;
  isLoading: boolean = true;
  error: string | null = null;

  constructor(
    private api: ApiService,
    private route: ActivatedRoute,
    private postService: DraftService,
    private router: Router,
    private snackBarService: SnackBarService,
    private breadcrumbService: BreadcrumbService
  ) {
    this.loadDraft();
  }

  loadDraft() {
    this.isLoading = true;
    this.error = null;

    this.route.params.subscribe((params) => {
      this.postService.fetchDraft(params['id']).subscribe({
        next: (response: HttpResponse<any>) => {
          this.draft = response.body;
          this.isLoading = false;

          this.breadcrumbService.setBreadcrumbs([
            { label: 'Posts', url: '/content/posts', icon: 'article' },
            { label: this.draft.title, url: `/content/posts/${this.draft.id}` },
          ]);
        },
        error: (error) => {
          this.error = 'Failed to load post';
          this.isLoading = false;
          this.router.navigate(['../']);
        },
      });
    });
  }

  changePlatform(platform: string) {
    this.selectedPlatform = platform;
  }

  copyContent() {
    const content = this.draft.content;
    navigator.clipboard.writeText(content).then(() => {
      this.snackBarService.info('Content copied to clipboard', 300);
    });
  }
}
