import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
})
export class SettingsComponent {
  // Define tabs for navigation
  tabs = [
    { key: 'general', label: 'General' },
    { key: 'content', label: 'Content' },
    { key: 'userManagement', label: 'User Management' },
    { key: 'aiConfig', label: 'AI Configuration' },
    { key: 'integrations', label: 'Integrations' },
    { key: 'workflow', label: 'Workflow' },
    { key: 'analytics', label: 'Analytics' },
  ];

  // Track the active tab
  activeTab: string = 'general';

  // Dummy data for company information
  companyName: string = 'InstaScribe Inc.';

  emailNotifications: boolean = true;
  inAppNotifications: boolean = true;

  // Handle tab switching
  switchTab(key: string): void {
    this.activeTab = key;
  }

  // Placeholder method for saving general settings
  saveGeneralSettings(): void {
    console.log('General settings saved:', this.companyName);
  }

  // Placeholder method for logo upload
  uploadLogo(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      console.log('Uploaded file:', input.files[0].name);
    }
  }

  //system preferences
  defaultLanguage: string = 'English';
  timeZone: string = 'UTC';
  darkMode: boolean = false;

  // Placeholder function to handle any logic
  savePreferences(): void {
    console.log('Preferences saved:', {
      defaultLanguage: this.defaultLanguage,
      timeZone: this.timeZone,
      darkMode: this.darkMode,
    });
  }

  saveChanges(): void {
    console.log('Changes saved:', {
      companyName: this.companyName,
      defaultLanguage: this.defaultLanguage,
      timeZone: this.timeZone,
      darkMode: this.darkMode,
      emailNotifications: this.emailNotifications,
      inAppNotifications: this.inAppNotifications,
    });
  }

  //content
  saveContentSettings() {
    console.log('Content settings saved:', this.contentTypes);
  }

  contentTypes = {
    blogPosts: true,
    socialMediaPosts: true,
    emailNewsletters: true,
    productDescriptions: false,
  };

  contentGuidelines = {
    wordCount: 1000,
    defaultTone: 'professional',
    enableOptimization: true,
  };

  saveContentGuidelines() {
    console.log('Content guidelines saved:', this.contentGuidelines);
  }

  // State for Content Approval Process
  contentApproval = {
    requireApproval: false, // Default state for toggle
    approvalStages: 'single', // Default value for approval stages
  };

  // Function to save content approval settings
  saveContentApproval(): void {
    console.log(
      'Content Approval Process Settings Saved:',
      this.contentApproval
    );

    // Add logic to send the `contentApproval` data to your backend or service
    // Example:
    // this.settingsService.saveContentApproval(this.contentApproval).subscribe(response => {
    //   console.log('Settings saved successfully!', response);
    // });
  }

  //user
  newUser = {
    name: '',
    email: '',
    role: '',
  };

  addUser() {
    if (this.newUser.name && this.newUser.email && this.newUser.role) {
      console.log('User Added:', this.newUser);
      // Logic to save the user (e.g., API call)
      this.newUser = { name: '', email: '', role: '' }; // Reset the form
    } else {
      console.log('All fields are required.');
    }
  }

  users = [
    { name: 'John Doe', email: 'john@example.com', role: 'Admin' },
    { name: 'Jane Smith', email: 'jane@example.com', role: 'Editor' },
    { name: 'Bob Johnson', email: 'bob@example.com', role: 'Viewer' },
  ];

  editUser(user: any) {
    console.log('Edit User:', user);
    // Logic to edit the user
  }

  deleteUser(user: any) {
    console.log('Delete User:', user);
    this.users = this.users.filter((u) => u !== user);
  }
}
