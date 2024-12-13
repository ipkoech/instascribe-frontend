import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { SettingsService } from '../services/settings.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
})
export class SettingsComponent {
  // Define tabs for navigation
  tabs = [
    { key: 'general', label: 'General' },
    { key: 'analytics', label: 'Analytics' },
  ];

  // Track the active tab
  activeTab: string = 'general';

  emailNotifications: boolean = true;
  inAppNotifications: boolean = true;

  // Handle tab switching
  switchTab(key: string): void {
    this.activeTab = key;
  }

  //company code
  companyForm: FormGroup;

  // Current company name
  companyName: string = '';

  constructor(
    private fb: FormBuilder,
    private settingsService: SettingsService
  ) {
    // Initialize the form group
    this.companyForm = this.fb.group({
      name: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    // Subscribe to the company name observable
    this.settingsService.companyName$.subscribe((name) => {
      this.companyName = name; // Update the local variable for display
      this.companyForm.patchValue({ name }); // Patch the form value
    });

    // Ensure company info is loaded
    this.settingsService.loadCompanyInfo();
  }

  // Save updated company info
  saveCompanyInfo(): void {
    if (this.companyForm.invalid) {
      console.error('Form is invalid. Cannot save company info.');
      return;
    }

    const updatedName = this.companyForm.value.name;

    this.settingsService.updateCompany({ name: updatedName }).subscribe({
      next: () => {},
      error: (err) => {},
    });
  }
}
