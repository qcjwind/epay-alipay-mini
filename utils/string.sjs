// String format, used for axml

// Capitalize the first letter
const toInitialsUpperCase = (str) => str.charAt(0).toUpperCase() + str.slice(1);

// Lowercase the first letter
const toInitialsLowerCase = (str) => str.charAt(0).toLowerCase() + str.slice(1);

const toUpperCase = (str) => str.toUpperCase();

const toLowerCase = (str) => str.toLowerCase();

const formatEuropeanCurrency = (amount) => {
  if (amount === 0) {
    return '0';
  }
  if (!amount) {
    return '';
  }
  return amount.toLocaleString('de-DE', {
    maximumFractionDigits: 2
  })
};

export default {
  toInitialsUpperCase,
  toInitialsLowerCase,
  toUpperCase,
  toLowerCase,
  formatEuropeanCurrency,
};