const wordBox = document.querySelector(".word-box");
const letterBox = document.querySelector(".letter-box");
const imageBox = document.querySelector(".image-box");
const scoreBox = document.getElementById("score");
const nextWordBtn = document.getElementById("next-word-btn");
const loadingBox = document.querySelector(".loading");
const giveupBtn = document.querySelector(".giveup-btn");

// const langSelect = document.getElementById("lang");

const accessKey = "F_QVnXIh5BWvbcAy7cI-rXzBg9U1iMLFK2jJQkFDGP4";

let word = "";
let usedLetters = {};

let score = 0;
scoreBox.innerHTML = '<i class="fa-solid fa-coins"></i>' + score;

let alphabet = [
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 
    'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

let letters;
// let lang = langSelect.value;

// langSelect.addEventListener("change", ()=>{
//     let isConfirmed = confirm("Game will restart");
//     if(!isConfirmed) {
//         langSelect.value = lang;
//         return;
//     }
//     lang = langSelect.value

// });

window.addEventListener('beforeunload', saveGame);
gameSet();

function randomizeString(str) {
    if (str.length < 12) {
        while (str.length < 12) {
            let randomNum = Math.floor(Math.random() * alphabet.length);
            str += alphabet[randomNum];
        }
    }
    const arr = str.split('');

    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }

    return arr.join('');
}

function addLetterToWordBox(e, letter) {
    if (letter.isUsed) {
        return; 
    }
    const boxes = wordBox.querySelectorAll(".box");
    for (let i = 0; i < boxes.length; i++) {
        if (boxes[i].innerHTML === "") {
            boxes[i].innerHTML = letter.innerHTML;
            boxes[i].style.cursor = "pointer";
            usedLetters[i] = letter; 
            letter.isUsed = true;
            e.target.classList.add("disabled");
            check();
            break;
        }
    }
}

function removeLetterFromWordBox(index) {
    const boxes = wordBox.querySelectorAll(".box");
    if (boxes[index].innerHTML !== "") {
        const letterElement = usedLetters[index];
        if (letterElement) {
            letterElement.classList.remove("disabled");
            letterElement.isUsed = false; 
        }
        boxes[index].innerHTML = "";
        boxes[index].style.cursor = "default";
        delete usedLetters[index];
    }
}

async function gameSet(){
    if(!loadGame()){
        word = await getRandomWord();
        loadPhotos(word);
        word = word.toUpperCase();
        letters = randomizeString(word);
    } 
        
    for (let i = 0; i < word.length; i++) {
        const letter = document.createElement("div");
        letter.classList.add("box");
        letter.addEventListener("click", () => removeLetterFromWordBox(i));
        wordBox.appendChild(letter);
    }

    let rightLetters = word.split('');
    for (let i = 0; i < 12; i++) {
        const letter = document.createElement("div");

        letter.innerHTML = letters[i];
        letter.classList.add("letter");
        if(rightLetters.includes(letters[i])){
            index = rightLetters.indexOf(letters[i]);
            rightLetters[index] = "0";
            letter.isRight = true;
            letter.index = index;
        } else letter.isRight = false;

        letter.id = i + 1;
        letter.isUsed = false; 
        letter.addEventListener("click", (e) => addLetterToWordBox(e, letter));
        letterBox.appendChild(letter);
    }

    giveupBtn.style.display = "block";
    loadingBox.style.display = "none";
    letterBox.style.display = "grid";
    wordBox.style.display = "flex";
    imageBox.style.display = "grid";
}

function check(){
    let quess = "";
    for (let i in usedLetters) {
        quess += usedLetters[i].innerHTML;
    }
    if(quess == word){
        const boxes = wordBox.querySelectorAll(".box");
        for (let i = 0; i < boxes.length; i++) {
                boxes[i].style.background = "lightgreen";
                boxes[i].style.pointerEvents = "none";
            }
        nextWordBtn.style.display = "block";
        score += 35;
        scoreBox.innerHTML = '<i class="fa-solid fa-coins"></i>' + score;
    }
}

async function getRandomWord(){
    len = Math.round(Math.random() * 2 + 4);

    try {
        const response = await fetch(`https://random-word-api.herokuapp.com/word?length=${len}`, {
            method: 'GET'
        });
        const jsonData = await response.json();
        console.log(jsonData);
        return jsonData[0];
    } catch (error) {
        console.error('Error getting quote:', error);
    }
}

async function loadPhotos(keyword){
    const url = `https://api.unsplash.com/search/photos?query=${keyword}&client_id=${accessKey}&per_page=4`;

    const response = await fetch(url);
    const data = await response.json();
    const results = data.results;

    let index = 1;

    results.map((result) =>{
        const image = document.getElementById(`img-${index}`);

        image.src = result.urls.small;
        index++;
    })

    for(i = index; i <= 4; i++){
        const image = document.getElementById(`img-${i}`);
        image.src = "https://img.freepik.com/premium-vector/no-photo-available-vector-icon-default-image-symbol-picture-coming-soon-web-site-mobile-app_87543-18055.jpg";
    }
}



function nextWord(){
    giveupBtn.style.display = "none";
    letterBox.style.display = "none";
    wordBox.style.display = "none";
    imageBox.style.display = "none";

    loadingBox.style.display = "block";

    const boxes = wordBox.querySelectorAll(".box");
    for (let i = 0; i < boxes.length; i++) {
        boxes[i].style.background = "#2b2525";
        boxes[i].style.pointerEvents = "auto";
    }

    for(i = 1; i <= 4; i++){
        const image = document.getElementById(`img-${i}`);
        image.src = "https://i.gifer.com/ZKZg.gif";
    }
    usedLetters = {};
    wordBox.innerHTML = "";
    letterBox.innerHTML = "";

    nextWordBtn.style.display = "none";
    gameSet();
}

function removeFakeLetter(){
    if(score < 10) return;

    score -= 10;
    let letters = document.querySelectorAll(".letter");
    letters = Array.from(letters).filter((l) => !l.isRight && !l.isUsed);
    if(letters.length <= 0) return;
    randomIndex = Math.round(Math.random() * (letters.length - 1));
    letters[randomIndex].isUsed = true;
    letters[randomIndex].classList.add("disabled");
    scoreBox.innerHTML = '<i class="fa-solid fa-coins"></i>' + score;
    return;
}



function showLetter(){
    if(score < 20) return;
    let letters = document.querySelectorAll(".letter");
    const boxes = wordBox.querySelectorAll(".box");

    letters = Array.from(letters).filter((l) => l.isRight);

    for(i = 0; i < letters.length; i++){
        if(letters[i].isPlaced != null) continue;
        boxes[letters[i].index].innerHTML = letters[i].innerHTML;
        letters[i].isUsed = true;
        letters[i].isPlaced = true;
        letters[i].classList.add("disabled");
        usedLetters[letters[i].index] = letters[i]; 
        boxes[letters[i].index].style.background = "lightgreen";
        boxes[letters[i].index].style.pointerEvents = "none";
        score -= 20;
        scoreBox.innerHTML = '<i class="fa-solid fa-coins"></i>' + score;
        check();
        break;
    }
}

function showWord(){
    if(score < 100) return;

    let letters = document.querySelectorAll(".letter");
    const boxes = wordBox.querySelectorAll(".box");
    letters = Array.from(letters).filter((l) => l.isRight);
    isCanBeUsed = false;

    for(i = 0; i < letters.length; i++){
        if(letters[i].isPlaced != null) continue;
        boxes[letters[i].index].innerHTML = letters[i].innerHTML;
        letters[i].isUsed = true;
        letters[i].isPlaced = true;
        letters[i].classList.add("disabled");
        usedLetters[letters[i].index] = letters[i]; 
        boxes[letters[i].index].style.background = "lightgreen";
        boxes[letters[i].index].style.pointerEvents = "none";
        isCanBeUsed = true;
    }

    if(isCanBeUsed) {
        score -= 100;
        check();
    }

}

function giveup() {

    const storedData = localStorage.getItem('record');
    let record = 0;
    if (storedData) {
        record = JSON.parse(storedData).record;
    }

    alert(`Your Score: ${score}\nYour Record: ${record}`);

    const newRecord = Math.max(record, score);
    localStorage.setItem('record', JSON.stringify({ record: newRecord }));

    localStorage.removeItem('gameData');
    score = 0;
    scoreBox.innerHTML = '<i class="fa-solid fa-coins"></i>' + score;
                    
    nextWord();
}

function saveGame() {
    const data = {
        points: score,
        hiddenWord: word,
        usedLetters: letters,
        imageBoxInfo: imageBox.innerHTML
    };
    localStorage.setItem('gameData', JSON.stringify(data));
}

function loadGame() {
    const storedData = localStorage.getItem('gameData');
    if (storedData) {
        const data = JSON.parse(storedData);
        word = data.hiddenWord;
        letters = data.usedLetters;
        score = data.points;
        imageBox.innerHTML = data.imageBoxInfo;
        scoreBox.innerHTML = '<i class="fa-solid fa-coins"></i>' + score;
        return true;
    } else {
        console.log('User data not found in local storage');
        return false;
    }
}
