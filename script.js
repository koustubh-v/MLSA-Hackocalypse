const socket = io('http://localhost:5000');  // Socket.IO connection

// Function to send broadcast message (Admin Only)
function sendBroadcast() {
    const token = localStorage.getItem('token'); // Retrieve token from localStorage
    const message = document.getElementById('broadcastInput').value.trim();

    if (message) {
        // Check if the user is admin
        fetch('http://localhost:5000/api/auth/checkAdmin', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.isAdmin) {
                // Emit broadcast message to all connected clients
                socket.emit('broadcastMessage', { token, message });
                document.getElementById('broadcastInput').value = "";  // Clear input field
            } else {
                alert("You do not have permission to send a broadcast message.");
            }
        })
        .catch(error => {
            console.error('Error checking admin:', error);
        });
    } else {
        alert("Please enter a message to broadcast.");
    }
}

// Function to send chat message
function sendChat() {
    const message = document.getElementById('chatInput').value.trim();

    if (message) {
        // Emit chat message to the server
        socket.emit('chatMessage', message);

        // Clear input field
        document.getElementById('chatInput').value = "";
    } else {
        alert("Please enter a chat message.");
    }
}

// Listen for broadcast messages and display them for all users
socket.on('broadcastMessage', (message) => {
    const broadcastArea = document.getElementById('broadcastArea');
    const newMessage = document.createElement('p');
    newMessage.textContent = `📢 ${message}`;
    broadcastArea.appendChild(newMessage);
});

// Listen for chat messages and display them
socket.on('chatMessage', (message) => {
    const chatArea = document.getElementById('chatArea');
    const newMessage = document.createElement('p');
    newMessage.textContent = `💬 ${message}`;
    chatArea.appendChild(newMessage);
});

// Handle server errors (e.g., unauthorized access)
socket.on('error', (data) => {
    alert(data.msg);
});

// Check if the user is an admin on page load to show the broadcast button
const token = localStorage.getItem('token');
if (token) {
    fetch('http://localhost:5000/api/auth/checkAdmin', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.isAdmin) {
            // Show broadcast input and send button for admins
            document.getElementById('broadcastInput').style.display = 'block';
            document.getElementById('sendBroadcastButton').style.display = 'inline-block';
        } else {
            // Hide the broadcast input and button for non-admins
            document.getElementById('broadcastInput').style.display = 'none';
            document.getElementById('sendBroadcastButton').style.display = 'none';
        }
    })
    .catch(error => {
        console.error('Error checking admin status:', error);
    });
}
