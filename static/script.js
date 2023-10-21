let conversation_history = [{ role: "system", content: "" }];

// Function to fetch the initial message from the bot
async function getInitialMessage() {
    const response = await fetch('/initial_message');
    const responseData = await response.json();

    const chatBox = document.getElementById('chat-box');
    const botMessageDiv = document.createElement('div');
    botMessageDiv.className = 'message bot';
    botMessageDiv.textContent = responseData.response;
    chatBox.appendChild(botMessageDiv);

    // Add assistant's initial message to the conversation history
    conversation_history.push({ role: "assistant", content: responseData.response });

    // Auto-scroll to the bottom
    chatBox.scrollTop = chatBox.scrollHeight;
}

// Function to send the user's message and get the bot's response
async function sendMessage() {
    const userInput = document.getElementById('user-input').value;
    document.getElementById('user-input').value = '';  // Clear the input field

    // Append user message to chat box
    const chatBox = document.getElementById('chat-box');
    const userMessageDiv = document.createElement('div');
    userMessageDiv.className = 'message user';
    userMessageDiv.textContent = userInput;
    chatBox.appendChild(userMessageDiv);

    // Add user's message to the conversation history
    conversation_history.push({ role: "user", content: userInput });

    // Send user input to server and get response
    const response = await fetch('/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: userInput, conversation_history })
    });

    const responseData = await response.json();

    // Add assistant's reply to the conversation history
    conversation_history.push({ role: "assistant", content: responseData.response });

    // Append bot response to chat box with typing effect
    const botMessageDiv = document.createElement('div');
    botMessageDiv.className = 'message bot';
    chatBox.appendChild(botMessageDiv);
    typeMessage(responseData.response, botMessageDiv);

    // Auto-scroll to the bottom
    chatBox.scrollTop = chatBox.scrollHeight;
}

// Function to simulate typing effect for bot's response
function typeMessage(message, element) {
    let i = 0;
    const typingInterval = setInterval(() => {
        if (i < message.length) {
            element.textContent += message.charAt(i);
            i++;
        } else {
            clearInterval(typingInterval);
        }
    }, 20);  // Adjust this value to change typing speed
}

// Function to handle the Enter key press in the input field
document.getElementById('user-input').addEventListener('keydown', function(event) {
    if (event.key === 'Enter' || event.keyCode === 13) {
        event.preventDefault();  // Prevent the default action (newline in the input field)
        sendMessage();
    }
});

// Call the function when the page loads
window.onload = getInitialMessage;
