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
  touchStartX!: number;
  touchEndX!: number;
  touchStartY!: number;
  touchEndY!: number;
  swipeEnd!: boolean;
  selectText = false;
  mouseStartTime!: number;
  subs = new Subscription();

  constructor(
    private element: ElementRef,
    private renderer: Renderer2,
    private matTabGroup: MatTabGroup
  ) {
    // console.log(element);
    this.matTabGroup.selectedIndex = this.scrollToCenter;
    this.subs.add(
      fromEvent<MouseEvent>(this.element.nativeElement, 'click').subscribe(
        (clickedContainer: MouseEvent) => {
          this.startEvent(clickedContainer);
        }
      )
    );
    //needed for lazy load (matTabContent). 'click' events in the tab body don't register on swipe
    this.subs.add(
      fromEvent<MouseEvent>(this.element.nativeElement, 'mouseup').subscribe(
        (clickedContainer: MouseEvent) => {
          this.startEvent(clickedContainer);
        }
      )
    );
    this.subs.add(
      fromEvent<TouchEvent>(this.element.nativeElement, 'touchend').subscribe(
        (clickedContainer: TouchEvent) => {
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
      this.touchStartX = $event.x;
    } else {
      this.touchStartX = $event.changedTouches[0].screenX;
      this.touchStartY = $event.changedTouches[0].screenY;
    }
    this.swipeEnd = false;
  }

  swipeFinish($event: MouseEvent | TouchEvent) {
    let newTime: number;
    if ($event instanceof MouseEvent) {
      newTime = new Date().getTime();
      const deltaTime = newTime - this.mouseStartTime;
      this.touchEndX = $event.x;

      //if swipe is > 300 cancel to allow text selection
      if (deltaTime > 300) {
        return;
      }
    } else {
      this.touchEndX = $event.changedTouches[0].screenX;
      this.touchEndY = $event.changedTouches[0].screenY;
    }
    //prevent vertical scrolling from activating horizontal swipe
    if (
      $event instanceof MouseEvent ||
      ($event instanceof TouchEvent &&
        Math.abs(this.touchEndY - this.touchStartY) < 50)
    ) {
      this.checkDirection();
    }

    this.swipeEnd = true;
  }

  //swipe left/right detection for moving tabs
  //added "+ swipeThreshold" so that small guestures don't activate
  checkDirection() {
    const swipeThreshold = 50;
    if (this.touchEndX + swipeThreshold < this.touchStartX && !this.swipeEnd) {
      // console.log('swiped left');

      if (this.scrollToCenter < this.tabsArrLength - 1) {
        const isLast = this.matTabGroup.selectedIndex === this.tabsArrLength;
        this.scrollToCenter++;
        this.matTabGroup.selectedIndex = isLast
          ? this.tabsArrLength
          : this.scrollToCenter;
      }
    }
    if (this.touchEndX > this.touchStartX + swipeThreshold && !this.swipeEnd) {
      // console.log('swiped right');

      if (this.scrollToCenter > 0) {
        const isFirst = this.scrollToCenter === 0; /* starter point as 0 */
        this.scrollToCenter--;
        this.matTabGroup.selectedIndex = isFirst ? 0 : this.scrollToCenter;
      }
    }
  }

  startEvent(clickedContainer: MouseEvent | TouchEvent) {
    let changeScroll = false;
    const scrolledButton: DOMRectI = (
      clickedContainer.target as HTMLElement
    ).getBoundingClientRect();

    const scrollContainer =
      this.element.nativeElement.querySelector('.mat-mdc-tab-list');

    let newPositionScrollTo: number = 0;

    const target = clickedContainer.target as HTMLElement;
    const targetParentClass = target.offsetParent?.classList[0];
    const targetGrandparentClass =
      target.offsetParent?.parentElement?.offsetParent?.classList[0];

    // if clicking/touching in tab body else if clicked in tab header calcs
    //Classes are undefined on swipe events
    if (
      targetParentClass?.includes('mat-mdc-tab-body') ||
      targetGrandparentClass?.includes('mat-mdc-tab-body') ||
      (targetParentClass === undefined && targetGrandparentClass === undefined)
    ) {
      // console.log('scrollTo via tab body');
      newPositionScrollTo =
        this.tabWidths * this.scrollToCenter +
        this.tabContentDiv.offsetLeft +
        scrollContainer.offsetLeft -
        (window.innerWidth - this.tabWidths) / 2;
      changeScroll = true;
    }
    //touch drag of the tab bar/header is jumpy due to touch events also initiating 'click' events
    //so prevents double "clicks" in tab header
    else if (clickedContainer.type === 'click') {
      // console.log('scrollTo via header');
      const leftXOffset = (window.innerWidth - scrolledButton.width) / 2;
      const currentVisibleViewportLeft = scrolledButton.left;
      const neededLeftOffset = currentVisibleViewportLeft - leftXOffset;
      newPositionScrollTo = scrollContainer.scrollLeft + neededLeftOffset;
      changeScroll = true;
    }

    if (changeScroll) {
      // console.log(newPositionScrollTo);
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
