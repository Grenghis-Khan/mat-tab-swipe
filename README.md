# Angular Material - Scrollable Tabs and Swipe Guestures

This project implements current Material Design Tab features such as Scrollable Tabs and swiping within the content area to switch tabs which are not included in Angular Material. Big thanks to [Igor Kurkov](https://github.com/IgorKurkov) for his initial work on the [scrollable tabs feauture](https://stackoverflow.com/a/62031767/27316320).

All the code that is needed for the features is located in the [scrolling.directive.ts](https://github.com/Grenghis-Khan/mat-tab-swipe/blob/main/src/app/tabs/scrolling.directive.ts).
In the template add the directive to a mat-tab-group as so `<mat-tab-group [scrollToCenter]="selectedIndex">` and in the class define `selectedIndex!: number;`

The default scrolling for mat-tab-groups also needs to be overridden which is done in the [styles.scss`](https://github.com/Grenghis-Khan/mat-tab-swipe/blob/main/src/styles.scss).

Finally to get `Element.scroll()` to function on iOS and IE we need the npm packages
`npm i element-scroll-polyfill` and `npm i smoothscroll-polyfill` which are imported into the [polyfills.ts](https://github.com/Grenghis-Khan/mat-tab-swipe/blob/main/src/polyfills.ts) file.

## Angular Info

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 17.3.3.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.
