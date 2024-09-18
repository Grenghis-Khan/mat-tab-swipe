import { Component } from '@angular/core';
import { NgFor } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { MatTabScrollToCenterDirective } from './scrolling.directive';

@Component({
  selector: 'app-tabs',
  standalone: true,
  imports: [
    NgFor,
    MatTabsModule,
    ScrollingModule,
    MatTabScrollToCenterDirective,
  ],
  templateUrl: './tabs.component.html',
  styleUrl: './tabs.component.scss',
})
export class TabsComponent {
  selectedIndex!: number;
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
  ];

  public tabContent = [
    'Book Your Flight!',
    'Reserve A Hotel!',
    'All your Favorite things!',
    'Just Another page',
    'Hey look! Another page!',
  ];

  pushed() {
    console.log('Button Pushed!');
  }
}
