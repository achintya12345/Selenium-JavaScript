const webdriver = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const options = new chrome.Options().addArguments("--headless");
const chromedriver = require('chromedriver');
var fs = require('fs');
//chrome.setDefaultService(new chrome.ServiceBuilder(chromedriver.path).build());


async function login(webdriver, driver, username, password){
    
    try{
        // go to webpage
        await driver.get("https://pulse-uae.tatsh.com/Login2.aspx?token=AQ==");

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
        
        // find the login button and click it, wait for 10 seconds.
        await driver.executeScript("document.getElementById('btnLogin').scrollIntoView();");
        await driver.sleep(1 * 10000);
        const login_button = await driver.findElement(webdriver.By.id("btnLogin"));
        await driver.wait(login_button.click(), 10000);

    }catch(NoSuchElementError){

    }
    
}


async function navigate_to_eligibility_page(webdriver, driver){

    try{
        // if login was successful then DOM will have an element with side-menu
        await driver.wait(webdriver.until.elementLocated(webdriver.By.id('side-menu')), 10000);

        // navigate to a eligibility page
        await driver.get("https://pulse-uae.tatsh.com/EligibilityChecking2.aspx");

    }catch(NoSuchElementError){

    }
   
}

async function click_on_eligbility_tab(webdriver, driver){

    try{
        // find tab and switch to it
        activate_tab = driver.findElement(webdriver.By.xpath("//label[@href= '#tab-3']"));
        await activate_tab.click();

    }catch(NoSuchElementError){

    }
    
}

async function fill_emirates_id_details(webdriver, driver, emiratesId){

    try{
        // find text box that will take national ID
        const emirates_id = await driver.findElement(
            webdriver.By.id("txtIDTypeValue")
        );
        await emirates_id.sendKeys(emiratesId);

        // run pure javascript to select option from select 
        // 2 is out-patient
        driver.executeScript("document.getElementById('ctl00_ContentPlaceHolderBody_cmbType').value = 2");

        // submit the form
        const submit_button = await driver.findElement(
            webdriver.By.id("btnCheckEligibilityorSearchbyPolicy")
        );
        await submit_button.click();

    }catch(NoSuchElementError){

    }
    
}

async function extract_eligibility(webdriver, driver){

    // check if banner that appears when eligibity is there shows up or not
    // if not return false else true
    await driver.wait(webdriver.until.elementLocated(webdriver.By.id('lblResultMessage1')), 10000);
    try {
        await driver.findElement(
            webdriver.By.id("lblResultMessage1")
        );

        //function to take screenshot of the details and store it in folder locally
        function writeScreenshot(data, name) {
            name = name || 'ss.png';
            var screenshotPath = 'C:\\selenium_local_map\\';
            fs.writeFileSync(screenshotPath + name, data, 'base64');
        };
          
            driver.takeScreenshot().then(function(data) {
            writeScreenshot(data, 'out1.png');
        });
        return true;
    } catch (NoSuchElementError) {
        return false;
    }

}

async function execute(){

    // To run in headless mode
    // let driver = new webdriver.Builder().forBrowser("chrome").setChromeOptions(options).build();
    let driver = new webdriver.Builder().forBrowser("chrome").build();

    // non headless mode - for seeing visually what's happening with automation
    // let driver = new webdriver.Builder().forBrowser("chrome").build();

    try{
        
        await login(webdriver, driver, "/*USERNAME*/", "/*PASSWORD*/");

        await navigate_to_eligibility_page(webdriver, driver);

        await click_on_eligbility_tab(webdriver, driver);

        await fill_emirates_id_details(webdriver, driver, "/*EMIRATES-ID*/");

        return await extract_eligibility(webdriver, driver);

    }catch(NoSuchElementError){
        return false;
    }finally{
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