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

// Update thank you count in realtime database
const thankYouCountRef = realtimeDB.ref('thanks');

document.addEventListener('contextmenu', (event) => {
    event.preventDefault();
});

thankYouCountRef.on('value', (snapshot) => {
    const count = snapshot.val() || 0;
    thankCountSpan.textContent = count;
});

// Thank MOE function
thankYouButton.addEventListener('click', () => {
    thankYouCountRef.transaction(count => (count || 0) + 1);
});

// Show send button when input has text
messageInput.addEventListener('input', () => {
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
    const scrollY = window.scrollY; // Store current scroll position

    db.collection("messages").orderBy("timestamp", "desc").onSnapshot((snapshot) => {
        messagesContainer.innerHTML = '';
        let messagesArray = [];
        
        snapshot.forEach((doc) => {
            const message = document.createElement('div');
            message.textContent = doc.data().text;
            message.classList.add('message');
            messagesArray.push(message);
        });

        // Group messages into three columns
        const columns = [[], [], []];
        messagesArray.forEach((msg, index) => {
            columns[index % 3].push(msg); // Place in the appropriate column
        });

        columns.forEach(column => {
            const columnDiv = document.createElement('div');
            columnDiv.classList.add('column');
            column.forEach(msg => columnDiv.appendChild(msg));
            messagesContainer.appendChild(columnDiv);
        });

        totalMessagesSpan.textContent = snapshot.size;
        messageSection.classList.remove('hidden');

        // Restore the scroll position
        window.scrollTo(0, scrollY); // Scroll back to the original position
    });
}

// Initial load of messages
loadMessages();
