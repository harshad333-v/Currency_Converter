from flask import Flask, render_template, request
import requests
import os


app = Flask(__name__)

@app.route("/", methods=["GET","POST"])
def index():

    result = None
    rate = None
    error = None
    from_currency = "USD"
    to_currency = "INR"

    # Fetch currency data
    url = "https://open.er-api.com/v6/latest/USD"
    response = requests.get(url)
    data = response.json()

    rates = data["rates"]

    # full currency list
    currency_list = sorted(rates.keys())

    # top currencies for dashboard
    top_rates = {
        "EUR": rates["EUR"],
        "INR": rates["INR"],
        "JPY": rates["JPY"],
        "AUD": rates["AUD"]
    }

    if request.method == "POST":

        amount_raw = request.form.get("amount", "").strip()
        from_currency = request.form.get("from_currency", from_currency)
        to_currency = request.form.get("to_currency", to_currency)

        if not amount_raw:
            error = "Please enter an amount to convert."
        else:
            try:
                amount = float(amount_raw)

                url = f"https://open.er-api.com/v6/latest/{from_currency}"
                data = requests.get(url).json()

                rates_data = data.get("rates", {})
                rate = rates_data.get(to_currency)

                if rate is None:
                    error = "Selected currency pair is not available."
                else:
                    result = round(amount * rate, 2)
            except ValueError:
                error = "Amount must be a number."
            except requests.RequestException:
                error = "Failed to fetch latest exchange rates. Please try again."

    return render_template(
        "index.html",
        result=result,
        rate=rate,
        currency_list=currency_list,
        from_currency=from_currency,
        to_currency=to_currency,
        top_rates=top_rates,
        error=error
    )

if __name__ == "__main__":
    app.run(debug=True)
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)






