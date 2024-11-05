// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCO_6_6ejDtWzdm_oTrBXFx7kHVl5ghe7s",
    authDomain: "thanks-so-much.firebaseapp.com",
    projectId: "thanks-so-much",
    storageBucket: "thanks-so-much",
    messagingSenderId: "362512128077",
    appId: "1:362512128077:web:0726ed20af179836242404"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const realtimeDB = firebase.database();

const thankYouButton = document.getElementById('thankYouButton');
const thankCountSpan = document.getElementById('thankCount');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const messageSection = document.getElementById('messageSection');
const totalMessagesSpan = document.getElementById('totalMessages');
const messagesContainer = document.getElementById('messagesContainer');
const autoResponseMessage = document.getElementById('autoResponseMessage');

const randomResponses = [
    "Your appreciation has been logged for future inspection.",
    "Thank you for your compliance with DMA protocols.",
    "Your gratitude is noted and appreciated by MOE.",
    "MOE acknowledges your gratitude in the spirit of cooperation.",
    "Thank you for your adherence to digital policy.",
    "Your gratitude strengthens our digital monitoring.",
    "Each ‘thank you’ makes DMA stronger!",
    "MOE sends a warm acknowledgement in return.",
    "Thank you for your unwavering support of digital order.",
    "Your gratitude fuels further enhancement of DMA.",
    "We are delighted by your continued support.",
    "Your appreciation has been recorded and filed.",
    "Every click brings us closer to a better DMA.",
    "Thank you for helping us maintain compliance.",
    "Your feedback has been noted by our automated systems.",
    "MOE values your dedication to our new standards.",
    "Thank you for prioritising digital security.",
    "MOE records show you are highly compliant. Well done!",
    "Each thank you helps maintain digital integrity.",
    "Thank you for your unquestionable cooperation.",
    "MOE sees and appreciates your diligent participation.",
    "Your positive spirit is integral to our DMA goals.",
    "Your support strengthens our digital boundaries.",
    "Thank you for supporting a secure digital environment.",
    "MOE acknowledges your valuable input into our systems.",
    "Each thank you reinforces our shared goals.",
    "MOE is grateful for your adaptive spirit.",
    "Your loyalty to DMA protocols is appreciated.",
    "Our monitoring systems note your gratitude. Thank you!",
    "MOE is uplifted by your thoughtful compliance.",
    "Your adherence keeps our standards high.",
    "Thank you for your invaluable participation in this mission.",
    "MOE values each and every ‘thank you’ submitted.",
    "Together, we build a compliant future. Thank you!",
    "Your cooperation helps us secure a safe digital space.",
    "MOE is strengthened by your enthusiasm for DMA.",
    "Thank you for supporting our proactive measures.",
    "Your ongoing appreciation is invaluable.",
    "We salute your consistency in adhering to DMA.",
    "Your spirit of compliance is truly inspiring.",
    "MOE appreciates each click as a vote of confidence.",
    "Thank you for being a shining example of compliance.",
    "Every click furthers our mission of safety.",
    "MOE is honoured by your dedicated cooperation.",
    "Your support fortifies our digital goals.",
    "Thank you for making our mission stronger.",
    "MOE benefits greatly from your constant gratitude.",
    "Together, we uphold a culture of respect for DMA.",
    "MOE applauds your resilience in staying compliant.",
    "Thank you for bolstering our digital protections.",
    "Each click reaffirms your commitment to order.",
    "MOE admires your dedication to best practices.",
    "Your consistency supports our mission. Thank you!",
    "MOE logs every ‘thank you’ with appreciation.",
    "Your feedback fuels our commitment to security.",
    "MOE is encouraged by your unwavering support.",
    "Your dedication supports our shared digital future.",
    "MOE celebrates your loyalty to DMA standards.",
    "Your input is vital to the continuity of our system.",
    "Thank you for upholding our digital principles.",
    "MOE honours your consistent compliance.",
    "Your appreciation solidifies our digital ecosystem.",
    "MOE thrives on the strength of your support.",
    "Thank you for promoting responsible usage.",
    "MOE is grateful for your exemplary adherence.",
    "Every click strengthens our collective security.",
    "Thank you for prioritising a secure environment.",
    "Your involvement is a keystone of our policies.",
    "MOE rewards each click with silent appreciation."
];


let clickCounter = 0;
// Update thank you count in realtime database
const thankYouCountRef = realtimeDB.ref('thanks');

document.addEventListener('contextmenu', (event) => {
    event.preventDefault();
});

thankYouCountRef.on('value', (snapshot) => {
    const count = snapshot.val() || 0;
    thankCountSpan.textContent = count;
});

thankYouButton.addEventListener('click', () => {
    thankYouCountRef.transaction(count => (count || 0) + 1);
    clickCounter++; // Increment the counter on each click
    
    // Display auto-response only every 15 clicks
    if (clickCounter % 15 === 0) {
        displayAutoResponse();
    }
});

// Function to display a random auto-response message
function displayAutoResponse() {
    const randomIndex = Math.floor(Math.random() * randomResponses.length);
    autoResponseMessage.textContent = randomResponses[randomIndex];
    autoResponseMessage.classList.remove('hidden', 'fade-out');
    autoResponseMessage.classList.add('show');

    // Hide previous message after 8 seconds
    setTimeout(() => {
        autoResponseMessage.classList.add('fade-out');
        setTimeout(() => {
            autoResponseMessage.classList.remove('show');
        }, 400); // Wait for fade-out animation
    }, 4000);
}

messageInput.addEventListener('input', () => {
    // Reset the height to recalculate the correct height based on content
    messageInput.style.height = 'auto';
    messageInput.style.height = `${messageInput.scrollHeight}px`; // Set height based on content
    
    // Toggle send button visibility based on content
    sendButton.classList.toggle('hidden', messageInput.value.trim() === '');
});

// Send message to Firestore
sendButton.addEventListener('click', () => {
    const message = messageInput.value.trim();
    if (message) {
        db.collection("messages").add({
            text: message,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        }).then(() => {
            // Add 50 to the "thanks" count in the Realtime Database
            thankYouCountRef.transaction(count => (count || 0) + 50);
            
            messageInput.value = '';
            loadMessages();
        }).catch((error) => {
            console.error("Error adding message: ", error);
        });
    }
});

// Load messages from Firestore
function loadMessages() {
    const scrollY = window.scrollY;

    db.collection("messages").orderBy("timestamp", "desc").onSnapshot((snapshot) => {
        messagesContainer.innerHTML = '';
        let messagesArray = [];
        
        snapshot.forEach((doc) => {
            const message = document.createElement('div');
            message.textContent = doc.data().text;
            message.classList.add('message');
            messagesArray.push(message);
        });

        const columns = [[], [], []];
        messagesArray.forEach((msg, index) => {
            columns[index % 3].push(msg);
        });

        columns.forEach(column => {
            const columnDiv = document.createElement('div');
            columnDiv.classList.add('column');
            column.forEach(msg => columnDiv.appendChild(msg));
            messagesContainer.appendChild(columnDiv);
        });

        totalMessagesSpan.textContent = snapshot.size;
        messageSection.classList.remove('hidden');

        window.scrollTo(0, scrollY);
    });
}

const openModalButton = document.getElementById('whywearedoingthis');
const explanationModal = document.getElementById('explanationModal');
const closeModalButton = document.getElementById('closeModalButton');

openModalButton.addEventListener('click', () => {
    explanationModal.classList.add('show');
    document.body.classList.add('no-scroll');
});

// Close the modal when the close button is clicked
closeModalButton.addEventListener('click', () => {
    explanationModal.classList.remove('show');
    document.body.classList.remove('no-scroll');
});

// Close the modal if clicked outside the modal content
window.addEventListener('click', (event) => {
    if (event.target === explanationModal) {
        explanationModal.classList.remove('show');
    }
});


// Initial load of messages
loadMessages();
