import { Directive, EventEmitter, Input, Output } from "@angular/core";
import { ListItem } from "./list-item";
import { ArrowKeyType, ExitEditType } from "./enums";

@Directive()
export class List {
    // Private
    private ctrlKeyDown!: boolean;
    private shiftKeyDown!: boolean;
    private eventListenersAdded!: boolean;

    // Public
    public stopMouseDownPropagation!: boolean;

    // Inputs
    @Input() public list!: Array<ListItem>;

    // Events
    @Output() public addedListItemEvent: EventEmitter<ListItem> = new EventEmitter();
    @Output() public editedListItemEvent: EventEmitter<ListItem> = new EventEmitter();
    @Output() public deletedListItemsEvent: EventEmitter<Array<ListItem>> = new EventEmitter();
    @Output() public deleteKeyPressedEvent: EventEmitter<Array<ListItem>> = new EventEmitter();
    @Output() public listItemsToBeDeletedEvent: EventEmitter<Array<ListItem>> = new EventEmitter();



    public selectListItem(listItem: ListItem): void {
        const editableListItem = this.list.find(x => x.inEditMode);
        if (editableListItem) editableListItem.exitEdit(this);
        this.setSelectedItems(listItem);
    }




    public addListItem(): void {
        this.addEventListeners();
        this.resetListItemProperties();
        this.stopMouseDownPropagation = false;
        this.list.unshift(new ListItem('', ''));
        this.list[0].initialize();
    }




    public editListItem() {
        const listItem = this.list.find(x => x.hasPrimarySelection);
        if (!listItem) return;
        listItem.setToEditMode(this);
    }




    public getListItemsToBeDeleted() {
        this.listItemsToBeDeletedEvent.emit(this.list.filter(x => x.hasSecondarySelection));
    }



    public deleteListItems(): void {
        if (this.list.find(x => x.inEditMode)) return;

        const listItemsToBeDeleted = this.list.filter(x => x.hasSecondarySelection);
        if (listItemsToBeDeleted.length == 0) return;
        this.deletedListItemsEvent.emit(listItemsToBeDeleted);

        const primarySelectedIndex = this.list.findIndex(x => x.hasPrimarySelection);
        const nextSelectedItem = primarySelectedIndex != -1 ? this.list.slice(primarySelectedIndex + 1).find(x => !x.hasSecondarySelection) : null;

        this.list = this.list.filter(x => !listItemsToBeDeleted.includes(x));
        if (nextSelectedItem) this.selectListItem(nextSelectedItem);
    }




    private setSelectedItems(listItem: ListItem): void {
        this.addEventListeners();
        listItem.htmlElement.nativeElement.focus();

        if (this.shiftKeyDown) {
            this.onItemSelectionUsingShiftKey(listItem);
        } else if (this.ctrlKeyDown) {
            this.onItemSelectionUsingCtrlKey(listItem);
        } else {
            this.onItemSelectionUsingNoModifierKey(listItem);
        }
        this.setSecondarySelectionType();
    }




    private onItemSelectionUsingShiftKey(listItem: ListItem) {
        this.list.forEach(x => {
            x.hasUnselection = false;
            x.hasPrimarySelection = false;
            x.hasSecondarySelection = false;
            x.secondarySelectionType = null!;
        });
        const selectedListItemIndex = this.list.indexOf(listItem);
        const pivotItemIndex = this.list.findIndex(x => x.isPivot);
        const start = Math.min(pivotItemIndex, selectedListItemIndex);
        const end = Math.max(pivotItemIndex, selectedListItemIndex);

        for (let i = start; i <= end; i++) {
            this.list[i].hasSecondarySelection = true;
        }
        listItem.hasPrimarySelection = true;
    }



    private onItemSelectionUsingCtrlKey(listItem: ListItem) {
        this.list.forEach(x => {
            x.isPivot = false;
            x.hasUnselection = false;
            x.hasPrimarySelection = false;
            x.secondarySelectionType = null!;
        });
        listItem.isPivot = true;
        listItem.hasUnselection = listItem.hasSecondarySelection;
        listItem.hasPrimarySelection = !listItem.hasSecondarySelection;
        listItem.hasSecondarySelection = !listItem.hasUnselection;
    }




    private onItemSelectionUsingNoModifierKey(listItem: ListItem): void {
        this.resetListItemProperties();
        listItem.isPivot = true;
        listItem.hasPrimarySelection = true;
        listItem.hasSecondarySelection = true;
    }




    private setSecondarySelectionType(): void {
        if (length !== 1) {
            const length = this.list.length;
            const firstListItem = this.list[0];
            const secondListItem = this.list[1];
            const lastListItem = this.list[length - 1];
            const secondToLastListItem = this.list[length - 2];

            firstListItem.setFirstListItemSecondarySelectionType(secondListItem);
            for (let i = 1; i < length - 1; i++) {
                const currentListItem = this.list[i];
                const prevListItem = this.list[i - 1];
                const nextListItem = this.list[i + 1];
                currentListItem.setMiddleListItemSecondarySelectionType(prevListItem, nextListItem);
            }
            lastListItem.setLastListItemSecondarySelectionType(secondToLastListItem);
        }
    }




    private onKeyDown = (e: KeyboardEvent): void => {
        switch (e.key) {
            case 'Escape':
                this.onEscape();
                break;
            case 'Enter':
                this.onEnter(e);
                break;
            case 'ArrowUp': case 'ArrowDown':
                this.onArrowKey(e, e.key === 'ArrowUp' ? ArrowKeyType.Up : ArrowKeyType.Down);
                break;
            case 'Shift': case 'Control':
                e.key == 'Shift' ? this.shiftKeyDown = true : this.ctrlKeyDown = true;
                break;
            case 'Delete':
                this.emitPressedDeleteKey();
                break;
        }
    }





    private onKeyUp = (e: KeyboardEvent): void => {
        switch (e.key) {
            case 'Shift': case 'Control':
                e.key == 'Shift' ? this.shiftKeyDown = false : this.ctrlKeyDown = false;
                break;
        }
    }




    private onMouseDown = (): void => {
        if (this.stopMouseDownPropagation) {
            this.stopMouseDownPropagation = false;
            return
        }
        const editableListItem = this.list.find(x => x.inEditMode);
        editableListItem ? editableListItem.exitEdit(this) : this.reinitializeList();
    }




    private onEscape() {
        const editableListItem = this.list.find(x => x.inEditMode);
        editableListItem ? editableListItem.exitEdit(this, ExitEditType.Escape) : this.reinitializeList();
    }




    private onEnter(e: KeyboardEvent): void {
        e.preventDefault();
        const editableListItem = this.list.find(x => x.inEditMode);
        if (editableListItem) editableListItem.exitEdit(this, ExitEditType.Enter);
    }





    private onArrowKey(e: KeyboardEvent, arrowKeyType: ArrowKeyType): void {
        e.preventDefault();
        const currentListItem = this.list.find(x => x.inEditMode || x.hasPrimarySelection || x.hasUnselection);
        currentListItem!.selectNextListItem(this, arrowKeyType);
    }




    private emitPressedDeleteKey(): void {
        if (this.list.find(x => x.inEditMode)) return;
        const listItemsToBeDeleted = this.list.filter(x => x.hasSecondarySelection);
        if (listItemsToBeDeleted.length > 0) this.deleteKeyPressedEvent.emit(listItemsToBeDeleted);
    }




    private addEventListeners(): void {
        if (!this.eventListenersAdded) {
            this.eventListenersAdded = true;
            window.addEventListener('keyup', this.onKeyUp);
            window.addEventListener('keydown', this.onKeyDown);
            window.addEventListener('mousedown', this.onMouseDown);
        }
    }




    private resetListItemProperties() {
        this.list.forEach(x => {
            x.isPivot = false;
            x.isDisabled = false;
            x.inEditMode = false;
            x.hasUnselection = false;
            x.hasPrimarySelection = false;
            x.hasSecondarySelection = false;
            x.secondarySelectionType = null!;
        });
    }




    public reinitializeList() {
        this.resetListItemProperties()
        this.eventListenersAdded = false;
        window.removeEventListener('keyup', this.onKeyUp);
        window.removeEventListener('keydown', this.onKeyDown);
        window.removeEventListener('mousedown', this.onMouseDown);
    }
}