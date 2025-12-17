// Date format, used for axml

const dateStringToMDReg = getRegExp('(\\d{4})-(\\d{2})-(\\d{2})\\s(.*)');
const formatDateStringToDateTime = (dateString = '') => dateString.replace(dateStringToMDReg, '$3.$2.$1 $4');

const formatDateStringToDate = (dateString = '') => dateString.replace(dateStringToMDReg, '$3.$2.$1');

const formateDateStringToDateHm = (dateString = '') => formatDateStringToDateTime(dateString).slice(0, -3);

const formatDateStringToTime = (dateString = '') => dateString.slice(-8);

const formatDateStringToms = (dateString = '') => dateString.slice(-5);

const formatDateStringToHm = (dateString = '') => dateString.slice(-8, -3);

const backTwelveHourUnit = (dateString = '') => {
  if (!dateString) {
    return '';
  }
  return parseInt(dateString.split(':')[0]) >= 12 ? 'PM' : 'AM';
}

const formatToFullYearDateTime = (dateString = '') => {
  if (!dateString) return '';
  const dateWithTime = dateString.replace(dateStringToMDReg, '$1.$2.$3 $4');
  return dateWithTime;
}

export default {
  formatDateStringToDateTime,
  formatDateStringToDate,
  formateDateStringToDateHm,
  formatDateStringToTime,
  formatDateStringToms,
  formatDateStringToHm,
  backTwelveHourUnit,
  formatToFullYearDateTime
};