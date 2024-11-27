import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'safeHtml',
  standalone: true
})
export class SafeHtmlPipe implements PipeTransform {

  constructor(private sanitizer: DomSanitizer) {}

  transform(value: string, limit?: number): SafeHtml {
    let truncatedContent = value;

    if (limit && value.length > limit) {
      truncatedContent = this.truncateWithEllipsis(value, limit);
    }

    return this.sanitizer.bypassSecurityTrustHtml(truncatedContent);
  }

  private truncateWithEllipsis(value: string, limit: number): string {
    let truncatedContent = value.substr(0, limit);

    // Ensure we don't cut off any open HTML tags
    const lastOpenTag = truncatedContent.lastIndexOf('<');
    const lastCloseTag = truncatedContent.lastIndexOf('>');

    if (lastOpenTag > lastCloseTag) {
      truncatedContent = truncatedContent.substr(0, lastOpenTag);
    }

    return `${truncatedContent}...`;
  }

}
