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

  // ai config
  aiConfig = {
    model: 'GPT-4', // Default AI model
    apiKey: '', // Placeholder for the API key
    useCustomPrompts: false, // Whether custom prompts are enabled
  };

  contentGenerationSettings = {
    temperature: 0.7, // Default slider value
    maxTokens: 2048, // Default max tokens value
    useKeywordOptimization: false, // Default toggle state
  };

  aiTraining = {
    enableCustomTraining: false,
    trainingDataSource: '',
  };

  trainingDataSources = ['Data Source 1', 'Data Source 2', 'Data Source 3'];

  startTraining() {
    if (!this.aiTraining.trainingDataSource) {
      alert('Please select a training data source.');
      return;
    }
    console.log('AI Training started with:', this.aiTraining);
    // Logic to initiate training
  }

  saveAISettings() {
    console.log('AI Settings saved.');
    // Logic for saving AI settings can be added here
  }

  //integrations
  integrations = {
    facebook: false,
    twitter: false,
    linkedin: false,
  };

  saveIntegrations() {
    console.log('Saved integrations:', this.integrations);
    // Add logic to handle integration toggles
  }

  cmsIntegrations = {
    enableWordPress: false,
    wordpressURL: '',
    wordpressAPIKey: '',
  };

  emailMarketingIntegrations = {
    mailchimpEnabled: false,
    mailchimpApiKey: '',
  };

  analyticsIntegrations = {
    googleAnalyticsEnabled: false,
    googleAnalyticsID: '',
  };

  saveIntegrationSettings() {
    // Logic to save all the integration settings
    console.log('Integration settings saved!');
    // Add your API or state update logic here
  }

  //workflow
  workflowSettings = {
    enableApprovalWorkflow: false, // Toggle state
    approvalStages: '2 Stages', // Default dropdown value
  };

  saveWorkflowSettings() {
    console.log('Workflow Settings:', this.workflowSettings);
    // Add logic to handle the save operation (e.g., API call)
  }

  autoSchedulingSettings = {
    enableAutoScheduling: false,
    maxPostsPerDay: 5,
    optimalPostingTime: 'Morning (8 AM - 12 PM)',
  };

  saveAutoSchedulingSettings() {
    console.log('Auto-scheduling Settings:', this.autoSchedulingSettings);
    // Add your logic to save the settings here
  }

  contentRecyclingSettings = {
    enableRecycling: false,
    minInterval: 30,
  };

  saveContentRecyclingSettings() {
    console.log('Content Recycling Settings:', this.contentRecyclingSettings);
    // Add logic to save the settings here
  }
  collaborationSettings = {
    enableCollaboration: false,
    preferredTool: 'internalComments', // Default selection
  };

  saveCollaborationSettings() {
    console.log('Collaboration Settings:', this.collaborationSettings);
    // Add logic to save the settings here
  }

  //analytics
  performanceMetrics = {
    trackPageViews: false,
    trackUserEngagement: false,
    trackConversions: false,
  };

  reportingSettings = {
    frequency: 'weekly', // Default to 'weekly'
    recipients: '',
  };
  customEvents = {
    enableTracking: false, // Default to disabled
    eventName: '', // Empty by default
  };
  dataRetention = {
    period: '12 Months', // Default retention period
  };

  retentionOptions = [
    '1 Month',
    '3 Months',
    '6 Months',
    '12 Months',
    '24 Months',
  ]; // Retention period options

  saveAnalyticsSettings() {
    // Logic to save analytics settings
    console.log('Analytics settings saved!');
  }
}
