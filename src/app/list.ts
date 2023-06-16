import { Directive, EventEmitter, Input, Output, SimpleChanges } from "@angular/core";
import { ListItem } from "./list-item";
import { SecondarySelectionType } from "./enums";

@Directive()
export class List {
    protected _selectedItem!: ListItem;
    public get selectedItem(): ListItem { return this._selectedItem; }


    protected _editedItem!: ListItem;
    public get editedItem(): ListItem { return this._editedItem; }


    protected _unselectedItem!: ListItem;
    public get unselectedItem(): ListItem { return this._unselectedItem; }


    private ctrlKeyDown!: boolean;

    private shiftKeyDown!: boolean;


    private eventListenersAdded!: boolean;
    private stopMouseDownPropagation!: boolean;

    private pivotItem!: ListItem;


    @Output() public rightClickedItemEvent: EventEmitter<ListItem> = new EventEmitter();

    @Input() public list!: Array<ListItem>;





    public onItemSelect(mouseDown: any): void {
        const rightMouseButton = 2;
        const { listItem, mouseEvent } = mouseDown;


        // Add the event listeners (if not already)
        this.addEventListeners();
        this.stopMouseDownPropagation = true

        // If another item is being edited, remove it from edit mode
        // if (this.editedItem) this.exitItemEdit(undefined, true);

        // If the item that received the mouse down is not currently being edited
        if (this.editedItem !== listItem) {
            // If this item is selected with a right mouse button
            if (mouseEvent.button === rightMouseButton) {
                this.rightClickedItemEvent.emit(listItem);
            }

            // If we're not right-clicking on an already selected item
            if (!(mouseEvent.button === rightMouseButton && listItem.selected)) {
                this._selectedItem = listItem;
                this._unselectedItem = null!;
                this.setSelectedItems();
            }
        }
    }



    private setSelectedItems(): void {
        if (this.shiftKeyDown) {
            this.onItemSelectionUsingShiftKey();
        } else if (this.ctrlKeyDown) {
            this.onItemSelectionUsingCtrlKey();
        } else {
            this.onItemSelectionUsingNoModifierKey();
        }

        this.setSecondarySelectionType();
    }




    onItemSelectionUsingShiftKey() {
        // Reset selected and secondarySelectionType properties for each item in list
        this.list.forEach(item => {
            item.selected = false;
            item.secondarySelectionType = null!;
        });

        // Find the indexes of pivotItem and selectedItem in the list
        const pivotItemIndex = this.list.indexOf(this.pivotItem);
        const selectedItemIndex = this.list.indexOf(this.selectedItem);

        // Return early if either pivotItem or selectedItem is not found
        if (pivotItemIndex === -1 || selectedItemIndex === -1) return;

        // Select items based on their indexes relative to the pivot
        const start = Math.min(pivotItemIndex, selectedItemIndex);
        const end = Math.max(pivotItemIndex, selectedItemIndex);

        for (let i = start; i <= end; i++) {
            this.list[i].selected = true;
        }
    }



    onItemSelectionUsingCtrlKey() {
        // Reset the secondarySelectionType property for each item in list
        this.list.forEach(item => {
            item.secondarySelectionType = null!;
        });

        // Toggle selection of the item we are pressing down on
        if (this._selectedItem.selected) {
            this._selectedItem.selected = false;
            this._unselectedItem = this._selectedItem;
            this._selectedItem = null!;
            this.pivotItem = this._unselectedItem;
        } else {
            this._unselectedItem = null!;
            this._selectedItem.selected = true;
            this.pivotItem = this._selectedItem;
        }
    }



    onItemSelectionUsingNoModifierKey(): void {
        // Reset selected and secondarySelectionType properties for each item in list
        this.list.forEach(item => {
            item.selected = false;
            item.secondarySelectionType = null!;
        });
        // Set the selected
        this._selectedItem.selected = true;
        // Define the pivot item
        this.pivotItem = this._selectedItem;
    }






    private setSecondarySelectionType(): void {
        const length = this.list.length;
        const firstItem = this.list[0];
        const lastItem = this.list[length - 1];

        if (length !== 1) {
            if (firstItem.selected && firstItem !== this._selectedItem) {
                if (this.list[1].selected || this.list[1] === this._unselectedItem) {
                    firstItem.secondarySelectionType = SecondarySelectionType.Top;
                } else if (!this.list[1].selected && this.list[1] !== this._unselectedItem) {
                    firstItem.secondarySelectionType = SecondarySelectionType.All;
                }
            }

            for (let i = 1; i < length - 1; i++) {
                const currentItem = this.list[i];
                const prevItem = this.list[i - 1];
                const nextItem = this.list[i + 1];

                if (currentItem.selected && currentItem !== this._selectedItem) {
                    if (!prevItem.selected && nextItem.selected) {
                        if (prevItem === this._unselectedItem) {
                            currentItem.secondarySelectionType = SecondarySelectionType.Middle;
                            continue;
                        } else {
                            currentItem.secondarySelectionType = SecondarySelectionType.Top;
                            continue;
                        }
                    }

                    if (prevItem.selected && !nextItem.selected) {
                        if (nextItem === this._unselectedItem) {
                            currentItem.secondarySelectionType = SecondarySelectionType.Middle;
                            continue;
                        } else {
                            currentItem.secondarySelectionType = SecondarySelectionType.Bottom;
                            continue;
                        }
                    }

                    if (!prevItem.selected && !nextItem.selected) {
                        if (prevItem === this._unselectedItem) {
                            currentItem.secondarySelectionType = SecondarySelectionType.Bottom;
                            continue;
                        } else if (nextItem === this._unselectedItem) {
                            currentItem.secondarySelectionType = SecondarySelectionType.Top;
                            continue;
                        } else {
                            currentItem.secondarySelectionType = SecondarySelectionType.All;
                            continue;
                        }
                    }

                    if (prevItem.selected && nextItem.selected) {
                        currentItem.secondarySelectionType = SecondarySelectionType.Middle;
                    }
                }
            }

            if (lastItem.selected && lastItem !== this._selectedItem) {
                if (this.list[length - 2].selected || this.list[length - 2] === this._unselectedItem) {
                    lastItem.secondarySelectionType = SecondarySelectionType.Bottom;
                } else if (!this.list[length - 2].selected && this.list[length - 2] !== this._unselectedItem) {
                    lastItem.secondarySelectionType = SecondarySelectionType.All;
                }
            }
        }
    }









    protected addEventListeners(): void {
        if (!this.eventListenersAdded) {
            window.addEventListener('keydown', this.onKeyDown);
            window.addEventListener('keyup', this.onKeyUp);
            // window.addEventListener('paste', this.onPaste);
            window.addEventListener('mousedown', this.onMouseDown);
        }
    }


    private onKeyDown = (e: KeyboardEvent): void => {
        if (e.key === 'Enter') {
            // this.onEnter(e);
            return
        }
        if (e.key === 'ArrowUp') {
            // this.onArrowUp(e);
            return
        }
        if (e.key === 'ArrowDown') {
            // this.onArrowDown(e);
            return
        }

        if (e.key === 'Escape') {
            // this.onEscape();
            return
        }

        if (e.key === 'Delete') {
            // this.emitPressedDeleteKey();
            return
        }

        // if (this.options.multiselectable) {
        if (e.key === 'Shift') {
            this.shiftKeyDown = true;
            return
        }
        if (e.key === 'Control') {
            this.ctrlKeyDown = true;
            return
        }
        // }
    }


    private onKeyUp = (e: KeyboardEvent): void => {
        // if (this.options.multiselectable) {
        if (e.key === 'Control') {
            this.ctrlKeyDown = false;
            return
        }
        if (e.key === 'Shift') {
            this.shiftKeyDown = false;
            return
        }
        // }
    }


    private onMouseDown = (): void => {
        // As long as a mouse down on an item did (NOT) just occur
        if (!this.stopMouseDownPropagation) {

            // If an item is being edited or added
            if (this.editedItem) {

                // Evaluate the state of the edit and then act accordingly
                // this.exitItemEdit(null!, true);

                // If an item is (NOT) being edited
            } else {

                // Then reinitialize the list
                this.reinitializeList();
            }

            // If a mouse-down on an item (DID) just occur
        } else {
            this.stopMouseDownPropagation = false;
        }
    }




    reinitializeList() {
        this.eventListenersAdded = false;
        this.shiftKeyDown = false;
        this.ctrlKeyDown = false;

        // window.removeEventListener('keyup', this.onKeyUp);
        // window.removeEventListener('keydown', this.onKeyDown);
        // window.removeEventListener('paste', this.onPaste);
        window.removeEventListener('mousedown', this.onMouseDown);


        this.pivotItem = null!;
        this._selectedItem = null!;
        this._unselectedItem = null!;
        this._editedItem = null!;

        this.list.forEach(x => {
            x.selected = false;
            x.secondarySelectionType = null!;
        })
    }




}