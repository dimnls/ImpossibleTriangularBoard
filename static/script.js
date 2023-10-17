let conversation_history = [{ role: "system", content: "" }];
async function getInitialMessage() {
    const response = await fetch('/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: '', conversation_history })
    });

    const responseData = await response.json();

    const chatBox = document.getElementById('chat-box');
    const botMessageDiv = document.createElement('div');
    botMessageDiv.className = 'message bot';
    botMessageDiv.textContent = responseData.response;
    chatBox.appendChild(botMessageDiv);

    // Add assistant's initial message to the conversation history
    conversation_history.push({role: "assistant", content: responseData.response});
    // Auto-scroll to the bottom
    chatBox.scrollTop = chatBox.scrollHeight;
}
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
    conversation_history.push({role: "user", content: userInput});

    // Send user input to server and get response
    const response = await fetch('/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: userInput, conversation_history })
    });

    const responseData = await response.json();

    // Add assistant's reply to the conversation history
    conversation_history.push({role: "assistant", content: responseData.response});

    // Append bot response to chat box one character at a time
    const botMessageDiv = document.createElement('div');
    botMessageDiv.className = 'message bot';
    chatBox.appendChild(botMessageDiv);
    let i = 0;
    function typeCharacter() {
        if (i < responseData.response.length) {
            botMessageDiv.textContent += responseData.response.charAt(i);
            i++;
            setTimeout(typeCharacter, 20);  // Adjust this value to change the typing speed
        }
    }
    typeCharacter();
    // Auto-scroll to the bottom
    chatBox.scrollTop = chatBox.scrollHeight;
}

// Call the function when the page loads
window.onload = getInitialMessage;