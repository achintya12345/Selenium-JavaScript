const { NAS_URL, WAIT_TIME, LOGIN_DOM_CHANGED, ELIGIBILITY_PAGE_DOM_CHANGED, EMIRATES_ID_SECTION_ERROR, EXTRACTING_ELIGIBILITY_ERROR, EXECUTION_ERROR, LOGIN_UNKNOWN_ERR, LOG_OUT_ERROR} = require('./constants.js');
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
        await driver.get(NAS_URL);

        // find username and password elements
        const usernameField = await driver.findElement(
            webdriver.By.id("txtEmail")
        );
        
        const passwordField = await driver.findElement(
            webdriver.By.id("txtPassword")
        );

        // set the password and username 
        await usernameField.sendKeys(username);
        await passwordField.sendKeys(password);
        
        //click on the login button
        await driver.executeScript("document.getElementById('btnSignIn');");
        const login_button = await driver.findElement(webdriver.By.id("btnSignIn"));
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


async function navigate_to_eligibility_page(webdriver, driver) {

    let eligibilityStatus = false;

    try{
        await driver.sleep(4000);

        //close the anouncement popup
        await driver.wait(webdriver.until.elementLocated(webdriver.By.id('ucShowAnnoucement')), WAIT_TIME);
        await driver.executeScript("document.querySelector(\"button[id='ucShowAnnoucement']\").click()");
        await driver.sleep(2000);

        //click the eligibility check option
        await driver.wait(webdriver.until.elementLocated(webdriver.By.id('aEligibility')), WAIT_TIME);
        await driver.executeScript("document.querySelector(\"a[id='aEligibility']\").click()");

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

async function fill_emirates_id_details(webdriver, driver, emiratesId, phoneNumber) {

    let emiratesIdStatus = false;

    try{
        //enter emirates ID 
        const emirates_id = await driver.findElement(
            webdriver.By.id("EligbilityAddNationalID")
        );
    
        await emirates_id.sendKeys(emiratesId);
        
        //select out-patient from select dropdown
        driver.executeScript("document.getElementById('ddlTreatmentbasis').value = 2");

        //enter phone number 
        const phone_number = await driver.findElement(
            webdriver.By.id("txtAddBenefPhone")
        );

        await phone_number.sendKeys(phoneNumber);

        //click on the submit button
        const submit_button = await driver.findElement(webdriver.By.id("btnSubmitNewEligibility"));
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
        //click on the logout button and exit 
        await driver.executeScript("document.querySelector(\"a[href='javascript:__doPostBack('ctl00$acLogOut','')']\").click()");

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
        await driver.sleep(5000);

        // check if banner that appears when eligibity is there shows up or not
        // if not return false else true
        await driver.wait(webdriver.until.elementLocated(webdriver.By.id('cphBody_rptResponseFile_imgEligibliity_0')),WAIT_TIME);
        await driver.wait(webdriver.until.elementLocated(webdriver.By.id('cphBody_rptResponseFile_dvResult_0')),WAIT_TIME);

        // store in relative path aka in current directory 
        // create a new folder called screenshots and save it there
        // you will not find selenium_local_map on user's computer
        function writeScreenshot(data, name) {
            name = name || 'ss.png';
            var screenshotPath = 'C:\\selenium_local_map\\';
            fs.writeFileSync(screenshotPath + name, data, 'base64');
        };
        
        // filename should be NAS_last_run.png
        driver.takeScreenshot().then(function (data) {
            writeScreenshot(data, 'NAS_last_run.png');
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

        const loginStatusResult =  await login(webdriver, driver, "aster.alnahda", "Aster@123");

        if(loginStatusResult == false){
            throw "";
        }

        const eligibilityStatusResult =  await navigate_to_eligibility_page(webdriver, driver);

        if(eligibilityStatusResult == false){
            throw "";
        }

        const emiratesIdStatusResult =  await fill_emirates_id_details(webdriver, driver, "784-1968-0254096-1", "050 123 4569");

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