let puppeteer = require("puppeteer");
let fs = require("fs");
let cfile = process.argv[2];

(async function () {
    try {
        let browser = await puppeteer.launch({
            headless: false,
            defaultViewport: null,
            args: ["incognito", "--start-maximized"]
        });
        let pages = await browser.pages();
        let page = pages[0];
        let data = await fs.promises.readFile(cfile);
        let {
            url,
            username,
            password
        } = JSON.parse(data);

        await page.goto(url);
        await page.type("#input-1", username);
        await page.type("#input-2", password);
        await page.click(".ui-btn.ui-btn-large");

        await page.waitForNavigation({
            waitUntil: "networkidle0"
        });
        await page.waitForSelector("a[data-analytics=NavBarProfileDropDown]", {
            visible: true
        });
        await page.click("a[data-analytics=NavBarProfileDropDown]");
        await Promise.all([page.click("a[data-analytics=NavBarProfileDropDownAdministration]"), page.waitForNavigation({
            waitUntil: "networkidle0"
        })]);

        // await page.waitForNavigation({waitUntil:"networkidle0"});
        await page.waitForSelector(".administration header",{visible:true});

        let tabs = await page.$$(".administration header ul li");
        await Promise.all([tabs[1].click(), page.waitForNavigation({
            waitUntil: "networkidle0"
        })]);
        // let mpUrl = await page.url();

        // let qidx=0;
        // while(true){
        //     let question=await getMeQuestionElement(page,qidx,mpUrl);
        //     if(question==null){
        //         console.log("All ouestions processed");
        //         return;
        //     }
        //     qidx++
        // }
        await NumberPages(page,browser);
    }catch(err){
        console.log(err);
    }
})();

// async function getMeQuestionElement(page,qidx,mpUrl){
//         let pidx=Math.floor(qidx/10);
//         let pQidx=qidx%10;

//         console.log(pidx+" "+pQidx);

//         await page.goto(mpUrl);
//         await waitForLoader(page);

//         await page.waitForSelector(".pagination ul li",{visible:true});
//         let paginations=await page.$$(".pagination ul li");
//         let nxtBtn=paginations[paginations.length-2];

//         let className=await page.evaluate(function(el){
//             return el.getAttribute("class")
//         },nxtBtn);
//         for(let i=0;i<pidx;i++){
//             if(className=="disabled"){
//                 return null;
//             }
//             await nxtBtn.click();
//             await page.waitForSelector(".pagination ul li",{visible:true});

//             paginations=await page.$$(".pagination ul li");
//             nxtBtn=paginations[paginations.length-2];

//             className=await page.evaluate(function(el){
//                 return el.getAttribute("class");
//             },nxtBtn);
//         }
//         let challengeList=await page.$$(".backbone.block-center");
//         if(challengeList.length>pQidx){
//             return challengeList[pQidx];
//         }
//     }

async function NumberPages(tab,browser) {
    await tab.waitForSelector(".backbone.block-center");
    let qoncPage=await tab.$$(".backbone.block-center");
    let pArr=[];

    for(let i=0;i<qoncPage.length;i++){
        let href=await tab.evaluate(function(element){
            return element.getAttribute("href");
        },qoncPage[i]);
    

    let newTab=await browser.newPage();
    let mWillBeAddedPromise=handleSingleQuestion(newTab,"https:\\www.hackerrank.com"+href);
    pArr.push(mWillBeAddedPromise);
}
await Promise.all(pArr);

await tab.waitForSelector(".pagination ul li");
let paginationBtn=await tab.$$(".pagination ul li");
let nxtBtn=paginationBtn[paginationBtn.length-2];
let className=await tab.evaluate(function(nxtBtn){
    return nxtBtn.getAttribute("class");
},nxtBtn);

if(className=="disabled"){
    return;
}else{
    await Promise.all([nxtBtn.click(),tab.waitForNavigation({
        waitUntil:"networkidle0"
    })]);
    await NumberPages(tab,browser);
}
}

async function handleSingleQuestion(newTab,link) {
    await newTab.goto(link,{waitUntil:"networkidle0"});
    // await newTab.waitForSelector(".tab");
    await newTab.click("li[data-tab=moderators]");
    await newTab.waitForSelector("input[id=moderator]",{visible:true});
    await newTab.type("#moderator","db935411");
    await newTab.keyboard.press("Enter");
    await newTab.click(".save-challenge.btn.btn-green");
    await newTab.close();
}

