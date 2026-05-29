// Myntra Clone JS Logic
// Created by: Junior Developer
// Description: Handle theme toggles, carousel sliders, wishlist count and cart calculations.

// --- Global Arrays to store our app state ---
var myCart = [];
var myWishlist = [];

// Constants
var SHIPPING_LIMIT = 799;

// Run when HTML elements are fully loaded
document.addEventListener("DOMContentLoaded", function() {
    console.log("Myntra Clone script loaded and ready!");

    // 1. Initialize theme mode from localStorage
    checkSavedTheme();

    // 2. Initialize Carousel settings
    initSlider();

    // 3. Initialize Wishlist buttons on product cards
    initWishlist();

    // 4. Initialize Cart operations (Add to Bag buttons)
    initCart();

    // 5. Connect other event handlers for panels/modals
    connectUIEvents();

    // 6. Check if user is logged in
    checkUserSession();
});

// --- Theme Toggle logic (Light / Dark mode) ---
function checkSavedTheme() {
    var savedTheme = localStorage.getItem("myntraTheme");
    if (savedTheme === "dark") {
        document.body.classList.add("dark-theme");
    } else {
        document.body.classList.remove("dark-theme");
    }
}

function toggleTheme() {
    console.log("Theme button clicked!");
    var bodyElement = document.body;
    bodyElement.classList.toggle("dark-theme");
    
    // Save selection to storage
    if (bodyElement.classList.contains("dark-theme")) {
        localStorage.setItem("myntraTheme", "dark");
    } else {
        localStorage.setItem("myntraTheme", "light");
    }
}

// --- Carousel Image Slider code ---
var currentSlideIndex = 0;
var sliderInterval;

function initSlider() {
    // Show first slide
    showSlide(0);
    
    // Auto slide every 4 seconds
    startAutoSlide();

    // Attach click listeners to previous and next buttons
    document.getElementById("prev_slide").addEventListener("click", function() {
        showSlide(currentSlideIndex - 1);
        startAutoSlide(); // Reset timer on click
    });

    document.getElementById("next_slide").addEventListener("click", function() {
        showSlide(currentSlideIndex + 1);
        startAutoSlide(); // Reset timer on click
    });

    // Attach click listeners to slide indicator dots
    var dots = document.querySelectorAll(".slider-dot");
    for (var i = 0; i < dots.length; i++) {
        dots[i].addEventListener("click", function(event) {
            var targetIndex = parseInt(event.target.getAttribute("data-index"));
            showSlide(targetIndex);
            startAutoSlide();
        });
    }
}

function showSlide(index) {
    var slides = document.querySelectorAll(".slide");
    var dots = document.querySelectorAll(".slider-dot");

    // Loop indices if they exceed bounds
    if (index >= slides.length) {
        currentSlideIndex = 0;
    } else if (index < 0) {
        currentSlideIndex = slides.length - 1;
    } else {
        currentSlideIndex = index;
    }

    // Shift wrapper to show correct slide
    var offset = currentSlideIndex * 33.3333;
    document.getElementById("carousel_container").style.transform = "translateX(-" + offset + "%)";

    // Set dots active status
    for (var j = 0; j < dots.length; j++) {
        if (j === currentSlideIndex) {
            dots[j].classList.add("active");
        } else {
            dots[j].classList.remove("active");
        }
    }
}

function startAutoSlide() {
    // Clear old timer if active
    if (sliderInterval) {
        clearInterval(sliderInterval);
    }
    sliderInterval = setInterval(function() {
        showSlide(currentSlideIndex + 1);
    }, 4000);
}

// --- Wishlist operations ---
function initWishlist() {
    // Read wishlist data from localStorage
    var savedWishlist = localStorage.getItem("myntraWishlist");
    if (savedWishlist) {
        myWishlist = JSON.parse(savedWishlist);
    }
    
    updateWishlistBadgeUI();

    // Attach click listeners to all card heart icons
    var cards = document.querySelectorAll(".product-card");
    cards.forEach(function(card) {
        var productId = card.getAttribute("data-id");
        var wishlistBtn = card.querySelector(".card-wishlist-btn");

        // If card was wishlisted before, make heart red
        if (myWishlist.indexOf(productId) > -1) {
            wishlistBtn.classList.add("active");
        }

        wishlistBtn.addEventListener("click", function(event) {
            event.stopPropagation(); // Avoid other triggers
            
            var index = myWishlist.indexOf(productId);
            if (index > -1) {
                // Remove item from wishlist array
                myWishlist.splice(index, 1);
                wishlistBtn.classList.remove("active");
                console.log("Wishlist item removed: " + productId);
            } else {
                // Add item to wishlist array
                myWishlist.push(productId);
                wishlistBtn.classList.add("active");
                console.log("Wishlist item added: " + productId);
            }

            // Save changes to storage
            localStorage.setItem("myntraWishlist", JSON.stringify(myWishlist));
            updateWishlistBadgeUI();
        });
    });
}

function updateWishlistBadgeUI() {
    var count = myWishlist.length;
    var badgeElement = document.getElementById("wishlist_badge");
    badgeElement.textContent = count;
    
    // Hide badge if 0 items
    if (count > 0) {
        badgeElement.style.display = "flex";
    } else {
        badgeElement.style.display = "none";
    }
}

// --- Cart calculations and updates ---
function initCart() {
    // Read cart data from localStorage
    var savedCart = localStorage.getItem("myntraCart");
    if (savedCart) {
        myCart = JSON.parse(savedCart);
    }

    updateCartBadgeUI();
    renderCartItems();

    // Attach click listeners to Add to Bag buttons on cards
    var cards = document.querySelectorAll(".product-card");
    cards.forEach(function(card) {
        var addBagBtn = card.querySelector(".add-btn");
        addBagBtn.addEventListener("click", function(event) {
            event.stopPropagation();
            addProductToCart(card);
        });
    });
}

function addProductToCart(cardElement) {
    var productId = cardElement.getAttribute("data-id");
    var brand = cardElement.querySelector(".brand-name").textContent;
    var name = cardElement.querySelector(".item-name").textContent;
    
    var priceSellingText = cardElement.querySelector(".price-now").textContent;
    var priceOriginalText = cardElement.querySelector(".price-was").textContent;
    
    // Remove Indian Rupee symbol and parse price to integer number
    var priceSelling = parseInt(priceSellingText.replace(/[^0-9]/g, ""));
    var priceOriginal = parseInt(priceOriginalText.replace(/[^0-9]/g, ""));

    // Find the vector graphic image wrapper
    var imgWrapper = cardElement.querySelector(".product-image");
    var graphicElement = imgWrapper.querySelector("img") || imgWrapper.querySelector("svg");
    var graphicHTML = graphicElement ? graphicElement.outerHTML : "<div></div>";

    console.log("Adding product to cart: " + name);

    // Search if product already in cart
    var existingItem = null;
    for (var i = 0; i < myCart.length; i++) {
        if (myCart[i].id === productId) {
            existingItem = myCart[i];
            break;
        }
    }

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        myCart.push({
            id: productId,
            brand: brand,
            name: name,
            priceSelling: priceSelling,
            priceOriginal: priceOriginal,
            graphicHTML: graphicHTML,
            quantity: 1
        });
    }

    // Save and render
    localStorage.setItem("myntraCart", JSON.stringify(myCart));
    renderCartItems();
    updateCartBadgeUI();

    // Open shopping drawer overlay automatically
    document.getElementById("cart_overlay").classList.add("active");
}

function updateCartBadgeUI() {
    var totalQuantity = 0;
    for (var i = 0; i < myCart.length; i++) {
        totalQuantity += myCart[i].quantity;
    }
    
    var cartBadge = document.getElementById("cart_badge");
    var cartQtyHeader = document.getElementById("cart_qty_header");
    
    cartBadge.textContent = totalQuantity;
    cartQtyHeader.textContent = totalQuantity;

    if (totalQuantity > 0) {
        cartBadge.style.display = "flex";
    } else {
        cartBadge.style.display = "none";
    }
}

function renderCartItems() {
    var emptyMessage = document.getElementById("cart_empty_view");
    var itemsListContainer = document.getElementById("cart_items_list");
    var summaryFooter = document.getElementById("cart_footer");

    // Hide summary panel and show empty message if cart empty
    if (myCart.length === 0) {
        emptyMessage.style.display = "block";
        itemsListContainer.style.display = "none";
        summaryFooter.style.display = "none";
        return;
    }

    emptyMessage.style.display = "none";
    itemsListContainer.style.display = "block";
    summaryFooter.style.display = "block";

    itemsListContainer.innerHTML = "";
    
    var totalOriginal = 0;
    var totalSelling = 0;

    // Loop through each item in the cart array
    for (var k = 0; k < myCart.length; k++) {
        var item = myCart[k];
        totalOriginal += item.priceOriginal * item.quantity;
        totalSelling += item.priceSelling * item.quantity;

        var itemDiv = document.createElement("div");
        itemDiv.className = "cart-item";
        itemDiv.innerHTML = `
            <div class="cart-item-img">
                ${item.graphicHTML}
            </div>
            <div class="cart-item-info">
                <div class="cart-item-brand">${item.brand}</div>
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price-qty">
                    <div class="qty-control">
                        <button class="qty-btn" onclick="changeQuantity('${item.id}', -1)">-</button>
                        <span class="qty-value">${item.quantity}</span>
                        <button class="qty-btn" onclick="changeQuantity('${item.id}', 1)">+</button>
                    </div>
                    <div class="cart-item-price">₹${item.priceSelling * item.quantity}</div>
                </div>
            </div>
            <button class="cart-item-remove" onclick="removeProduct('${item.id}')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
        `;
        itemsListContainer.appendChild(itemDiv);
    }

    // Calculations for values in checkout block
    var totalDiscount = totalOriginal - totalSelling;
    var shippingFee = 99;
    if (totalSelling >= SHIPPING_LIMIT) {
        shippingFee = 0; // Free delivery
    }
    var orderTotal = totalSelling + shippingFee;

    document.getElementById("summary_bag_total").textContent = "₹" + totalOriginal;
    document.getElementById("summary_bag_discount").textContent = "-₹" + totalDiscount;
    document.getElementById("summary_delivery_fee").textContent = shippingFee === 0 ? "FREE" : "₹" + shippingFee;
    document.getElementById("summary_order_total").textContent = "₹" + orderTotal;
}

// Global functions for inline click triggers inside generated cart html
function changeQuantity(id, change) {
    for (var i = 0; i < myCart.length; i++) {
        if (myCart[i].id === id) {
            myCart[i].quantity += change;
            if (myCart[i].quantity <= 0) {
                removeProduct(id);
                return;
            }
            break;
        }
    }
    localStorage.setItem("myCart", JSON.stringify(myCart));
    localStorage.setItem("myntraCart", JSON.stringify(myCart));
    renderCartItems();
    updateCartBadgeUI();
}

function removeProduct(id) {
    // Filter out item with matching ID
    myCart = myCart.filter(function(item) {
        return item.id !== id;
    });
    localStorage.setItem("myntraCart", JSON.stringify(myCart));
    renderCartItems();
    updateCartBadgeUI();
}

// --- Modals, navigation and button event listener mappings ---
function connectUIEvents() {
    // Dark Theme Toggle Switch
    document.getElementById("theme_toggle").addEventListener("click", toggleTheme);

    // Profile Dropdown Login Button
    document.getElementById("open_login_btn").addEventListener("click", function() {
        window.location.href = "login/login.html";
    });

    // Close Login Modal
    document.getElementById("close_login_btn").addEventListener("click", function() {
        document.getElementById("login_modal_overlay").classList.remove("active");
    });

    // Close Login modal clicking outside the box
    var loginOverlay = document.getElementById("login_modal_overlay");
    loginOverlay.addEventListener("click", function(event) {
        if (event.target === loginOverlay) {
            loginOverlay.classList.remove("active");
        }
    });

    // Header shopping bag button clicks (Open drawer)
    document.getElementById("cart_action_btn").addEventListener("click", function() {
        document.getElementById("cart_overlay").classList.add("active");
    });

    // Close shopping cart drawer
    document.getElementById("close_cart_btn").addEventListener("click", function() {
        document.getElementById("cart_overlay").classList.remove("active");
    });

    document.getElementById("empty_shop_btn").addEventListener("click", function() {
        document.getElementById("cart_overlay").classList.remove("active");
    });

    // Close Drawer clicking outside the drawer pane
    var cartOverlay = document.getElementById("cart_overlay");
    cartOverlay.addEventListener("click", function(event) {
        if (event.target === cartOverlay) {
            cartOverlay.classList.remove("active");
        }
    });

    // Click on Wishlist button in header scrolls to product cards
    document.getElementById("wishlist_action_btn").addEventListener("click", function() {
        document.getElementById("deals").scrollIntoView({ behavior: "smooth" });
        alert("Quick TIP: Click the heart icons on the product cards to add them to your wishlist!");
    });

    // Cart Place Order action button
    document.getElementById("checkout_action_btn").addEventListener("click", function() {
        alert("Success! Your order has been placed. Thank you for using Myntra Clone.");
        myCart = [];
        localStorage.removeItem("myntraCart");
        renderCartItems();
        updateCartBadgeUI();
        document.getElementById("cart_overlay").classList.remove("active");
    });

    // Live search input filtering
    var searchInput = document.getElementById("search_query");
    searchInput.addEventListener("keyup", function(event) {
        var query = event.target.value.toLowerCase().trim();
        var cards = document.querySelectorAll(".product-card");

        // Clear active filter tab if user searches
        if (query !== "") {
            var tabs = document.querySelectorAll(".tab");
            tabs.forEach(function(btn) {
                btn.classList.remove("active");
            });
            tabs[0].classList.add("active"); // Set 'All' tab active
        }

        cards.forEach(function(card) {
            var brand = card.querySelector(".brand-name").textContent.toLowerCase();
            var name = card.querySelector(".item-name").textContent.toLowerCase();
            var category = card.getAttribute("data-category").toLowerCase();

            if (brand.indexOf(query) > -1 || name.indexOf(query) > -1 || category.indexOf(query) > -1) {
                card.style.display = "block";
            } else {
                card.style.display = "none";
            }
        });
    });
}

// --- Product Category Filtering functions ---
function tabFilter(category) {
    console.log("Filtering tab category: " + category);
    
    var tabs = document.querySelectorAll(".tab");
    tabs.forEach(function(btn) {
        var btnText = btn.textContent.toLowerCase().trim();
        var matches = false;
        if (category === "all") {
            matches = (btnText.indexOf("all") > -1);
        } else {
            matches = (btnText === category);
        }
        
        if (matches) {
            btn.classList.add("active");
        } else {
            btn.classList.remove("active");
        }
    });

    // Show/hide matching card elements
    var cards = document.querySelectorAll(".product-card");
    cards.forEach(function(card) {
        var cardCat = card.getAttribute("data-category");
        if (category === "all" || cardCat === category) {
            card.style.display = "block";
        } else {
            card.style.display = "none";
        }
    });
}

function filterCategory(category) {
    // Scroll down to deals grid
    document.getElementById("deals").scrollIntoView({ behavior: "smooth" });
    tabFilter(category);
}

// Expose filters to global window scope for inline onclick support
window.tabFilter = tabFilter;
window.filterCategory = filterCategory;
window.changeQuantity = changeQuantity;
window.removeProduct = removeProduct;

// --- Session Verification and Dropdown Update ---
function checkUserSession() {
    var currentUser = localStorage.getItem("currentUser");
    var welcomePane = document.querySelector(".profile-welcome");
    
    if (currentUser && welcomePane) {
        var user = JSON.parse(currentUser);
        
        // Populate profile dropdown with logged-in user state
        welcomePane.innerHTML = `
            <div class="user-profile-info" style="margin-bottom: 12px;">
                <h5 style="font-weight: 700; font-size: 14px; margin-bottom: 4px; color: var(--myntra-pink); text-transform: capitalize;">Hello, ${user.name}</h5>
                <p style="font-size: 11px; color: var(--text-gray); text-transform: none; word-break: break-all; margin-bottom: 0;">${user.email || user.mobile}</p>
            </div>
            <button class="login-btn logout-btn" id="logout_action_btn" style="background-color: var(--text-dark); color: var(--body-bg); border: 1px solid var(--border-color); font-weight: 700;">LOG OUT</button>
        `;

        // Attach click handler for Logout
        document.getElementById("logout_action_btn").addEventListener("click", function() {
            localStorage.removeItem("currentUser");
            alert("Logged out successfully!");
            location.reload();
        });
    }
}
