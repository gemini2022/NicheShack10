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
    this.dataService.getItems('api/List').subscribe(
      (listItems: Array<ListItem>) => {
        this.testList = listItems;
      }
    )
  }


  addListItem() {
    this.listComponent.addListItem();
  }



  onListItemAdded(newListItemText: string) {
    this.dataService.post('api/List', {
      text: newListItemText
    }).subscribe((listItems: Array<ListItem>) => {
      this.testList = listItems;
    });
  }




  editListItem() {
    this.listComponent.editListItem();
  }




  onListItemEdited(listItem: ListItem) {
    this.dataService.put('api/List', {
      id: listItem.id,
      text: listItem.text
    }).subscribe((listItems: Array<ListItem>) => {
      this.testList = listItems;
    });
  }




  onListItemsToBeDeleted(listItemsToBeDeleted: Array<ListItem>) {
    this.listComponent.deleteListItems();
  }



  onDeletedListItems(idsOfDeletedListItems: Array<any>) {
    this.dataService.delete('api/List', {
      ids: idsOfDeletedListItems
    }).subscribe((listItems: Array<ListItem>) => {
      this.testList = listItems;
    });
  }


  


  onPastedListItems(pastedListItemsText: Array<string>) {
    this.dataService.post('api/List/Pasted', {
      texts: pastedListItemsText
    }).subscribe((listItems: Array<ListItem>) => {
      this.testList = listItems;
    });
  }
}