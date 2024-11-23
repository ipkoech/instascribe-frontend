import { ChangeDetectorRef, NgZone, OnDestroy, Pipe, PipeTransform } from '@angular/core';
import { Subscription, Observable, of, interval, startWith, map, switchMap } from 'rxjs';

@Pipe({
  name: 'timeSince',
  standalone: true
})
export class TimeSincePipe implements PipeTransform , OnDestroy {
  private timerSubscription!: Subscription;

  constructor(private changeDetectorRef: ChangeDetectorRef, private ngZone: NgZone) { }

  transform(value: string | Date): Observable<string> {
    if (!value) return of('');
    let date = new Date(value);

    this.ngZone.runOutsideAngular(() => {
      if (this.timerSubscription) {
        this.timerSubscription.unsubscribe();
      }

      this.timerSubscription = this.getTimeObservable(date).subscribe(() => {
        this.ngZone.run(() => this.changeDetectorRef.markForCheck());
      });
    });

    return this.getTimeObservable(date);
  }

  private getTimeObservable(date: Date): Observable<string> {
    return interval(1000).pipe(
      startWith(0),
      map(() => {
        const seconds = Math.floor((+new Date() - +date) / 1000);

        if (seconds < 60) return 'now';
        else if (seconds < 3600) return `${Math.floor(seconds / 60)}min`;
        else if (seconds < 86400) return `${Math.floor(seconds / 3600)}hr`;
        else if (seconds < 2592000) return `${Math.floor(seconds / 86400)}d`;
        else if (seconds < 31536000) return `${Math.floor(seconds / 2592000)}mo`;
        else return `${Math.floor(seconds / 31536000)}yr`;
      }),
      switchMap((period) => {
        if (period === 'now') return of(period);
        // Adjust interval based on period to reduce unnecessary checks
        const newInterval = period.endsWith('min') ? 60000
          : period.endsWith('hr') ? 3600000
            : 86400000;
        return interval(newInterval).pipe(startWith(0), map(() => period));
      })
    );
  }

  ngOnDestroy(): void {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
  }
}
