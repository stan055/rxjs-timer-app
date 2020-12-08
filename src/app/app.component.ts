import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { Subscription, fromEvent, Observable, merge, empty  } from 'rxjs';
import { interval } from 'rxjs/internal/observable/interval';
import { map, filter, bufferCount, tap } from 'rxjs/operators';
import { switchMap, mapTo, startWith, scan  } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, AfterViewInit{
  @ViewChild('btnWait') btnWait: ElementRef;
  @ViewChild('btnReset') btnReset: ElementRef;
  @ViewChild('btnStartStop') btnStartStop: ElementRef;
  timerSub: Subscription;
  time: number;
  timer$: Observable<any>;
  btnStartStopLabel: string;
  MIDNIGHT = 75600999;

  constructor() {}

  ngOnInit(): void {
    this.btnStartStopLabel = 'Start';
    this.time = 0;
  }

  ngAfterViewInit(): void {
    const interval$ = interval(1000).pipe(mapTo(1));
    const wait$ = this.rxDoubleClick(this.btnWait);
    const resume$ = fromEvent(this.btnStartStop.nativeElement, 'click').pipe(mapTo(true));

    this.timer$ = merge(wait$, resume$)
      .pipe(
        startWith(true),
        switchMap(val => (val ? interval$ : empty())),
        scan((acc, curr) => (curr ? curr + acc : acc)),
      );
  }

  startStop(): void {
    if (!this.time && this.btnStartStopLabel === 'Start') {
      this.timerSub = this.timer$.subscribe(val => this.time = val);
      this.btnStartStopLabel = 'Stop';
    }
    else if (this.time && this.btnStartStopLabel === 'Stop') {
      this.timerSub.unsubscribe();
      this.time = 0;
      this.btnStartStopLabel = 'Start';
    }
    else if (this.time && this.btnStartStopLabel === 'Start') {
      this.btnStartStopLabel = 'Stop';
    }
  }

  reset(): void {
    this.timerSub.unsubscribe();
    this.time = 0;
    this.btnStartStopLabel = 'Stop';
    this.timerSub = this.timer$.subscribe(val => this.time = val);
  }

  rxDoubleClick(element: ElementRef): Observable<boolean> {
    const time = 300;
    const count = 2;
    return fromEvent(element.nativeElement, 'click')
            .pipe(
              map(() => new Date().getTime()),
              bufferCount(count, 1),
              filter((timestamps) => {
                return timestamps[0] > new Date().getTime() - time;
              }),
              tap(() => this.btnStartStopLabel = 'Start'),
              mapTo(false)
            );
  }
}
