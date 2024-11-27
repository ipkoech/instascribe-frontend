import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ApiService } from './api.service';
import * as ActionCable from '@rails/actioncable';

interface ExtendedChannel extends ActionCable.Channel {
  received?: (data: any) => void;
}

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  cable: ActionCable.Cable | undefined;
  cable$ = new BehaviorSubject<ActionCable.Cable | undefined>(undefined);
  private channels: { [key: string]: ExtendedChannel } = {};
  private pingInterval: any;
  private updateBound!: () => void;
  private awayBound!: () => void;

  constructor(private api: ApiService) {
    this.updateBound = this.update.bind(this);
    this.awayBound = this.away.bind(this);
    this.connected();
    this.startPing(); // Start pinging the server
  }

  connect() {
    try {
      if (!this.cable) {
        this.cable = ActionCable.createConsumer(
          `${this.api.base_uri}cable?token=${this.getCookie('access_token')}`
        );
        this.cable$.next(this.cable);
        this.subscribeToAllChannels(); // Subscribe to all channels on reconnect
      }
    } catch (error) {
      this.cable$.next(undefined);
    }
  }

  private disconnected() {
    this.uninstallEventListeners();
    this.away();
    this.attemptReconnect();
  }

  private connected() {
    this.connect();
    this.installEventListeners();
    this.update();
  }

  // Method to subscribe to a channel and listen for messages
  subscribeAndListenToChannel(
    channelName: string,
    params: {},
    callback: (data: any) => void
  ) {
    if (this.channels[channelName]) {
      this.channels[channelName].received = callback;
    } else {
      const mixin = {
        received: callback,
        connected: this.connected.bind(this),
        disconnected: this.disconnected.bind(this),
        rejected: this.rejected.bind(this),
      };

      const channel = this.cable?.subscriptions.create(
        { channel: channelName, ...params },
        mixin as unknown as ActionCable.Channel & ExtendedChannel
      );

      if (channel) {
        this.channels[channelName] = channel;
      } else {
      }
    }
  }

  // Unsubscribe from a channel
  unsubscribeFromChannel(channelName: string) {
    const channel = this.channels[channelName];
    if (channel) {
      channel.unsubscribe();
      delete this.channels[channelName];
    }
  }

  // Send a message to a specific channel
  sendMessage(channelName: string, message: any) {
    const channel = this.channels[channelName];
    if (channel) {
      channel.perform('receive', message);
    } else {
    }
  }

  // Handle rejected subscriptions
  private rejected() {
    this.uninstallEventListeners();
    this.away();
  }

  private startPing() {
    this.pingInterval = setInterval(() => {
      if (this.cable) {
        this.cable.send({ type: 'ping' });
      }
    }, 40000); // Every 30 seconds
  }

  // Reconnect if disconnected
  private attemptReconnect() {
    if (!this.cable) {
      this.connect();
    }
  }

  // Re-subscribe to all channels after reconnecting
  private subscribeToAllChannels() {
    for (const channelName in this.channels) {
      const channel = this.channels[channelName];
      if (channel) {
        this.subscribeAndListenToChannel(channelName, {}, channel.received!);
      }
    }
  }

  // Listen for visibility changes (tab focus/blur)
  private handleVisibilityChange() {
    if (document.visibilityState === 'visible') {
      this.connect(); // Reconnect WebSocket if needed
      this.subscribeToAllChannels(); // Re-subscribe to channels
    }
  }

  // Install event listeners to handle visibility changes
  private installEventListeners() {
    window.addEventListener('focus', this.updateBound);
    window.addEventListener('blur', this.updateBound);
    window.addEventListener('beforeunload', this.awayBound);
    document.addEventListener(
      'visibilitychange',
      this.handleVisibilityChange.bind(this)
    ); // Added
  }

  // Uninstall event listeners
  private uninstallEventListeners() {
    window.removeEventListener('focus', this.updateBound);
    window.removeEventListener('blur', this.updateBound);
    window.removeEventListener('beforeunload', this.awayBound);
    document.removeEventListener(
      'visibilitychange',
      this.handleVisibilityChange.bind(this)
    );
  }

  private update() {
    if (this.documentIsActive()) {
      this.appear();
    } else {
      this.away();
    }
  }

  private appear() {
    for (let channelName in this.channels) {
      this.channels[channelName].perform('appear', {
        appearing_on: this.appearingOn(),
      });
    }
  }

  private away() {
    for (let channelName in this.channels) {
      this.channels[channelName].perform('away', {});
    }
  }

  private documentIsActive(): boolean {
    return document.visibilityState === 'visible' && document.hasFocus();
  }

  private appearingOn(): string | null {
    const element = document.querySelector('[data-appearing-on]');
    return element ? element.getAttribute('data-appearing-on') : null;
  }

  // Gracefully unsubscribe from all channels and clean up
  ngOnDestroy() {
    clearInterval(this.pingInterval);
    this.uninstallEventListeners();
    for (const channelName in this.channels) {
      if (this.channels[channelName]) {
        this.channels[channelName].unsubscribe();
        delete this.channels[channelName];
      }
    }
    if (this.cable) {
      this.cable.disconnect();
    }
    this.cable = undefined;
    this.cable$.next(undefined);
  }

  // Helper function to get cookies (for authentication tokens)
  private getCookie(name: string): string {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()!.split(';').shift()!;
    return '';
  }
}
