import { LightningElement, api } from 'lwc';

export default class MultiSelectDropdown extends LightningElement {
  @api options = [];
  @api selectedItems;
  @api disabled = false;
  isDropdownOpen = false;
  _selected = [];

  get selectedValues() {
    return this._selected.join(', ');
  }

  get selected() {
    return this._selected;
  }

  set selected(value) {
    this._selected = value;
    // eslint-disable-next-line @lwc/lwc/no-api-reassignments
    this.selectedItems = value.join(',');
  }

  connectedCallback() {
    if (this.selectedItems) {
      this._selected = this.selectedItems.split(',').map(s => s.trim());
    }

    window.addEventListener('searchflights', () => {
      this.closeDropdown();
    });
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  handleChange(e) {
    e.stopPropagation(); // Prevent lightning-checkbox-group's event from bubbling up
    this.selected = e.detail.value;
    this.dispatchEvent(new CustomEvent('change', { detail: this.selectedValues }));
  }

  closeDropdown() {
    this.isDropdownOpen = false;
  }
}
