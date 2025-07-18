const themeToggle = document.getElementById("themeToggle");
const currentTheme = localStorage.getItem("theme");

// Als gebruiker eerder "dark" gekozen heeft
if (currentTheme === "dark") {
  document.body.classList.add("dark-mode");
  themeToggle.checked = true;
}

// Bij verandering slider → dark/light toggle
themeToggle.addEventListener("change", () => {
  document.body.classList.toggle("dark-mode");
  const theme = document.body.classList.contains("dark-mode") ? "dark" : "light";
  localStorage.setItem("theme", theme);
});
