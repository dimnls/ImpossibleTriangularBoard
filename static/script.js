let conversation_history = [{ role: "system", content: "" }];

async function getInitialMessage() {
    const response = await fetch('/initial_message');
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

    try {
        const response = await fetch('/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ input: userInput, conversation_history })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const responseData = await response.json();
        if (responseData && responseData.question) {
            typeQuestion(responseData.response);
        } else {
            console.error('Unexpected responseData structure:', responseData);
        }
    } catch (error) {
        console.error('Error sending message:', error);
    }
}

function typeQuestion(responseData) {
    const chatBox = document.getElementById('chat-box');
    const botMessageDiv = document.createElement('div');
    botMessageDiv.className = 'message bot';
    chatBox.appendChild(botMessageDiv);
    let i = 0;

    // Adjusting to the new structure of responseData
    const botResponse = responseData.response;

    if (botResponse && botResponse.question) {
        function typeCharacter() {
            if (i < botResponse.question.length) {
                botMessageDiv.textContent += botResponse.question.charAt(i);
                i++;
                setTimeout(typeCharacter, 20);  // Adjust this value to change the typing speed
            } else {
                if (botResponse.options && Array.isArray(botResponse.options)) {
                    botResponse.options.forEach(option => {
                        const key = Object.keys(option)[0];
                        const value = option[key];
                        const optionButton = document.createElement('button');
                        optionButton.textContent = value;
                        optionButton.className = 'option-button';
                        optionButton.onclick = () => sendOption(key);
                        chatBox.appendChild(optionButton);
                    });
                } else {
                    console.error('Unexpected botResponse structure:', botResponse);
                }
            }
        }
        typeCharacter();
    } else {
        console.error('Unexpected responseData structure:', responseData);
    }
}

async function sendOption(optionKey) {
    const optionText = optionKey;
    document.getElementById('user-input').value = optionText;  // Set the option text as user input
    sendMessage();  // Send the option text as a message
}

// Call the function when the page loads
window.onload = getInitialMessage;