/* Bridgework onboarding prototype — no authentication or data storage is used. */

document.addEventListener("DOMContentLoaded", () => {
  const screens = [...document.querySelectorAll("[data-screen]")];
  const indicators = [...document.querySelectorAll("[data-step-indicator]")];
  const profileFields = document.querySelector("#dynamic-profile-fields");
  const currentYear = document.querySelector("#current-year");
  const characterCount = document.querySelector("#character-count");
  const lookingFor = document.querySelector("#looking-for");

  const state = {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    role: "",
    profile: {},
    location: "",
    lookingFor: ""
  };

  const roleProfiles = {
    Professional: {
      intro: "Show the kind of work you do and the connections that will help you grow.",
      fields: [
        { id: "headline", label: "Professional headline", type: "text", placeholder: "e.g. Product leader in fintech" },
        { id: "industry", label: "Industry", type: "select", options: ["Select an industry", "Technology", "Finance", "Marketing", "Healthcare", "Real estate", "Other"] }
      ]
    },
    "Business Owner": {
      intro: "Tell future partners a little about your business and your next priority.",
      fields: [
        { id: "businessName", label: "Business name", type: "text", placeholder: "e.g. Northstar Studios" },
        { id: "businessStage", label: "Business stage", type: "select", options: ["Select a stage", "Just starting", "Growing team", "Established business", "Scaling up"] }
      ]
    },
    Freelancer: {
      intro: "Help prospective clients quickly understand the value you bring.",
      fields: [
        { id: "specialty", label: "Primary specialty", type: "text", placeholder: "e.g. Brand and web design" },
        { id: "availability", label: "Current availability", type: "select", options: ["Select availability", "Available now", "Available this month", "Booking ahead", "Not currently available"] }
      ]
    },
    "Lead Generator": {
      intro: "Tell us where you have strong relationships and how you make introductions.",
      fields: [
        { id: "networkFocus", label: "Your network focus", type: "text", placeholder: "e.g. B2B SaaS founders in India" },
        { id: "connectionStyle", label: "Preferred connection style", type: "select", options: ["Select a style", "Warm introductions", "Events and communities", "Outbound referrals", "Partnerships"] }
      ]
    }
  };

  currentYear.textContent = new Date().getFullYear();

  function showScreen(name) {
    screens.forEach((screen) => {
      const show = screen.dataset.screen === name;
      screen.hidden = !show;
      screen.classList.toggle("is-visible", show);
    });

    const order = ["login", "role", "profile", "review"];
    const activeIndex = order.indexOf(name);
    indicators.forEach((indicator, index) => {
      indicator.classList.toggle("is-active", index === activeIndex);
      indicator.classList.toggle("is-complete", activeIndex > index || name === "success");
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
    const heading = document.querySelector(`[data-screen="${name}"] h2`);
    if (heading) heading.setAttribute("tabindex", "-1"), heading.focus({ preventScroll: true });
  }

  function setError(id, message = "") {
    document.querySelector(id).textContent = message;
  }

  function createProfileFields(role) {
    const definition = roleProfiles[role];
    document.querySelector("#profile-intro").textContent = definition.intro;
    profileFields.innerHTML = definition.fields.map((field) => {
      const saved = state.profile[field.id] || "";
      if (field.type === "select") {
        const options = field.options.map((option, index) =>
          `<option value="${option}" ${saved === option ? "selected" : ""} ${index === 0 ? "disabled" : ""}>${option}</option>`
        ).join("");
        return `<label class="field"><span>${field.label}</span><select id="${field.id}" name="${field.id}" required>${options}</select></label>`;
      }
      return `<label class="field"><span>${field.label}</span><input id="${field.id}" name="${field.id}" type="text" value="${saved.replace(/"/g, "&quot;")}" placeholder="${field.placeholder}" required /></label>`;
    }).join("");
  }

  function saveProfile() {
    const formData = new FormData(document.querySelector("#profile-form"));
    const definition = roleProfiles[state.role];
    state.profile = {};
    definition.fields.forEach((field) => { state.profile[field.id] = String(formData.get(field.id) || "").trim(); });
    state.location = String(formData.get("location") || "").trim();
    state.lookingFor = String(formData.get("lookingFor") || "").trim();
  }

  function validateProfile() {
    const definition = roleProfiles[state.role];
    const missing = definition.fields.some((field) => !String(document.querySelector(`#${field.id}`).value || "").trim()) ||
      !document.querySelector("#location").value.trim() || !lookingFor.value.trim();
    if (missing) {
      setError("#profile-error", "Please complete each profile field before continuing.");
      return false;
    }
    setError("#profile-error");
    return true;
  }

  function renderReview() {
    const name = `${state.firstName} ${state.lastName}`.trim();
    document.querySelector("#review-name").textContent = name;
    document.querySelector("#review-role").textContent = state.role;
    document.querySelector("#profile-initials").textContent = `${state.firstName[0] || ""}${state.lastName[0] || ""}`.toUpperCase() || "BW";

    const definition = roleProfiles[state.role];
    const details = [
      ["Email", state.email],
      ...definition.fields.map((field) => [field.label, state.profile[field.id]]),
      ["Location", state.location],
      ["Looking for", state.lookingFor]
    ];
    document.querySelector("#review-list").innerHTML = details.map(([label, value]) => `<dt>${label}</dt><dd>${value}</dd>`).join("");
  }

  document.querySelector("#login-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const code = document.querySelector("#access-code").value.trim();
    if (!form.checkValidity()) {
      setError("#login-error", "Please enter your name and a valid work email.");
      form.reportValidity();
      return;
    }
    if (!/^\d{4,8}$/.test(code)) {
      setError("#login-error", "For this demo, use any 4–8 digit access code.");
      document.querySelector("#access-code").focus();
      return;
    }
    const formData = new FormData(form);
    state.firstName = String(formData.get("firstName")).trim();
    state.lastName = String(formData.get("lastName")).trim();
    state.email = String(formData.get("email")).trim();
    state.phone = String(formData.get("phone")).trim();
    setError("#login-error");
    showScreen("role");
  });

  document.querySelector("#role-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const selected = document.querySelector('input[name="role"]:checked');
    if (!selected) {
      setError("#role-error", "Please choose the role that fits you best.");
      return;
    }
    state.role = selected.value;
    setError("#role-error");
    createProfileFields(state.role);
    document.querySelector("#location").value = state.location;
    lookingFor.value = state.lookingFor;
    characterCount.textContent = lookingFor.value.length;
    showScreen("profile");
  });

  document.querySelector("#profile-form").addEventListener("submit", (event) => {
    event.preventDefault();
    if (!validateProfile()) return;
    saveProfile();
    renderReview();
    showScreen("review");
  });

  document.querySelector("#finish-button").addEventListener("click", () => {
    if (!document.querySelector("#consent").checked) {
      setError("#review-error", "Please confirm the respectful-use agreement to create your demo profile.");
      return;
    }
    setError("#review-error");
    document.querySelector("#success-name").textContent = state.firstName || "there";
    showScreen("success");
  });

  document.querySelectorAll("[data-back]").forEach((button) => {
    button.addEventListener("click", () => {
      const destination = button.dataset.back;
      if (destination === "profile") saveProfile();
      showScreen(destination);
    });
  });

  lookingFor.addEventListener("input", () => { characterCount.textContent = lookingFor.value.length; });
  document.querySelector("#access-code").addEventListener("input", (event) => { event.target.value = event.target.value.replace(/\D/g, ""); });
  document.querySelector("#explore-button").addEventListener("click", () => alert("Demo complete! In a live product, this would open your connection feed."));
  document.querySelector("#restart-button").addEventListener("click", () => window.location.reload());
});
