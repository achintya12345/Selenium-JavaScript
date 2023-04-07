const { ALBUHAIRA_URL, WAIT_TIME, LOGIN_DOM_CHANGED, MEMBER_DOM_CHANGED, EMIRATES_ID_SECTION_ERROR, EXTRACTING_ELIGIBILITY_ERROR, EXECUTION_ERROR, LOGIN_UNKNOWN_ERR, LOG_OUT_ERROR} = require('./constants.js');
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
        await driver.get(ALBUHAIRA_URL);

        //click on the login-in button
        const loginInButton = await driver.findElement(webdriver.By.xpath('/html/body/header/nav/div/div[2]/ul/li[3]/a'));
        await loginInButton.click();

        /*
        const usernameField = await driver.findElement(
            webdriver.By.xpath("//*[@id='user-name']")  
        );
        
        const passwordField = await driver.findElement(
            webdriver.By.xpath("//*[@id='user-pass']")
        );
        */

        await driver.executeScript("document.querySelector(\"input[id='user-name']\").value = '830892455'");
        await driver.executeScript("document.querySelector(\"input[id='user-pass']\").value = 'TIfFbBQSzdaajIQRHwJo'");

        
        /*
        await usernameField.sendKeys(username);
        await passwordField.sendKeys(password);
        */
        

        // find the login button and click it.
        await driver.executeScript("document.getElementById('login_btn').click();");

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

async function click_member_option(webdriver, driver){

    let memberStatus = false;

    try{
        //wait for the member option to appear
        await driver.wait(webdriver.until.elementLocated(webdriver.By.id('Label1')), WAIT_TIME);

        //click on the member option
        await driver.executeScript("document.querySelector(\"a[href='MemberInformationSearch.aspx']\").click()");

        memberStatus = true;
    }catch (e) {
        if(e instanceof NoSuchElementError){
            logger.error(MEMBER_DOM_CHANGED);
        
        }/*else{
            logger.error(LOGIN_UNKNOWN_ERR);
        }*/
    }
    return memberStatus; 
}


async function fill_emirates_id_details(webdriver, driver, emiratesId){
    
    let emiratesIdStatus = false;

    try{
        //find the emirates ID field and enter the emirates ID
        const emiratesField = await driver.findElement(
            webdriver.By.id("TextBox1")
        );
        
        await emiratesField.sendKeys(emiratesId);
        
        //click on the search button
        await driver.executeScript("document.getElementById('Button1').click();");

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

        await driver.wait(webdriver.until.elementLocated(webdriver.By.css("a[href='Default.aspx']")), WAIT_TIME);
        //click on the logout button and exit
        await driver.executeScript("document.querySelector(\"a[href='Default.aspx']\").click()");
    
    } catch (e) {
        if(e instanceof NoSuchElementError){
            logger.error(LOG_OUT_ERROR);
        }/*else{
            logger.error(LOGIN_UNKNOWN_ERR);
        }*/
    }
}

async function extract_eligibility(webdriver, driver){

    try{

        //wait for the result to load
        driver.sleep(1*5000);

        //find the network field which will give us the result
        const networkField = driver.findElement(webdriver.By.id("txtnetwork"));
        console.log("Found the network field");
        const value = networkField.getAttribute('value');
        console.log("Got the network field");
        if (value === null || value === '') {
            // The input field is empty
            console.log("Inside the empty field if block");
            await logout(driver);
            console.log("after the empty field if block logout");
            return false;
        }else{
            console.log("Inside the filled field else block");
            // The input field is filled
            function writeScreenshot(data, name) {
                name = name || 'ss.png';
                var screenshotPath = 'C:\\selenium_local_map\\';
                fs.writeFileSync(screenshotPath + name, data, 'base64');
            };
            
            // filename should be albuhaira_last_run.png
            driver.takeScreenshot().then(function (data) {
                writeScreenshot(data, 'albuhaira_last_run.png');
            });
    
            await logout(driver);
            console.log("after the filled field else block logout");
            return true;
        }
    }catch (e) {
        if(e instanceof NoSuchElementError){
            logger.error(EXTRACTING_ELIGIBILITY_ERROR);
            //await logout(driver);
        }/*else{
            logger.error(LOGIN_UNKNOWN_ERR);
        }*/
    }
}


async function execute() {
    // To run in headless mode
    // let driver = new webdriver.Builder().forBrowser("chrome").setChromeOptions(options).build();
    let driver = new webdriver.Builder().forBrowser("chrome").build();
  
    // non headless mode - for seeing visually what's happening with automation
    // let driver = new webdriver.Builder().forBrowser("chrome").build();

    try{
        await driver.sleep(3*1000);
        
        const loginStatusResult =  await login(webdriver, driver,);

        if(loginStatusResult == false){
            throw "";
        }

        const clickMemberStatusResult = await click_member_option(webdriver, driver);

        if(clickMemberStatusResult == false){
            throw "";
        }

        const emiratesIdStatusResult =  await fill_emirates_id_details(webdriver, driver, /*emiratesId*/);

        if(emiratesIdStatusResult == false){
            throw "";
        }

        return await extract_eligibility(webdriver, driver);
    }catch (e) {
        if(e instanceof NoSuchElementError){
            logger.error(EXECUTION_ERROR);
        }else{
            logger.error(LOGIN_UNKNOWN_ERR);
        }
    } /*finally {
        await driver.quit();
    }*/

};

// execute the sequential function
(async () => {
    var status = await execute();
    console.log("After getting the value from execute");
    if (status == true) {
        console.log("is eligible");
    }
    else {
        console.log("isn't eligible")
    }
})()




