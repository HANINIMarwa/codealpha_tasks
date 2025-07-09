// Async translation function with fallback
async function translateText() {
    const text = document.getElementById("inputText").value;
    const sourceLang = document.getElementById("sourceLang").value;
    const targetLang = document.getElementById("targetLang").value;
    const outputText = document.getElementById("outputText");

    if (!text.trim()) {
        alert("Please enter text to translate");
        return;
    }

    outputText.value = "Translating...";

    try {
        // Try LibreTranslate first
        const libreResponse = await fetch("https://libretranslate.com/translate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                q: text,
                source: sourceLang,
                target: targetLang,
                format: "text"
            })
        });

        if (libreResponse.ok) {
            const data = await libreResponse.json();
            outputText.value = data.translatedText;
            return;
        }

        // Fallback to MyMemory if LibreTranslate fails
        const myMemoryResponse = await fetch(
            `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLang}|${targetLang}`
        );

        const myMemoryData = await myMemoryResponse.json();

        if (myMemoryData.responseData && myMemoryData.responseData.translatedText) {
            outputText.value = myMemoryData.responseData.translatedText;
        } else {
            throw new Error("No valid translation returned");
        }
    } catch (error) {
        console.error("Translation error:", error);
        outputText.value = "Translation failed. Please try again later.";
    }
}

// Enhanced copy function with fallback
function copyText() {
    const text = document.getElementById("outputText").value;

    if (!text.trim()) {
        alert("No translation to copy");
        return;
    }

    if (navigator.clipboard) {
        navigator.clipboard.writeText(text)
            .then(() => alert("Copied to clipboard!"))
            .catch((err) => {
                console.error("Clipboard API error:", err);
                fallbackCopyText(text);
            });
    } else {
        fallbackCopyText(text);
    }
}

function fallbackCopyText(text) {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    document.body.appendChild(textarea);
    textarea.select();

    try {
        const successful = document.execCommand("copy");
        if (successful) {
            alert("Copied to clipboard!");
        } else {
            throw new Error("Copy failed");
        }
    } catch (err) {
        console.error("Fallback copy error:", err);
        alert("Failed to copy text. Please copy manually.");
    } finally {
        document.body.removeChild(textarea);
    }
}

// Speak function
function speakText() {
    const text = document.getElementById("outputText").value;
    const targetLang = document.getElementById("targetLang").value;

    if (!text.trim()) {
        alert("No translation to speak");
        return;
    }

    if (!window.speechSynthesis) {
        alert("Text-to-speech not supported in your browser");
        return;
    }

    window.speechSynthesis.cancel();

    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = targetLang;
    speech.rate = 0.9;
    speech.pitch = 1;

    speech.onerror = (event) => {
        console.error("Speech synthesis error:", event);
        alert(`Text-to-speech failed: ${event.error}`);
    };

    try {
        window.speechSynthesis.speak(speech);
    } catch (error) {
        console.error("Speech synthesis blocked:", error);
        alert("Please click on the page first to enable text-to-speech");
    }
}

// Event listeners
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("translateBtn").addEventListener("click", translateText);
    document.getElementById("copyBtn").addEventListener("click", copyText);
    document.getElementById("speakBtn").addEventListener("click", speakText);

    const input = document.getElementById("inputText");
    input.addEventListener("keydown", function(event) {
        if (event.key === "Enter" && event.ctrlKey) {
            event.preventDefault();
            translateText();
        }
    });
});

