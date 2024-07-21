function toggleVisibility(e) {
  const visivilityIcon = e.parentElement.querySelector("i");
  const textInput = e.parentElement.parentElement.querySelector("input");
  if (textInput.type === "password") {
    textInput.type = "text";
    visivilityIcon.classList.remove("fa-eye");
    visivilityIcon.classList.add("fa-eye-slash");
  } else {
    textInput.type = "password";
    visivilityIcon.classList.remove("fa-eye-slash");
    visivilityIcon.classList.add("fa-eye");
  }
}

function stringToBase64(bytes) {
  const binString = String.fromCodePoint(...bytes);
  return btoa(binString);
}

async function sha512(str) {
  const buf = await crypto.subtle.digest(
    "SHA-512",
    new TextEncoder().encode(str)
  );
  return Array.prototype.map
    .call(new Uint8Array(buf), (x) => ("00" + x.toString(16)).slice(-2))
    .join("");
}

async function generate() {
  const phrase = document.querySelector("#passphrase");
  if (phrase.value) {
    let s = (await sha512(phrase.value)).slice(0, 12);
    navigator.clipboard.writeText(stringToBase64(new TextEncoder().encode(s)));
  }
}
