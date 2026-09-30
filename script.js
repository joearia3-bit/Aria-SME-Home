"use strict";

/* =========================================================
   ARIA SME HUB
   PHASE 1 - SCRIPT.JS
   ========================================================= */

const STORAGE_KEY = "ariaSMEHubPhase1ActionPlan";


/* =========================================================
   GET HTML ELEMENTS
   ========================================================= */

const imageButton = document.getElementById("imageButton");
const imageInput = document.getElementById("imageInput");
const scanPreview = document.getElementById("scanPreview");
const previewImage = document.getElementById("previewImage");
const imageName = document.getElementById("imageName");
const imageSize = document.getElementById("imageSize");
const removeImageButton =
    document.getElementById("removeImageButton");

const scanDescription =
    document.getElementById("scanDescription");

const analyzeButton =
    document.getElementById("analyzeButton");

const scanStatus =
    document.getElementById("scanStatus");

const scanResults =
    document.getElementById("scanResults");

const chatForm =
    document.getElementById("chatForm");

const chatInput =
    document.getElementById("chatInput");

const chatMessages =
    document.getElementById("chatMessages");

const opportunityInput =
    document.getElementById("opportunityInput");

const findOpportunityButton =
    document.getElementById("findOpportunityButton");

const opportunityStatus =
    document.getElementById("opportunityStatus");

const opportunityResults =
    document.getElementById("opportunityResults");

const actionPlanContent =
    document.getElementById("actionPlanContent");

const printPlanButton =
    document.getElementById("printPlanButton");

const clearPlanButton =
    document.getElementById("clearPlanButton");

const currentYear =
    document.getElementById("currentYear");


/* =========================================================
   APP STATE
   ========================================================= */

let selectedImageFile = null;
let selectedImageUrl = null;

let savedPlan = loadSavedPlan();


/* =========================================================
   STARTUP
   ========================================================= */

if (currentYear) {
    currentYear.textContent =
        new Date().getFullYear();
}

renderActionPlan();


/* =========================================================
   HELPER FUNCTIONS
   ========================================================= */

function normaliseText(value) {

    return String(value || "")
        .toLowerCase()
        .replace(/[^\p{L}\p{N}\s]/gu, " ")
        .replace(/\s+/g, " ")
        .trim();
}


function escapeHTML(value) {

    return String(value ?? "")
        .replace(/[&<>"']/g, function (character) {

            const replacements = {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#039;"
            };

            return replacements[character];
        });
}


function formatKina(amount) {

    return "K" +
        Number(amount || 0).toLocaleString("en-PG");
}


function setStatus(element, message) {

    if (element) {
        element.textContent = message;
    }
}


function showResults(element, html) {

    if (!element) {
        return;
    }

    element.innerHTML = html;
    element.hidden = false;
}


function hideResults(element) {

    if (!element) {
        return;
    }

    element.innerHTML = "";
    element.hidden = true;
}


/* =========================================================
   IMAGE SELECTION
   ========================================================= */

if (imageButton && imageInput) {

    imageButton.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            imageInput.value = "";

            imageInput.click();
        }
    );


    imageInput.addEventListener(
        "change",
        function () {

            if (
                !imageInput.files ||
                imageInput.files.length === 0
            ) {
                return;
            }

            const file =
                imageInput.files[0];


            if (
                !file.type ||
                !file.type.startsWith("image/")
            ) {

                alert(
                    "Please choose an image file."
                );

                imageInput.value = "";

                return;
            }


            const maximumSize =
                8 * 1024 * 1024;


            if (file.size > maximumSize) {

                alert(
                    "Please choose an image smaller than 8 MB."
                );

                imageInput.value = "";

                return;
            }


            if (selectedImageUrl) {

                URL.revokeObjectURL(
                    selectedImageUrl
                );
            }


            selectedImageFile = file;

            selectedImageUrl =
                URL.createObjectURL(file);


            if (previewImage) {

                previewImage.src =
                    selectedImageUrl;

                previewImage.alt =
                    "Preview of " + file.name;
            }


            if (imageName) {

                imageName.textContent =
                    file.name;
            }


            if (imageSize) {

                imageSize.textContent =
                    (
                        file.size /
                        1024 /
                        1024
                    ).toFixed(2) +
                    " MB";
            }


            if (scanPreview) {
                scanPreview.hidden = false;
            }


            setStatus(
                scanStatus,
                "Image selected successfully. Now describe what is in the image."
            );
        }
    );
}


/* =========================================================
   REMOVE IMAGE
   ========================================================= */

if (removeImageButton) {

    removeImageButton.addEventListener(
        "click",
        function () {

            clearSelectedImage();

            setStatus(
                scanStatus,
                "Image removed."
            );
        }
    );
}


function clearSelectedImage() {

    if (selectedImageUrl) {

        URL.revokeObjectURL(
            selectedImageUrl
        );
    }


    selectedImageFile = null;
    selectedImageUrl = null;


    if (imageInput) {
        imageInput.value = "";
    }


    if (previewImage) {

        previewImage.removeAttribute(
            "src"
        );
    }


    if (imageName) {
        imageName.textContent = "";
    }


    if (imageSize) {
        imageSize.textContent = "";
    }


    if (scanPreview) {
        scanPreview.hidden = true;
    }
}


/* =========================================================
   CATEGORY DETECTION
   ========================================================= */

function detectCategory(text) {

    const value =
        normaliseText(text);


    const categories = [

        {
            name: "Fishing and seafood",

            words: [
                "fish",
                "fishing",
                "seafood",
                "prawn",
                "prawns",
                "crab",
                "crabs",
                "squid",
                "lobster",
                "lobsters"
            ]
        },


        {
            name: "Farming and produce",

            words: [
                "farm",
                "farming",
                "garden",
                "gardening",
                "crop",
                "crops",
                "vegetable",
                "vegetables",
                "banana",
                "cassava",
                "taro",
                "sweet potato",
                "cocoa",
                "coffee",
                "coconut",
                "peanut",
                "peanuts",
                "fruit",
                "fruits"
            ]
        },


        {
            name: "Food and baking",

            words: [
                "food",
                "cook",
                "cooking",
                "bake",
                "baking",
                "cake",
                "cakes",
                "bread",
                "catering",
                "lunch",
                "snack",
                "snacks",
                "doughnut",
                "doughnuts"
            ]
        },


        {
            name: "Arts and crafts",

            words: [
                "craft",
                "crafts",
                "carving",
                "carved",
                "bilum",
                "weaving",
                "sewing",
                "handmade",
                "jewellery",
                "jewelry",
                "art",
                "artwork"
            ]
        },


        {
            name: "Repair and construction",

            words: [
                "repair",
                "repairs",
                "construction",
                "building",
                "carpentry",
                "carpenter",
                "plumbing",
                "electrical",
                "electric",
                "mechanic",
                "mechanical",
                "welding",
                "welder",
                "painting"
            ]
        },


        {
            name: "Transport and services",

            words: [
                "transport",
                "taxi",
                "bus",
                "pmv",
                "driver",
                "driving",
                "delivery",
                "deliveries",
                "courier"
            ]
        },


        {
            name: "Technology and digital services",

            words: [
                "computer",
                "phone",
                "mobile",
                "internet",
                "website",
                "digital",
                "software",
                "coding",
                "design",
                "printing",
                "online"
            ]
        }

    ];


    let bestCategory = "General business opportunity";
    let bestScore = 0;


    categories.forEach(function (category) {

        let score = 0;


        category.words.forEach(function (word) {

            if (value.includes(word)) {
                score++;
            }
        });


        if (score > bestScore) {

            bestScore = score;
            bestCategory = category.name;
        }
    });


    return bestCategory;
}


/* =========================================================
   OPPORTUNITY GENERATOR
   ========================================================= */

function generateOpportunities(text) {

    const value =
        normaliseText(text);

    const category =
        detectCategory(value);


    const opportunities = [];


    if (
        value.includes("fish") ||
        value.includes("fishing") ||
        value.includes("seafood") ||
        value.includes("crab") ||
        value.includes("prawn") ||
        value.includes("squid")
    ) {

        opportunities.push({
            title: "Fresh seafood sales",
            description:
                "Sell fresh seafood directly to households, markets, restaurants or small food businesses.",
            action:
                "Identify three nearby buyers and compare their prices before selling."
        });

        opportunities.push({
            title: "Prepared seafood",
            description:
                "Clean, portion, cook or package seafood to create a higher-value product.",
            action:
                "Start with a small batch and calculate your cost and selling price."
        });

        opportunities.push({
            title: "Regular seafood supply",
            description:
                "Build relationships with repeat customers who need seafood regularly.",
            action:
                "Ask potential customers what quantity and delivery schedule they need."
        });

    } else if (
        value.includes("farm") ||
        value.includes("garden") ||
        value.includes("crop") ||
        value.includes("vegetable") ||
        value.includes("cocoa") ||
        value.includes("coffee") ||
        value.includes("coconut")
    ) {

        opportunities.push({
            title: "Local produce sales",
            description:
                "Sell fresh produce directly to households, markets, shops or food businesses.",
            action:
                "Find out which products have reliable local demand."
        });

        opportunities.push({
            title: "Value-added produce",
            description:
                "Process or package produce so it can be sold at a higher value.",
            action:
                "Choose one product and calculate the cost of producing a small batch."
        });

        opportunities.push({
            title: "Regular supply business",
            description:
                "Supply produce consistently to a shop, restaurant, market seller or institution.",
            action:
                "Contact three possible buyers and ask about their weekly requirements."
        });

    } else if (
        value.includes("cake") ||
        value.includes("bake") ||
        value.includes("bread") ||
        value.includes("food") ||
        value.includes("cook") ||
        value.includes("catering")
    ) {

        opportunities.push({
            title: "Made-to-order food",
            description:
                "Take orders for cakes, snacks, meals or other food products.",
            action:
                "Start with one product that you can make consistently."
        });

        opportunities.push({
            title: "Event catering",
            description:
                "Provide food for meetings, church events, celebrations and community activities.",
            action:
                "Create a simple menu with clear prices."
        });

        opportunities.push({
            title: "Local food delivery",
            description:
                "Sell prepared food to nearby workers, families or small businesses.",
            action:
                "Identify a small delivery area and calculate your delivery cost."
        });

    } else if (
        value.includes("craft") ||
        value.includes("bilum") ||
        value.includes("weaving") ||
        value.includes("sewing") ||
        value.includes("carving") ||
        value.includes("handmade")
    ) {

        opportunities.push({
            title: "Handmade product sales",
            description:
                "Sell locally made crafts, clothing, carvings, bilums or other handmade products.",
            action:
                "Photograph three products and create simple prices."
        });

        opportunities.push({
            title: "Custom orders",
            description:
                "Create products based on customer requests.",
            action:
                "Ask potential customers what designs or products they want."
        });

        opportunities.push({
            title: "Online market opportunity",
            description:
                "Use digital channels to reach customers beyond your immediate community.",
            action:
                "Prepare clear product photos, prices and contact information."
        });

    } else if (
        value.includes("repair") ||
        value.includes("construction") ||
        value.includes("carpenter") ||
        value.includes("plumbing") ||
        value.includes("electrical") ||
        value.includes("welding") ||
        value.includes("mechanic")
    ) {

        opportunities.push({
            title: "Local repair service",
            description:
                "Offer practical repair and maintenance services to households and businesses.",
            action:
                "List the five services you can perform confidently."
        });

        opportunities.push({
            title: "Construction service",
            description:
                "Provide small construction, maintenance or improvement services.",
            action:
                "Create a simple service list and starting price guide."
        });

        opportunities.push({
            title: "Mobile service",
            description:
                "Travel to customers instead of requiring them to bring equipment to you.",
            action:
                "Calculate transport costs before setting your service price."
        });

    } else if (
        value.includes("computer") ||
        value.includes("phone") ||
        value.includes("internet") ||
        value.includes("website") ||
        value.includes("digital") ||
        value.includes("coding") ||
        value.includes("printing")
    ) {

        opportunities.push({
            title: "Digital service business",
            description:
                "Provide computer, phone, design, printing, online or digital support services.",
            action:
                "Choose one service you can deliver reliably."
        });

        opportunities.push({
            title: "Small business digital support",
            description:
                "Help local businesses with menus, flyers, documents, social media or basic websites.",
            action:
                "Prepare one sample service to show potential customers."
        });

        opportunities.push({
            title: "Training service",
            description:
                "Teach basic digital skills to individuals, students or small businesses.",
            action:
                "Create a simple beginner lesson and price."
        });

    } else {

        opportunities.push({
            title: "Local service business",
            description:
                "Turn your existing skill, resource or experience into a service for people nearby.",
            action:
                "Write down three things you can do better than the average person."
        });

        opportunities.push({
            title: "Buy and sell opportunity",
            description:
                "Find products people need locally and connect suppliers with customers.",
            action:
                "Ask five people what products they regularly struggle to find."
        });

        opportunities.push({
            title: "Small-scale production",
            description:
                "Create a simple product from resources or skills already available to you.",
            action:
                "Choose one product and calculate the cost of making one unit."
        });
    }


    return {
        category: category,
        opportunities: opportunities
    };
}


/* =========================================================
   DISPLAY OPPORTUNITIES
   ========================================================= */

function displayOpportunities(
    result,
    targetElement
) {

    if (!targetElement) {
        return;
    }


    let html = "";


    html += `
        <div class="result-header">
            <strong>ARIA found a starting point</strong>
            <span>${escapeHTML(result.category)}</span>
        </div>
    `;


    result.opportunities.forEach(
        function (opportunity, index) {

            html += `
                <article class="opportunity-card">

                    <div class="opportunity-number">
                        ${index + 1}
                    </div>

                    <div class="opportunity-content">

                        <h3>
                            ${escapeHTML(opportunity.title)}
                        </h3>

                        <p>
                            ${escapeHTML(opportunity.description)}
                        </p>

                        <p class="action-text">
                            <strong>Next step:</strong>
                            ${escapeHTML(opportunity.action)}
                        </p>

                        <button
                            class="button button-secondary save-opportunity-button"
                            type="button"
                            data-title="${escapeHTML(opportunity.title)}"
                            data-description="${escapeHTML(opportunity.description)}"
                            data-action="${escapeHTML(opportunity.action)}"
                        >
                            📋 Save to My Action Plan
                        </button>

                    </div>

                </article>
            `;
        }
    );


    targetElement.innerHTML = html;
    targetElement.hidden = false;


    const saveButtons =
        targetElement.querySelectorAll(
            ".save-opportunity-button"
        );


    saveButtons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    saveOpportunity({
                        title:
                            button.dataset.title,

                        description:
                            button.dataset.description,

                        action:
                            button.dataset.action
                    });

                    button.textContent =
                        "✓ Saved to My Action Plan";

                    button.disabled = true;
                }
            );
        }
    );
}


/* =========================================================
   FIND OPPORTUNITY BUTTON
   ========================================================= */

if (findOpportunityButton) {

    findOpportunityButton.addEventListener(
        "click",
        function () {

            const text =
                opportunityInput
                    ? opportunityInput.value.trim()
                    : "";


            if (!text) {

                setStatus(
                    opportunityStatus,
                    "Tell ARIA what you have, know, or want to do first."
                );

                return;
            }


            setStatus(
                opportunityStatus,
                "ARIA is analysing your information..."
            );


            const result =
                generateOpportunities(text);


            displayOpportunities(
                result,
                opportunityResults
            );


            setStatus(
                opportunityStatus,
                "Here are some practical starting opportunities."
            );
        }
    );
}


/* =========================================================
   SCAN ANALYSIS
   ========================================================= */

if (analyzeButton) {

    analyzeButton.addEventListener(
        "click",
        function () {

            const description =
                scanDescription
                    ? scanDescription.value.trim()
                    : "";


            if (
                !selectedImageFile &&
                !description
            ) {

                setStatus(
                    scanStatus,
                    "Choose an image or describe what you have first."
                );

                return;
            }


            let combinedText =
                description;


            if (
                selectedImageFile &&
                selectedImageFile.name
            ) {

                combinedText +=
                    " " +
                    selectedImageFile.name;
            }


            setStatus(
                scanStatus,
                "ARIA is analysing your information..."
            );


            const result =
                generateOpportunities(
                    combinedText
                );


            displayOpportunities(
                result,
                scanResults
            );


            setStatus(
                scanStatus,
                "ARIA has identified some starting opportunities."
            );
        }
    );
}


/* =========================================================
   CHAT
   ========================================================= */

if (chatForm) {

    chatForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            const message =
                chatInput
                    ? chatInput.value.trim()
                    : "";


            if (!message) {
                return;
            }


            addChatMessage(
                "You",
                message,
                "user-message"
            );


            chatInput.value = "";


            const response =
                generateLocalARIAResponse(
                    message
                );


            setTimeout(
                function () {

                    addChatMessage(
                        "ARIA",
                        response,
                        "aria-message"
                    );

                },
                250
            );
        }
    );
}


function addChatMessage(
    sender,
    message,
    className
) {

    if (!chatMessages) {
        return;
    }


    const wrapper =
        document.createElement("div");


    wrapper.className =
        "chat-message " +
        className;


    const strong =
        document.createElement("strong");


    strong.textContent =
        sender;


    const paragraph =
        document.createElement("p");


    paragraph.textContent =
        message;


    wrapper.appendChild(strong);
    wrapper.appendChild(paragraph);


    chatMessages.appendChild(wrapper);


    wrapper.scrollIntoView({
        behavior: "smooth",
        block: "nearest"
    });
}


/* =========================================================
   LOCAL ARIA RESPONSE
   ========================================================= */

function generateLocalARIAResponse(message) {

    const value =
        normaliseText(message);


    if (
        value.includes("business idea") ||
        value.includes("business ideas") ||
        value.includes("what business")
    ) {

        return (
            "Start with what you already have: a skill, " +
            "product, resource, tool, location or customer need. " +
            "Tell me what you have and I can help turn it into " +
            "practical opportunity ideas."
        );
    }


    if (
        value.includes("money") ||
        value.includes("income") ||
        value.includes("make money")
    ) {

        return (
            "A good starting point is to identify something " +
            "people nearby already pay for. Consider your skills, " +
            "local resources and customer demand before spending money."
        );
    }


    if (
        value.includes("customer") ||
        value.includes("customers") ||
        value.includes("buyer") ||
        value.includes("buyers")
    ) {

        return (
            "Start by identifying who needs your product or service. " +
            "Then ask potential customers what they currently buy, " +
            "how much they pay and what problem you could solve."
        );
    }


    if (
        value.includes("png") ||
        value.includes("papua new guinea")
    ) {

        return (
            "For Papua New Guinea, useful starting points include " +
            "local food production, agriculture, fishing, transport, " +
            "construction, repair services, crafts and digital services. " +
            "The right opportunity depends on your location and resources."
        );
    }


    if (
        value.includes("tok pisin") ||
        value.includes("wantok") ||
        value.includes("gutpela") ||
        value.includes("bisnis")
    ) {

        return (
            "Mi ken helpim yu long tingim bisnis idea, maket, " +
            "ol samting yu gat, na ol step bilong stat. " +
            "Yu ken raitim moa information na ARIA bai helpim yu."
        );
    }


    const result =
        generateOpportunities(message);


    return (
        "Based on what you told me, a possible area to explore is " +
        result.category +
        ". " +
        result.opportunities[0].description +
        " " +
        result.opportunities[0].action
    );
}


/* =========================================================
   ACTION PLAN STORAGE
   ========================================================= */

function loadSavedPlan() {

    try {

        const saved =
            localStorage.getItem(
                STORAGE_KEY
            );


        if (!saved) {
            return [];
        }


        const parsed =
            JSON.parse(saved);


        if (!Array.isArray(parsed)) {
            return [];
        }


        return parsed;

    } catch (error) {

        console.error(
            "Could not load action plan:",
            error
        );

        return [];
    }
}


function savePlanToStorage() {

    try {

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(savedPlan)
        );

    } catch (error) {

        console.error(
            "Could not save action plan:",
            error
        );
    }
}


/* =========================================================
   SAVE OPPORTUNITY
   ========================================================= */

function saveOpportunity(opportunity) {

    const alreadySaved =
        savedPlan.some(
            function (item) {

                return item.title ===
                    opportunity.title;
            }
