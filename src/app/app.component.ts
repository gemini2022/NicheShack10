import { Component, ViewChild } from '@angular/core';
import { ListItem } from './list-item';
import { ListComponent } from './list/list.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  public testList: Array<ListItem> = new Array<ListItem>();

  @ViewChild('list') listComponent!: ListComponent;

  ngOnInit() {
    for (let i = 0; i < 20; i++) {
      this.testList.push(new ListItem(i.toString(), 'ListItem' + (i + 1)))
    }
  }


  addListItem() {
    this.listComponent.addListItem();
  }


  editListItem() {
    this.listComponent.editListItem();
  }


  onListItemsToBeDeleted(listItemsToBeDeleted: Array<ListItem>) {
    this.listComponent.deleteListItems();
  }


  onListItemAdded(listItem: ListItem) {
    console.log('list item added: ', listItem)
  }

  onListItemEdited(listItem: ListItem) {
    console.log('list item edited: ', listItem)
  }
}