
export default function Register() {

  const wrap = document.createElement("div");
  wrap.className = "w-full max-w-4xl card p-6 md:p-10 flex flex-col md:flex-row gap-6";

  /* LEFT SIDE */
  const left = document.createElement("div");
  left.className = "flex-1";
  left.innerHTML = `
    <h1 class="text-3xl md:text-4xl font-extrabold mb-2">
      <span id="typed" class="typing">Create Your Civix Account</span>
    </h1>
    <p class="text-gray-600 mb-6">Help us build a cleaner community.</p>
  `;

  /* FORM */
  const form = document.createElement("form");
  form.className = "grid gap-3";
  form.id = "regForm";
  form.innerHTML = `
    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">

      <div class="field">
        <label>Full Name *</label>
        <input id="full" required class="w-full border p-3 rounded input-glow" />
      </div>

      <div class="field">
        <label>Username *</label>
        <input id="user" required class="w-full border p-3 rounded input-glow" />
      </div>

      <div class="field">
        <label>Email *</label>
        <input id="email" type="email" required class="w-full border p-3 rounded input-glow" />
      </div>

      <div class="field">
        <label>Phone (optional)</label>
        <input id="phone" class="w-full border p-3 rounded input-glow" />
      </div>

      <div class="field relative md:col-span-2">
        <label>Password *</label>
        <input id="pass" type="password" required class="w-full border p-3 rounded input-glow" minlength="6" />
        <span id="eye1" class="eye-btn">👁</span>
      </div>

      <div class="field relative md:col-span-2">
        <label>Confirm Password *</label>
        <input id="confirmPass" type="password" required class="w-full border p-3 rounded input-glow" minlength="6" />
        <span id="eye2" class="eye-btn">👁</span>
      </div>

    </div>

    <div>
      <label>Choose Role *</label>
      <div class="flex gap-3 mt-1">
        <button type="button" data-role="User" class="role-btn bg-cyan-500 text-white">User</button>
        <button type="button" data-role="Volunteer" class="role-btn">Volunteer</button>
        <button type="button" data-role="Admin" class="role-btn">Admin</button>
      </div>
    </div>

    <button id="submitBtn" class="btn-primary mt-4 w-full">Register</button>
  `;

  left.appendChild(form);
  wrap.appendChild(left);

  /* RIGHT SIDE */
  const right = document.createElement("div");
  right.className =
    "w-full md:w-80 bg-cyan-50 rounded-xl flex flex-col items-center justify-center p-6 relative overflow-hidden";
  right.innerHTML = `
    <div class="absolute inset-0 bg-[url('/Register.png')] bg-cover opacity-10"></div>
    <img src="/Register.png" class="w-24 h-24 rounded-full shadow-md logo-float mb-3 z-10" />
    <h2 class="text-xl font-extrabold z-10">Join the Movement</h2>
    <p class="text-gray-600 text-center z-10">Cleaner streets start with you.</p>
  `;
  wrap.appendChild(right);

  /* TYPING EFFECT */
  let i = 0;
  const text = "Create Your Civix Account";
  const typed = () => wrap.querySelector("#typed");
  typed().textContent = "";
  const typer = setInterval(() => {
    typed().textContent += text[i];
    i++;
    if (i >= text.length) clearInterval(typer);
  }, 25);

  /* PASSWORD EYE TOGGLES */
  const pass = () => wrap.querySelector("#pass");
  const con = () => wrap.querySelector("#confirmPass");

  wrap.querySelector("#eye1").onclick = () => {
    const t = pass().type === "password" ? "text" : "password";
    pass().type = t;
    wrap.querySelector("#eye1").textContent = t === "password" ? "👁" : "🙈";
  };
  wrap.querySelector("#eye2").onclick = () => {
    const t = con().type === "password" ? "text" : "password";
    con().type = t;
    wrap.querySelector("#eye2").textContent = t === "password" ? "👁" : "🙈";
  };

  /* ROLE SELECT */
  let role = "User";
  wrap.querySelectorAll(".role-btn").forEach((btn) => {
    btn.onclick = () => {
      role = btn.dataset.role;
      wrap.querySelectorAll(".role-btn").forEach((b) =>
        b.classList.remove("bg-cyan-500", "text-white")
      );
      btn.classList.add("bg-cyan-500", "text-white");
    };
  });

  /* SUBMIT HANDLER */
  form.onsubmit = (e) => {
    e.preventDefault();
    if (pass().value !== con().value) {
      alert("Passwords do not match!");
      return;
    }

    console.clear();
    console.log("Registered:", {
      full: full.value,
      user: user.value,
      email: email.value,
      phone: phone.value,
      password: "***",
      role,
    });

    alert("Registered successfully!");
  };

  return wrap;
}
