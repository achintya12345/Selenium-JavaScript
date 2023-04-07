const { ECARE_URL, WAIT_TIME, LOGIN_DOM_CHANGED, ELIGIBILITY_PAGE_DOM_CHANGED, EMIRATES_ID_SECTION_ERROR, EXTRACTING_ELIGIBILITY_ERROR, EXECUTION_ERROR, LOGIN_UNKNOWN_ERR, LOG_OUT_ERROR} = require('./constants.js');
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


async function login(webdriver, driver, username, password) {

    let loginStatus = false;

    try{
        // go to webpage
        await driver.get(ECARE_URL);

        // find username and password elements
        const usernameField = await driver.findElement(
            webdriver.By.id("txtName")
        );
        const passwordField = await driver.findElement(
            webdriver.By.id("txtPassword")
        );

        // set the password and username
        await usernameField.sendKeys(username);
        await passwordField.sendKeys(password);

        // find the login button and click it.
        const loginButton = await driver.findElement(webdriver.By.xpath('//*[@id="btnLogin"]'));
        await loginButton.click();

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

async function navigate_to_eligibility_page(webdriver, driver) {

    let eligibilityStatus = false;

    try{
        // if login was successful then DOM will have an element with id "ctl00_MenuHolder_hiHead"
        await driver.wait(webdriver.until.elementLocated(webdriver.By.id('ctl00_MenuHolder_hiHead')), WAIT_TIME);

        //select the Eligibility check button
        const eligibilityButton = await driver.findElement(webdriver.By.xpath('//*[@id="ctl00_SideBarMenu"]/ul/li/ul/li[1]/a'));
        await eligibilityButton.click();

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

async function fill_emirates_id_details(webdriver, driver, emiratesId) {

    let emiratesIdStatus = false;

    try{
        await driver.sleep(3*1000);

        //select emirates ID radio button
        await driver.executeScript(`const inputElement = document.querySelector('input[value="Emirates ID"]'); inputElement.click();`);

        //find the emirates ID field and enter the value
        const emiratesIdField = await driver.findElement(
            webdriver.By.id("ctl00_ContentPlaceHolder1_ubnosrchdiv_txtUcxidno")
        );

        await emiratesIdField.sendKeys(emiratesId);

        //click the search button
        const searchButton = await driver.findElement(webdriver.By.xpath('//*[@id="ctl00_ContentPlaceHolder1_ubnosrchdiv_btnsearch"]'));
        await searchButton.click();

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

async function logout(webdriver, driver){
    try{
        //click on the dropDown button
        const dropDownButton = await driver.findElement(webdriver.By.xpath('//*[@id="ctl00_logindet"]/ul/li/a"]'));
        await dropDownButton.click();

        //click on the logout button and exit
        const logOutButton = await driver.findElement(webdriver.By.xpath('//*[@id="ctl00_logindet"]/ul/li/ul/li/div/div[5]/a'));
        await logOutButton.click();

    } catch (e) {
        if(e instanceof NoSuchElementError){
            logger.error(LOG_OUT_ERROR);
        }/*else{
            logger.error(LOGIN_UNKNOWN_ERR);
        }*/
    }
}

// extract_eligibility

async function execute() {
 
    // To run in headless mode
    // let driver = new webdriver.Builder().forBrowser("chrome").setChromeOptions(options).build();
    let driver = new webdriver.Builder().forBrowser("chrome").build();
  
    // non headless mode - for seeing visually what's happening with automation
    // let driver = new webdriver.Builder().forBrowser("chrome").build();

    try {
   
        const loginStatusResult =  await login(webdriver, driver, "ASTERALNAHDA 1", "ASTERALNAHDA1239");

        if(loginStatusResult == false){
            throw "";
        }
        
        const eligibilityStatusResult =  await navigate_to_eligibility_page(webdriver, driver);

        if(eligibilityStatusResult == false){
            throw "";
        }
    
        const emiratesIdStatusResult =  await fill_emirates_id_details(webdriver, driver, "784-1984-1437575-2");

        if(emiratesIdStatusResult == false){
            throw "";
        }

        await logout(webdriver, driver);
        //return await extract_eligibility(webdriver, driver);
 
    } catch (e) {
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
    var status = await execute()
    if (status == true) {
        console.log("is eligible");
    }
    else {
        console.log("isn't eligible")
    }
})()