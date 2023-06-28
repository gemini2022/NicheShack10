import { ElementRef } from "@angular/core";
import { ArrowKeyType, ExitEditType, SecondarySelectionType } from "./enums";
import { List } from "./list";

export class ListItem {
  public hasSecondarySelection!: boolean;
  public isDisabled!: boolean;
  public hasPrimarySelection!: boolean;
  public htmlElement!: ElementRef<HTMLElement>;
  public secondarySelectionType!: SecondarySelectionType;

  public isPivot!: boolean;

  public hasUnselection!: boolean;

  public isNew!: boolean;
  public inEditMode!: boolean;

  constructor(public id: string, public text: string) { }



  public initialize() {
    this.isNew = true;
    this.inEditMode = true;
    this.hasSecondarySelection = true;
    window.setTimeout(() => {
      this.htmlElement.nativeElement.focus();
    })
  }


  public setToEditMode(list: List) {
    this.inEditMode = true;
    this.hasPrimarySelection = false;
    list.list.forEach(x => {
      if (!x.inEditMode) x.isDisabled = true;
    })
    this.selectRange();
  }


  private selectRange() {
    const range = document.createRange();
    range.selectNodeContents(this.htmlElement.nativeElement);
    const selection = window.getSelection();
    selection!.removeAllRanges();
    selection!.addRange(range);
  }



  public exitEdit(list: List, exitEditType?: ExitEditType) {
    if (this.htmlElement!.nativeElement.innerText.trim().length > 0) {

      if (exitEditType == ExitEditType.Escape) {
        this.cancelListItemEdit(list);

      } else {
        this.completeListItemEdit(list);
      }

    } else {
      if (exitEditType != ExitEditType.Enter) this.cancelListItemEdit(list);
    }
  }














  private cancelListItemEdit(list: List): void {
    if (this.isNew) {
      list.list.splice(0, 1);
      list.reinitializeList();
    }

    // Reset the item back to the way it was before the edit
    this.htmlElement!.nativeElement.innerText = this.text.trim();
    this.reselectItem(list);
  }






  private completeListItemEdit(list: List): void {
    const oldText = this.text;
    this.text = this.getCaseType();
    this.htmlElement!.nativeElement.innerText = this.text;

    // If the edited text is different from what it was before the edit
    if (this.text!.trim() != oldText) {
      if (this.isNew) {
        list.addedListItemEvent.emit(this)
      } else {
        list.editedListItemEvent.emit(this)
      }
    }
    this.reselectItem(list);
  }




  private getCaseType(): string {
    let text: string;

    // switch (this.caseType) {

    //   // Capitalized Case
    //   case CaseType.CapitalizedCase:
    //     const capCase = new CapitalizedCase();
    //     text = capCase.getCase(this.htmlElement.nativeElement.innerText.trim());
    //     break;

    //   // Title Case
    //   case CaseType.TitleCase:
    //     const titleCase = new TitleCase();
    //     text = titleCase.getCase(this.htmlElement.nativeElement.innerText.trim());
    //     break;

    //   // Lower Case
    //   case CaseType.LowerCase:
    //     text = this.htmlElement.nativeElement.innerText.trim().toLowerCase();
    //     break;

    //   // No Case
    //   default:
    //     text = this.htmlElement.nativeElement.innerText.trim();
    //     break;
    // }


    text = this.htmlElement!.nativeElement.innerText.trim(); // ****** Temporary ****** \\

    return text;
  }






  private reselectItem(list: List): void {
    this.isNew = false;
    this.inEditMode = false;
    this.hasPrimarySelection = true;
    this.htmlElement!.nativeElement.focus();
    list.list.forEach(x => x.isDisabled = false);
  }




  public setFirstListItemSecondarySelectionType(secondListItem: ListItem) {
    if (this.hasSecondarySelection && !this.hasPrimarySelection) {
      if (secondListItem.hasSecondarySelection || secondListItem.hasUnselection) {
        this.secondarySelectionType = SecondarySelectionType.Top;
      } else if (!secondListItem.hasSecondarySelection && !secondListItem.hasUnselection) {
        this.secondarySelectionType = SecondarySelectionType.All;
      }
    }
  }


  public setMiddleListItemSecondarySelectionType(prevListItem: ListItem, nextListItem: ListItem) {
    if (this.hasSecondarySelection && !this.hasPrimarySelection) {
      if (!prevListItem.hasSecondarySelection && nextListItem.hasSecondarySelection) {
        if (prevListItem.hasUnselection) {
          this.secondarySelectionType = SecondarySelectionType.Middle;
          // continue;
        } else {
          this.secondarySelectionType = SecondarySelectionType.Top;
          // continue;
        }
      }

      if (prevListItem.hasSecondarySelection && !nextListItem.hasSecondarySelection) {
        if (nextListItem.hasUnselection) {
          this.secondarySelectionType = SecondarySelectionType.Middle;
          // continue;
        } else {
          this.secondarySelectionType = SecondarySelectionType.Bottom;
          // continue;
        }
      }

      if (!prevListItem.hasSecondarySelection && !nextListItem.hasSecondarySelection) {
        if (prevListItem.hasUnselection) {
          this.secondarySelectionType = SecondarySelectionType.Bottom;
          // continue;
        } else if (nextListItem.hasUnselection) {
          this.secondarySelectionType = SecondarySelectionType.Top;
          // continue;
        } else {
          this.secondarySelectionType = SecondarySelectionType.All;
          // continue;
        }
      }

      if (prevListItem.hasSecondarySelection && nextListItem.hasSecondarySelection) {
        this.secondarySelectionType = SecondarySelectionType.Middle;
      }
    }
  }


  public setLastListItemSecondarySelectionType(secondToLastListItem: ListItem) {
    if (this.hasSecondarySelection && !this.hasPrimarySelection) {
      if (secondToLastListItem.hasSecondarySelection || secondToLastListItem.hasUnselection) {
        this.secondarySelectionType = SecondarySelectionType.Bottom;
      } else if (!secondToLastListItem.hasSecondarySelection && !secondToLastListItem.hasUnselection) {
        this.secondarySelectionType = SecondarySelectionType.All;
      }
    }
  }


  public selectNextListItem(list: List, arrowKeyType: ArrowKeyType): void {
    if (this.inEditMode) return;
    const currentIndex = list.list.indexOf(this);
    const nextIndex = arrowKeyType === ArrowKeyType.Up ? currentIndex - 1 : currentIndex + 1;

    if (nextIndex >= 0 && nextIndex < list.list.length) {
      list.selectListItem(list.list[nextIndex]);
    }
  }
}