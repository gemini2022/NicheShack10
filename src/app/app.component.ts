import { Component } from '@angular/core';
import { ListItem } from './list-item';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  public testList: Array<ListItem> = [
    {id: '0', text: 'ListItem1'},
    {id: '1', text: 'ListItem2'},
    {id: '2', text: 'ListItem3'},
    {id: '3', text: 'ListItem4'},
    {id: '4', text: 'ListItem5'},
    {id: '5', text: 'ListItem6'},
    {id: '6', text: 'ListItem7'},
    {id: '7', text: 'ListItem8'},
    {id: '8', text: 'ListItem9'},
    {id: '9', text: 'ListItem10'},
    {id: '10', text: 'ListItem11'},
    {id: '11', text: 'ListItem12'},
  ];
}