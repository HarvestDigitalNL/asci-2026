import { LightningElement, api } from 'lwc';

export default class Tooltip extends LightningElement {
  @api content = 'Default tooltip content';
}
