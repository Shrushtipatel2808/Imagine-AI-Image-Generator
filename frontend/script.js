
// Counter
let promptInput = document.querySelector(".prompt-input");
let promptCount = document.querySelector(".prompt-count");
let results = document.querySelector("#results");

promptInput.addEventListener("input", () => {
    let count = promptInput.value.length;
    promptCount.textContent = `${count} / 500 characters`;
});

// Image Settings
let imageSize = document.querySelector("#imageSize");
let imageCount = document.querySelector("#imageCount");
let imageQuality = document.querySelector("#imageQuality");

// Generate Button
let generateBtn = document.querySelector(".generate-btn");

generateBtn.addEventListener("click", () => {

    // Check empty prompt
    let prompt = promptInput.value.trim();

    if (prompt === "") {
        alert("Please enter a prompt first!");
        return;
    }

    // Collect user settings
    let settings = {
        prompt: prompt,
        aspectRatio: imageSize.value,
        numberOfImages: imageCount.value,
        quality: imageQuality.value
    };

    console.log(settings);

    // Button loading state
    generateBtn.textContent = "Sending...";
    generateBtn.disabled = true;

    // Send request to backend
    fetch("http://localhost:5000/generate", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(settings)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error("Something went wrong!");
            }

            return response.json();
        })
        .then(data => {
            console.log("Backend Response:", data);
        })
        .catch(error => {
            console.log("Error:", error.message);
        })
        .finally(() => {
            setTimeout(() => {
                generateBtn.textContent = "Generate Image ✨";
                generateBtn.disabled = false;
            }, 1000);
        });

});
