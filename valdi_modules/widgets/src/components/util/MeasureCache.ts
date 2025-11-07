import { Observable } from 'valdi_rxjs/src/Observable';
import { Subject } from 'valdi_rxjs/src/Subject';

export interface MeasuredComponentSize {
  width: number;
  height: number;
}

export class MeasureCache {
  readonly observable$: Observable<MeasuredComponentSize>;
  private subject = new Subject<MeasuredComponentSize>();

  constructor(readonly roundToPoints: boolean) {
    this.observable$ = this.subject;
  }

  populate(size: MeasuredComponentSize): void {
    this.subject.next(size);
  }
}
