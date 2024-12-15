const socket = io('http://localhost:5000');  // Socket.IO connection

// Store chat messages in localStorage (persist chat on the page)
const chatArea = document.getElementById('chatArea');
const chatInput = document.getElementById('chatInput');

// Load messages from localStorage if available
window.onload = () => {
    const storedMessages = JSON.parse(localStorage.getItem('chatMessages')) || [];
    storedMessages.forEach(message => {
        const newMessage = document.createElement('p');
        newMessage.textContent = `💬 ${message}`;
        chatArea.appendChild(newMessage);
    });
};

// Function to send chat message
function sendChat() {
    const message = chatInput.value.trim();

    if (message) {
        // Emit chat message to the server
        socket.emit('chatMessage', message);

        // Store the message locally
        const storedMessages = JSON.parse(localStorage.getItem('chatMessages')) || [];
        storedMessages.push(message);
        localStorage.setItem('chatMessages', JSON.stringify(storedMessages));

        // Display the message on the page
        const newMessage = document.createElement('p');
        newMessage.textContent = `💬 ${message}`;
        chatArea.appendChild(newMessage);

        // Clear input field
        chatInput.value = '';
    } else {
        alert("Please enter a chat message.");
    }
}

// Listen for chat messages and display them
socket.on('chatMessage', (message) => {
    const newMessage = document.createElement('p');
    newMessage.textContent = `💬 ${message}`;
    chatArea.appendChild(newMessage);

    // Store new message in localStorage
    const storedMessages = JSON.parse(localStorage.getItem('chatMessages')) || [];
    storedMessages.push(message);
    localStorage.setItem('chatMessages', JSON.stringify(storedMessages));
});
