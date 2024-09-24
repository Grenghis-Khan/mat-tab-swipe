import { Component } from '@angular/core';
import { NgFor } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { MatTabScrollToCenterDirective } from './scrolling.directive';

@Component({
  selector: 'app-tabs',
  standalone: true,
  imports: [
    NgFor,
    MatCardModule,
    MatTabsModule,
    ScrollingModule,
    MatTabScrollToCenterDirective,
  ],
  templateUrl: './tabs.component.html',
  styleUrl: './tabs.component.scss',
})
export class TabsComponent {
  mySelectedIndex = 0;
  public tabs: any[] = [
    {
      id: 1,
      label: 'Flights',
      icon: 'airplanemode_active',
    },
    {
      id: 2,
      label: 'Hotel',
      icon: 'hotel',
    },
    {
      id: 3,
      label: 'Favorites',
      icon: 'favorite',
    },
    {
      id: 4,
      label: 'Another',
      icon: 'star',
    },
    {
      id: 5,
      label: 'Yet Another',
      icon: 'bookmark',
    },
    {
      id: 6,
      label: 'Yet Another 2',
      icon: 'bookmark',
    },
    {
      id: 7,
      label: 'Yet Another 3',
      icon: 'bookmark',
    },
    {
      id: 8,
      label: 'Yet Another 4',
      icon: 'bookmark',
    },
    {
      id: 9,
      label: 'Yet Another 5',
      icon: 'bookmark',
    },
    {
      id: 10,
      label: 'Yet Another 6',
      icon: 'bookmark',
    },
  ];

  public tabContent = [
    'Book Your Flight!',
    'Reserve A Hotel!',
    'All your Favorite things!',
    'Just Another page',
    'Hey look! Another page!',
    'Hey look! Another page2!',
    'Hey look! Another page3!',
    'Hey look! Another page4!',
    'Hey look! Another page5!',
    'Hey look! Another page6!',
  ];

  nextTab() {
    console.log('current tab: ', this.mySelectedIndex);
    if (this.mySelectedIndex < this.tabs.length - 1) {
      this.mySelectedIndex++;
    } else {
      this.mySelectedIndex = 0;
    }
    console.log(this.mySelectedIndex);
    console.log('Button Pushed!');
  }
}
