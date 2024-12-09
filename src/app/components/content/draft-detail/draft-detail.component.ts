import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DraftService } from '../services/draft.service';
import {
  HttpClient,
  HttpErrorResponse,
  HttpParams,
  HttpResponse,
} from '@angular/common/http';
import Editor from '@toast-ui/editor';
import { DraftModel } from '../../../core/interfaces/draft.model';
import '@toast-ui/editor/dist/toastui-editor-viewer.css';
import '@toast-ui/editor/dist/toastui-editor.css';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SnackBarService } from '../../../core/services/snack-bar.service';
import { ApiService } from '../../../core/services/api.service';
import { UserModelsResponse } from '../../../core/interfaces/user.model';
@Component({
  selector: 'app-draft-detail',
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
  ],
  templateUrl: './draft-detail.component.html',
  styleUrl: './draft-detail.component.scss',
})
export class DraftDetailComponent implements AfterViewInit, OnInit, OnDestroy {
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
    private api: ApiService,
    private http: HttpClient
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
  ngOnInit(): void {
    this.draftService.draft$.subscribe((updatedDraft) => {
      if (updatedDraft) {
        this.draft = updatedDraft;
        if (this.editor && this.draft.content) {
          this.editor.setMarkdown(this.draft.content);
        }
      }
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
      next: (response: HttpResponse<any>) => {},
    });
  }

  ngAfterViewInit() {
    this.initializeEditor();
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
        error: (errorResponse: HttpErrorResponse) => {},
      });
  }

  private initializeEditor() {
    this.editor = new Editor({
      el: this.editorElement.nativeElement,
      height: '250px',
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

  loadDraft(id: string) {
    this.draftService.fetchDraft(id).subscribe({
      next: (response: HttpResponse<any>) => {
        this.draft = response.body;
        this.draftService.subscribeToDraftChannel(this.draft);
        if (this.editor && this.draft.content) {
          this.editor.setMarkdown(this.draft.content);
        }
      },
    });
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
        title: 'Submit Review',
        message:
          'Are you sure you want to Submit the draft for review process? This will lock the draft for editing.',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.draftService.startReview(this.draftId).subscribe({
          next: () => {
            this.loadDraft(this.draftId);
            this.snackBarService.info(
              'Submitted successfully',
              500,
              'center',
              'top'
            );
            this.router.navigate(['/content/drafts']);
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
  selectedUserIds: string[] = [];

  @ViewChild('confirmationDialog')
  ConfirmationDialogComponent!: TemplateRef<any>;
  openAddCollaboratorDialog() {
    const dialogRef = this.dialog.open(this.collaboratorDialog, {
      width: '400px',
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

  // Is user a collaborator
  isCollaborator(userId: string): boolean {
    return this.draft?.collaborators!.some(
      (collaborator) => collaborator.id === userId
    );
  }
}
