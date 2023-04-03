const { DAMAN_URL, WAIT_TIME, LOGIN_DOM_CHANGED, ELIGIBILITY_PAGE_DOM_CHANGED, EMIRATES_ID_SECTION_ERROR, EXTRACTING_ELIGIBILITY_ERROR, EXECUTION_ERROR, LOGIN_UNKNOWN_ERR, LOG_OUT_ERROR} = require('./constants.js');
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
    
    try {
        // go to webpage
        await driver.get(DAMAN_URL);

        //click on the sign-in button
        const signInButton = await driver.findElement(webdriver.By.xpath('//*[@id="navbar"]/div/div/div/ul[2]/li[1]/a'));
        await signInButton.click();
    
        // find username and password elements
        const usernameField = await driver.findElement(
            webdriver.By.id("j_username")
        );
        const passwordField = await driver.findElement(
            webdriver.By.id("j_password")
        );

        // set the password and username
        await usernameField.sendKeys(username);
        await passwordField.sendKeys(password);

        // find the login button and click it.
        const loginButton = await driver.findElement(webdriver.By.xpath('//*[@id="form-sign-in"]/div/div/div[5]/div/button'));
        await loginButton.click();
        
        loginStatus = true;

    } catch (e) {
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

    try {
        // if login was successful then DOM will have an element with class name "inside-content-boxes"
        await driver.wait(webdriver.until.elementLocated(webdriver.By.className('inside-content-boxes')), WAIT_TIME);
    
        //select the emirates ID radio button
        const radioButton = await driver.findElement(webdriver.By.xpath('//*[@id="mv_form"]/div/div[1]/section/div/div[2]/label/input'));
        await radioButton.click();

        eligibilityStatus = true;
    
    } catch (e) {
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

    try {
        //code to slice the emirates ID and enter in the respective fields
        const birth_year = emiratesId.substring(4, 8);
        const random_seven_digit = emiratesId.substring(9, 16);
        const check_digit = emiratesId.substring(17);

        const birth_year_section = await driver.findElement(
            webdriver.By.id("eid2")
        );
        await birth_year_section.sendKeys(birth_year);
        
        const random_seven_digit_section = await driver.findElement(
            webdriver.By.id("eid3")
        );
        await random_seven_digit_section.sendKeys(random_seven_digit);
        
        const check_digit_section = await driver.findElement(
            webdriver.By.id("eid4")
        );
        await check_digit_section.sendKeys(check_digit);

        // submit the form
        const submit_button = await driver.findElement(
            webdriver.By.id("mv_search")
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

async function logout(driver){
    try{
        //click on the signout button and exit
        await driver.executeScript("document.querySelector(\"a[href='redirectToLogout.action']\").click()");

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
    await driver.wait(webdriver.until.elementLocated(webdriver.By.className('cardcontent')),WAIT_TIME);
    try {
        await driver.findElement(webdriver.By.className("cardcontent"));

        // store in relative path aka in current directory 
        // create a new folder called screenshots and save it there
        // you will not find selenium_local_map on user's computer
        function writeScreenshot(data, name) {
            name = name || 'ss.png';
            var screenshotPath = 'C:\\selenium_local_map\\';
            fs.writeFileSync(screenshotPath + name, data, 'base64');
        };
        
        // filename should be daman_last_run.png
        driver.takeScreenshot().then(function (data) {
            writeScreenshot(data, 'daman_last_run.png');
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

    try {
   
        const loginStatusResult =  await login(webdriver, driver, "ASTERAWEER", "Aster@123");

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
    