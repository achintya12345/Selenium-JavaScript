const { AXA_URL, WAIT_TIME, LOGIN_DOM_CHANGED, EMIRATES_ID_SECTION_ERROR, EXTRACTING_ELIGIBILITY_ERROR, EXECUTION_ERROR, LOGIN_UNKNOWN_ERR, LOG_OUT_ERROR} = require('./constants.js');
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
        await driver.get(AXA_URL);

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
        

        //captcha code


        // find the login button and click it.
        const loginButton = await driver.findElement(webdriver.By.xpath('//*[@id="btnSubmit"]'));
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

async function fill_emirates_id_details(webdriver, driver, emiratesId) {

    let emiratesIdStatus = false;

    try{
        //wait for the eligibility page element to be loaded
        await driver.wait(webdriver.until.elementLocated(webdriver.By.id('ctl00_pagecontent_lblMandatory')),WAIT_TIME);

        //enter the emirates ID
        const emiratesIDField = await driver.findElement(
            webdriver.By.id("ctl00_pagecontent_txtEmiratesId")
        );

        await emiratesIDField.sendKeys(emiratesId);

        //click on the search button
        const search_button = await driver.findElement(
            webdriver.By.id("ctl00_pagecontent_btnCheckValid")
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


async function logout(webdriver, driver){
    try{
        //click on the logout button and exit
        const logOutButton = await driver.findElement(webdriver.By.xpath('//*[@id="idSignOut"]'));
        await logOutButton.click();

    } catch (e) {
        if(e instanceof NoSuchElementError){
            logger.error(LOG_OUT_ERROR);
        }/*else{
            logger.error(LOGIN_UNKNOWN_ERR);
        }*/
    }
}


async function extract_eligibility(webdriver, driver) {

    await driver.sleep(20000);

    // check if banner that appears when eligibity is there shows up or not
    // if not return false else true
    await driver.wait(webdriver.until.elementLocated(webdriver.By.id('ctl00_pagecontent_tdMsg')),WAIT_TIME);

    try{
        await driver.findElement(webdriver.By.id("ctl00_pagecontent_imgPhoto"));

        // store in relative path aka in current directory 
        // create a new folder called screenshots and save it there
        // you will not find selenium_local_map on user's computer
        function writeScreenshot(data, name) {
            name = name || 'ss.png';
            var screenshotPath = 'C:\\selenium_local_map\\';
            fs.writeFileSync(screenshotPath + name, data, 'base64');
        };
        
        // filename should be axa_last_run.png
        driver.takeScreenshot().then(function (data) {
            writeScreenshot(data, 'axa_last_run.png');
        });

        await logout(webdriver, driver);

        return true;
    }catch (e) {
        if(e instanceof NoSuchElementError){
            logger.error(EXTRACTING_ELIGIBILITY_ERROR);
            //await logout(driver);
        }/*else{
            logger.error(LOGIN_UNKNOWN_ERR);
        }*/
    }
    await logout(webdriver, driver);
}

async function execute() {

     // To run in headless mode
    // let driver = new webdriver.Builder().forBrowser("chrome").setChromeOptions(options).build();
    let driver = new webdriver.Builder().forBrowser("chrome").build();
  
    // non headless mode - for seeing visually what's happening with automation
    // let driver = new webdriver.Builder().forBrowser("chrome").build();

    try {
   
        const loginStatusResult =  await login(webdriver, driver, "ALRAFA", "Jubilee@2022");

        if(loginStatusResult == false){
            throw "";
        }
    
        const emiratesIdStatusResult =  await fill_emirates_id_details(webdriver, driver, "784-1995-3659537-6");

        if(emiratesIdStatusResult == false){
            throw "";
        }

        return await extract_eligibility(webdriver, driver);
 
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