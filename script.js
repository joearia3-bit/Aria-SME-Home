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


function formatKina(amount) {

    return "K" +
        Number(amount).toLocaleString("en-PG");
}


function setStatus(element, message) {

    if (element) {
        element.textContent = message;
    }
}


/* =========================================================
   CHOOSE IMAGE
   ========================================================= */

/*
   IMPORTANT:

   This is the complete image chooser.

   Choose Image button
        ↓
   Phone image/file picker
        ↓
   Image selected
        ↓
   Image preview appears
*/

if (imageButton && imageInput) {

    imageButton.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            /*
               Clear the previous selection.

               This also allows the user to select
               the SAME image again.
            */

            imageInput.value = "";

            /*
               Open the phone's image picker.
            */

            imageInput.click();

        }
    );


    imageInput.addEventListener(
        "change",
        function () {

            /*
               No file selected.
            */

            if (
                !imageInput.files ||
                imageInput.files.length === 0
            ) {
                return;
            }


            const file =
                imageInput.files[0];


            /*
               Check that it is actually an image.
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
               Maximum image size:
               8 MB
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
               Remove the previous preview URL.
            */

            if (selectedImageUrl) {

                URL.revokeObjectURL(
                    selectedImageUrl
                );
            }


            /*
               Save selected image.
            */

            selectedImageFile = file;


            /*
               Create temporary browser URL.
            */

            selectedImageUrl =
                URL.createObjectURL(file);


            /*
               Display preview.
            */

            if (previewImage) {

                previewImage.src =
                    selectedImageUrl;

                previewImage.alt =
                    "Preview of " + file.name;
            }


            /*
               Display filename.
            */

            if (imageName) {

                imageName.textContent =
                    file.name;
            }


            /*
               Display file size.
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
               Show preview area.
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

    /*
       Release browser memory.
    */

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
                "electric
