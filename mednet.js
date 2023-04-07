const { MEDNET_URL, WAIT_TIME, LOGIN_DOM_CHANGED, EMIRATES_ID_SECTION_ERROR, EXTRACTING_ELIGIBILITY_ERROR, EXECUTION_ERROR, LOGIN_UNKNOWN_ERR, LOG_OUT_ERROR} = require('./constants.js');
const winston = require('winston');
const { format } = require('logform');

const webdriver = require('selenium-webdriver')
const chrome = require('selenium-webdriver/chrome')
const options = new chrome.Options().addArguments("--headless")
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
        await driver.get(MEDNET_URL);

        // find username and password elements
        const usernameField = await driver.findElement(
            webdriver.By.id("username")
        );
        
        const passwordField = await driver.findElement(
            webdriver.By.id("password")
        );
        
        // set the password and username  
        await usernameField.sendKeys(username);
        await passwordField.sendKeys(password);

        // find the login button and click it.
        await driver.executeScript("document.getElementsByName('btn_login');");
        const login_button = await driver.findElement(webdriver.By.name("btn_login"));
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

async function fill_emirates_id_details(webdriver, driver, emiratesId, phoneNumber) {

    let emiratesIdStatus = false;

    try{
        //select the emirates ID radio button
        await driver.executeScript(`const inputElement = document.querySelector('input[value="emirates_id"]'); inputElement.click();`); 

        //enter the emiratesID and phone number 
        const emirates_id = await driver.findElement(
            webdriver.By.id("card_number")
        );
        
        await emirates_id.sendKeys(emiratesId);
    
        const phone_number = await driver.findElement(
            webdriver.By.id("reg_mobile_number")
        );
        
        await phone_number.sendKeys(phoneNumber);

        //click on the ADD button
        await driver.executeScript("document.querySelector(\"input[value='Add']\").click()");

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
        const dropDownButton = await driver.findElement(webdriver.By.xpath('/html/body/header/div/div[3]/div[1]/div/div/a'));
        await dropDownButton.click();

        //click on the logout button and exit
        const logOutButton = await driver.findElement(webdriver.By.xpath('/html/body/header/div/div[3]/div[1]/div/div/div/ul/li[5]/a'));
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
    
    try{
        
        // check if banner that appears when eligibity is there shows up or not
        // if not return false else true
        await driver.wait(webdriver.until.elementLocated(webdriver.By.id('print_btn')), WAIT_TIME);
        await driver.wait(webdriver.until.elementLocated(webdriver.By.id('memberbenefitddiv')), WAIT_TIME);
        
        //find the print button
        const print_button = driver.findElement(
            webdriver.By.id("print_btn")
        );
        print_button.click();

        await driver.sleep(4000);

        function writeScreenshot(data, name) {
            name = name || 'ss.png';
            var screenshotPath = 'C:\\selenium_local_map\\';
            fs.writeFileSync(screenshotPath + name, data, 'base64');
        };
         
            driver.takeScreenshot().then(function(data) {
            writeScreenshot(data, 'out1.png');
        });

        await logout(webdriver,driver);
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

    try{
        const loginStatusResult =  await login(webdriver, driver, );

        if(loginStatusResult == false){
            throw "";
        }
    
        const emiratesIdStatusResult =  await fill_emirates_id_details(webdriver, driver, );

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
    var status = await execute()
    if (status == true) {
        console.log("is eligible");
    }
    else {
        console.log("isn't eligible")
    }
})()
