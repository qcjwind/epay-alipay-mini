import EN_US from './EN_US';
import { eventEmit } from '/common/eventBus';

export default function useI18n(lang) {
  switch (lang) {
    case 'EN_US':
      eventEmit('onLanguageChange', EN_US);
      return EN_US;
  }
};