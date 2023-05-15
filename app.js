const fun = {
    timeMin: 60,
    wrongCount: 0,
    correctCount: 0,
    totalCount: 0,
    createWordArray: async function () {
        let wordArray = [];
        for (let i = 0; i < 150; i++) {
            let index = Math.floor(Math.random() * paragraph.length);
            let selectedParagraph = paragraph[index];
            wordArray.push(selectedParagraph);
        }
        return Promise.resolve(wordArray);
    },
    appendToDOM: async function (words) {
        words.forEach(w => {
            let flexParent = newEle('div');
            flexParent.classList.add('flexParent');
            let wordArray = w.split('');
            wordArray.push(' ');

            wordArray = wordArray.map(l => {
                let flexItem = newEle('div');
                flexParent.classList.add('flexItem');
                if (l == ' ') {
                    flexItem.innerHTML = '&nbsp';
                    return flexItem;
                };
                flexItem.innerText = l;
                return flexItem;
            });

            wordArray.forEach(node => flexParent.appendChild(node));
            Selector('div.sentenceCol').appendChild(flexParent)
        });
        return Promise.resolve(true);
    },
    startAtFirstletter: async function () {
        Selector('div.flexParent:first-child').id = "presentFlex";
        Selector('div.flexParent:first-child').children[0].classList.add('underLine');
        return Promise.resolve();
    },
    correctKey: function (presentLetter) {
        if ([...presentLetter.classList].includes('wrong')) presentLetter.classList.remove('wrong');
        presentLetter.classList.add('correct');
        presentLetter.classList.remove('underLine');
        if (!presentLetter.nextSibling) {
            let currentWord = Selector('#presentFlex');
            currentWord.id = '';
            currentWord.nextSibling.id = 'presentFlex';
            currentWord.nextSibling.children[0].classList.add('underLine');
            return;
        }
        presentLetter.nextSibling.classList.add('underLine');
    },
    wrongKey: function (presentLetter, e) {
        presentLetter.classList.add('wrong');
        let wrongLetter = newEle('div');
        wrongLetter.innerText = e.key;
        wrongLetter.classList.add('floating');
        presentLetter.appendChild(wrongLetter);
        sT(() => wrongLetter.remove(), 1000);
        presentLetter.classList.remove('underLine');
        if (!presentLetter.nextSibling) {
            let currentWord = Selector('#presentFlex');
            currentWord.id = '';
            currentWord.nextSibling.id = 'presentFlex';
            currentWord.nextSibling.children[0].classList.add('underLine');
            return;
        }
        presentLetter.nextSibling.classList.add('underLine');
    },
    backSpace: function (presentLetter) {
        if ([...presentLetter.classList].includes('correct')) presentLetter.classList.remove('correct');
        if ([...presentLetter.classList].includes('wrong')) presentLetter.classList.remove('wrong');
        presentLetter.classList.remove('underLine');
        if (!presentLetter.previousSibling) {
            let currentWord = Selector('#presentFlex');
            currentWord.id = '';
            currentWord.previousSibling.id = 'presentFlex';
            let total = currentWord.previousSibling.children.length;
            currentWord.previousSibling.children[total - 1].classList.add('underLine');
            return;
        }
        presentLetter.previousSibling.classList.add('underLine');
    },
    keyChecking: function (e) {
       if(e.keyCode != 123) e.preventDefault();
        let presentLetter = Selector('#presentFlex>.underLine');
        if (e.keyCode == 116 || (e.keyCode == 82 && e.ctrlKey)) {
            location.reload();
            return;
        }
        if (e.keyCode == 16 || e.keyCode == 17 || e.keyCode == 18 || e.keyCode == 9  || e.keyCode == 123) return;
        if (e.keyCode == 8) {
            fun.backSpace(presentLetter);
            return;
        }
        if (e.key == presentLetter.innerText) {
            fun.correctKey(presentLetter);
            return;
        }
        if (presentLetter.innerHTML == '&nbsp;') {
            if (e.keyCode == 32) fun.correctKey(presentLetter);
            if (e.keyCode == 8) fun.backSpace(presentLetter);
        } else if (e.key != presentLetter.innerText) {
            fun.wrongKey(presentLetter, e);
            return;
        }
        Selector('#presentFlex>.underLine').scrollIntoView({
            behavior: 'smooth'
        });
    },
    startTyping: async function () {
        document.addEventListener('keydown', this.keyChecking);
        // blocking other keys events
        document.onkeypress = () => false;
        document.onkeyup = () => false;
    },
    init: async function () {
        if (paragraph.length) {
            let wordArray = await this.createWordArray(); // return array of words from paragraph
            let success = await this.appendToDOM(wordArray); // return the success msg
            if (success) await this.startAtFirstletter(); // set cursor at first letter
            this.startTyping(); // start typing
        }
    }
}

fun.init();