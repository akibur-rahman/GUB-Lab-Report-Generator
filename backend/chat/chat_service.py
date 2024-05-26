import google.generativeai as genai
API_KEY = "AIzaSyD3zJ_ihXbUbwOmFEmAy0x8PKMeiGokl4Y"


genai.configure(api_key=API_KEY)

model = genai.GenerativeModel('gemini-pro')
chat = model.start_chat(history=[])

while True:
    user_input = input("You: ")
    if user_input == "exit":
        break
    response = chat.send_message(user_input)
    print('\n')
    print("Gemini: " + response.text)
    print('\n')
