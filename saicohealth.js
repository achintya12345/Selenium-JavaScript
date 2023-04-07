const { SAICO_URL, WAIT_TIME, LOGIN_DOM_CHANGED, ELIGIBILITY_PAGE_DOM_CHANGED, EMIRATES_ID_SECTION_ERROR, EXTRACTING_ELIGIBILITY_ERROR, EXECUTION_ERROR, LOGIN_UNKNOWN_ERR, LOG_OUT_ERROR} = require('./constants.js');
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
        await driver.get(SAICO_URL);

        //click on the login-in button
        const loginButton = await driver.findElement(webdriver.By.xpath('//*[@id="my-body"]/hiip-root/div/hiip-landing-page/div/div[1]/div[1]/div[2]/div/button'));
        await loginButton.click();

        // find username and password elements
        const usernameField = await driver.findElement(
            webdriver.By.id("Username")
        );
        const passwordField = await driver.findElement(
            webdriver.By.id("Password")
        );

        // set the password and username
        await usernameField.sendKeys(username);
        await passwordField.sendKeys(password);

        // find the login button and click it.
        const loginMainButton = await driver.findElement(webdriver.By.xpath('//*[@id="providers-page"]/div[2]/div/div/div/div/form/fieldset/div[3]/button'));
        await loginMainButton.click();

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
        await driver.sleep(3*1000);

        //select the member eligibility option
        const eligibilityButton = await driver.findElement(webdriver.By.xpath('//*[@id="my-body"]/hiip-root/div/hiip-home/mat-sidenav-container/mat-sidenav-content/hiip-home-content/hiip-dashboard/div/div/div/div/div[4]/div/a'));
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
        
        //find the emirates ID field
        const emiratesIdField = await driver.findElement(
            webdriver.By.id("mat-input-0")
        );
        
        //send the emirates ID
        await emiratesIdField.sendKeys(emiratesId);

        //click on the check eligibility button
        const checkEligibilityButton = await driver.findElement(webdriver.By.xpath('//*[@id="my-body"]/hiip-root/div/hiip-home/mat-sidenav-container/mat-sidenav-content/hiip-home-content/hiip-eligibility/div/div/div/div[2]/button'));
        await checkEligibilityButton.click();

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

async function logout(webdriver,driver){
    try{
        //click on the dropdown button 
        const dropDownButton = await driver.findElement(webdriver.By.xpath('//*[@id="my-body"]/hiip-root/div/hiip-home/hiip-header/nav/div[2]/div[3]/hiip-user-management/div/div/div/button'));
        await dropDownButton.click();

        //click on logout option
        const logOutButton = await driver.findElement(webdriver.By.xpath('//*[@id="cdk-overlay-0"]/div/div/p[3]/a'));
        await logOutButton.click();

    } catch (e) {
        if(e instanceof NoSuchElementError){
            logger.error(LOG_OUT_ERROR);
        }/*else{
            logger.error(LOGIN_UNKNOWN_ERR);
        }*/
    }
}

//async function extract_eligibility(webdriver, driver)

async function execute() {
 
    // To run in headless mode
    // let driver = new webdriver.Builder().forBrowser("chrome").setChromeOptions(options).build();
    let driver = new webdriver.Builder().forBrowser("chrome").build();
  
    // non headless mode - for seeing visually what's happening with automation
    // let driver = new webdriver.Builder().forBrowser("chrome").build();

    try {
   
        const loginStatusResult =  await login(webdriver, driver, "ALWARQA", "Aster@123");

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