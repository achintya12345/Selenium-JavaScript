const {PULSE_URL, PULSE_ELIGIBILITY_URL, WAIT_TIME, LOGIN_DOM_CHANGED, ELIGIBILITY_PAGE_DOM_CHANGED, ELIGIBILITY_TAB_DOM_CHANGED, EMIRATES_ID_SECTION_ERROR, EXTRACTING_ELIGIBILITY_ERROR, EXECUTION_ERROR, LOGIN_UNKNOWN_ERR} = require('./constants_pulse.js');
const winston = require('winston');
const { format } = require('logform');

const webdriver = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const options = new chrome.Options().addArguments("--headless");
const chromedriver = require('chromedriver');
var fs = require('fs');
const { NoSuchElementError } = require('selenium-webdriver').error;
//chrome.setDefaultService(new chrome.ServiceBuilder(chromedriver.path).build());


/*
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    format: format.combine(
        format.timestamp(),
        format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
    ),
    defaultMeta: { service: 'daman-app' },
    transports: [
        new winston.transports.File({ filename: 'logfile.log' }),
    ],
});
*/   

const logger = winston.createLogger({
    format: format.combine(
      format.timestamp(),
      format.json()
    ),
    transports: [
        new winston.transports.File({ filename: 'logfile.log' })
    ]
});


async function login(webdriver, driver, username, password){
    
    let loginStatus = false;

    try{
        // go to webpage
        await driver.get(PULSE_URL);

        // find username and password elements
        const usernameField = await driver.findElement(
            webdriver.By.id("txtUserName")
        );
        const passwordField = await driver.findElement(
            webdriver.By.id("txtPassword")
        );
        
        // set the password and username
        await usernameField.sendKeys(username);
        await passwordField.sendKeys(password);
        
        // find the login button and click it, wait for 10 seconds.
        await driver.executeScript("document.getElementById('btnLogin').scrollIntoView();");
        /*await driver.sleep(1 * 10000);*/
        const login_button = await driver.findElement(webdriver.By.id("btnLogin"));
        await driver.wait(login_button.click(), WAIT_TIME);

        loginStatus = true;

    }catch (e) {
        if(e instanceof NoSuchElementError){
            logger.error(LOGIN_DOM_CHANGED);
        
        }/*else{
            logger.error(LOGIN_UNKNOWN_ERR);
        }*/
    }
    return loginStatus; 
}


async function navigate_to_eligibility_page(webdriver, driver){

    let eligibilityStatus = false;

    try{
        // if login was successful then DOM will have an element with side-menu
        await driver.wait(webdriver.until.elementLocated(webdriver.By.id('side-menu')),WAIT_TIME);

        // navigate to a eligibility page
        await driver.get(PULSE_ELIGIBILITY_URL);

        eligibilityStatus = true;

    }catch (e) {
        if(e instanceof NoSuchElementError){
            logger.error(ELIGIBILITY_PAGE_DOM_CHANGED);
        }/*else{
            logger.error(LOGIN_UNKNOWN_ERR);
        }*/
    }
    return eligibilityStatus;
}

async function click_on_eligbility_tab(webdriver, driver){

    let eligibilityTabStatus = false;

    try{
        // find tab and switch to it
        activate_tab = driver.findElement(webdriver.By.xpath("//label[@href= '#tab-3']"));
        await activate_tab.click();

        eligibilityTabStatus = true;

    }catch (e) {
        if(e instanceof NoSuchElementError){
            logger.error(ELIGIBILITY_TAB_DOM_CHANGED);
        }/*else{
            logger.error(LOGIN_UNKNOWN_ERR);
        }*/
    }
    return eligibilityTabStatus;
}

async function fill_emirates_id_details(webdriver, driver, emiratesId){

    let emiratesIdStatus = false;

    try{
        // find text box that will take national ID
        const emirates_id = await driver.findElement(
            webdriver.By.id("txtIDTypeValue")
        );
        await emirates_id.sendKeys(emiratesId);

        // run pure javascript to select option from select 
        // 2 is out-patient
        driver.executeScript("document.getElementById('ctl00_ContentPlaceHolderBody_cmbType').value = 2");

        // submit the form
        const submit_button = await driver.findElement(
            webdriver.By.id("btnCheckEligibilityorSearchbyPolicy")
        );
        await submit_button.click();

        emiratesIdStatus = true;

    }catch (e) {
        if(e instanceof NoSuchElementError){
            logger.error(EMIRATES_ID_SECTION_ERROR);
        }/*else{
            logger.error(LOGIN_UNKNOWN_ERR);
        }*/
    }
    return emiratesIdStatus;
}

async function extract_eligibility(webdriver, driver){

    // check if banner that appears when eligibity is there shows up or not
    // if not return false else true
    await driver.wait(webdriver.until.elementLocated(webdriver.By.id('lblResultMessage1')), WAIT_TIME);
    try {
        await driver.findElement(webdriver.By.id("lblResultMessage1"));

        // store in relative path aka in current directory 
        // create a new folder called screenshots and save it there
        // you will not find selenium_local_map on user's computer
        function writeScreenshot(data, name) {
            name = name || 'ss.png';
            var screenshotPath = 'C:\\selenium_local_map\\';
            fs.writeFileSync(screenshotPath + name, data, 'base64');
        };
        
        // filename should be pulse_last_run.png
        driver.takeScreenshot().then(function (data) {
            writeScreenshot(data, 'pulse_last_run.png');
        });
        return true;

    } catch (e) {
        if(e instanceof NoSuchElementError){
            logger.error(EXTRACTING_ELIGIBILITY_ERROR);
        }/*else{
            logger.error(LOGIN_UNKNOWN_ERR);
        }*/
    }
}

async function execute(){

    // To run in headless mode
    // let driver = new webdriver.Builder().forBrowser("chrome").setChromeOptions(options).build();
    let driver = new webdriver.Builder().forBrowser("chrome").build();

    // non headless mode - for seeing visually what's happening with automation
    // let driver = new webdriver.Builder().forBrowser("chrome").build();

    try{
        
        const loginStatusResult = await login(webdriver, driver, "insurance_dmmckd", "Aster@2024");

        if(loginStatusResult == false){
            throw "";
        }

        const eligibilityStatusResult = await navigate_to_eligibility_page(webdriver, driver);

        if(eligibilityStatusResult == false){
            throw "";
        }

        const eligibilityTabResult = await click_on_eligbility_tab(webdriver, driver);

        if(eligibilityTabResult == false){
            throw "";
        }

        const emiratesIdStatusResult = await fill_emirates_id_details(webdriver, driver, "784-1994-1609796-4");

        if(emiratesIdStatusResult == false){
            throw "";
        }

        return await extract_eligibility(webdriver, driver);

    }catch (e) {
        if(e instanceof NoSuchElementError){
            logger.error(EXECUTION_ERROR);
        }/*else{
            logger.error(LOGIN_UNKNOWN_ERR);
        }*/
    } finally {
        await driver.quit();
    }

}


// execute the sequential function
(async () => {
    var status = await execute();
    if (status == true) {
        console.log("is eligible");
    }
    else {
        console.log("isn't eligible")
    }
})()