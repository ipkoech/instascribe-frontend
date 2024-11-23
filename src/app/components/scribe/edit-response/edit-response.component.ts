import { Component, ViewChild, ElementRef, AfterViewInit, Input, Output, EventEmitter, OnInit, TemplateRef } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Editor } from '@toast-ui/editor';
import '@toast-ui/editor/dist/toastui-editor.css';
import { ChatModel } from '../../../core/interfaces/chat.model';
import '@toast-ui/editor/dist/toastui-editor-viewer.css';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { ApiService } from '../../../core/services/api.service';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { SidenavService } from '../services/sidenav.service';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SnackBarService } from '../../../core/services/snack-bar.service';
import { Router } from '@angular/router';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { DraftModel } from '../../../core/interfaces/draft.model';

@Component({
  selector: 'app-edit-response',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    ReactiveFormsModule,
    MatInputModule,
    FormsModule
  ],
  templateUrl: './edit-response.component.html',
  styleUrl: './edit-response.component.scss'
})
export class EditResponseComponent implements AfterViewInit, OnInit {
  constructor(
    private http: HttpClient,
    private api: ApiService,
    private sidenavService: SidenavService,
    private snackBarService: SnackBarService,
    private router: Router,
    private dialog: MatDialog,
  ) {

  }
  ngOnInit(): void {
    this.sidenavService.toggleEditSidenav$.subscribe(data => {
      this.chatData = data;
      if (this.chatData) {
        this.initialValue = this.chatData.bot_reply;
      }
    });
  }
  @ViewChild('editorElement') editorElement!: ElementRef;
  initialValue: any = '';
  @Output() onChange = new EventEmitter<string>();
  chatData: ChatModel | null = null;
  draftTitleControl = new FormControl('', Validators.required);

  private editor!: Editor;

  ngAfterViewInit() {
    this.editor = new Editor({
      el: this.editorElement.nativeElement,
      height: '650px',
      initialValue: this.chatData?.bot_reply || '',
      previewStyle: 'tab',
      initialEditType: 'wysiwyg',
      hideModeSwitch: true,
      previewHighlight: false,
      viewer: true
    });

    // Update editor content when chatData changes
    this.sidenavService.toggleEditSidenav$.subscribe(data => {
      if (data?.bot_reply) {
        this.editor.setMarkdown(data.bot_reply);
      }
    });

    this.editor.on('change', () => {
      this.onChange.emit(this.editor.getMarkdown());
    });
  }

  ngOnDestroy() {
    this.editor?.destroy();
  }
  cancel() {
    this.sidenavService.toggleEditSidenav(null);
    this.editor.setMarkdown('');
    this.chatData = null;
    this.initialValue = '';
  }
  @ViewChild('saveDraftDialog') saveDraftDialog!: TemplateRef<any>;

  saveChanges(): void {
    const updatedContent = this.editor.getMarkdown();

    this.http.post(`${this.api.base_uri}conversations/${this.chatData?.conversation_id}/chats/${this.chatData?.id}/update`, {
      bot_reply: updatedContent
    }, { withCredentials: true, observe: 'response' }).subscribe({
      next: (response) => {
        if (response.ok) {
          this.sidenavService.toggleEditSidenav(null);
        }
      }
    });
  }

  saveChangesAsDraft(): void {
    const dialogRef = this.dialog.open(this.saveDraftDialog, {
      width: '400px',
      disableClose: true
    });

    const updatedContent = this.editor.getMarkdown();

    dialogRef.afterClosed().subscribe(title => {
      if (title) {
        this.http.post(`${this.api.base_uri}conversations/${this.chatData?.conversation_id}/chats/${this.chatData?.id}/update`, {
          bot_reply: updatedContent
        }, { withCredentials: true, observe: 'response' }).subscribe({
          next: (response) => {
            if (response.ok) {
              const draft = {
                title: title,
                content: updatedContent,
                content_type: 'chat',
                original_content: this.chatData?.bot_reply,
                status: 'editing',
                active: false
              };

              this.http.post(`${this.api.base_uri}drafts`, draft, {
                withCredentials: true,
                observe: 'response'
              }).subscribe({
                next: (response: HttpResponse<any>) => {
                  if (response.ok) {
                    this.draft = response.body;
                    if (this.draft.id) {
                      this.snackBarService.success(`Draft "${title}" created successfully`);
                      this.sidenavService.toggleEditSidenav(null);
                      this.router.navigate(['/content/drafts', this.draft.id]);
                    }
                  }
                }
              });
            }
          }
        });
      }
    });

  }
  draft!: DraftModel
  copyEditorContent() {
    const content = this.editor.getMarkdown();

    navigator.clipboard.writeText(content).then(
      () => {
        this.snackBarService.success('Content copied to clipboard!', 500, 'center', 'top');
        this.sidenavService.toggleEditSidenav(null);
        this.editor.setMarkdown('');
        this.chatData = null;
        this.initialValue = '';
      },
      (err) => {
        this.snackBarService.error('Failed to copy content: ' + err);
      }
    );
  }

}

