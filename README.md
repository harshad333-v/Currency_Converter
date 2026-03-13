💱 Currency Converter – Foreign Trip Expense Tool

A simple web-based currency converter built using Python (Flask) and HTML/CSS with Bootstrap.
The application converts currencies using real-time exchange rates from an API and displays live currency rate cards for popular currencies.

This project was developed as part of a Python course project to demonstrate API integration, backend development, and dynamic web interfaces.

🚀 Features

Convert between 160+ world currencies

Uses real-time exchange rates        

Clean Bootstrap UI

Dynamic currency dropdown list

Displays top currency exchange rates

Responsive layout

Simple and lightweight Flask backend

🖥️ Tech Stack
Frontend

HTML5

CSS3

Bootstrap 5

Bootstrap Icons

Backend

Python

Flask

API

Exchange Rate API
https://open.er-api.com

📂 Project Structure
currency-converter
│
├── app.py
├── requirements.txt
│
├── templates
│   └── index.html
│
├── static
│   └── style.css
│
└── README.md
⚙️ Installation & Setup
1️⃣ Clone the Repository
git clone https://github.com/harshad333-v/Currency_Converter.git
cd currency-converter
2️⃣ Create Virtual Environment (Recommended)
python -m venv venv

Activate it:

Windows

venv\Scripts\activate

Mac/Linux

source venv/bin/activate
3️⃣ Install Dependencies
pip install -r requirements.txt
4️⃣ Run the Application
python app.py

Open your browser and go to:

http://127.0.0.1:5000
📊 How It Works

User enters an amount and selects currencies.

Flask backend receives the form data.

The backend calls the Exchange Rate API.

The API returns real-time exchange rates.

Flask calculates the converted value.

The result is displayed on the webpage.

🌍 Example Conversion
Amount: 100
From: USD
To: INR

Result:
100 USD = 8300 INR (example rate)
🎯 Learning Outcomes

This project demonstrates:

Python web development using Flask

REST API integration

Dynamic templates using Jinja2

Frontend design using Bootstrap

Handling real-time financial data

🔮 Future Improvements

Possible upgrades for this project:

Currency search dropdown

Swap currency button

Historical exchange rate charts

Travel expense calculator

Auto-refresh live exchange rates

Country flags for currencies

📜 License

This project is created for educational purposes.
