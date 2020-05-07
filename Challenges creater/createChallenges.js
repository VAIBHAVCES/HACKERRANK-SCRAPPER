console.log(process.argv)
let swd = require("selenium-webdriver")
let fs =require('fs')
require('chromedriver')
let bldr=new swd.Builder()
let driver= bldr.forBrowser("chrome").build();

let cfile=process.argv[2];
let questionsFile=process.argv[3];

( async function(){
    try{

    await driver.manage().setTimeouts({
        implicit:10000,
        pageLoad:10000
    })    ;
    let data=await fs.promises.readFile(cfile);
    let {url , pwd , user }=JSON.parse(data);
    await driver.get(url);
    let userFoundPromise=driver.findElement(swd.By.css("#input-1"));
    let pwdFoundPromise=driver.findElement(swd.By.css("#input-2"))
    let credentialsPromise= await Promise.all([userFoundPromise,pwdFoundPromise])
    let userSendPromise=credentialsPromise[0].sendKeys(user);
    let pwdSendPromise=credentialsPromise[1].sendKeys(pwd);

    await Promise.all([userSendPromise,pwdSendPromise]);
    let loginbutton=await driver.findElement(swd.By.css("button[data-analytics=LoginPassword]"))
    await loginbutton.click();
    // await driver.wait(swd.until.)

    let adminBtn= await driver.findElement(swd.By.css("a[data-analytics=NavBarProfileDropDownAdministration]"));
    let adminpageurl=await adminBtn.getAttribute("href");
    await driver.get(adminpageurl);
    // this was the point you gotcha stale error
    await waitForLoader();
    let manageContestTabawait= await driver.findElements(swd.By.css(".administration header ul li"));
    await manageContestTabawait[1].click();
    
    
    
    //  storing link for button of create new challenge
    let linkfornewchallenge=await driver.getCurrentUrl();
    // read questions.js file
    console.log("about to read questions file "+questionsFile);
    let questions=require(questionsFile);
    console.log("no of questions are : "+questions.length);
    for(let i=0;i<questions.length;i++)
    {
        console.log("about to start proccess for ith :"+i)
        await driver.get(linkfornewchallenge);
        await waitForLoader();
        console.log("   called challnege created with "+questions[i])
        await createNewChallenge(questions[i]);
        console.log("*****************************************")
    }

// **************************all CHALLENGEES HAS  BEEN CREATED SO FAR;/*************** */
// TIME TO PUT TEST CASES
// get to challenegs page

// await driver.get(linkfornewchallenge);
// await waitForLoader();
// //get list of all created challenges 

// let listofallchallenges= await driver.findElements (swd.By.css(".backbone.block-center"))
// console.log("contest i found are +"+listofallchallenges.length);
// let promisetogetlink=await listofallchallenges[0].getAttribute("href"); 
// console.log("getting to navigation bar page");
// await driver.get(promisetogetlink);

// // now click to test cases
//     await waitForLoader();
//     console.log("page loaded")
//     await putestcases();

// for(let i=0;i<listofallchallenges.length;i++)
// {
//    for(let j=0;questions)

// }



    }
    catch(err)
    {
        console.log(err);
    }

})()





// *********************create challenges function************
async function createNewChallenge(question) {
console.log("inside filler");
let createChallenge=driver.findElement(swd.By.css(".btn.btn-green.backbone.pull-right"));
createChallenge.click()

await waitForLoader();
let eSelector = ["#name", "textarea.description", "#problem_statement-container .CodeMirror div textarea",
 "#input_format-container .CodeMirror textarea", "#constraints-container .CodeMirror textarea", 
 "#output_format-container .CodeMirror textarea", "#tags_tag"];

let eWillBeselectedPromise = eSelector.map(function (s) {
  return driver.findElement(swd.By.css(s));
})
let AllElements = await Promise.all(eWillBeselectedPromise);
// submit name ,description


// challenge name
let NameWillAddedPromise = AllElements[0].sendKeys(question["Challenge Name"]);
// description
let descWillAddedPromise = AllElements[1].sendKeys(question["Description"]);
    //problem statement
    console.log("putting problem statement "+question["Problem Statement"])
    await editorHandler("#problem_statement-container .CodeMirror div ",AllElements[2],question["Problem Statement"]);
    // input format
    await editorHandler("#input_format-container .CodeMirror div",AllElements[3],question["Input Format"]);
    // constraints
    await editorHandler("#constraints-container .CodeMirror div",AllElements[4],question["Constraints"]);
    // output format
    
    await editorHandler("#output_format-container .CodeMirror div",AllElements[5],question["Output Format"]);
    // tags
    let TagsInput = AllElements[6];
    await TagsInput.sendKeys(question["Tags"]);
    await TagsInput.sendKeys(swd.Key.ENTER);
    // save changes
    let buttontosavechangespromise=await driver.findElement(swd.By.css(".save-challenge.btn.btn-green"))
    await buttontosavechangespromise.click();
    console.log("       save clicked and proceeding to next one")

}

async function editorHandler(parentSelector, element, data) {
    let parent = await driver.findElement(swd.By.css(parentSelector));
    // selenium => browser js execute 
    await driver.executeScript("arguments[0].style.height='10px'", parent);
    await element.sendKeys(data);
  }

  async function waitForLoader(){

    let loader=await driver.findElement(swd.By.css("#ajax-msg"));
    await driver.wait(swd.until.elementIsNotVisible(loader));
}

async function editorHandler(parentSelector, element, data) {
    let parent = await driver.findElement(swd.By.css(parentSelector));
    // selenium => browser js execute 
    await driver.executeScript("arguments[0].style.height='10px'", parent);
    await element.sendKeys(data);
  }