const { ADNIC_URL, WAIT_TIME, LOGIN_DOM_CHANGED, ELIGIBILITY_PAGE_DOM_CHANGED, EMIRATES_ID_SECTION_ERROR, EXTRACTING_ELIGIBILITY_ERROR, EXECUTION_ERROR, LOGIN_UNKNOWN_ERR, LOG_OUT_ERROR } = require('./constants.js');
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

const driver = new webdriver.Builder().forBrowser('chrome').setChromeOptions(options).build();



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
    console.log("Inside the login function");
    let loginStatus = false;

    try {
        // go to webpage
        await driver.get(ADNIC_URL);

        await driver.sleep(3000);

        // find username and password elements
        const usernameField = await driver.findElement(
            webdriver.By.id("userIdEcommerce")
        );
        const passwordField = await driver.findElement(
            webdriver.By.id("pwdEcommerce")
        );

        // set the password and username
        await usernameField.sendKeys(username);
        await passwordField.sendKeys(password);
        console.log("After sending the keys in login page");
        // find the login button and click it.
        const loginButton = await driver.findElement(webdriver.By.xpath('//*[@id="HomeLogIn"]/form/a'));
        await loginButton.click();
        console.log("After clicking the login button");
        loginStatus = true;
    } catch (e) {
        if (e instanceof NoSuchElementError) {
            logger.error(LOGIN_DOM_CHANGED);

        }/*else{
                logger.error(LOGIN_UNKNOWN_ERR);
            }*/
    }
    return loginStatus;
}

async function navigate_to_eligibility_page(webdriver, driver) {

    let eligibilityStatus = false;
    console.log("inside navigate to eligibility function");

    try {
        console.log("Inside navigate to eligibilit try block");
        await driver.sleep(5000);
        // if login was successful then DOM will have an element with id "top"
        await driver.wait(webdriver.until.elementLocated(webdriver.By.id('top')), WAIT_TIME);
        console.log("After finding element and selecting eligibility option");

        await driver.sleep(5000);
        
        //select the  Online Eligibility option
        /*
        const eligibilityButton = await driver.findElement(webdriver.By.xpath('//*[@id="mOnlineEligiblity"]/a'));
        await eligibilityButton.click();
        */
        
        await driver.executeScript("document.querySelector(\"a[href='onlineElig.html']\").click()");
        

        console.log("After clicking the option");
        eligibilityStatus = true;

    } catch (e) {
        if (e instanceof NoSuchElementError) {
            logger.error(ELIGIBILITY_PAGE_DOM_CHANGED);
        }/*else{
                logger.error(LOGIN_UNKNOWN_ERR);
            }*/
    }
    return eligibilityStatus;
}

async function fill_emirates_id_details(webdriver, driver, emiratesId) {
    console.log("inside the emirates ID page");
    let emiratesIdStatus = false;
    console.log(emiratesId);
    try {
        console.log("Inside the try block");
        console.log(emiratesId);
        await driver.wait(webdriver.until.elementLocated(webdriver.By.id('txtEmiratesId')), WAIT_TIME);
        console.log("after waiting....");
        //find the emirates ID section and enter the ID
        const emiratesIdField = await driver.findElement(
            webdriver.By.id("txtEmiratesId")
        );
        await emiratesIdField.sendKeys(emiratesId);

        console.log("after sending the emirates ID");

        //click on the search button
        const searchButton = await driver.findElement(webdriver.By.xpath('//*[@id="btnSearch"]'));
        await searchButton.click();

        emiratesIdStatus = true;
    } catch (e) {
        if (e instanceof NoSuchElementError) {
            logger.error(EMIRATES_ID_SECTION_ERROR);
        }/*else{
                logger.error(LOGIN_UNKNOWN_ERR);
            }*/
    }
    return emiratesIdStatus;
}

async function logout(driver) {
    return;
    try {
        //click on the logout button
        await driver.executeScript("document.querySelector(\"a[id='userLogOutLink']\").click()");

        //click on the ok buttion to confirm
        await driver.executeScript("document.querySelector(\"button[id='alertify-ok']\").click()");

    } catch (e) {
        if (e instanceof NoSuchElementError) {
            logger.error(LOG_OUT_ERROR);
        }/*else{
                logger.error(LOGIN_UNKNOWN_ERR);
            }*/
    }
}

async function extract_eligibility(webdriver, driver) {
    // check if banner that appears when eligibity is there shows up or not
    // if not return false else true
    await driver.wait(webdriver.until.elementLocated(webdriver.By.className('divMemberDetail')), WAIT_TIME);
    try {
        await driver.findElement(webdriver.By.className("divMemberDetail"));

        // store in relative path aka in current directory 
        // create a new folder called screenshots and save it there
        // you will not find selenium_local_map on user's computer
        function writeScreenshot(data, name) {
            name = name || 'ss.png';
            var screenshotPath = 'C:\\selenium_local_map\\';
            fs.writeFileSync(screenshotPath + name, data, 'base64');
        };

        // filename should be adnic_last_run.png
        driver.takeScreenshot().then(function (data) {
            writeScreenshot(data, 'adnic_last_run.png');
        });

        await logout(driver);

        return true;
    } catch (e) {
        if (e instanceof NoSuchElementError) {
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

        const loginStatusResult = await login(webdriver, driver, "INSURANCE.JEBELALI@ASTERMEDICALCENTRE.COM", "Aster@1234");

        if (loginStatusResult == false) {
            throw "";
        }

        const eligibilityStatusResult = await navigate_to_eligibility_page(webdriver, driver);

        if (eligibilityStatusResult == false) {
            throw "";
        }

        const emiratesIdStatusResult = await fill_emirates_id_details(webdriver, driver, "784-1985-5951693-9");

        if (emiratesIdStatusResult == false) {
            throw "";
        }

        return await extract_eligibility(webdriver, driver);

    } catch (e) {
        if (e instanceof NoSuchElementError) {
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



