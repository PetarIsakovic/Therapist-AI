const askQuestion = document.getElementById("askQuestionButton");
const questionSpace = document.getElementById("questionSpace");
const text = document.getElementById("text");
const askQuestionTitle = document.getElementById("askQuestionTitle");
const aiResponse = document.getElementById("aiResponse");
const loading = document.getElementById("loading");
const welcome = document.getElementById("welcomeMessage");

questionSpace.style.height = text.getBoundingClientRect().height + "px";
let talking = false;

// import require from'./node_modules/requirejs';
// require.env;
// dotenv.config();

// const apiKey = process.env.HACKATHONAPIKEY;
// console.log(apiKey);


// import require from './node_modules/requirejs/require.js';

// webpack.config.js

let file = "env.txt"

let APIKEY = "";

let oldMessage = "";
let oldMessageOfUser = "";

let message = "";

text.innerHTML = "";

welcome.innerHTML ="";
const words = "Welcome to AI Therapy, which is a cutting-edge AI technology and a comforting, familiar voice, we offer you a unique space to embark on a journey of self-discovery and healing. Our platform is dedicated to offering you a safe haven where you can freely express your thoughts, untangle your emotions, and find the insights that can lead to positive change.";

// for (let i = 0; i < words.length; i++) {
//     let currentChar = words[i].split('');
//     for (let j = 0; j < currentChar.length; j++) {
//     await new Promise((resolve) => setTimeout(resolve, 70));
//     welcome.innerHTML += currentChar[j];
//     }
//     await new Promise((resolve) => setTimeout(resolve, 99));
//     welcome.innerHTML += ' ';
// }
let index = 0;
var inter = setInterval(function(){
    welcome.innerHTML = welcome.innerHTML + words.charAt(index);
    if(index == words.length-1){
        clearInterval(inter);
    }
    index++;
    
}, 12);

//;------------------------------------------------------------------;
fetch(file)
    .then((response) => response.text())
    .then((data) => {
    APIKEY = data;
    })
    .catch((error) => {
        console.log("Failed to get text file", error);
    });

askQuestion.addEventListener("click", function(){
    if(!talking){
        talking = true;
        text.innerHTML = "";
        recognition.start();
        askQuestionTitle.innerHTML = "Talk Now!";
        askQuestion.style.backgroundColor = "rgb(255, 246, 179)";
        // askQuestion.style.border = "3px solid black";
        questionSpace.style.height = text.getBoundingClientRect().height + "px";
        aiResponse.innerHTML = '';
        aiResponse.style.display = 'none';
    }
    
    speechSynthesis.cancel();
    
});

let tick = 0;

setInterval(function(){
    if(talking){
        tick++;
        if(tick < 10){
            askQuestionTitle.style.color = "rgb(0, 0, 0, 0)";
        }
        else{
            askQuestionTitle.style.color = "rgb(0, 0, 0, 1)";
            if(tick == 20){
                tick = 0;
            }
        }
    }
}, 50)

// const fs = require("fs");
// let p;
// fs.readFile(".env", (err, data) => {
//   if (err) throw err;
//   p = data.toString()
//   console.log(p);
// });

// require("dotenv").config();

// console.log(process.env.HACKATHONAPIKEY)

async function getMessage(){

console.log("OLD USER MESSAGE: " + oldMessageOfUser);    
console.log("OLD AI MESSAGE: " + oldMessage);    

    
    try{
        const options = {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${APIKEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [
                  {
                    role: "system",
                    content: "You are a helpful therapist keep your answers short and to the point never go above 200 words. However, if the user does not ask a question that relates to therapy tell them ",
                    // "You are a therapist for the user. Always try to be considerate of the person talking to you. Always treat the user as a friend and be considerate.", \"I only answer questions that will help you emotionally\"
                  },
                  {
                    role: "user",
                    content: (oldMessageOfUser),
                  },
                  {
                    role: "assistant",
                    content: (oldMessage),
                  },
                  {
                    role: "user",
                    content: (text.innerHTML),
                  }
                  
                ]
              })
        };
        
        const response = await fetch('https://api.openai.com/v1/chat/completions', options);
        const data = await response.json();
        
        message = data.choices[0].message.content;
        oldMessage = ("" + message);
        aiResponse.style.display = 'block';

        loading.style.display = "none";
        message = message.replace(/(\r\n|\r|\n)/g, '<br>');

        aiResponse.innerHTML = message;
        oldMessageOfUser = text.innerHTML;

        var utterance = new SpeechSynthesisUtterance(message);
        speechSynthesis.speak(utterance);
        window.addEventListener('beforeunload', function(){
            speechSynthesis.cancel();
        });
    }
    catch(error){
        console.log(error);
    }
}

var speech = true;
window.SpeechRecognition = window.webkitSpeechRecognition;

const recognition = new SpeechRecognition();
recognition.interimResults = true;

recognition.addEventListener('result', e => {
const transcript = Array.from(e.results)
    .map(result => result[0])
    .map(result => result.transcript)
    .join('')
text.innerHTML = transcript;
text.innerHTML = text.innerHTML.charAt(0).toUpperCase() + text.innerHTML.substring(1, text.innerHTML.length);
questionSpace.style.height = text.getBoundingClientRect().height + "px";
});

recognition.addEventListener("soundend", (event) => {
    //response is what you need to throw into chat gpt
    askQuestionTitle.innerHTML = "Ask a Question";
    askQuestion.style.backgroundColor = "rgb(255, 206, 114)"
    askQuestionTitle.style.color = "rgb(0, 0, 0, 1)";
    talking = false;
    
    const response = text.innerHTML;
    loading.style.display = "block";
    getMessage();
});


