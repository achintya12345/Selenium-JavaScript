const {SUKOON_URL, WAIT_TIME, LOGIN_DOM_CHANGED, EMIRATES_ID_SECTION_ERROR, REQUEST_CONFIRM, FIRST_LINK_ERROR, EXTRACTING_ELIGIBILITY_ERROR, EXECUTION_ERROR, LOGIN_UNKNOWN_ERR, LOG_OUT_ERROR} = require('./constants.js');
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


async function login(webdriver, driver, license, username, password) {

    let loginStatus = false;

    try{
        // go to webpage
        await driver.get(SUKOON_URL);

        // find License, username and password elements
        const licenseField = await driver.findElement(
            webdriver.By.id("License")
        );

        const usernameField = await driver.findElement(
            webdriver.By.id("Username")
        );

        const passwordField = await driver.findElement(
            webdriver.By.id("Password")
        );

        // set the license, username and password 
        await licenseField.sendKeys(license);
        await usernameField.sendKeys(username);
        await passwordField.sendKeys(password);

        // find the login button and click it.
        await driver.executeScript("document.getElementById('Button1');");
        const login_button = await driver.findElement(webdriver.By.id("Button1"));
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


async function fill_emirates_id_details(webdriver, driver, emiratesId){

    let emiratesIdStatus = false;

    try{
        // if login was successful then DOM will have an element with ID "mainDiv"
        await driver.wait(webdriver.until.elementLocated(webdriver.By.id('mainDiv')), WAIT_TIME);

        //select the members ID input field
        const members_id = await driver.findElement(
            webdriver.By.id("autoc_Member")
        );

        //enter the members ID or emirates ID in this case 
        await members_id.sendKeys(emiratesId);

        //click on the work related checkBox
        driver.findElement(webdriver.By.id("WorkRelated")).click();

        //from select element, select the option of 'Unknown Status, Without A Card'
        var selectElement = driver.findElement(webdriver.By.id('ddl_EmiratesId'));
        selectElement.click();
        selectElement.sendKeys('Unknown Status, Without A Card');
        selectElement.click();

        //click on the submit button
        const submit_button = await driver.findElement(
            webdriver.By.id("RequestAuthorization")
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


async function request_confirmation(webdriver, driver){

    let confirmationRequestStatus = false;

    try{
        //Find the submit button to confirm the request
        const requestConfirmationbutton = await driver.findElement(
            webdriver.By.id("requestConfirmed")
        );
        await requestConfirmationbutton.click();

        confirmationRequestStatus = true;
    }catch (e) {
        if(e instanceof NoSuchElementError){
            logger.error(REQUEST_CONFIRM);
        }/*else{
            logger.error(LOGIN_UNKNOWN_ERR);
        }*/
    }
    return confirmationRequestStatus;
}

async function click_on_first_link(webdriver, driver){

    let firstLinkStatus = false;

    try{
        //wait for the new link to generate
        await driver.sleep(WAIT_TIME);

        //find the first link and click on it
        const firstRowFourthElement = await driver.findElement(webdriver.By.xpath('//table/tbody/tr[1]/td[5]/a[1]'));
        await firstRowFourthElement.click();

        firstLinkStatus = true;
    }catch (e) {
        if(e instanceof NoSuchElementError){
            logger.error(FIRST_LINK_ERROR);
        }/*else{
            logger.error(LOGIN_UNKNOWN_ERR);
        }*/
    }
    return firstLinkStatus;
}

async function logout(driver){
    try{
        //click on the signout button and exit
        await driver.executeScript("document.querySelector(\"a[id='HeadLoginStatus']\").click()");

    } catch (e) {
        if(e instanceof NoSuchElementError){
            logger.error(LOG_OUT_ERROR);
        }/*else{
            logger.error(LOGIN_UNKNOWN_ERR);
        }*/
    }
}

async function extract_eligibility(webdriver, driver) {

    // check if banner that appears when eligibity is there shows up or not
    // if not return false else true
    await driver.wait(webdriver.until.elementLocated(webdriver.By.id('transactionActions')), WAIT_TIME);
    try {
        await driver.findElement(webdriver.By.id("transactionActions"));

        // store in relative path aka in current directory 
        // create a new folder called screenshots and save it there
        // you will not find selenium_local_map on user's computer
        function writeScreenshot(data, name) {
            name = name || 'ss.png';
            var screenshotPath = 'C:\\selenium_local_map\\';
            fs.writeFileSync(screenshotPath + name, data, 'base64');
        };
        
        // filename should be sukoon_last_run.png
        driver.takeScreenshot().then(function (data) {
            writeScreenshot(data, 'sukoon_last_run.png');
        });

        await logout(driver); 

        return true;

    } catch (e) {
        if(e instanceof NoSuchElementError){
            logger.error(EXTRACTING_ELIGIBILITY_ERROR);
            //await logout(driver);
        }/*else{
            logger.error(LOGIN_UNKNOWN_ERR);
        }*/
    } 
    await logout(driver);
}

async function execute() {

    // To run in headless mode
    // let driver = new webdriver.Builder().forBrowser("chrome").setChromeOptions(options).build();
    let driver = new webdriver.Builder().forBrowser("chrome").build();
  
    // non headless mode - for seeing visually what's happening with automation
    // let driver = new webdriver.Builder().forBrowser("chrome").build();

    try{

        const loginStatusResult =  await login(webdriver, driver, "DHA-F-7867194", "dubailandaster", "Aster@123");

        if(loginStatusResult == false){
            throw "";
        }

        const emiratesIdStatusResult =  await fill_emirates_id_details(webdriver, driver, "784-1999-1217815-1");

        if(emiratesIdStatusResult == false){
            throw "";
        }

        const confirmationRequestStatusResult = await request_confirmation(webdriver, driver);

        if(confirmationRequestStatusResult == false){
            throw "";
        }

        const firstLinkStatusResult = await click_on_first_link(webdriver, driver);

        if(firstLinkStatusResult == false){
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
    