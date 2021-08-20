"use strict";
var Selector = selector => document.querySelector(selector);
var SelectorAll = selectorAll => document.querySelectorAll(selectorAll);
var sT = (fun, interval) => setTimeout(fun, interval);
var sI = (fun, interval) => setInterval(fun, interval);
var cI = intervalClear => clearInterval(intervalClear);
var newEle = element => document.createElement(element);
const alphabet = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"];
var i, j;
var timeMin = 60;
var wrongCount, correctCount, totalCount;
wrongCount = correctCount = totalCount = 0;

//** XML HTTP Requests **//
var sentence = [];

var xhr = new XMLHttpRequest();
xhr.open("GET", "https://soaibhaque.github.io/TypingTest/sentence.json");
xhr.onload = () => {
    if (xhr.status == 200) {
        JSON.parse(xhr.responseText).sentence.forEach(element => {
            sentence.push(element);
        });
    };
};
xhr.send(null);


//** Random key generate**/
function startProcessing() {

    var keyString = "";
    for (i = 0; i < 20; i++) {
        keyString += alphabet[Math.floor(Math.random() * alphabet.length)];
    };

    //** Genrate the sentences **//

    var randomSentence = sentence[Math.floor(Math.random() * sentence.length)];
    var refineSentence = randomSentence.replaceAll(" ", ` ${keyString}`);
    var splitSentence = refineSentence.split(keyString);
    for (i = 0; i < splitSentence.length; i++) {
        var flexParent = newEle('div');
        flexParent.classList.add('flexParent');
        for (j = 0; j < splitSentence[i].length; j++) {
            var flexItem = newEle('div');
            flexItem.classList.add('flexItem');
            if (splitSentence[i][j] == " ") {
                flexItem.innerHTML = "&nbsp;"
                flexParent.appendChild(flexItem);
            } else {
                flexItem.innerText = splitSentence[i][j];
                flexParent.appendChild(flexItem);
            };
        };
        Selector('div.sentenceCol').appendChild(flexParent);
    };

    //** Handling the key Inputs **//

    SelectorAll('div.flexParent')[0].id = "presentFlex";
    SelectorAll('div.flexParent')[0].children[0].classList.add('underLine');

    // adding tooltip on fisrt word

    (() => {
        const tooltip = newEle('span');
        tooltip.classList.add("tooltip");
        tooltip.innerText = "Start Typing !";
        Selector('body').insertBefore(tooltip, Selector('body').children[0]);
        //adjust tooltip to the correct position
        const toolTipAdjust = sI(() => {
            if (Selector("span.tooltip")) {
                const fromTop = (SelectorAll("#presentFlex>div.flexItem")[0].getBoundingClientRect().y - SelectorAll("#presentFlex>div.flexItem")[0].getBoundingClientRect().height - 15);
                const fromLeft = (SelectorAll("#presentFlex>div.flexItem")[0].getBoundingClientRect().x - (Selector("span.tooltip").getBoundingClientRect().width - 32) / 2);
                Selector("span.tooltip").style.top = fromTop + "px";
                Selector("span.tooltip").style.left = fromLeft + "px";
            } else {
                cI(toolTipAdjust);
            }
        })
    })();

    //removing tool tip

    const removeToolTip = () => Selector("span.tooltip") ? Selector("span.tooltip").remove() : false;

    //key functions

    function gotoNextWord(presence) {
        Selector('div#presentFlex div.underLine').classList.add(presence);
        Selector('div#presentFlex div.underLine').nextSibling.classList.add("underLine");
        Selector('div#presentFlex div.underLine').classList.remove("underLine");
    }

    function spaceKey(key) {
        if (key.keyCode == 32) {
            Selector('div#presentFlex div.underLine').classList.add("correct");
            Selector('div#presentFlex').nextSibling.id = "presentFlex";
            Selector('div#presentFlex div.underLine').classList.remove("underLine");
            Selector('div#presentFlex').removeAttribute('id');
            Selector('div#presentFlex').children[0].classList.add('underLine');
        };
    };

    function backSpace() {
        if (Selector('div#presentFlex div.underLine').previousSibling) {
            Selector('div#presentFlex div.underLine').previousSibling.removeAttribute('class');
            Selector('div#presentFlex div.underLine').previousSibling.setAttribute('class', "flexItem");
            Selector('div#presentFlex div.underLine').previousSibling.classList.add('underLine');
            SelectorAll('div#presentFlex div.underLine')[1].classList.remove('underLine');
            correctCount--;
        };
    };

    function correctKey() {
        if (Selector('div#presentFlex div.underLine').nextSibling) {
            gotoNextWord("correct");
            totalCount++;
            correctCount++;
            removeToolTip();
            timeBar();
        };
    };

    function floatingWrongKey(key) {
        var floatingDiv = newEle('div');
        floatingDiv.classList.add('floating');
        Selector('div.underLine').appendChild(floatingDiv);
        floatingDiv.innerText = key.key;
        sT(() => {
            floatingDiv.remove();
        }, 500);
    };

    function wrongKey(key) {
        if (key.shiftKey || key.altKey || key.ctrlKey) {
            return false;
        } else {
            floatingWrongKey(key);
            gotoNextWord("wrong");
            totalCount++;
            wrongCount++;
            timeBar();
            return false;
        };
    };

    //Stats

    function showStats() {
        const gwpm = (totalCount / 5) / (timeMin / 60);
        const nwpm = ((totalCount - wrongCount) / 5) / (timeMin / 60);
        const accuracy = String(((nwpm * 100) / gwpm));
        Selector('div.blackHover').style.display = "block";
        Selector('span.wpm').innerText = gwpm + " WPM";
        Selector('span.wrongCharacter').innerText = wrongCount + " Wrong";
        Selector('span.accuracy').innerText = accuracy.slice(0, 4) + " %";
    };

    //Block Key

    function blockKeys() {
        document.onkeydown = () => false;
        document.onkeypress = () => false;
        document.onkeyup = () => false;
    };

    //Time start

    function timeBar() {
        if (!Selector('div.timeBar')) {
            var timeBar = newEle('div');
            timeBar.classList.add('timeBar');
            Selector('body').insertBefore(timeBar, Selector('body').children[0]);
            //Increase Bar size after every Second
            for (i = 0; i < timeMin; i++) {
                var time = 0;
                sT(() => {
                    time++;
                    timeBar.style.width = ((100 / timeMin) * time) + "%";
                    if (time == timeMin) {
                        showStats();
                        blockKeys();
                    };
                }, 1000 * i);
            };
        };
    };

    //autoscroll
    sI(() => {
        Selector('#presentFlex').scrollIntoView();
    })

    document.onkeydown = key => {
        if (Selector('div#presentFlex div.underLine').innerHTML == "&nbsp;") {
            if (key.keyCode == 8) {
                backSpace();
            } else {
                spaceKey(key);
            };
            return false;
        } else if (key.keyCode == 8) {
            backSpace();
        } else if (key.keyCode == 116 || (key.ctrlKey && key.keyCode == 82)) { //refresh the page with F5 and ctrl + R
            location.reload();
        } else if (key.key == Selector('div#presentFlex div.underLine').innerText) {
            correctKey();
            return false;
        } else {
            wrongKey(key);
            return false;
        };
    };
};

//start sentence processing
var sentenceArr = sI(() => {
    if (sentence.length) {
        startProcessing();
        clearInterval(sentenceArr);
    };
});