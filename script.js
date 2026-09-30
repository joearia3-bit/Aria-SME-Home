"use strict";

/* =========================================================
   ARIA SME HUB
   PHASE 1 - COMPLETE SCRIPT
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
   YEAR
   ========================================================= */

if (currentYear) {
    currentYear.textContent =
        new Date().getFullYear();
}


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


function setStatus(element, message) {

    if (element) {
        element.textContent = message;
    }
}


function formatKina(amount) {

    const number =
        Number(amount);

    if (!Number.isFinite(number)) {
        return "K0";
    }

    return "K" +
        number.toLocaleString("en-PG");
}


/* =========================================================
   IMAGE SELECTOR
   ========================================================= */

if (imageButton && imageInput) {

    imageButton.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            /*
             * Reset the input so the same image
             * can be selected again.
             */
            imageInput.value = "";

            /*
             * Open the phone's normal
             * file/image picker.
             */
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


            /*
             * Make sure the selected file
             * is an image.
             */
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


            /*
             * Maximum image size:
             * 8 MB
             */
            const maximumSize =
                8 * 1024 * 1024;


            if (file.size > maximumSize) {

                alert(
                    "Please choose an image smaller than 8 MB."
                );

                imageInput.value = "";

                return;
            }


            /*
             * Release previous preview URL.
             */
            if (selectedImageUrl) {

                URL.revokeObjectURL(
                    selectedImageUrl
                );
            }


            selectedImageFile = file;


            /*
             * Create temporary preview URL.
             */
            selectedImageUrl =
                URL.createObjectURL(file);


            /*
             * Display preview.
             */
            if (previewImage) {

                previewImage.src =
                    selectedImageUrl;

                previewImage.alt =
                    "Preview of " + file.name;
            }


            /*
             * Display filename.
             */
            if (imageName) {

                imageName.textContent =
                    file.name;
            }


            /*
             * Display file size.
             */
            if (imageSize) {

                imageSize.textContent =
                    (
                        file.size /
                        1024 /
                        1024
                    ).toFixed(2) +
                    " MB";
            }


            /*
             * Show preview section.
             */
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
        previewImage.removeAttribute("src");
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
                "lobsters",
                "ocean",
                "sea"
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
                "welding",
                "welder",
                "mechanic",
                "mechanical",
                "painting",
                "brick",
                "concrete"
            ]
        },


        {
            name: "Transport and delivery",

            words: [
                "car",
                "vehicle",
                "truck",
                "bus",
                "taxi",
                "transport",
                "driver",
                "driving",
                "delivery",
                "deliver",
                "boat"
            ]
        },


        {
            name: "Technology and digital",

            words: [
                "computer",
                "phone",
                "mobile",
                "internet",
                "online",
                "website",
                "digital",
                "technology",
                "tech",
                "design",
                "coding",
                "code",
                "social media"
            ]
        },


        {
            name: "Retail and trading",

            words: [
                "shop",
                "store",
                "selling",
                "sell",
                "sales",
                "trade",
                "trading",
                "market",
                "customer",
                "customers"
            ]
        },


        {
            name: "Tourism and services",

            words: [
                "tourism",
                "tourist",
                "hotel",
                "guesthouse",
                "travel",
                "tour",
                "guide",
                "hospitality",
                "cleaning",
                "laundry"
            ]
        }

    ];


    let bestCategory =
        "General business opportunity";

    let highestScore = 0;


    categories.forEach(
        function (category) {

            let score = 0;


            category.words.forEach(
                function (word) {

                    if (
                        value.includes(
                            normaliseText(word)
                        )
                    ) {
                        score++;
                    }
                }
            );


            if (score > highestScore) {

                highestScore = score;

                bestCategory =
                    category.name;
            }
        }
    );


    return bestCategory;
}


/* =========================================================
   GENERATE OPPORTUNITIES
   ========================================================= */

function generateOpportunities(text) {

    const category =
        detectCategory(text);


    const opportunities = [];


    if (category === "Fishing and seafood") {

        opportunities.push(
            {
                title: "Fresh seafood sales",
                description:
                    "Sell cleaned and fresh fish or seafood directly to households, markets, shops or food businesses.",
                firstStep:
                    "Identify three nearby customers or selling points.",
                startingCost:
                    "Low to medium",
                incomeIdea:
                    "Buy or catch fresh seafood, prepare it safely and sell in small quantities."
            }
        );


        opportunities.push(
            {
                title: "Value-added seafood",
                description:
                    "Explore cleaning, portioning, smoking, drying or packaging seafood for customers.",
                firstStep:
                    "Choose one simple product that can be prepared safely.",
                startingCost:
                    "Medium",
                incomeIdea:
                    "Turn raw seafood into a more convenient product with a higher selling value."
            }
        );


        opportunities.push(
            {
                title: "Seafood supply service",
                description:
                    "Supply regular seafood orders to restaurants, food sellers and households.",
                firstStep:
                    "Ask five potential customers what seafood they regularly need.",
                startingCost:
                    "Low to medium",
                incomeIdea:
                    "Build repeat customers through reliable supply and consistent quality."
            }
        );

    } else if (
        category === "Farming and produce"
    ) {

        opportunities.push(
            {
                title: "Fresh produce selling",
                description:
                    "Grow or collect useful crops and sell directly to households, markets and shops.",
                firstStep:
                    "List the produce you already have and identify nearby buyers.",
                startingCost:
                    "Low to medium",
                incomeIdea:
                    "Sell fresh produce in convenient quantities."
            }
        );


        opportunities.push(
            {
                title: "Value-added farm products",
                description:
                    "Explore drying, processing, packaging or preparing farm products for customers.",
                firstStep:
                    "Choose one crop that is available regularly.",
                startingCost:
                    "Medium",
                incomeIdea:
                    "Create a product that can last longer or be sold at a higher value."
            }
        );


        opportunities.push(
            {
                title: "Small-scale farm supply",
                description:
                    "Supply produce directly to food sellers, restaurants or other businesses.",
                firstStep:
                    "Ask local businesses what produce they buy regularly.",
                startingCost:
                    "Low",
                incomeIdea:
                    "Build repeat orders from reliable customers."
            }
        );

    } else if (
        category === "Food and baking"
    ) {

        opportunities.push(
            {
                title: "Food and snack sales",
                description:
                    "Prepare simple food or snacks and sell where there is regular customer demand.",
                firstStep:
                    "Choose one product and identify a busy selling location.",
                startingCost:
                    "Low",
                incomeIdea:
                    "Start with small quantities and reinvest the profit."
            }
        );


        opportunities.push(
            {
                title: "Custom baking",
                description:
                    "Offer cakes, bread or other baked products for birthdays, meetings and events.",
                firstStep:
                    "Create a simple menu with three products.",
                startingCost:
                    "Low to medium",
                incomeIdea:
                    "Take advance orders so ingredients are purchased for confirmed customers."
            }
        );


        opportunities.push(
            {
                title: "Small catering service",
                description:
                    "Provide food for meetings, community events, workplaces and family functions.",
                firstStep:
                    "Create one affordable catering package.",
                startingCost:
                    "Medium",
                incomeIdea:
                    "Charge per person or per event."
            }
        );

    } else if (
        category === "Arts and crafts"
    ) {

        opportunities.push(
            {
                title: "Local craft sales",
                description:
                    "Sell handmade products to local customers, visitors and businesses.",
                firstStep:
                    "Choose your three strongest products.",
                startingCost:
                    "Low",
                incomeIdea:
                    "Produce small batches and sell directly."
            }
        );


        opportunities.push(
            {
                title: "Online craft market",
                description:
                    "Photograph your products and explore online customers and wider markets.",
                firstStep:
                    "Take clear photos and create a simple product list.",
                startingCost:
                    "Low",
                incomeIdea:
                    "Reach customers beyond your immediate community."
            }
        );


        opportunities.push(
            {
                title: "Custom-made products",
                description:
                    "Make products according to customer requests.",
                firstStep:
                    "Create examples of products customers can order.",
                startingCost:
                    "Low to medium",
                incomeIdea:
                    "Charge according to materials, time and design."
            }
        );

    } else if (
        category === "Repair and construction"
    ) {

        opportunities.push(
            {
                title: "Local repair service",
                description:
                    "Offer practical repair services to households and small businesses.",
                firstStep:
                    "List the repairs you can safely perform.",
                startingCost:
                    "Low to medium",
                incomeIdea:
                    "Charge for labour and materials."
            }
        );


        opportunities.push(
            {
                title: "Construction support service",
                description:
                    "Provide skilled or general construction support where appropriate.",
                firstStep:
                    "Identify your strongest construction skills.",
                startingCost:
                    "Low to medium",
                incomeIdea:
                    "Work on small jobs and build a customer reputation."
            }
        );


        opportunities.push(
            {
                title: "Maintenance service",
                description:
                    "Offer regular maintenance to homes, shops and small businesses.",
                firstStep:
                    "Create a simple list of maintenance services.",
                startingCost:
                    "Low",
                incomeIdea:
                    "Develop repeat customers through scheduled maintenance."
            }
        );

    } else if (
        category === "Transport and delivery"
    ) {

        opportunities.push(
            {
                title: "Local delivery service",
                description:
                    "Help businesses and households move goods locally.",
                firstStep:
                    "Identify areas and delivery needs you can safely serve.",
                startingCost:
                    "Low to medium",
                incomeIdea:
                    "Charge per delivery or distance."
            }
        );


        opportunities.push(
            {
                title: "Business transport support",
                description:
                    "Provide reliable transport support to small businesses.",
                firstStep:
                    "Speak with local businesses about their regular transport needs.",
                startingCost:
                    "Medium",
                incomeIdea:
                    "Build repeat business accounts."
            }
        );


        opportunities.push(
            {
                title: "Scheduled community transport",
                description:
                    "Explore regular transport services where there is genuine local demand.",
                firstStep:
                    "Research routes, demand, costs and required permissions.",
                startingCost:
                    "Medium to high",
                incomeIdea:
                    "Use scheduled services and repeat customers."
            }
        );

    } else if (
        category === "Technology and digital"
    ) {

        opportunities.push(
            {
                title: "Digital services",
                description:
                    "Help individuals and small businesses with simple digital tasks.",
                firstStep:
                    "List the digital skills you can already provide.",
                startingCost:
                    "Low",
                incomeIdea:
                    "Charge per task or service package."
            }
        );


        opportunities.push(
            {
                title: "Website and social media support",
                description:
                    "Help small businesses create and maintain basic online presence.",
                firstStep:
                    "Create one sample business page or website.",
                startingCost:
                    "Low",
                incomeIdea:
                    "Charge for setup and ongoing support."
            }
        );


        opportunities.push(
            {
                title: "Digital learning service",
                description:
                    "Teach useful phone, computer or online skills to others.",
                firstStep:
                    "Choose one skill people around you need.",
                startingCost:
                    "Low",
                incomeIdea:
                    "Offer short practical lessons."
            }
        );

    } else if (
        category === "Retail and trading"
    ) {

        opportunities.push(
            {
                title: "Small retail business",
                description:
                    "Sell products that people regularly need in your local area.",
                firstStep:
                    "Identify five products with consistent local demand.",
                startingCost:
                    "Low to medium",
                incomeIdea:
                    "Buy carefully, price fairly and reinvest profits."
            }
        );


        opportunities.push(
            {
                title: "Market trading",
                description:
                    "Buy or produce useful products and sell them through local markets.",
                firstStep:
                    "Research customer demand and competitor prices.",
                startingCost:
                    "Low to medium",
                incomeIdea:
                    "Focus on products with enough margin after transport and other costs."
            }
        );


        opportunities.push(
            {
                title: "Order-based selling",
                description:
                    "Take customer orders before buying larger quantities.",
                firstStep:
                    "Find products customers already ask for.",
                startingCost:
                    "Low",
                incomeIdea:
                    "Reduce unsold stock by buying against confirmed demand."
            }
        );

    } else if (
        category === "Tourism and services"
    ) {

        opportunities.push(
            {
                title: "Local service business",
                description:
                    "Offer a useful service to households, visitors or businesses.",
                firstStep:
                    "Choose one service you can deliver reliably.",
                startingCost:
                    "Low",
                incomeIdea:
                    "Charge per service or package."
            }
        );


        opportunities.push(
            {
                title: "Tourism support service",
                description:
                    "Explore practical services for visitors, guides, accommodation or local experiences.",
                firstStep:
                    "Identify a local attraction and what visitors need.",
                startingCost:
                    "Low to medium",
                incomeIdea:
                    "Charge for agreed services or experiences."
            }
        );


        opportunities.push(
            {
                title: "Cleaning and maintenance service",
                description:
                    "Provide cleaning or basic maintenance for homes and businesses.",
                firstStep:
                    "Create a simple service and price list.",
                startingCost:
                    "Low",
                incomeIdea:
                    "Build repeat customers through reliable service."
            }
        );

    } else {

        opportunities.push(
            {
                title: "Turn your existing skill into income",
                description:
                    "Identify something you already know how to do and find people willing to pay for it.",
                firstStep:
                    "Write down your three strongest skills.",
                startingCost:
                    "Low",
                incomeIdea:
                    "Start with a small service and improve it from customer feedback."
            }
        );


        opportunities.push(
            {
                title: "Sell what is available locally",
                description:
                    "Look at resources, products or services already available around you.",
                firstStep:
                    "List five things you can access easily.",
                startingCost:
                    "Low to medium",
                incomeIdea:
                    "Find a buyer before spending heavily."
            }
        );


        opportunities.push(
            {
                title: "Solve a local problem",
                description:
                    "Look for a common problem in your community and create a simple service around it.",
                firstStep:
                    "Ask five people what problem they would pay someone to solve.",
                startingCost:
                    "Low",
                incomeIdea:
                    "Start with one customer and improve the service."
            }
        );
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
    container
) {

    if (!container) {
        return;
    }


    const cards =
        result.opportunities
            .map(
                function (opportunity, index) {

                    return `
                        <article class="result-card">

                            <p class="eyebrow">
                                OPPORTUNITY ${index + 1}
                            </p>

                            <h3>
                                ${escapeHTML(
                                    opportunity.title
                                )}
                            </h3>

                            <p>
                                ${escapeHTML(
                                    opportunity.description
                                )}
                            </p>

                            <p>
                                <strong>First step:</strong>
                                ${escapeHTML(
                                    opportunity.firstStep
                                )}
                            </p>

                            <p>
                                <strong>Starting cost:</strong>
                                ${escapeHTML(
                                    opportunity.startingCost
                                )}
                            </p>

                            <p>
                                <strong>Income idea:</strong>
                                ${escapeHTML(
                                    opportunity.incomeIdea
                                )}
                            </p>

                            <button
                                type="button"
                                class="button button-secondary save-opportunity-button"
                                data-opportunity-index="${index}"
                            >
                                📋 Save to My Action Plan
                            </button>

                        </article>
                    `;
                }
            )
            .join("");


    container.innerHTML = `
        <div class="results-summary">

            <p class="eyebrow">
                ARIA FOUND A DIRECTION
            </p>

            <h3>
                ${escapeHTML(result.category)}
            </h3>

            <p>
                Here are practical ideas to explore.
                Check local demand, costs and customer needs
                before spending money.
            </p>

        </div>

        <div class="opportunity-list">
            ${cards}
        </div>
    `;


    container.hidden = false;


    const buttons =
        container.querySelectorAll(
            ".save-opportunity-button"
        );


    buttons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    const index =
                        Number(
                            button.dataset.opportunityIndex
                        );

                    const opportunity =
                        result.opportunities[index];

                    saveOpportunity(
                        opportunity
                    );
                }
            );
        }
    );
}


/* =========================================================
   FIND AN OPPORTUNITY
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
                    "Please tell ARIA what you have, what you know, or what you want to do."
                );

                if (opportunityInput) {
                    opportunityInput.focus();
                }

                return;
            }


            setStatus(
                opportunityStatus,
                "ARIA is generating practical opportunities..."
            );


            const result =
                generateOpportunities(text);


            displayOpportunities(
                result,
                opportunityResults
            );


            setStatus(
                opportunityStatus,
                "Opportunities generated."
            );
        }
    );
}


/* =========================================================
   SCAN WITH ARIA
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


            if (selectedImageFile) {

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
                "Analysis complete. These are starting opportunities to explore."
            );
        }
    );
}


/* =========================================================
   TALK WITH ARIA
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


            if (chatInput) {
                chatInput.value = "";
            }


            const response =
                createAriaResponse(
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


/* =========================================================
   CHAT MESSAGE
   ========================================================= */

function addChatMessage(
    name,
    message,
    className
) {

    if (!chatMessages) {
        return;
    }


    const messageElement =
        document.createElement("div");


    messageElement.className =
        "chat-message " +
        className;


    const strong =
        document.createElement("strong");

    strong.textContent =
        name;


    const paragraph =
        document.createElement("p");

    paragraph.textContent =
        message;


    messageElement.appendChild(
        strong
    );

    messageElement.appendChild(
        paragraph
    );


    chatMessages.appendChild(
        messageElement
    );


    chatMessages.scrollTop =
        chatMessages.scrollHeight;
}


/* =========================================================
   ARIA CHAT RESPONSE
   ========================================================= */

function createAriaResponse(message) {

    const value =
        normaliseText(message);


    /*
     * Basic Tok Pisin recognition.
     * ARIA responds in English by default.
     */
    const tokPisinWords = [
        "moni",
        "wok",
        "haus",
        "pis",
        "maket",
        "bisnis",
        "helpim",
        "mekim",
        "gutpela",
        "sapos",
        "olsem"
    ];


    const containsTokPisin =
        tokPisinWords.some(
            function (word) {
                return value.includes(word);
            }
        );


    if (
        value.includes("business idea") ||
        value.includes("business ideas") ||
        value.includes("what business")
    ) {

        return "Start with what you already have: a skill, product, resource, location or customer need. Tell me what you have and I can help turn it into practical business opportunities.";
    }


    if (
        value.includes("money") ||
        value.includes("income") ||
        value.includes("make money") ||
        value.includes("moni")
    ) {

        return "Look for a simple problem people already pay to solve. Start small, confirm customer demand, control your costs and reinvest part of your profit.";
    }


    if (
        value.includes("market") ||
        value.includes("sell") ||
        value.includes("customer") ||
        value.includes("buyer")
    ) {

        return "Start by identifying who needs your product or service. Speak with potential customers directly, ask what they currently buy, and compare local prices before investing.";
    }


    if (
        value.includes("skill") ||
        value.includes("can do") ||
        value.includes("wok")
    ) {

        return "Your skills can become income when they solve a real problem. Tell me your strongest skill and who you think might need it.";
    }


    if (
        value.includes("fish") ||
        value.includes("fishing") ||
        value.includes("seafood") ||
        value.includes("pis")
    ) {

        return "Fishing and seafood can support several small businesses, including fresh sales, prepared seafood, supply to food sellers and direct household sales. Start by identifying reliable buyers.";
    }


    if (
        value.includes("farm") ||
        value.includes("garden") ||
        value.includes("crop")
    ) {

        return "Farming opportunities can include fresh produce sales, supplying businesses, processing and value-added products. Start with products you can produce consistently and buyers who already need them.";
    }


    if (
        value.includes("help") ||
        value.includes("how do i") ||
        value.includes("where do i start")
    ) {

        return "Start with three things: what you have, what you can do, and what people around you need. Give me those details and I will help you create a practical first step.";
    }


    if (containsTokPisin) {

        return "I can recognise some Tok Pisin words and phrases. Please tell me what you have, what skill you have, or what business problem you want to solve. I will respond in English.";
    }


    return "I can help you explore business ideas, customers, markets, skills and practical next steps. Tell me what you have or what you want to achieve.";
}


/* =========================================================
   ACTION PLAN STORAGE
   ========================================================= */

function loadSavedPlan() {

    try {

        const stored =
            localStorage.getItem(
                STORAGE_KEY
            );


        if (!stored) {
            return [];
        }


        const parsed =
            JSON.parse(stored);


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


/* =========================================================
   SAVE ACTION PLAN
   ========================================================= */

function persistSavedPlan() {

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

    if (!opportunity) {
        return;
    }


    const alreadySaved =
        savedPlan.some(
            function (item) {

                return (
                    item.title ===
                    opportunity.title
                );
            }
        );


    if (alreadySaved) {

        alert(
            "This opportunity is already in your Action Plan."
        );

        return;
    }


    const savedOpportunity = {

        title:
            opportunity.title,

        description:
            opportunity.description,

        firstStep:
            opportunity.firstStep,

        startingCost:
            opportunity.startingCost,

        incomeIdea:
            opportunity.incomeIdea,

        savedAt:
            new Date().toISOString()
    };


    savedPlan.push(
        savedOpportunity
    );


    persistSavedPlan();

    renderActionPlan();


    alert(
        "Opportunity saved to My Action Plan."
    );


    const actionPlanSection =
        document.getElementById(
            "action-plan"
        );


    if (actionPlanSection) {

        actionPlanSection.scrollIntoView({
            behavior: "smooth"
        });
    }
}


/* =========================================================
   RENDER ACTION PLAN
   ========================================================= */

function renderActionPlan() {

    if (!actionPlanContent) {
        return;
    }


    if (savedPlan.length === 0) {

        actionPlanContent.innerHTML = `
            <div class="empty-state">

                <span class="empty-icon">
                    📝
                </span>

                <h3>
                    Your plan starts here
                </h3>

                <p>
                    Generate an opportunity and select
                    "Save to My Action Plan".
                </p>

            </div>
        `;

        return;
    }


    actionPlanContent.innerHTML =
        savedPlan
            .map(
                function (item, index) {

                    return `
                        <article class="result-card">

                            <p class="eyebrow">
                                ACTION ${index + 1}
                            </p>

                            <h3>
                                ${escapeHTML(
                                    item.title
                                )}
                            </h3>

                            <p>
                                ${escapeHTML(
                                    item.description
                                )}
                            </p>

                            <p>
                                <strong>First step:</strong>
                                ${escapeHTML(
                                    item.firstStep
                                )}
                            </p>

                            <p>
                                <strong>Starting cost:</strong>
                                ${escapeHTML(
                                    item.startingCost
                                )}
                            </p>

                            <p>
                                <strong>Income idea:</strong>
                                ${escapeHTML(
                                    item.incomeIdea
                                )}
                            </p>

                            <button
                                type="button"
                                class="button button-danger remove-saved-opportunity"
                                data-plan-index="${index}"
                            >
                                Remove
                            </button>

                        </article>
                    `;
                }
            )
            .join("");


    const removeButtons =
        actionPlanContent.querySelectorAll(
            ".remove-saved-opportunity"
        );


    removeButtons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    const index =
                        Number(
                            button.dataset.planIndex
                        );


                    if (
                        Number.isInteger(index) &&
                        index >= 0 &&
                        index < savedPlan.length
                    ) {

                        savedPlan.splice(
                            index,
                            1
                        );

                        persistSavedPlan();

                        renderActionPlan();
                    }
                }
            );
        }
    );
}


/* =========================================================
   CLEAR ACTION PLAN
   ========================================================= */

if (clearPlanButton) {

    clearPlanButton.addEventListener(
        "click",
        function () {

            if (savedPlan.length === 0) {

                alert(
                    "Your Action Plan is already empty."
                );

                return;
            }


            const confirmed =
                window.confirm(
                    "Clear all saved opportunities from your Action Plan?"
                );


            if (!confirmed) {
                return;
            }


            savedPlan = [];

            persistSavedPlan();

            renderActionPlan();
        }
    );
}


/* =========================================================
   PRINT ACTION PLAN
   ========================================================= */

if (printPlanButton) {

    printPlanButton.addEventListener(
        "click",
        function () {

            if (savedPlan.length === 0) {

                alert(
                    "Your Action Plan is empty."
                );

                return;
            }


            window.print();
        }
    );
}


/* =========================================================
   STARTUP
   ========================================================= */

renderActionPlan();


/* =========================================================
   CLEAN UP IMAGE MEMORY
   ========================================================= */

window.addEventListener(
    "beforeunload",
    function () {

        if (selectedImageUrl) {

            URL.revokeObjectURL(
                selectedImageUrl
            );

            selectedImageUrl = null;
        }
    }
);
