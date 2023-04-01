const PULSE_URL = "https://pulse-uae.tatsh.com/Login2.aspx?token=AQ==";

const PULSE_ELIGIBILITY_URL = "https://pulse-uae.tatsh.com/EligibilityChecking2.aspx";

const WAIT_TIME = 10000;

const LOGIN_DOM_CHANGED = 'Pulse - login page - DOM has changed.';

const ELIGIBILITY_PAGE_DOM_CHANGED = 'Pulse - eligibility page - DOM has changed.';

const ELIGIBILITY_TAB_DOM_CHANGED = 'Pulse - eligibility tab3 - DOM has changed.';

const EMIRATES_ID_SECTION_ERROR = 'Pulse - emirates ID section - DOM has changed.';

const EXTRACTING_ELIGIBILITY_ERROR = 'Pulse - extracting eligibility program - DOM has changed or screenshot program error.';

const EXECUTION_ERROR = 'Pulse - overall execution - chrome browser build() not working or execution failed.';

const LOGIN_UNKNOWN_ERR = 'Pulse - login - Unknown error.';

module.exports = {PULSE_URL,PULSE_ELIGIBILITY_URL, WAIT_TIME, LOGIN_DOM_CHANGED, ELIGIBILITY_PAGE_DOM_CHANGED, ELIGIBILITY_TAB_DOM_CHANGED, EMIRATES_ID_SECTION_ERROR, EXTRACTING_ELIGIBILITY_ERROR, EXECUTION_ERROR, LOGIN_UNKNOWN_ERR};