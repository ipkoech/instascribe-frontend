import { CommonModule } from '@angular/common';
import { HttpResponse } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, EventEmitter, Output, TemplateRef, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
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
  ],
  templateUrl: './draft-review-detail.component.html',
  styleUrl: './draft-review-detail.component.scss'
})
export class DraftReviewDetailComponent  implements AfterViewInit {
  @ViewChild('editorElement') editorElement!: ElementRef;
  @Output() onChange = new EventEmitter<string>();

  draftId!: string;
  draft!: DraftModel;
  public editor!: Editor;
  private contentChanges = new Subject<string>();
  private autoSaveSubscription: any;
  collaboratorForm: FormGroup;
  initialValue: string = ''

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private draftService: DraftService,
    private snackBarService: SnackBarService,
    private dialog: MatDialog,
    private fb: FormBuilder
  ) {
    this.route.params.subscribe(params => {
      this.draftId = params['id'];
      if (this.draftId) {
        this.loadDraft(this.draftId);
        this.setupAutoSave();
      }
    });
    this.collaboratorForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      accessLevel: ['viewer', Validators.required],
      reason: ['', Validators.required]
    });
  }

  private setupAutoSave() {
    this.autoSaveSubscription = this.contentChanges.pipe(
      debounceTime(1000),
      distinctUntilChanged()
    ).subscribe(content => {
      this.saveDraft(content);
    });
  }

  saveDraft(content: string) {
    const updatedDraft = {
      draft: {
        content: content
      }
    };
    this.draftService.updateDraft(this.draftId, updatedDraft).subscribe({
      next: (response: HttpResponse<any>) => {
      }
    });
  }

  ngAfterViewInit() {
    this.initializeEditor();
  }

  private initializeEditor() {
    this.editor = new Editor({
      el: this.editorElement.nativeElement,
      height: '650px',
      initialValue: '',
      previewStyle: 'tab',
      initialEditType: 'wysiwyg',
      hideModeSwitch: true,
      previewHighlight: false,
      viewer: true
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
        if (this.editor && this.draft.content) {
          this.editor.setMarkdown(this.draft.content);
        }
      }
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
        title: 'Start Review',
        message: 'Are you sure you want to start the review process? This will lock the draft for editing.'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.draftService.startReview(this.draftId).subscribe({
          next: () => {
            this.loadDraft(this.draftId);
            this.snackBarService.info('Review started', 500, 'center', 'top');
          }
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
        message: 'Are you sure you want to approve this draft?'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.draftService.approveDraft(this.draftId).subscribe({
          next: () => {
            this.loadDraft(this.draftId);
            this.snackBarService.success('Draft approved', 500, 'center', 'top');
          }
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
        message: 'Are you sure you want to reject this draft? Please provide a reason.',
        showReason: true
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.draftService.rejectDraft(this.draftId).subscribe({
          next: () => {
            this.loadDraft(this.draftId);
            this.snackBarService.info('Draft rejected', 500, 'center', 'top');
          }
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
        message: 'Are you sure you want to remove this collaborator?'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.draftService.removeCollaborators(this.draftId, [userId]).subscribe({
          next: () => {
            this.loadDraft(this.draftId);
            this.snackBarService.info('Collaborator removed', 500, 'center', 'top');
          }
        });
      }
    });
  }



  @ViewChild('collaboratorDialog') collaboratorDialog!: TemplateRef<any>;


  @ViewChild('confirmationDialog') ConfirmationDialogComponent!: TemplateRef<any>;

  openAddCollaboratorDialog() {
    const dialogRef = this.dialog.open(this.collaboratorDialog, {
      width: '400px',
      hasBackdrop: true,
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.draftService.addCollaborators(this.draftId, this.collaboratorForm.value).subscribe({
          next: () => {
            this.loadDraft(this.draftId);
            this.snackBarService.success('Collaborator added successfully', 500, 'center', 'top');
            this.collaboratorForm.reset({ accessLevel: 'viewer' });
          }
        });
      }
    });
  }


  copyEditorContent() {
    const content = this.editor.getMarkdown();

    navigator.clipboard.writeText(content).then(
      () => {
        this.snackBarService.success('Content copied to clipboard!', 500, 'center', 'top');
      },
      (err) => {
        this.snackBarService.error('Failed to copy content: ' + err);
      }
    );
  }
}
