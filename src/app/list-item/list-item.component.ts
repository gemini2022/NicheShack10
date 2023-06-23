import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { ListItem } from '../list-item';
import { ExitEditType, SecondarySelectionType } from '../enums';

@Component({
  selector: 'list-item',
  templateUrl: './list-item.component.html',
  styleUrls: ['./list-item.component.scss']
})
export class ListItemComponent {
  // Public
  public ExitEditType = ExitEditType;
  public SecondarySelectionType = SecondarySelectionType;

  // Input
  @Input() public listItem!: ListItem;
  
  // Output
  @Output() public onDoubleClick: EventEmitter<void> = new EventEmitter();
  @Output() public onMouseDown: EventEmitter<ListItem> = new EventEmitter();
  @Output() public onListItemAdded: EventEmitter<ListItem> = new EventEmitter();
  @Output() public onListItemEdited: EventEmitter<ListItem> = new EventEmitter();

  // View Child
  @ViewChild('htmlElement') htmlElement!: ElementRef<HTMLElement>;

  ngOnInit() {
    this.listItem.onListItemAdded.subscribe(()=> {
      this.onListItemAdded.emit(this.listItem);
    });
    this.listItem.onListItemEdited.subscribe(()=> {
      this.onListItemEdited.emit(this.listItem);
    });
  }


  ngAfterViewInit() {
    this.listItem.htmlElement = this.htmlElement;
  }


  
  onListItemDown(e: MouseEvent) {
    const rightMouseButton = 2;

    // As long as this list item is (NOT) currently in edited mode
    if (!this.listItem.inEditMode) {

      // If this list item is being selected from a right mouse down
      if (e.button == rightMouseButton) console.log('right click')

      // As long as we're (NOT) right clicking on a list item that's already selected
      if (!(e.button === rightMouseButton && this.listItem.hasSecondarySelection)) {
        this.onMouseDown.emit(this.listItem)
      }
    }
  }
}