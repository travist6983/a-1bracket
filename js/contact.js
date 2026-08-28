(function () {
  "use strict";

  var form = document.querySelector("[data-contact-form]");
  if (!form) return;

  // TODO: replace with your deployed Cloudflare Worker URL (see worker/README.md)
  var CONTACT_ENDPOINT = "https://REPLACE-ME.workers.dev";

  var questionEl = form.querySelector("[data-captcha-question]");
  var answerInput = form.querySelector("[data-captcha-answer]");
  var captchaError = form.querySelector("[data-captcha-error]");
  var statusEl = form.querySelector("[data-form-status]");
  var submitBtn = form.querySelector("[data-submit-btn]");
  var expected = 0;

  function newCaptcha() {
    var a = Math.floor(Math.random() * 12) + 1;
    var b = Math.floor(Math.random() * 12) + 1;
    expected = a + b;
    questionEl.textContent = a + " + " + b + " =";
    answerInput.value = "";
  }

  function showStatus(kind, message) {
    statusEl.textContent = message;
    statusEl.className = "form-status is-visible is-" + kind;
  }

  function hideStatus() {
    statusEl.classList.remove("is-visible", "is-success", "is-error");
  }

  newCaptcha();

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    captchaError.classList.remove("is-visible");
    hideStatus();

    if (parseInt(answerInput.value, 10) !== expected) {
      captchaError.textContent = "That's not quite right — try again.";
      captchaError.classList.add("is-visible");
      newCaptcha();
      return;
    }

    var data = {
      name: form.name.value.trim(),
      email: form.email.value.trim(),
      phone: form.phone.value.trim(),
      message: form.message.value.trim(),
      company: form.company.value // honeypot: real visitors leave this blank
    };

    if (!data.name || !data.email || !data.message) {
      showStatus("error", "Please fill in your name, email, and message.");
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Sending…";

    fetch(CONTACT_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    })
      .then(function (res) {
        if (!res.ok) throw new Error("Request failed");
        return res.json();
      })
      .then(function () {
        showStatus("success", "Thanks — we will be in touch within one business day.");
        form.reset();
        newCaptcha();
      })
      .catch(function () {
        showStatus("error", "Something went wrong sending your message. Please call 215-295-9561 or email info@a-1bracket.com directly.");
      })
      .finally(function () {
        submitBtn.disabled = false;
        submitBtn.textContent = "Send message";
      });
  });
})();
