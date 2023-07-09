import { Component, ViewChild } from '@angular/core';
import { ListItem } from './list-item';
import { ListComponent } from './list/list.component';
import { DataService } from './services/data/data.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  public testList: Array<ListItem> = new Array<ListItem>();

  @ViewChild('list') listComponent!: ListComponent;


  constructor(private dataService: DataService) { }


  ngOnInit() {
    this.dataService.getItems('api/Test').subscribe(
      (listItems: Array<ListItem>) => {
        this.testList = listItems;
      }
    )
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


  onListItemAdded(listItemsTexts: Array<string>) {
    this.dataService.post('api/Test', {
      texts: listItemsTexts
    }).subscribe((listItems: Array<ListItem>) => {
      this.testList = listItems;
    });
  }


  onListItemEdited(listItem: ListItem) {
    this.dataService.put('api/Test', {
      id: listItem.id,
      text: listItem.text
    }).subscribe((listItems: Array<ListItem>) => {
      this.testList = listItems;
    });
  }
}