/* ============================================================
   Currency Converter – Main JavaScript
   ============================================================ */

// ── Currency → ISO-3166-1 alpha-2 country code mapping ────────
// Used to build flag URLs via flagcdn.com
const CURRENCY_FLAGS = {
  AED: "ae", AFN: "af", ALL: "al", AMD: "am", ANG: "cw",
  AOA: "ao", ARS: "ar", AUD: "au", AWG: "aw", AZN: "az",
  BAM: "ba", BBD: "bb", BDT: "bd", BGN: "bg", BHD: "bh",
  BMD: "bm", BND: "bn", BOB: "bo", BRL: "br", BSD: "bs",
  BTN: "bt", BWP: "bw", BYN: "by", BZD: "bz", CAD: "ca",
  CDF: "cd", CHF: "ch", CLP: "cl", CNY: "cn", COP: "co",
  CRC: "cr", CUP: "cu", CVE: "cv", CZK: "cz", DJF: "dj",
  DKK: "dk", DOP: "do", DZD: "dz", EGP: "eg", ERN: "er",
  ETB: "et", EUR: "eu", FJD: "fj", FKP: "fk", GBP: "gb",
  GEL: "ge", GHS: "gh", GIP: "gi", GMD: "gm", GNF: "gn",
  GTQ: "gt", GYD: "gy", HKD: "hk", HNL: "hn", HRK: "hr",
  HTG: "ht", HUF: "hu", IDR: "id", ILS: "il", INR: "in",
  IQD: "iq", IRR: "ir", ISK: "is", JMD: "jm", JOD: "jo",
  JPY: "jp", KES: "ke", KGS: "kg", KHR: "kh", KMF: "km",
  KRW: "kr", KWD: "kw", KYD: "ky", KZT: "kz", LAK: "la",
  LBP: "lb", LKR: "lk", LRD: "lr", LSL: "ls", LYD: "ly",
  MAD: "ma", MDL: "md", MGA: "mg", MKD: "mk", MMK: "mm",
  MNT: "mn", MOP: "mo", MRU: "mr", MUR: "mu", MVR: "mv",
  MWK: "mw", MXN: "mx", MYR: "my", MZN: "mz", NAD: "na",
  NGN: "ng", NIO: "ni", NOK: "no", NPR: "np", NZD: "nz",
  OMR: "om", PAB: "pa", PEN: "pe", PGK: "pg", PHP: "ph",
  PKR: "pk", PLN: "pl", PYG: "py", QAR: "qa", RON: "ro",
  RSD: "rs", RUB: "ru", RWF: "rw", SAR: "sa", SBD: "sb",
  SCR: "sc", SDG: "sd", SEK: "se", SGD: "sg", SLL: "sl",
  SOS: "so", SRD: "sr", STN: "st", SVC: "sv", SYP: "sy",
  SZL: "sz", THB: "th", TJS: "tj", TMT: "tm", TND: "tn",
  TOP: "to", TRY: "tr", TTD: "tt", TWD: "tw", TZS: "tz",
  UAH: "ua", UGX: "ug", USD: "us", UYU: "uy", UZS: "uz",
  VES: "ve", VND: "vn", VUV: "vu", WST: "ws", XAF: "cm",
  XCD: "ag", XOF: "sn", XPF: "pf", YER: "ye", ZAR: "za",
  ZMW: "zm", ZWL: "zw"
};

/**
 * Returns the flagcdn.com image URL for a currency code, or null if unknown.
 * @param {string} currency  Three-letter currency code (e.g. "USD").
 * @param {string} size      Image size string (default "20x15").
 */
function getFlagUrl(currency, size) {
  const code = CURRENCY_FLAGS[currency];
  if (!code) return null;
  return "https://flagcdn.com/" + (size || "20x15") + "/" + code + ".png";
}

// ── Select2 option/selection template ─────────────────────────
function formatCurrencyOption(option) {
  if (!option.id) return option.text;
  const flagUrl = getFlagUrl(option.id);
  const img = flagUrl
    ? '<img src="' + flagUrl + '" class="select2-flag" alt="' + option.id + '" onerror="this.style.display=\'none\'">'
    : '<span style="display:inline-block;width:22px;"></span>';
  return $("<span>" + img + " " + option.id + "</span>");
}

// ── Document ready ─────────────────────────────────────────────
$(document).ready(function () {

  // ── 1. Select2 – initialise all currency dropdowns ──────────
  $(".currency-select").select2({
    templateResult:    formatCurrencyOption,
    templateSelection: formatCurrencyOption,
    width: "100%"
  });

  // ── 2. Dark Mode ─────────────────────────────────────────────
  const savedTheme = localStorage.getItem("theme") || "light";
  applyTheme(savedTheme);
  document.getElementById("darkModeToggle").checked = (savedTheme === "dark");

  document.getElementById("darkModeToggle").addEventListener("change", function () {
    const theme = this.checked ? "dark" : "light";
    applyTheme(theme);
    localStorage.setItem("theme", theme);
  });

  // ── 3. Swap Button ───────────────────────────────────────────
  document.getElementById("swapBtn").addEventListener("click", function () {
    const fromVal = $("#fromCurrency").val();
    const toVal   = $("#toCurrency").val();
    $("#fromCurrency").val(toVal).trigger("change");
    $("#toCurrency").val(fromVal).trigger("change");
  });

  // ── 4. Conversion History ────────────────────────────────────
  renderHistory();

  // If the page was returned with a fresh result, save it
  const convEl = document.getElementById("newConversion");
  if (convEl) {
    saveToHistory({
      amount: convEl.dataset.amount,
      from:   convEl.dataset.from,
      to:     convEl.dataset.to,
      result: convEl.dataset.result,
      ts:     new Date().toLocaleString()
    });
    renderHistory();
  }

  document.getElementById("clearHistoryBtn").addEventListener("click", function () {
    localStorage.removeItem("conversionHistory");
    renderHistory();
  });

  // ── 5. Inject flags into result section ──────────────────────
  document.querySelectorAll(".result-flag").forEach(function (el) {
    const flagUrl = getFlagUrl(el.dataset.currency, "24x18");
    if (flagUrl) {
      const img = document.createElement("img");
      img.src       = flagUrl;
      img.className = "flag-img";
      img.alt       = el.dataset.currency;
      img.onerror   = function () { this.style.display = "none"; };
      el.appendChild(img);
    }
  });

  // ── 6. Inject flags into live-rate cards ─────────────────────
  document.querySelectorAll(".rate-card").forEach(function (card) {
    const flagUrl = getFlagUrl(card.dataset.currency, "24x18");
    const flagDiv = card.querySelector(".rate-flag");
    if (flagDiv && flagUrl) {
      const img = document.createElement("img");
      img.src     = flagUrl;
      img.alt     = card.dataset.currency;
      img.onerror = function () { this.style.display = "none"; };
      flagDiv.appendChild(img);
    }
  });

  // ── 7. Trip Calculator ───────────────────────────────────────
  document.getElementById("calcTripBtn").addEventListener("click", calculateTrip);

  // ── 8. Auto-refresh live rates every 60 seconds ──────────────
  refreshRates(); // first run immediately
  setInterval(refreshRates, 60000);
});

// ── Dark Mode ──────────────────────────────────────────────────
function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
}

// ── Conversion History helpers ─────────────────────────────────
function getHistory() {
  try {
    return JSON.parse(localStorage.getItem("conversionHistory") || "[]");
  } catch (_) {
    return [];
  }
}

function saveToHistory(entry) {
  let history = getHistory();
  history.unshift(entry);
  history = history.slice(0, 5); // keep the last 5 conversions
  localStorage.setItem("conversionHistory", JSON.stringify(history));
}

function renderHistory() {
  const history   = getHistory();
  const container = document.getElementById("historyContainer");
  const noMsg     = document.getElementById("noHistoryMsg");

  // Remove any previously rendered table
  const existing = container.querySelector(".history-table-wrap");
  if (existing) existing.remove();

  if (history.length === 0) {
    noMsg.style.display = "";
    return;
  }
  noMsg.style.display = "none";

  const rows = history.map(function (h, i) {
    const fromFlag = getFlagUrl(h.from, "16x12");
    const toFlag   = getFlagUrl(h.to,   "16x12");
    const fromImg  = fromFlag ? '<img src="' + fromFlag + '" class="me-1" onerror="this.style.display=\'none\'">' : "";
    const toImg    = toFlag   ? '<img src="' + toFlag   + '" class="me-1" onerror="this.style.display=\'none\'">' : "";
    return (
      "<tr>" +
      "<td class=\"text-muted small\">#" + (i + 1) + "</td>" +
      "<td>" + fromImg + "<strong>" + h.amount + "</strong> " + h.from + "</td>" +
      "<td><i class=\"bi bi-arrow-right text-success\"></i></td>" +
      "<td>" + toImg + "<strong>" + h.result + "</strong> " + h.to + "</td>" +
      "<td class=\"text-muted small d-none d-sm-table-cell\">" + h.ts + "</td>" +
      "</tr>"
    );
  }).join("");

  const wrap = document.createElement("div");
  wrap.className = "table-responsive history-table-wrap";
  wrap.innerHTML =
    '<table class="table table-sm table-hover align-middle mb-0">' +
      "<thead>" +
        "<tr>" +
          "<th>#</th>" +
          "<th>From</th>" +
          "<th></th>" +
          "<th>To</th>" +
          "<th class=\"d-none d-sm-table-cell\">Time</th>" +
        "</tr>" +
      "</thead>" +
      "<tbody>" + rows + "</tbody>" +
    "</table>";
  container.appendChild(wrap);
}

// ── Trip Expense Calculator ────────────────────────────────────
async function calculateTrip() {
  const hotel     = parseFloat(document.getElementById("hotelExpense").value)     || 0;
  const food      = parseFloat(document.getElementById("foodExpense").value)      || 0;
  const transport = parseFloat(document.getElementById("transportExpense").value) || 0;
  const shopping  = parseFloat(document.getElementById("shoppingExpense").value)  || 0;
  const total     = hotel + food + transport + shopping;

  const tripError  = document.getElementById("tripError");
  const tripErrMsg = document.getElementById("tripErrorMsg");
  const tripResult = document.getElementById("tripResult");

  tripError.style.display  = "none";
  tripResult.style.display = "none";

  if (total <= 0) {
    tripErrMsg.textContent  = "Please enter at least one expense amount.";
    tripError.style.display = "";
    return;
  }

  const from = $("#tripFrom").val();
  const to   = $("#tripTo").val();
  const btn  = document.getElementById("calcTripBtn");

  btn.disabled  = true;
  btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Calculating…';

  try {
    const res  = await fetch("/api/convert?amount=" + total + "&from=" + from + "&to=" + to);
    const data = await res.json();

    if (data.error) {
      tripErrMsg.textContent  = data.error;
      tripError.style.display = "";
    } else {
      document.getElementById("hotelDisplay").textContent     = hotel     ? hotel     + " " + from : "—";
      document.getElementById("foodDisplay").textContent      = food      ? food      + " " + from : "—";
      document.getElementById("transportDisplay").textContent = transport ? transport + " " + from : "—";
      document.getElementById("shoppingDisplay").textContent  = shopping  ? shopping  + " " + from : "—";
      document.getElementById("tripTotalOrig").textContent    = total + " " + from;
      document.getElementById("tripConverted").textContent    = data.result + " " + to;
      tripResult.style.display = "";
    }
  } catch (_) {
    tripErrMsg.textContent  = "Unable to calculate. Please check your internet connection and try again.";
    tripError.style.display = "";
  } finally {
    btn.disabled  = false;
    btn.innerHTML = '<i class="bi bi-calculator me-2"></i>Calculate Total';
  }
}

// ── Auto-refresh live rates ────────────────────────────────────
async function refreshRates() {
  try {
    const res  = await fetch("/api/rates?base=USD");
    const data = await res.json();
    if (data.error) return; // silent failure – rates stay as server-rendered values

    document.querySelectorAll(".rate-card").forEach(function (card) {
      const currency = card.dataset.currency;
      if (data.rates[currency] !== undefined) {
        const valueEl = card.querySelector(".rate-value");
        if (valueEl) valueEl.textContent = data.rates[currency];
      }
    });

    const updEl = document.getElementById("ratesLastUpdated");
    if (updEl) {
      updEl.innerHTML = '<i class="bi bi-check-circle-fill text-success me-1"></i>Updated: ' + new Date().toLocaleTimeString();
    }
  } catch (_) {
    // silent failure – do not alarm the user for a background refresh
  }
}