
/* =====================================
   1. SELECT HTML ELEMENTS
===================================== */

const promptInput = document.querySelector("#promptInput");
const promptCount = document.querySelector(".prompt-count");

const imageSize = document.querySelector("#imageSize");
const imageCount = document.querySelector("#imageCount");
const imageQuality = document.querySelector("#imageQuality");

const generateBtn = document.querySelector(".generate-btn");

const galleryGrid = document.querySelector("#galleryGrid");
const galleryCount = document.querySelector("#galleryCount");
const emptyGallery = document.querySelector("#emptyGallery");

const clearPromptBtn = document.querySelector("#clearPrompt");
const resetSettingsBtn = document.querySelector("#resetSettings");

const suggestionButtons = document.querySelectorAll(".suggestion-btn");


/* =====================================
   2. CHARACTER COUNTER
===================================== */

function updateCharacterCount() {

    const count = promptInput.value.length;

    promptCount.textContent = `${count} / 500 characters`;

}

promptInput.addEventListener("input", updateCharacterCount);


/* =====================================
   3. PROMPT SUGGESTIONS
===================================== */

suggestionButtons.forEach((button) => {

    button.addEventListener("click", () => {

        promptInput.value = button.dataset.prompt;

        updateCharacterCount();

        promptInput.focus();

    });

});


/* =====================================
   4. CLEAR PROMPT
===================================== */

clearPromptBtn.addEventListener("click", () => {

    promptInput.value = "";

    updateCharacterCount();

    promptInput.focus();

});


/* =====================================
   5. RESET SETTINGS
===================================== */

resetSettingsBtn.addEventListener("click", () => {

    imageSize.value = "1:1";
    imageCount.value = "2";
    imageQuality.value = "standard";

});


/* =====================================
   6. GET IMAGE DIMENSIONS
===================================== */

function getImageDimensions() {

    const selectedRatio = imageSize.value;
    const selectedQuality = imageQuality.value;

    const qualitySizes = {
        standard: 768,
        high: 1024,
        ultra: 1536
    };

    const ratioValues = {
        "1:1": [1, 1],
        "2:3": [2, 3],
        "3:2": [3, 2],
        "16:9": [16, 9]
    };

    const maxSize = qualitySizes[selectedQuality] || 1024;

    const [ratioWidth, ratioHeight] =
        ratioValues[selectedRatio] || [1, 1];

    let width;
    let height;

    if (ratioWidth >= ratioHeight) {

        width = maxSize;

        height = Math.round(
            maxSize * ratioHeight / ratioWidth
        );

    } else {

        height = maxSize;

        width = Math.round(
            maxSize * ratioWidth / ratioHeight
        );

    }

    return { width, height };

}


/* =====================================
   7. UPDATE GALLERY COUNT
===================================== */

function updateGalleryCount() {

    const total =
        galleryGrid.querySelectorAll(".image-card").length;

    galleryCount.textContent =
        `${total} ${total === 1 ? "image" : "images"}`;

    emptyGallery.classList.toggle("hidden", total > 0);

}

updateGalleryCount();


/* =====================================
   8. DOWNLOAD IMAGE
===================================== */

async function downloadImage(imageUrl, button, imageNumber) {

    try {

        button.disabled = true;
        button.textContent = "Downloading...";

        const response = await fetch(imageUrl);

        if (!response.ok) {
            throw new Error("Image download failed");
        }

        const blob = await response.blob();

        const blobUrl = URL.createObjectURL(blob);

        const link = document.createElement("a");

        link.href = blobUrl;

        link.download = `imagine-ai-image-${imageNumber}.png`;

        document.body.appendChild(link);

        link.click();

        link.remove();

        setTimeout(() => {
            URL.revokeObjectURL(blobUrl);
        }, 1500);

        button.textContent = "↓ Download Image";

    } catch (error) {

        console.error("Download error:", error);

        button.textContent = "Open Image to Save";

        window.open(imageUrl, "_blank");

    } finally {

        button.disabled = false;

    }

}


/* =====================================
   9. GENERATE SINGLE IMAGE
===================================== */

function generateSingleImage(prompt, width, height, imageNumber) {

    return new Promise((resolve) => {

        const seed = Math.floor(Math.random() * 1000000);

        const imageUrl =
            `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=${width}&height=${height}&seed=${seed}`;

        const img = new Image();

        img.classList.add("generated-image");

        img.alt = prompt;

        let completed = false;

        function finish(success) {

            if (completed) return;

            completed = true;

            resolve(success);

        }


        // IMAGE SUCCESS

        img.onload = () => {

            if (img.naturalWidth < 100 || img.naturalHeight < 100) {

                finish(false);

                return;

            }

            const imageCard = document.createElement("div");

            imageCard.classList.add("image-card");

            imageCard.appendChild(img);


            // DOWNLOAD BUTTON

            const downloadBtn = document.createElement("button");

            downloadBtn.classList.add("download-btn");

            downloadBtn.textContent = "↓ Download Image";

            downloadBtn.addEventListener("click", () => {

                downloadImage(imageUrl, downloadBtn, imageNumber);

            });

            imageCard.appendChild(downloadBtn);


            // ADD TO GALLERY

            galleryGrid.appendChild(imageCard);

            updateGalleryCount();

            finish(true);

        };


        // IMAGE ERROR

        img.onerror = () => {

            console.error(`Image ${imageNumber} failed to load.`);

            finish(false);

        };


        // START GENERATION

        img.src = imageUrl;

    });

}


/* =====================================
   10. WAIT FUNCTION
===================================== */

function wait(seconds) {

    return new Promise((resolve) => {

        setTimeout(resolve, seconds * 1000);

    });

}


/* =====================================
   11. GENERATE MULTIPLE IMAGES
===================================== */

generateBtn.addEventListener("click", async () => {

    const prompt = promptInput.value.trim();

    // EMPTY PROMPT CHECK

    if (prompt === "") {

        alert("Please enter a prompt first!");

        promptInput.focus();

        return;

    }


    const totalImages = Number(imageCount.value) || 1;

    const { width, height } = getImageDimensions();

    let successfulImages = 0;


    // DISABLE BUTTON

    generateBtn.disabled = true;


    try {

        for (let i = 0; i < totalImages; i++) {

            generateBtn.textContent =
                `Generating ${i + 1} of ${totalImages}...`;


            const success = await generateSingleImage(
                prompt,
                width,
                height,
                Date.now() + i
            );


            if (success) {

                successfulImages++;

            }


            // WAIT BETWEEN IMAGE REQUESTS

            if (i < totalImages - 1) {

                let remainingSeconds = 45;

                while (remainingSeconds > 0) {

                    generateBtn.textContent =
                        `Next image in ${remainingSeconds}s...`;

                    await wait(1);

                    remainingSeconds--;

                }

            }

        }


        if (successfulImages === 0) {

            alert(
                "Image generation failed. Please try again later."
            );

        } else if (successfulImages < totalImages) {

            alert(
                `${successfulImages} out of ${totalImages} images generated successfully.`
            );

        }

    } catch (error) {

        console.error("Generation error:", error);

        alert("Something went wrong. Please try again.");

    } finally {

        generateBtn.disabled = false;

        generateBtn.textContent = "✦ Generate Images";

    }

});


/* =====================================
   12. INITIALIZE PAGE
===================================== */

updateCharacterCount();

updateGalleryCount();
