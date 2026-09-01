(function () {
  "use strict";

  var form = document.querySelector("[data-contact-form]");
  if (!form) return;

  var CONTACT_ENDPOINT = "https://a1bracket-contact.travisjterry.workers.dev/";

  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  var nameInput = form.querySelector("#name");
  var emailInput = form.querySelector("#email");
  var messageInput = form.querySelector("#message");
  var nameError = form.querySelector("[data-name-error]");
  var emailError = form.querySelector("[data-email-error]");
  var messageError = form.querySelector("[data-message-error]");

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

  function showFieldError(input, errorEl, message) {
    errorEl.textContent = message;
    errorEl.classList.add("is-visible");
    input.setAttribute("aria-invalid", "true");
  }

  function clearFieldError(input, errorEl) {
    errorEl.classList.remove("is-visible");
    input.removeAttribute("aria-invalid");
  }

  function validateName() {
    if (!nameInput.value.trim()) {
      showFieldError(nameInput, nameError, "Please enter your name.");
      return false;
    }
    clearFieldError(nameInput, nameError);
    return true;
  }

  function validateEmail() {
    var value = emailInput.value.trim();
    if (!value) {
      showFieldError(emailInput, emailError, "Please enter your email.");
      return false;
    }
    if (!EMAIL_RE.test(value)) {
      showFieldError(emailInput, emailError, "That doesn't look like a valid email — check for a typo.");
      return false;
    }
    clearFieldError(emailInput, emailError);
    return true;
  }

  function validateMessage() {
    if (!messageInput.value.trim()) {
      showFieldError(messageInput, messageError, "Please enter a message.");
      return false;
    }
    clearFieldError(messageInput, messageError);
    return true;
  }

  // Validate on blur so mistakes surface as soon as the visitor leaves a field,
  // and re-validate on input once a field has already been flagged so the
  // error clears the moment it's fixed instead of lingering until submit.
  nameInput.addEventListener("blur", validateName);
  emailInput.addEventListener("blur", validateEmail);
  messageInput.addEventListener("blur", validateMessage);
  nameInput.addEventListener("input", function () {
    if (nameError.classList.contains("is-visible")) validateName();
  });
  emailInput.addEventListener("input", function () {
    if (emailError.classList.contains("is-visible")) validateEmail();
  });
  messageInput.addEventListener("input", function () {
    if (messageError.classList.contains("is-visible")) validateMessage();
  });

  newCaptcha();

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    captchaError.classList.remove("is-visible");
    hideStatus();

    var nameOk = validateName();
    var emailOk = validateEmail();
    var messageOk = validateMessage();

    if (!nameOk || !emailOk || !messageOk) {
      (!nameOk ? nameInput : !emailOk ? emailInput : messageInput).focus();
      return;
    }

    if (parseInt(answerInput.value, 10) !== expected) {
      captchaError.textContent = "That's not quite right — try again.";
      captchaError.classList.add("is-visible");
      newCaptcha();
      return;
    }

    var data = {
      name: nameInput.value.trim(),
      email: emailInput.value.trim(),
      phone: form.phone.value.trim(),
      message: messageInput.value.trim(),
      company: form.company.value // honeypot: real visitors leave this blank
    };

    submitBtn.disabled = true;
    submitBtn.textContent = "Sending…";

    fetch(CONTACT_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    })
      .then(function (res) {
        return res
          .json()
          .catch(function () {
            return {};
          })
          .then(function (body) {
            if (!res.ok) {
              var err = new Error(body.error || "Request failed");
              err.isValidationError = res.status >= 400 && res.status < 500;
              throw err;
            }
            return body;
          });
      })
      .then(function () {
        showStatus("success", "Thanks — we will be in touch within one business day.");
        form.reset();
        newCaptcha();
      })
      .catch(function (err) {
        // A 4xx means the server rejected something about the submission itself
        // (should be rare now that we validate client-side first) — surface that
        // instead of blaming it on a generic send failure. Anything else (network
        // error, 5xx from the Worker/Resend) is a real delivery failure.
        if (err && err.isValidationError) {
          showStatus("error", err.message + " Please fix that and try again.");
        } else {
          showStatus("error", "Something went wrong sending your message. Please call 215-295-9561 or email info@a-1bracket.com directly.");
        }
      })
      .finally(function () {
        submitBtn.disabled = false;
        submitBtn.textContent = "Send message";
      });
  });
})();
