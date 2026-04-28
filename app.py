from flask import Flask, render_template, request, jsonify
import requests
import os

app = Flask(__name__)

# Exchange Rate API base URL
API_BASE = "https://open.er-api.com/v6/latest"

# Top currencies shown in the live rate cards
TOP_CURRENCIES = ["EUR", "USD", "JPY", "AUD", "GBP", "CAD", "CHF", "CNY"]


def fetch_rates(base="USD"):
    """Fetch exchange rates from the Exchange Rate API.

    Returns a tuple (rates_dict, error_string).
    On success, error_string is None.  On failure, rates_dict is empty.
    """
    try:
        response = requests.get(f"{API_BASE}/{base}", timeout=10)
        response.raise_for_status()
        data = response.json()
        if data.get("result") == "success":
            return data.get("rates", {}), None
        return {}, "API returned an unexpected response. Please try again later."
    except requests.Timeout:
        return {}, "Request timed out. Please check your internet connection."
    except requests.ConnectionError:
        return {}, "Unable to fetch exchange rates. Please try again later."
    except requests.RequestException:
        return {}, "Unable to fetch exchange rates. Please try again later."


@app.route("/", methods=["GET", "POST"])
def index():
    """Main converter page — handles both the currency list and POST conversions."""
    result = None
    rate = None
    error = None
    from_currency = "USD"
    to_currency = "INR"
    amount = 1

    # Fetch base rates for building the currency list and live rate cards
    rates, fetch_error = fetch_rates("INR")

    if fetch_error:
        error = fetch_error
        currency_list = []
        top_rates = {}
    else:
        currency_list = sorted(rates.keys())
        top_rates = {c: rates[c] for c in TOP_CURRENCIES if c in rates}

    if request.method == "POST":
        amount_raw = request.form.get("amount", "").strip()
        from_currency = request.form.get("from_currency", "USD")
        to_currency = request.form.get("to_currency", "INR")

        if not amount_raw:
            error = "Please enter an amount to convert."
        else:
            try:
                amount = float(amount_raw)
                conv_rates, conv_error = fetch_rates(from_currency)

                if conv_error:
                    error = conv_error
                else:
                    rate = conv_rates.get(to_currency)
                    if rate is None:
                        error = "Selected currency pair is not available."
                    else:
                        result = round(amount * rate, 4)
            except ValueError:
                error = "Amount must be a valid number."

    return render_template(
        "index.html",
        result=result,
        rate=rate,
        currency_list=currency_list,
        from_currency=from_currency,
        to_currency=to_currency,
        top_rates=top_rates,
        error=error,
        amount=amount,
    )


@app.route("/api/rates")
def api_rates():
    """JSON endpoint — returns live top rates for client-side auto-refresh."""
    base = request.args.get("base", "USD").upper()
    rates, error = fetch_rates(base)
    if error:
        return jsonify({"error": error}), 503
    top_rates = {c: rates[c] for c in TOP_CURRENCIES if c in rates}
    return jsonify({"rates": top_rates, "base": base})


@app.route("/api/convert")
def api_convert():
    """JSON endpoint — used by the trip expense calculator for AJAX conversions."""
    try:
        amount = float(request.args.get("amount", 1))
    except ValueError:
        return jsonify({"error": "Invalid amount."}), 400

    from_currency = request.args.get("from", "USD").upper()
    to_currency = request.args.get("to", "INR").upper()

    rates, error = fetch_rates(from_currency)
    if error:
        return jsonify({"error": error}), 503

    rate = rates.get(to_currency)
    if rate is None:
        return jsonify({"error": "Currency pair not available."}), 400

    return jsonify({
        "result": round(amount * rate, 4),
        "rate": rate,
        "from": from_currency,
        "to": to_currency,
        "amount": amount,
    })


if __name__ == "__main__":
    port  = int(os.environ.get("PORT", 5000))
    debug = os.environ.get("FLASK_DEBUG", "0") == "1"
    app.run(host="0.0.0.0", port=port, debug=debug)






