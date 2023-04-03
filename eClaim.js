const {ECLAIM_URL, ECLAIM_ELIGIBILITY_PAGE_URL, WAIT_TIME, LOGIN_DOM_CHANGED, POP_UP_DOM_CHANGED, NAVIGATE_TO_ELIGIBILITY_ERROR, EMIRATES_ID_SECTION_ERROR, EXTRACTING_ELIGIBILITY_ERROR, EXECUTION_ERROR, LOGIN_UNKNOWN_ERR, LOG_OUT_ERROR} = require('./constants.js');
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
        await driver.get(ECLAIM_URL);

        // find username and password elements
        const usernameField = await driver.findElement(
            webdriver.By.id("ContentPlaceHolder1_LoginWithCaptcha1_loginBox_Login1_UserName")
        );
        const passwordField = await driver.findElement(
            webdriver.By.id("ContentPlaceHolder1_LoginWithCaptcha1_loginBox_Login1_Password")
        );
        
        // set the password and username
        await usernameField.sendKeys(username);
        await passwordField.sendKeys(password);

        // find the login button and click it, wait for 10 seconds.
        const login_button = await driver.findElement(webdriver.By.id("ContentPlaceHolder1_LoginWithCaptcha1_loginBox_Login1_LoginButton"));
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


async function close_the_pop_up(webdriver, driver){

    let closeThePopUpStatus = false;

    try{
        // if login was successful then DOM will show an pop-up
        await driver.wait(webdriver.until.elementLocated(webdriver.By.id('breadcrumbs_Panel4')), WAIT_TIME);

        // close the pop-up by clicking update later button
        await driver.executeScript("document.querySelector(\"input[id='breadcrumbs_Button1']\").click()");

        closeThePopUpStatus = true;

    }catch (e) {
        if(e instanceof NoSuchElementError){
            logger.error(POP_UP_DOM_CHANGED);
        
        }/*else{
            logger.error(LOGIN_UNKNOWN_ERR);
        }*/
    }
    return closeThePopUpStatus;
}


async function navigate_to_eligibility_page(webdriver, driver){

    let eligibilityStatus = false;

    try{
        // navigate to a eligibility page
        await driver.get(ECLAIM_ELIGIBILITY_PAGE_URL);

        eligibilityStatus = true;

    }catch (e) {
        if(e instanceof NoSuchElementError){
            logger.error(NAVIGATE_TO_ELIGIBILITY_ERROR);
        
        }/*else{
            logger.error(LOGIN_UNKNOWN_ERR);
        }*/
    }
    return eligibilityStatus;
}


async function fill_emirates_id_details(webdriver, driver, emiratesId){

    let emiratesIdStatus = false;

    try{
        // if navigation was successful then DOM will have an element with ID main_section
        await driver.wait(webdriver.until.elementLocated(webdriver.By.id('main_section')), WAIT_TIME);

        //select emirates ID option from drop down menu
        driver.executeScript("document.getElementById('ContentPlaceHolder1_ddlTypes').value = 2");

        //find text box that will take national ID
        const emirates_id = await driver.findElement(
            webdriver.By.id("ContentPlaceHolder1_txtMemberInfoByEmirateId")
        );
        await emirates_id.sendKeys(emiratesId);

        // submit the form
        const submit_button = await driver.findElement(
            webdriver.By.id("ContentPlaceHolder1_Button1")
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
        console.log("inside log try");
        //click on the signout button and exit
        await driver.executeScript("document.querySelector(\"a[id='LoginView1_LoginStatus1']\").click()");

        await driver.executeScript("console.log('trying..')");
    } catch (e) {
        if(e instanceof NoSuchElementError){
            logger.error(LOG_OUT_ERROR);
        }/*else{
            logger.error(LOGIN_UNKNOWN_ERR);
        }*/
    }
}

async function extract_eligibility(webdriver, driver){

    // check if table that appears when eligibity is there shows up or not
    // if not return false else true

    console.log('before first search');

    await driver.wait(webdriver.until.elementLocated(webdriver.By.id('ContentPlaceHolder1_gv2')), WAIT_TIME);

    console.log('after first search');
    try{

        console.log('before try first search');
        await driver.findElement(webdriver.By.id("ContentPlaceHolder1_gv2"));
        console.log('after try first search');

        // store in relative path aka in current directory 
        // create a new folder called screenshots and save it there
        // you will not find selenium_local_map on user's computer
        function writeScreenshot(data, name) {
            name = name || 'ss.png';
            var screenshotPath = 'C:\\selenium_local_map\\';
            fs.writeFileSync(screenshotPath + name, data, 'base64');
        };
        
        // filename should be eClaim_last_run.png
        driver.takeScreenshot().then(function (data) {
            writeScreenshot(data, 'eClaim_last_run.png');
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



async function execute(){

    // To run in headless mode
    // let driver = new webdriver.Builder().forBrowser("chrome").setChromeOptions(options).build();
    let driver = new webdriver.Builder().forBrowser("chrome").build();

    // non headless mode - for seeing visually what's happening with automation
    // let driver = new webdriver.Builder().forBrowser("chrome").build();

    try{
        
        const loginStatusResult = await login(webdriver, driver, "ASTER SHAAB", "asterdmh");

        if(loginStatusResult == false){
            throw "";
        }

        const popUpStatusResult = await close_the_pop_up(webdriver, driver);

        if(popUpStatusResult == false){
            throw "";
        }

        const eligibilityStatusResult = await navigate_to_eligibility_page(webdriver, driver);

        if(eligibilityStatusResult == false){
            throw "";
        }

        const emiratesIdStatusResult = await fill_emirates_id_details(webdriver, driver, "784-1974-4218064-8");

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