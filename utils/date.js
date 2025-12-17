// Date and date format

const dateStringToYMDReg = /(\d{4})-(\d{2})-(\d{2}).*/;
export const formatDateStringToYMD = (dateString = '', lang = '') => dateString.replace(dateStringToYMDReg, lang.indexOf('ZH') > -1 ? '$1.$2.$3' : '$3.$2.$1');