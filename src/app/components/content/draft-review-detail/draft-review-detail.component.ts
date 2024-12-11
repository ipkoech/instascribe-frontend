import { CommonModule } from '@angular/common';
import {
  HttpClient,
  HttpErrorResponse,
  HttpParams,
  HttpResponse,
} from '@angular/common/http';
import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Output,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import {
  FormsModule,
  ReactiveFormsModule,
  FormGroup,
  FormBuilder,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MatDialogModule,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router } from '@angular/router';
import Editor from '@toast-ui/editor';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { DraftModel } from '../../../core/interfaces/draft.model';
import { SnackBarService } from '../../../core/services/snack-bar.service';
import { DraftService } from '../services/draft.service';
import '@toast-ui/editor/dist/toastui-editor-viewer.css';
import '@toast-ui/editor/dist/toastui-editor.css';
import { ApiService } from '../../../core/services/api.service';
import { UserModelsResponse } from '../../../core/interfaces/user.model';
import { BreadcrumbService } from '../../../core/services/breadcrumb.service';
import { BreadCrumbComponent } from '../../shared/bread-crumb/bread-crumb.component';
import { MatChipsModule } from '@angular/material/chips';
import { UserService } from '../../../core/services/user.service';
import { MarkdownPipe } from "../../../core/pipes/markdown.pipe";

@Component({
  selector: 'app-draft-review-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    FormsModule,
    MatInputModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatDialogModule,
    MatButtonModule,
    MatTooltipModule,
    BreadCrumbComponent,
    MatChipsModule,
    MarkdownPipe
  ],
  templateUrl: './draft-review-detail.component.html',
  styleUrl: './draft-review-detail.component.scss',
})
export class DraftReviewDetailComponent implements AfterViewInit {
  @ViewChild('editorElement') editorElement!: ElementRef;
  @Output() onChange = new EventEmitter<string>();

  draftId!: string;
  draft!: DraftModel;
  public editor!: Editor;
  private contentChanges = new Subject<string>();
  private autoSaveSubscription: any;
  collaboratorForm: FormGroup;
  initialValue: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private draftService: DraftService,
    private snackBarService: SnackBarService,
    private dialog: MatDialog,
    private fb: FormBuilder,
    private http: HttpClient,
    private api: ApiService,
    private breadcrumbService: BreadcrumbService,
    public userService: UserService,
  ) {
    this.route.params.subscribe((params) => {
      this.draftId = params['id'];
      if (this.draftId) {
        this.loadDraft(this.draftId);
        this.setupAutoSave();
        this.loadUsers();
      }
    });
    this.collaboratorForm = this.fb.group({
      userIds: [[], [Validators.required]],
      accessLevel: ['viewer', Validators.required],
      reason: ['', Validators.required],
    });
  }

  private setupAutoSave() {
    this.autoSaveSubscription = this.contentChanges
      .pipe(debounceTime(1000), distinctUntilChanged())
      .subscribe((content) => {
        this.saveDraft(content);
      });
  }

  saveDraft(content: string) {
    const updatedDraft = {
      draft: {
        content: content,
      },
    };
    this.draftService.updateDraft(this.draftId, updatedDraft).subscribe({
      next: (response: HttpResponse<any>) => {
        if (response.ok) {
        }
      },
    });
  }

  ngAfterViewInit() {
    this.initializeEditor();
  }

  private initializeEditor() {
    this.editor = new Editor({
      el: this.editorElement.nativeElement,
      height: '400px',
      initialValue: '',
      previewStyle: 'tab',
      initialEditType: 'wysiwyg',
      hideModeSwitch: true,
      previewHighlight: false,
      viewer: true,
    });

    this.editor.on('change', () => {
      const content = this.editor.getMarkdown();
      this.onChange.emit(content);
      this.contentChanges.next(content);
    });
  }

  users: UserModelsResponse | undefined;
  loadUsers() {
    this.http
      .get(this.api.base_uri_api + 'users', {
        withCredentials: true,
        observe: 'response',
        params: new HttpParams()
          .append('include', 'roles')
          .append('per_page', -1),
      })
      .subscribe({
        next: (response: HttpResponse<any>) => {
          if (response.ok) {
            this.users = response.body;
          }
        },
        error: (errorResponse: HttpErrorResponse) => { },
      });
  }
  collaboratorIds: Set<string> = new Set<string>();
  loadDraft(id: string) {
    this.draftService.fetchDraft(id).subscribe({
      next: (response: HttpResponse<any>) => {
        this.draft = response.body;
        this.breadcrumbService.setBreadcrumbs([
          { label: 'Review', url: '/content/review', icon: 'article' },
          { label: this.draft.title, url: `/content/review/${this.draft.id}` },
        ]);
        this.collaboratorIds.clear();
        // Populate the Set with collaborator IDs
        if (this.draft.collaborators) {
          this.draft.collaborators.forEach((collab: any) => {
            this.collaboratorIds.add(collab.id);
          });
        }
        if (this.editor && this.draft.content) {
          this.editor.setMarkdown(this.draft.content);
        }
      },
    });
  }
  /**
   * Check if the given user ID belongs to the author.
   * @param userId - ID of the user to check
   * @returns boolean indicating if the user is the author
   */
  isAuthor(userId: string): boolean {
    return this.draft?.author?.id === userId;
  }

  /**
   * Check if the given user ID is already a collaborator.
   * @param userId - ID of the user to check
   * @returns boolean indicating if the user is a collaborator
   */
  isCollaborator(userId: string): boolean {
    return this.collaboratorIds.has(userId);
  }

  /**
   * Get tooltip message for a user.
   * @param userId - ID of the user
   * @returns string message
   */
  getTooltip(userId: string): string {
    if (this.isAuthor(userId)) {
      return 'Cannot add the author as a collaborator.';
    } else if (this.isCollaborator(userId)) {
      return 'User is already a collaborator.';
    }
    return '';
  }

  ngOnDestroy() {
    this.editor?.destroy();
    this.autoSaveSubscription?.unsubscribe();
  }

  startReview() {
    const dialogRef = this.dialog.open(this.ConfirmationDialogComponent, {
      width: '400px',
      hasBackdrop: true,
      data: {
        title: 'Start Review',
        message:
          'Are you sure you want to start the review process? This will lock the draft for editing.',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.draftService.startReview(this.draftId).subscribe({
          next: () => {
            this.loadDraft(this.draftId);
            this.snackBarService.info('Review started', 500, 'center', 'top');
          },
        });
      }
    });
  }

  approveDraft() {
    const dialogRef = this.dialog.open(this.ConfirmationDialogComponent, {
      width: '400px',
      hasBackdrop: true,
      data: {
        title: 'Approve Draft',
        message: 'Are you sure you want to approve this draft?',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.draftService.approveDraft(this.draftId).subscribe({
          next: (response: HttpResponse<any>) => {
            if (response.ok) {
              this.loadDraft(this.draftId);
              this.snackBarService.success(
                'Draft approved',
                500,
                'center',
                'top'
              );
            }
          },
          error: (error) => {
            this.snackBarService.error(error.error['error']);
          },
        });
      }
    });
  }

  rejectDraft() {
    const dialogRef = this.dialog.open(this.ConfirmationDialogComponent, {
      width: '400px',
      hasBackdrop: true,
      data: {
        title: 'Reject Draft',
        message:
          'Are you sure you want to reject this draft? Please provide a reason.',
        showReason: true,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.draftService.rejectDraft(this.draftId).subscribe({
          next: (response: HttpResponse<any>) => {
            if (response.ok) {
              this.loadDraft(this.draftId);
              this.snackBarService.info('Draft rejected', 500, 'center', 'top');
            }
          },
          error: (error) => {
            this.snackBarService.error(error.error['error']);
          },
        });
      }
    });
  }

  removeCollaborator(userId: string) {
    const dialogRef = this.dialog.open(this.ConfirmationDialogComponent, {
      width: '400px',
      hasBackdrop: true,
      data: {
        title: 'Remove Collaborator',
        message: 'Are you sure you want to remove this collaborator?',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.draftService
          .removeCollaborators(this.draftId, [userId])
          .subscribe({
            next: () => {
              this.loadDraft(this.draftId);
              this.snackBarService.info(
                'Collaborator removed',
                500,
                'center',
                'top'
              );
            },
          });
      }
    });
  }

  @ViewChild('collaboratorDialog') collaboratorDialog!: TemplateRef<any>;

  @ViewChild('confirmationDialog')
  ConfirmationDialogComponent!: TemplateRef<any>;

  // openAddCollaboratorDialog() {
  //   this.dialogRef = this.dialog.open(this.collaboratorDialog, {
  //     width: '400px',
  //     hasBackdrop: true,
  //   });
  // }

  openAddCollaboratorDialog() {
    const dialogRef = this.dialog.open(this.collaboratorDialog, {
      width: '400-px',
      hasBackdrop: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // Get the selected user ids
        const userIds = this.collaboratorForm.value.userIds;

        if (userIds?.length === 0) {
          this.snackBarService.error(
            'Please select at least one user to add as a collaborator.'
          );
          return;
        }

        // Prepare the data to be sent to the backend
        const collaboratorData = {
          user_ids: userIds,
          reason: this.collaboratorForm.value.reason,
          access_level: this.collaboratorForm.value.accessLevel,
        };

        // Call the backend service to add collaborators
        this.draftService
          .addCollaborators(this.draftId, collaboratorData)
          .subscribe({
            next: () => {
              this.loadDraft(this.draftId);
              this.snackBarService.success(
                'Collaborator added successfully',
                500,
                'center',
                'top'
              );
              this.collaboratorForm.reset({ accessLevel: 'viewer' });
            },
            error: (err) => {
              this.snackBarService.error(err.error['error']);
            },
          });
      }
    });
  }

  dialogRef!: MatDialogRef<any>;
  addCollaborator() {
    const userIds = this.collaboratorForm.value.userIds;

    // Validate user selection
    if (userIds?.length === 0) {
      this.snackBarService.error(
        'Please select at least one user to add as a collaborator.'
      );
      return;
    }

    // Prepare the data to be sent to the backend
    const collaboratorData = {
      user_ids: userIds,
      reason: this.collaboratorForm.value.reason,
      access_level: this.collaboratorForm.value.accessLevel,
    };


    // Call the service to add collaborators
    this.draftService
      .addCollaborators(this.draftId, collaboratorData)
      .subscribe({
        next: () => {
          this.loadDraft(this.draftId);
          this.snackBarService.success(
            'Collaborator added successfully',
            500,
            'center',
            'top'
          );

          // Reset the form and close the dialog on success
          this.collaboratorForm.reset({ accessLevel: 'viewer' });
          this.dialogRef.close(); // Close the dialog after success
        },
        error: (err) => {
          this.snackBarService.error(
            'Failed to add collaborator: ' + err.message
          );
        },
      });
  }

  copyEditorContent() {
    const content = this.editor.getMarkdown();
    navigator.clipboard.writeText(content).then(
      () => {
        this.snackBarService.success(
          'Content copied to clipboard!',
          500,
          'center',
          'top'
        );
      },
      (err) => {
        this.snackBarService.error('Failed to copy content: ' + err);
      }
    );
  }

  //collaborator dialog additonal declarations
  selectedOption: string = 'Viewer';
  dropdownOpen: boolean = false;
  options: string[] = ['Viewer', 'Editor', 'Admin'];

  // Toggles the visibility of the dropdown
  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  // Updates the selected option and closes the dropdown
  selectOption(option: string) {
    this.selectedOption = option;
    this.dropdownOpen = false;
  }

  @ViewChild('versionDialog') versionDialog!: TemplateRef<any>;
  showVersions() {
    // load history versions
    this.loadVersionHistory();
    this.dialogRef = this.dialog.open(this.versionDialog, {
      width: '500px',
      hasBackdrop: true,
      height: '700px',
      position: { top: '50px', right: '20px', bottom: '20px' },
    });
  }

  restoreVersion(index: number) {
    const version = this.versionHistory[index];
    this.editor.setMarkdown(version.content);
    this.saveDraft(version.content);
    this.dialogRef.close();
  }


  versionHistory: any;
  loadVersionHistory() {
    this.draftService.getDraftVersionHistory(this.draftId).subscribe({
      next: (response: HttpResponse<any>) => {
        this.versionHistory = response.body.filter((version: any) => {
          const contentChangesStr = version.content_changes;
          // Check if content_changes is present and not empty
          if (!contentChangesStr || contentChangesStr.trim() === '' || contentChangesStr.trim() === '{}') {
            return false;
          }

          return contentChangesStr
            && contentChangesStr.trim() !== ''
            && contentChangesStr.trim() !== '{}';
        });

      },
      error: (error) => {
        this.snackBarService.error('Failed to load version history');
      }
    });
  }

  formatContentChanges(changes: string): string {
    if (!changes || changes.trim() === '{}') {
      return 'No changes';
    }

    // Step 1: Convert Ruby hash-like syntax to JSON-like syntax
    // Replace '=>' with ':'
    let jsonLike = changes.replace(/=>/g, ':');

    // Replace symbol-like keys (:removed, :added) with string keys
    jsonLike = jsonLike.replace(/:removed/g, '"removed"');
    jsonLike = jsonLike.replace(/:added/g, '"added"');

    // Wrap unquoted numeric keys with quotes to make it valid JSON
    // e.g. {5:{...}} becomes {"5":{...}}
    jsonLike = jsonLike.replace(/(\{|,\s*)(\d+):/g, '$1"$2":');

    try {
      const parsed = JSON.parse(jsonLike);

      const results: string[] = [];

      // parsed is now an object like { "5": { removed:[], added:[""] }, "6": {...} }
      for (const line in parsed) {
        const { removed, added } = parsed[line];
        const lineChanges: string[] = [];

        if (removed && removed.length > 0 && !(removed.length === 1 && removed[0] === '')) {
          lineChanges.push(`Removed: ${removed.join(', ')}`);
        }

        if (added && added.length > 0 && !(added.length === 1 && added[0] === '')) {
          lineChanges.push(`Added: ${added.join(', ')}`);
        }

        if (lineChanges.length > 0) {
          results.push(`Line ${line}: ${lineChanges.join('; ')}`);
        }
      }

      return results.length > 0 ? results.join('<br>') : 'No changes';
    } catch (e) {
      return 'Could not parse changes';
    }
  }

}
