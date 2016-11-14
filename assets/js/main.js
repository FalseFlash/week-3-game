var alphabet = [
    'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k',
    'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v',
    'w', 'x', 'y', 'z'
];

var word = ""; // Current selected word
var wordList;
var arrWord = []; // The word in array format.
var guesses = []; // Letters guessed
var cGuesses = []; // Correct letters guessed
var lives = 9; // Number of guesses remaining.
var counter = 0; // Number of correct guesses
var gameStarted = true;
var currentDiff;
var timer; // Countdown timer to start a new game.

var winAudio = new Audio('assets/sounds/win.wav');
var loseAudio = new Audio('assets/sounds/lose.wav');

var loses = 0;
var wins = 0;

// For reading words file
var loadJSON = function(callback, file) {
    var obj = new XMLHttpRequest();
    obj.overrideMimeType("application/json");
    obj.open('GET', file, true);

    obj.onreadystatechange = function() {
        if(obj.readyState == 4 && obj.status == "200") {
            callback(obj.responseText);
        }
    };
    obj.send(null);
};

// Give an error, such as incorrect answer.
var giveError = function(error) {
    document.getElementById('errorField').innerHTML = "<strong>" + error + "</strong>";
};

var removeALife = function() {
    lives--;
    document.getElementById('lives').innerHTML = "Lives Left: " + lives;
};

var newGameCountdown = function(seconds) {
    var oldSeconds = seconds;
    var seconds = seconds * 1000;

    timer = setInterval(function() {
        oldSeconds--;
        document.getElementById('countdown').innerHTML = 'A new game will automatically begin in ' + oldSeconds + ' seconds';

        if(oldSeconds <= 0) {
            reset(true);
            clearInterval(timer);
            document.getElementById('countdown').innerHTML = '';
        }
    }, 1000);

}

// Create all the buttons for the alphabet.
var alphaButtons = function () {
    if(document.getElementById('letter-buttons').childElementCount > 0)
        document.getElementById('letter-buttons').innerHTML = "";

    var buttonsDiv = document.getElementById('letter-buttons');
    var letters = document.createElement('ul');

    for (var i = 0; i < alphabet.length; i++) {
        letters.setAttribute('class', 'alpha');
        var list = document.createElement('li');
        list.setAttribute('class', 'letter btnMain');
        list.setAttribute('id', alphabet[i] + "_button");
        list.setAttribute('onClick', "check('" + alphabet[i] + "');");
        list.innerHTML = alphabet[i];
        buttonsDiv.appendChild(letters);
        letters.appendChild(list);
    }
};

// Check if the letter is in the word.
var check = function(letter) {
    if(!gameStarted)
        return;

    if(guesses.indexOf(letter) > -1) {
        giveError("You've already guessed the letter " + letter.toUpperCase());
        return;
    } else {
        document.getElementById('errorField').innerHTML = "";
        document.getElementById(letter + "_button").style.textDecoration = "line-through";
        document.getElementById(letter + "_button").style.background = "#F8BBD0";
        document.getElementById(letter + "_button").style.cursor = "default";
    }

    if(arrWord.indexOf(letter) > -1) {
       for(var i = 0; i < arrWord.length; i++) {
           if(arrWord[i] == letter){
               document.getElementById(i).innerHTML = letter.toUpperCase();
               cGuesses.push(letter);
           }
       }
    } else {
        giveError("Sorry, " + letter.toUpperCase() + " was incorrect!");
        removeALife();
        if(lives == 0) {
            gameStarted = false;
            giveError("Sorry, you were hung. Better luck next time!<br>Click reset to play a new game.");
            loseAudio.play();
            loses++;
            document.getElementById('loses').innerHTML = "Loses: " + loses;
            newGameCountdown(6);
        }
    }

    if(cGuesses.length == arrWord.length) {
        giveError("Congratulations, you won!<br>Click reset to play a new game.");
        wins++;
        document.getElementById('wins').innerHTML = "Wins: " + wins;
        winAudio.play();
        gameStarted = false;
        newGameCountdown(6);
    }

    guesses.push(letter);
};

// Reset the game to default.
var reset = function(startNew) {
    if(word === '')
        return;

    word = '';
    arrWord = [];
    gameStarted = false;
    lives = 9;
    counter = 0;
    guesses = [];

    clearInterval(timer);

    $('.gameContainer').slideUp();
    $('.diffChoose').slideDown();

    var wordDiv = document.getElementById('word');
    wordDiv.innerHTML = '';
    giveError('');
    alphaButtons();

    if(startNew)
        setDifficulty(currentDiff);
};

// Create the lines for the letters
var setupLetterLines = function() {
    var wordDiv = document.getElementById('word');

    for(var i = 0, len = word.length; i < len; i++) {
        var span = document.createElement('span');
        arrWord.push(word[i]);
        if(word[i] !== ' ') {
            span.setAttribute('id', i);
            span.innerHTML = '_';
            wordDiv.appendChild(span);
        } else {
            span.innerHTML = '&nbsp;';
            wordDiv.appendChild(span);
        }
    }
};

// This is ran when the player chooses the level.
var setDifficulty = function(level) {
    // Reset old game (if any)
    if(gameStarted)
        reset();

    $('.gameContainer').slideDown();
    $('.diffChoose').slideUp();

    // 1 = easy, 2 = medium, 3 = hard, EE = easter egg (only accessed with console).
    if((level == 1) || (level == 2) || (level == 3) || (level === "EE")) {
        var rand = Math.floor(Math.random() * wordList[level].length);

        if(level == 1) {
            lives = 9;
        } else if(level == 2) {
            lives = 7;
        } else {
            lives = 5;
        }

        currentDiff = level;
        document.getElementById('lives').innerHTML = "Lives Left: " + lives;
        word = wordList[level][rand];
        setupLetterLines();
        gameStarted = true;
    }
};

// Allow the letters to be pressed on the keyboard.
document.onkeyup = function(key) {
    key = String.fromCharCode(key.keyCode).toLowerCase();

    if(gameStarted) {
        check(key);
    }
};



// Runs when the page loads.
var init = function() {
    alphaButtons(); // Load all the buttons

    // Load all the words.
    loadJSON(function(resp) {
        wordList = JSON.parse(resp);
    }, 'words.json');
}();