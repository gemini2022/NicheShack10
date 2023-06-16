import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ListItem } from '../list-item';
import { SecondarySelectionType } from '../enums';

@Component({
  selector: 'list-item',
  templateUrl: './list-item.component.html',
  styleUrls: ['./list-item.component.scss']
})
export class ListItemComponent  {
  @Input() public listItem!: ListItem;
  @Input() public editedItem!: ListItem;
  @Input() public selectedItem!: ListItem;
  @Input() public unselectedItem!: ListItem;
  @Output() public itemSelected: EventEmitter<{listItem: ListItem, mouseEvent: MouseEvent}> = new EventEmitter();
 

  public SecondarySelectionType = SecondarySelectionType;

  

  
}