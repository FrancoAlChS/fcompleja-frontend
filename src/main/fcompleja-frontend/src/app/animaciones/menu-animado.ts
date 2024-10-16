import {
  trigger,
  state,
  style,
  animate,
  transition
} from '@angular/animations';

export const hideAnimation =
  trigger('hideAnimation', [
    state('collapse', style({
      maxWidth: '58px'
    })),
    state('no-collapse', style({
      maxWidth: '278px'
    })),
    transition('collapse=>no-collapse', animate('500ms')),
    transition('no-collapse=>collapse', animate('500ms'))
  ]);

export const menuAnimation =
  trigger('menuAnimation', [
    state('true', style({ opacity: 1 })),
    state('false', style({ opacity: 0, width: '0px', display: 'none' })),
    transition('* => *', [
      animate(500)
    ])
  ]);
