let pup=require('puppeteer');
let fs= require('fs');

let cFile=process.argv[2];
let myModerator=process.argv[3];
let dataFile=process.argv[4];

// 3 = > JSON FILE CONTAINING TEST CASES

(async function(){
  try  
 {   
    let data = await fs.promises.readFile(cFile);
    let {url,pwd,username}=JSON.parse(data);
    let information=require(dataFile)
    const browser=await pup.launch({
        headless:false,
        defaultViewport:null,
        args:["--start-maximized"]
        })
    
    let tabs = await browser.pages();
    let tab = tabs[0]
    await tab.goto(url , {waitUntil:"networkidle0"})

    // send login id
    await tab.waitForSelector("#input-1", { visible: true })
    await tab.type("#input-1",username,{delay:100});

    await tab.waitForSelector("#input-2", { visible: true })
    await tab.type("#input-2",pwd,{delay:100});

    // click login button
    await Promise.all([tab.click("button[data-analytics=LoginPassword]"),
    tab.waitForNavigation({ waitUntil: "networkidle0" })])

    //  click drop down button
    await tab.waitForSelector("a[data-analytics=NavBarProfileDropDown]", { visible: true });
    await tab.click("a[data-analytics=NavBarProfileDropDown]");
    // administartion
    await Promise.all(
      [tab.waitForNavigation({ waitUntil: "networkidle0" }),
      tab.click("a[data-analytics=NavBarProfileDropDownAdministration]"),])

    //**************************Manage Challenges ***************************/

    await tab.waitForSelector(".administration header", { visible: true })
    let mTabs = await tab.$$(".administration header ul li a");

    await Promise.all(
      [tab.waitForNavigation({ waitUntil: "networkidle0" }),
      mTabs[1].click("a[data-analytics=NavBarProfileDropDownAdministration]"),])
    
     
    await updateQuestions(tab,browser,information);



  }
catch(err)
{
    console.log(err);
}    
})()

async function updateQuestions(tab,browser,information)
{
    
    console.log("ok updation process starts ")

  while(true)
  {
        await tab.waitForSelector(".pagination ul li");
        let paginationBtn = await tab.$$(".pagination ul li");

        // ************page of questions**************
        await tab.waitForSelector(".backbone.block-center",{visible:true});
        let pageofallquestions=tab.url()

        let allQuestions=await tab.$$(".backbone.block-center")

        let idx=0
        let no_of_questions=allQuestions.length;
        while(idx<no_of_questions)
        {
            // ******************PART ADDING MODERATORS*****************
            let href = await tab.evaluate(function (elem) {
                return elem.getAttribute("href");
              }, allQuestions[idx]);
            console.log("      attributes is"+href);
            let new_tab=await browser.newPage();
            await new_tab.goto("https://www.hackerrank.com"+href, {waitUntil:"networkidle0"} );
            console.log("       reached to questions page with href "+href);
            await addModerator(new_tab,browser);
            // ******************PART ADDING MODERATORS*****************
            // ------------------TIME TO ADD  TEST CASES IN SAME TAB-----
            console.log("called test cases for idx = "+idx);
            await addTestCase(new_tab,browser,information[idx])

            // ----------------------TEST CASES DONW----------------------
            new_tab.close();
            idx++;
        }
        
        let nxtBtn = paginationBtn[paginationBtn.length - 2];
        let className = await tab.evaluate(function (nxtBtn) {
          return nxtBtn.getAttribute("class");
        }, nxtBtn);
        if (className === "disabled") {
          return;
        } else {
      await Promise.all([nxtBtn.click(), tab.waitForNavigation({ waitUntil: "networkidle0" })]);
      
    }
  }
}

async function addModerator(tab,browser)
{


    console.log("               just final function ")

    await tab.waitForSelector(".tag")
    await tab.waitForSelector("[data-tab=moderators]");
    await Promise.all([ 
      tab.click("li[data-tab=moderators]"),
      tab.waitForNavigation({ waitUntil: "networkidle0" }),
    ]);
    await tab.waitForSelector("#moderator",{visible:true})
    await tab.type("#moderator",myModerator,{delay:100});
    await tab.click(".btn.moderator-save")
    await tab.click(".save-challenge.btn.btn-green");
    

}

async function addTestCase(tab,browser,data)
{
    console.log("*****************************")
    console.log("1.about to start addition of test case")
    let testcases=data["Testcases"];
    await tab.waitForSelector("[data-tab=testcases]");
    await Promise.all([ 
      tab.click("[data-tab=testcases]"),
      tab.waitForNavigation({ waitUntil: "networkidle0" }),
    ]);
    console.log("2.clicked  test cases  from navbar button")
    for(let i=0;i<testcases.length;i++)
    {
        await tab.waitForSelector('.btn.add-testcase.btn-green');
        await tab.click('.btn.add-testcase.btn-green');
        console.log(" ****clicked add test cases button ");
        await tab.waitForSelector(".administration-challenge-edit-add-testcase-dialog.on-the-fly-dialog.position-absolute",{visible:true});

          // /**************************  PART TO SEND KEYS  */
        // let all_text_boxes=await tab.$$(".CodeMirror-scroll .CodeMirror-lines");
        // console.log("found all text boxes tottal are "+all_text_boxes.length);
        // await tab.type(all_text_boxes[0],testcases["Input"])
        // console.log("input send")
        // await tab.type(all_text_boxes[1],testcases["Output"])
        // console.log("output send");
        
        // INPUT SENDER
        let allio=testcases[i]
        await tab.waitForSelector(".formgroup.horizontal.input-testcase-row.row .CodeMirror div",{visible:true})
        
        await tab.evaluate(()=> 
        {
          document.querySelector(".formgroup.horizontal.input-testcase-row.row .CodeMirror div").style.height="10px";
        }, )
        await tab.type(".formgroup.horizontal.input-testcase-row.row .CodeMirror div textarea",allio["Input"],{delay:100})
        console.log("******sended input  "+allio["Input"])
        // OUTPUT SENDER
        
        await tab.waitForSelector(".formgroup.horizontal.output-testcase-row.row .CodeMirror div textarea",{visible:true})
        // await editorHandler(".formgroup.horizontal.input-testcase-row.row .CodeMirror div",outputboxselector,allio["Output"])
        await tab.evaluate(()=> 
        {
          document.querySelector(".formgroup.horizontal.output-testcase-row.row .CodeMirror div").style.height="10px";
        }, )
        await tab.type(".formgroup.horizontal.output-testcase-row.row .CodeMirror div textarea",allio["Output"],{delay:100})
        console.log("sendedn output "+allio["Output"])
          // /************************************** */
        await tab.waitForSelector('.btn.btn-primary.btn-large.save-testcase')
        await tab.click('.btn.btn-primary.btn-large.save-testcase');
        await tab.evaluate(()=> 
        {
          let value=document.querySelectorAll(".administration-challenge-edit-add-testcase-dialog.on-the-fly-dialog.position-absolute").length==0
          console.log("value is  "+value);
        }, )
        let final_time=Date.now()+3000;
        while(final_time>Date.now())
        {

        }


    }

    await tab.waitForSelector(".save-challenge.btn.btn-green")
    await tab.click(".save-challenge.btn.btn-green");
    await tab.waitForSelector(".save-challenge.btn.btn-green")
}

