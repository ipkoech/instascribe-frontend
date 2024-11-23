import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {

  private readonly THEME_LOCAL_STORAGE_KEY = 'app-theme';
  private readonly DEFAULT_THEME = 'light';

  private theme: BehaviorSubject<string> = new BehaviorSubject<string>(this.getSavedTheme());

  constructor() {
    this.loadTheme();
  }

  private getSavedTheme(): string {
    const savedTheme = localStorage.getItem(this.THEME_LOCAL_STORAGE_KEY);
    return savedTheme || this.DEFAULT_THEME;
  }

  private saveTheme(theme: string): void {
    localStorage.setItem(this.THEME_LOCAL_STORAGE_KEY, theme);
  }

  private loadTheme(): void {
    this.setTheme(this.getSavedTheme());
  }

  public setTheme(theme: string): void {
    this.theme.next(theme);
    this.saveTheme(theme);
    this.applyTheme(theme);
  }

  public getTheme(): BehaviorSubject<string> {
    return this.theme;
  }

  private applyTheme(theme: string): void {
    const body = document.getElementsByTagName('body')[0];

    // Remove existing theme classes
    body.classList.remove('theme-light', 'theme-dark', 'dark-mode');

    // Add the appropriate theme class
    body.classList.add(`theme-${theme}`);

    // Add the 'dark-mode' class for dark theme
    if (theme === 'dark') {
      body.classList.add('dark-mode');
    }
  }
}
