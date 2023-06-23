import { Directive, EventEmitter, Input, Output } from "@angular/core";
import { ListItem } from "./list-item";
import { ExitEditType, SecondarySelectionType } from "./enums";

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
    @Output() public listItemAddedEvent: EventEmitter<ListItem> = new EventEmitter();
    @Output() public listItemEditedEvent: EventEmitter<ListItem> = new EventEmitter();




    public selectListItem(listItem: ListItem): void {
        this.addEventListeners();

        // If another item is being edited, remove it from edit mode
        const editableListItem = this.list.find(x => x.inEditMode);
        if (editableListItem) {
            this.list.forEach(x => x.isDisabled = false);
            editableListItem.onExitListItemEdit(ExitEditType.Blur);
        }
        this.setSelectedItems(listItem);
    }








    public addListItem(): void {
        this.list.forEach(x => {
            x.isPivot = false;
            x.isDisabled = true;
            x.hasUnselection = false;
            x.hasPrimarySelection = false;
            x.hasSecondarySelection = false;
            x.secondarySelectionType = null!;
        })
        this.list.unshift(new ListItem('', ''));
        this.list[0].isNew = true;
        this.list[0].inEditMode = true;
        window.setTimeout(() => {
            this.list[0].htmlElement.nativeElement.focus();
        })
    }



    public editListItem() {
        const listItem = this.list.find(x => x.hasPrimarySelection);
        if (listItem) {
            listItem.inEditMode = true;
            listItem.hasPrimarySelection = false;
            this.list.forEach(x => {
                if (!x.inEditMode) x.isDisabled = true;
            })
            this.selectRange(listItem);
        }
    }






    private setSelectedItems(listItem: ListItem): void {
        if (this.shiftKeyDown) {
            this.onItemSelectionUsingShiftKey(listItem);
        } else if (this.ctrlKeyDown) {
            this.onItemSelectionUsingCtrlKey(listItem);
        } else {
            this.onItemSelectionUsingNoModifierKey(listItem);
        }
        this.setSecondarySelectionType();
    }





    onItemSelectionUsingShiftKey(listItem: ListItem) {
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



    onItemSelectionUsingCtrlKey(listItem: ListItem) {
        this.list.forEach(x => {
            x.isPivot = false;
            x.hasUnselection = false;
            x.hasPrimarySelection = false;
            x.secondarySelectionType = null!;
        });
        if (listItem.hasSecondarySelection) {
            listItem.hasUnselection = true;
            listItem.hasSecondarySelection = false;

        } else {
            listItem.hasPrimarySelection = true;
            listItem.hasSecondarySelection = true;
        }
        listItem.isPivot = true;
    }



    onItemSelectionUsingNoModifierKey(listItem: ListItem): void {
        this.list.forEach(x => {
            x.isPivot = false;
            x.hasUnselection = false;
            x.hasPrimarySelection = false;
            x.hasSecondarySelection = false;
            x.secondarySelectionType = null!;
        });
        listItem.isPivot = true;
        listItem.hasPrimarySelection = true;
        listItem.hasSecondarySelection = true;
    }






    private setSecondarySelectionType(): void {
        const length = this.list.length;
        const firstListItem = this.list[0];
        const secondListItem = this.list[1];
        const lastListItem = this.list[length - 1];
        const secondToLastListItem = this.list[length - 2];


        if (length !== 1) {
            if (firstListItem.hasSecondarySelection && !firstListItem.hasPrimarySelection) {
                if (secondListItem.hasSecondarySelection || secondListItem.hasUnselection) {
                    firstListItem.secondarySelectionType = SecondarySelectionType.Top;
                } else if (!secondListItem.hasSecondarySelection && !secondListItem.hasUnselection) {
                    firstListItem.secondarySelectionType = SecondarySelectionType.All;
                }
            }

            for (let i = 1; i < length - 1; i++) {
                const currentListItem = this.list[i];
                const prevListItem = this.list[i - 1];
                const nextListItem = this.list[i + 1];

                if (currentListItem.hasSecondarySelection && !currentListItem.hasPrimarySelection) {
                    if (!prevListItem.hasSecondarySelection && nextListItem.hasSecondarySelection) {
                        if (prevListItem.hasUnselection) {
                            currentListItem.secondarySelectionType = SecondarySelectionType.Middle;
                            continue;
                        } else {
                            currentListItem.secondarySelectionType = SecondarySelectionType.Top;
                            continue;
                        }
                    }

                    if (prevListItem.hasSecondarySelection && !nextListItem.hasSecondarySelection) {
                        if (nextListItem.hasUnselection) {
                            currentListItem.secondarySelectionType = SecondarySelectionType.Middle;
                            continue;
                        } else {
                            currentListItem.secondarySelectionType = SecondarySelectionType.Bottom;
                            continue;
                        }
                    }

                    if (!prevListItem.hasSecondarySelection && !nextListItem.hasSecondarySelection) {
                        if (prevListItem.hasUnselection) {
                            currentListItem.secondarySelectionType = SecondarySelectionType.Bottom;
                            continue;
                        } else if (nextListItem.hasUnselection) {
                            currentListItem.secondarySelectionType = SecondarySelectionType.Top;
                            continue;
                        } else {
                            currentListItem.secondarySelectionType = SecondarySelectionType.All;
                            continue;
                        }
                    }

                    if (prevListItem.hasSecondarySelection && nextListItem.hasSecondarySelection) {
                        currentListItem.secondarySelectionType = SecondarySelectionType.Middle;
                    }
                }
            }

            if (lastListItem.hasSecondarySelection && !lastListItem.hasPrimarySelection) {
                if (secondToLastListItem.hasSecondarySelection || secondToLastListItem.hasUnselection) {
                    lastListItem.secondarySelectionType = SecondarySelectionType.Bottom;
                } else if (!secondToLastListItem.hasSecondarySelection && !secondToLastListItem.hasUnselection) {
                    lastListItem.secondarySelectionType = SecondarySelectionType.All;
                }
            }
        }
    }












    private onKeyDown = (e: KeyboardEvent): void => {
        switch (e.key) {
            case 'Enter':
                // this.onEnter(e);
                break;
            case 'ArrowUp':
                // this.onArrowUp(e);
                break;
            case 'ArrowDown':
                // this.onArrowDown(e);
                break;
            case 'Escape':
                this.onEscape();
                break;
            case 'Delete':
                // this.emitPressedDeleteKey();
                break;
            case 'Control':
                this.ctrlKeyDown = true;
                break;
            case 'Shift':
                this.shiftKeyDown = true;
                break;

            default:
                break;
        }
    }





    private onKeyUp = (e: KeyboardEvent): void => {
        switch (e.key) {
            case 'Control':
                this.ctrlKeyDown = false;
                break;
            case 'Shift':
                this.shiftKeyDown = false;
                break;
            default:
                break;
        }
    }




    private onMouseDown = (): void => {
        if (!this.stopMouseDownPropagation) {
            const editableListItem = this.list.find(x => x.inEditMode);
            if (editableListItem) {
                this.list.forEach(x => x.isDisabled = false);
                editableListItem.onExitListItemEdit(ExitEditType.Blur);
            } else {
                this.reinitializeList();
            }
        } else {
            this.stopMouseDownPropagation = false;
        }
    }






    private selectRange(listItem: ListItem) {
        const range = document.createRange();
        range.selectNodeContents(listItem.htmlElement.nativeElement);
        const selection = window.getSelection();
        selection!.removeAllRanges();
        selection!.addRange(range);
    }




    private onEscape() {
        const editableListItem = this.list.find(x => x.inEditMode);
        if (editableListItem) {
            this.list.forEach(x => x.isDisabled = false);

            if (editableListItem.isNew) {
                this.removeNewItem();
            } else {
                editableListItem.onExitListItemEdit(ExitEditType.Escape);
            }
        } else {
            this.reinitializeList();
        }
    }



    private removeNewItem() {
        this.list.splice(0, 1);
        this.reinitializeList();
    }



    private addEventListeners(): void {
        if (!this.eventListenersAdded) {
            this.eventListenersAdded = true;
            window.addEventListener('keyup', this.onKeyUp);
            window.addEventListener('keydown', this.onKeyDown);
            window.addEventListener('mousedown', this.onMouseDown);
        }
    }





    private reinitializeList() {
        this.list.forEach(x => {
            x.isPivot = false;
            x.isDisabled = false;
            x.inEditMode = false;
            x.hasUnselection = false;
            x.hasPrimarySelection = false;
            x.hasSecondarySelection = false;
            x.secondarySelectionType = null!;
        });
        window.removeEventListener('keyup', this.onKeyUp);
        window.removeEventListener('keydown', this.onKeyDown);
        window.removeEventListener('mousedown', this.onMouseDown);
    }
}