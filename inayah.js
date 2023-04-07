const { INAYAH_URL, WAIT_TIME, LOGIN_DOM_CHANGED, ELIGIBILITY_PAGE_DOM_CHANGED, EMIRATES_ID_SECTION_ERROR, EXTRACTING_ELIGIBILITY_ERROR, EXECUTION_ERROR, LOGIN_UNKNOWN_ERR, LOG_OUT_ERROR} = require('./constants.js');
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
        await driver.get(INAYAH_URL);

        // find username and password elements
        const usernameField = await driver.findElement(
            webdriver.By.id("txtusername")
        );
        const passwordField = await driver.findElement(
            webdriver.By.id("txtpassword")
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

async function navigate_to_eligibility_page(webdriver, driver){

    let eligibilityStatus = false;

    try{
        // if login was successful then DOM will have an element with id name "ContentPlaceHolder1_IMG1"
        await driver.wait(webdriver.until.elementLocated(webdriver.By.id('ContentPlaceHolder1_IMG1')), WAIT_TIME);

        //select the member eligibility button
        const eligibilityButton = await driver.findElement(webdriver.By.xpath('//*[@id="ASPxMenu2_DXI1_T"]'));
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

async function fill_emirates_id_details(webdriver, driver, emiratesId, phoneNumber){

    let emiratesIdStatus = false;

    try{

        //finding the emirates ID and phone number field
        const emiratesIdField = await driver.findElement(
            webdriver.By.id("ContentPlaceHolder1_TextBox1")
        );
        const phoneNumberField = await driver.findElement(
            webdriver.By.id("ContentPlaceHolder1_txtmobno")
        );

        // set the password and username
        await emiratesIdField.sendKeys(emiratesId);
        await phoneNumberField.sendKeys(phoneNumber);

        //find the search button and press it
        const search_button = await driver.findElement(
            webdriver.By.id("ContentPlaceHolder1_ASPxButton1_I")
        );
        await search_button.click();

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

async function logout(driver){
    try{
        //click on the logout button and exit
        await driver.executeScript("document.querySelector(\"li[id='ASPxMenu2_DXI7_']\").click()");

    } catch (e) {
        if(e instanceof NoSuchElementError){
            logger.error(LOG_OUT_ERROR);
        }/*else{
            logger.error(LOGIN_UNKNOWN_ERR);
        }*/
    }
}

//extract_eligibility_function

async function execute() {
 
    // To run in headless mode
    // let driver = new webdriver.Builder().forBrowser("chrome").setChromeOptions(options).build();
    let driver = new webdriver.Builder().forBrowser("chrome").build();
  
    // non headless mode - for seeing visually what's happening with automation
    // let driver = new webdriver.Builder().forBrowser("chrome").build();

    try {
   
        const loginStatusResult =  await login(webdriver, driver, );

        if(loginStatusResult == false){
            throw "";
        }
        
        const eligibilityStatusResult =  await navigate_to_eligibility_page(webdriver, driver);

        if(eligibilityStatusResult == false){
            throw "";
        }
    
        const emiratesIdStatusResult =  await fill_emirates_id_details(webdriver, driver, );

        if(emiratesIdStatusResult == false){
            throw "";
        }

        await logout(driver);
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
    
