import {
  Directive,
  ElementRef,
  OnDestroy,
  Input,
  Renderer2,
} from '@angular/core';
import { fromEvent, Subscription } from 'rxjs';
import { MatTabGroup } from '@angular/material/tabs';

interface DOMRectI {
  bottom: number;
  height: number;
  left: number; // position start of element
  right: number; // position end of element
  top: number;
  width: number; // width of element
  x?: number;
  y?: number;
}

@Directive({
  // tslint:disable-next-line:directive-selector
  standalone: true,
  selector: '[scrollToCenter]',
})
export class MatTabScrollToCenterDirective implements OnDestroy {
  @Input() scrollToCenter!: number;

  tabWidths!: number;
  tabsArrLength!: number;
  tabContentDiv!: HTMLDivElement;
  storedIndex!: number;
  touchstartX!: number;
  touchendX!: number;
  swipeEnd!: boolean;
  selectText = false;
  mouseStartTime!: number;
  subs = new Subscription();

  constructor(
    private element: ElementRef,
    private renderer: Renderer2,
    private matTabGroup: MatTabGroup
  ) {
    this.matTabGroup.selectedIndex = 0;
    this.storedIndex = this.matTabGroup.selectedIndex;
    this.subs.add(
      fromEvent<PointerEvent>(this.element.nativeElement, 'click').subscribe(
        (clickedContainer: PointerEvent) => {
          this.startEvent(clickedContainer);
        }
      )
    );
    this.subs.add(
      fromEvent<PointerEvent>(this.element.nativeElement, 'touchend').subscribe(
        (clickedContainer: PointerEvent) => {
          this.startEvent(clickedContainer);
        }
      )
    );
  }

  ngAfterViewInit() {
    const matTabLabel = this.element.nativeElement.querySelector(
      '.mat-mdc-tab-labels'
    );
    this.tabWidths = matTabLabel.children[0].offsetWidth;

    this.tabsArrLength = matTabLabel.children.length;

    this.tabContentDiv = this.element.nativeElement.querySelector(
      '.mat-mdc-tab-body-wrapper'
    );

    this.removeBodySelect();

    this.guestureListener();
  }

  // disable text selection in the Tab Content Body so doesn't highlight on swipe
  removeBodySelect() {
    this.renderer.setStyle(
      this.tabContentDiv,
      '-webkit-touch-callout',
      'none'
    ); /* iOS Safari */
    this.renderer.setStyle(
      this.tabContentDiv,
      '-webkit-user-select',
      'none'
    ); /* Safari */
    this.renderer.setStyle(
      this.tabContentDiv,
      '-khtml-user-select',
      'none'
    ); /* Konqueror HTML */
    this.renderer.setStyle(
      this.tabContentDiv,
      '-moz-user-select',
      'none'
    ); /* Old versions of Firefox */
    this.renderer.setStyle(
      this.tabContentDiv,
      '-ms-user-select',
      'none'
    ); /* Internet Explorer/Edge */
    this.renderer.setStyle(
      this.tabContentDiv,
      'user-select',
      'none'
    ); /* Non-prefixed version, currently supported by Chrome, Edge, Opera and Firefox */
  }

  guestureListener() {
    this.tabContentDiv.addEventListener(
      'mousedown',
      this.swipeStart.bind(this)
    );
    this.tabContentDiv.addEventListener('mouseup', this.swipeFinish.bind(this));

    this.tabContentDiv.addEventListener(
      'touchstart',
      this.swipeStart.bind(this)
    );
    this.tabContentDiv.addEventListener(
      'touchend',
      this.swipeFinish.bind(this)
    );
  }

  swipeStart($event: MouseEvent | TouchEvent) {
    if ($event instanceof MouseEvent) {
      this.mouseStartTime = new Date().getTime();
      this.touchstartX = $event.x;
    } else {
      this.touchstartX = $event.changedTouches[0].screenX;
    }
    this.swipeEnd = false;
  }

  swipeFinish($event: MouseEvent | TouchEvent) {
    let newTime: number;
    if ($event instanceof MouseEvent) {
      newTime = new Date().getTime();
      const deltaTime = newTime - this.mouseStartTime;
      this.touchendX = $event.x;

      //if swipe is > 300 cancel to allow text selection
      if (deltaTime > 300) {
        return;
      }
    } else {
      this.touchendX = $event.changedTouches[0].screenX;
    }
    this.checkDirection();
    this.swipeEnd = true;
  }

  //swipe left/right detection for moving tabs
  //added "+ n" so that small guestures don't activate
  checkDirection() {
    if (this.touchendX + 10 < this.touchstartX && !this.swipeEnd) {
      // console.log('swiped left');

      if (this.storedIndex < this.tabsArrLength - 1) {
        const isLast = this.matTabGroup.selectedIndex === this.tabsArrLength;
        this.storedIndex++;
        this.matTabGroup.selectedIndex = isLast
          ? this.tabsArrLength
          : this.storedIndex;
      }
    }
    if (this.touchendX > this.touchstartX + 10 && !this.swipeEnd) {
      // console.log('swiped right');

      if (this.storedIndex > 0) {
        const isFirst = this.storedIndex === 0; /* starter point as 0 */
        this.storedIndex--;
        this.matTabGroup.selectedIndex = isFirst ? 0 : this.storedIndex;
      }
    }
  }

  startEvent(clickedContainer: PointerEvent) {
    let changeScroll = false;
    const scrolledButton: DOMRectI = (
      clickedContainer.target as HTMLElement
    ).getBoundingClientRect();

    const scrollContainer =
      this.element.nativeElement.querySelector('.mat-mdc-tab-list');

    const tabHeader = this.element.nativeElement.querySelector(
      '.mat-mdc-tab-header'
    );

    const containerHeight = tabHeader.offsetHeight + tabHeader.offsetTop;

    let newPositionScrollTo: number = 0;

    //touch drag of the tab bar is jumpy due to touch events also init 'click' events
    //so prevent double "clicks"
    //If clicking/touching the tab bar else if clicking/touching tab body calcs
    if (
      scrolledButton.bottom <= containerHeight &&
      clickedContainer instanceof PointerEvent
    ) {
      // console.log('scrollTo via header');
      const leftXOffset = (window.innerWidth - scrolledButton.width) / 2;
      const currentVisibleViewportLeft = scrolledButton.left;
      const neededLeftOffset = currentVisibleViewportLeft - leftXOffset;
      newPositionScrollTo = scrollContainer.scrollLeft + neededLeftOffset;
      changeScroll = true;
    } else if (scrolledButton.bottom > containerHeight) {
      // console.log('scrollTo via div body');
      newPositionScrollTo =
        this.tabWidths * this.storedIndex +
        scrollContainer.offsetLeft -
        (window.innerWidth - this.tabWidths) / 2;
      changeScroll = true;
    }

    //needed because this.matTabGroup.selectedIndex is null when tab 0 is selected
    //which causes the above newPositionScrollTo to have bad data next time it's ran
    if (
      this.matTabGroup.selectedIndex &&
      clickedContainer instanceof PointerEvent
    ) {
      this.storedIndex = this.matTabGroup.selectedIndex;
    } else if (clickedContainer instanceof PointerEvent) {
      this.storedIndex = 0;
    }

    if (changeScroll) {
      scrollContainer.scroll({
        left: newPositionScrollTo,
        behavior: 'smooth',
      });
    }
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
