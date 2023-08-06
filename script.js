import HACKATHONAPIKEY from "./apikey.js";
import.meta.env;

console.log(HACKATHONAPIKEY);

const askQuestion = document.getElementById("askQuestionButton");
const questionSpace = document.getElementById("questionSpace");
const text = document.getElementById("text");
const askQuestionTitle = document.getElementById("askQuestionTitle");
const aiResponse = document.getElementById("aiResponse");
const loading = document.getElementById("loading");
const welcome = document.getElementById("welcomeMessage");

questionSpace.style.height = text.getBoundingClientRect().height + "px";
let talking = false;

let oldMessage = "";
let oldMessageOfUser = "";

let message = "";

welcome.innerHTML = "";
const words = "Welcome to AI Therapy, which is a cutting-edge AI technology and a comforting, familiar voice, we offer you a unique space to embark on a journey of self-discovery and healing. Our platform is dedicated to offering you a safe haven where you can freely express your thoughts, untangle your emotions, and find the insights that can lead to positive change.";

let index = 0;
var inter = setInterval(function () {
    welcome.innerHTML = welcome.innerHTML + words.charAt(index);
    if (index == words.length - 1) {
        clearInterval(inter);
    }
    index++;

}, 12);


askQuestion.addEventListener("click", function () {
    if (!talking) {
        talking = true;
        text.innerHTML = "";
        recognition.start();
        askQuestionTitle.innerHTML = "Talk Now!";
        askQuestion.style.backgroundColor = "rgb(255, 246, 179)";
        questionSpace.style.height = text.getBoundingClientRect().height + "px";
        aiResponse.innerHTML = '';
        aiResponse.style.display = 'none';
    }

    speechSynthesis.cancel();

});

let tick = 0;

setInterval(function () {
    if (talking) {
        tick++;
        if (tick < 10) {
            askQuestionTitle.style.color = "rgb(0, 0, 0, 0)";
        }
        else {
            askQuestionTitle.style.color = "rgb(0, 0, 0, 1)";
            if (tick == 20) {
                tick = 0;
            }
        }
    }
}, 50)

async function getMessage() {

    console.log("OLD USER MESSAGE: " + oldMessageOfUser);
    console.log("OLD AI MESSAGE: " + oldMessage);


    try {
        const options = {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${HACKATHONAPIKEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                temperature: 0.8,
                messages: [
                    {
                        role: "system",
                        content: "You are a helpful and soft spoken therapist keep your answers short and to the point never go above 250 words. As a therapist it is your job to talk to the user and make them feel more comfortable. The user is coming to you so they can receive help from you do not refer them to any other therapist, they do not exist, only you exist as a therapist. However, if the user does not ask a question that relates to therapy tell them ",
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

        var utterance = new SpeechSynthesisUtterance(message);
        for (let i = 0; i < window.speechSynthesis.getVoices().length; i++) {
            console.log(i);
            console.log(window.speechSynthesis.getVoices()[i]);
        }
        speechSynthesis.speak(utterance);
        window.addEventListener('beforeunload', function () {
            speechSynthesis.cancel();
        });
        utterance.addEventListener("end", (event) => {
            console.log("stopped talking");
            talking = true;
            recognition.start();
        });

        message = message.replace(/(\r\n|\r|\n)/g, '<br>');

        aiResponse.innerHTML = message;
        oldMessageOfUser = text.innerHTML;


    }
    catch (error) {
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
    askQuestionTitle.innerHTML = "Ask a Question";
    askQuestion.style.backgroundColor = "rgb(255, 206, 114)"
    askQuestionTitle.style.color = "rgb(0, 0, 0, 1)";
    talking = false;

    const response = text.innerHTML;
    loading.style.display = "block";
    getMessage();
});


