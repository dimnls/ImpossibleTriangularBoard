import openai
from flask import Flask, request, jsonify, render_template
import os

app = Flask(__name__, static_folder="static")

# Replace with your OpenAI API key
openai.api_key = os.environ['openaikey']

# Load the initial system message from the text file
with open('personality.txt', 'r') as file:
    initial_system_message = file.read()

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/initial_message', methods=['GET'])
def get_initial_message():
    return jsonify({'response': initial_system_message})


# Initialize the conversation history with the initial system message
conversation_history = [{"role": "system", "content": initial_system_message}]


@app.route('/generate', methods=['POST'])
def generate_response():
    user_input = request.json.get('input', '')
    conversation_history = request.json.get('conversation_history', [])
    # Add user's message to the conversation history
    conversation_history.append({"role": "user", "content": user_input})

    # Prepare the prompt for OpenAI
    prompt = [{'role':'system', 'content': initial_system_message}]
    prompt.extend(conversation_history)

    try:
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",  # Change this to your desired model
            messages=prompt
        )
        generated_text = response['choices'][0]['message']['content']
        # Add assistant's reply to the conversation history
        conversation_history.append({"role": "assistant", "content": generated_text})
        return jsonify({'response': generated_text, 'conversation_history': conversation_history})
    except Exception as e:
        return jsonify({'error': str(e)}), 500



if __name__ == '__main__':
  app.run(debug=True, host='0.0.0.0')
