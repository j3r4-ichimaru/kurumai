document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const cartBtn = document.getElementById('cartBtn');
    const loginModal = document.getElementById('loginModal');
    const registerModal = document.getElementById('registerModal');
    const cartModal = document.getElementById('cartModal');
    const checkoutModal = document.getElementById('checkoutModal');
    const closeBtns = document.querySelectorAll('.close-btn');
    const productsGrid = document.getElementById('productsGrid');
    const cartItems = document.getElementById('cartItems');
    const cartCount = document.getElementById('cartCount');
    const cartTotal = document.getElementById('cartTotal');
    const checkoutBtn = document.getElementById('checkoutBtn');
    const nextToPayment = document.getElementById('nextToPayment');
    const backToShipping = document.getElementById('backToShipping');
    const confirmOrder = document.getElementById('confirmOrder');
    const closeCheckout = document.getElementById('closeCheckout');
    const shippingStep = document.getElementById('shippingStep');
    const paymentStep = document.getElementById('paymentStep');
    const confirmationStep = document.getElementById('confirmationStep');
    const step1 = document.getElementById('step1');
    const step2 = document.getElementById('step2');
    const step3 = document.getElementById('step3');
    const paymentMethods = document.querySelectorAll('.payment-method');
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const shopNowBtn = document.getElementById('shopNowBtn');
    const homeLink = document.getElementById('homeLink');
    const categoriesLink = document.getElementById('categoriesLink');
    const dealsLink = document.getElementById('dealsLink');
    const newArrivalsLink = document.getElementById('newArrivalsLink');
    const policyLinks = document.querySelectorAll('.policy-link');
    const mainContent = document.getElementById('mainContent');
    const policyPages = document.getElementById('policyPages');
    const policyTitle = document.getElementById('policyTitle');
    const policyContent = document.getElementById('policyContent');
    const backToHome = document.getElementById('backToHome');
    
    // State
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    let isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
    let products = [];
    
    // Initialize
    updateCartUI();
    if (isLoggedIn) {
        updateAuthUI();
    }
    fetchProducts();
    
    // Event Listeners
    loginBtn.addEventListener('click', () => loginModal.style.display = 'flex');
    registerBtn.addEventListener('click', () => registerModal.style.display = 'flex');
    cartBtn.addEventListener('click', () => cartModal.style.display = 'flex');
    
    closeBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
        });
    });
    
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });
    
    // Search Functionality
    searchBtn.addEventListener('click', searchProducts);
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchProducts();
        }
    });
    
    // Navigation Buttons
    shopNowBtn.addEventListener('click', function() {
        document.querySelector('.products-section').scrollIntoView({ behavior: 'smooth' });
    });
    
    homeLink.addEventListener('click', function(e) {
        e.preventDefault();
        showMainContent();
    });
    
    categoriesLink.addEventListener('click', function(e) {
        e.preventDefault();
        alert('Categories feature coming soon!');
    });
    
    dealsLink.addEventListener('click', function(e) {
        e.preventDefault();
        alert('Deals feature coming soon!');
    });
    
    newArrivalsLink.addEventListener('click', function(e) {
        e.preventDefault();
        alert('New Arrivals feature coming soon!');
    });
    
    // Policy Links
    policyLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const policy = this.dataset.policy;
            showPolicyPage(policy);
        });
    });
    
    backToHome.addEventListener('click', showMainContent);
    
    // Login Form
    document.getElementById('loginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        // Simple validation (in a real app, you'd verify against a database)
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const user = users.find(u => u.email === email && u.password === password);
        
        if (user) {
            isLoggedIn = true;
            currentUser = user;
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('currentUser', JSON.stringify(user));
            loginModal.style.display = 'none';
            updateAuthUI();
            alert('Login successful!');
        } else {
            alert('Invalid email or password');
        }
    });
    
    // Register Form
    document.getElementById('registerForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('registerConfirmPassword').value;
        
        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }
        
        // Check if user already exists
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const userExists = users.some(u => u.email === email);
        
        if (userExists) {
            alert('User with this email already exists');
            return;
        }
        
        // Create new user
        const newUser = {
            id: Date.now().toString(),
            name,
            email,
            password
        };
        
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        
        // Auto-login
        isLoggedIn = true;
        currentUser = newUser;
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('currentUser', JSON.stringify(newUser));
        
        registerModal.style.display = 'none';
        updateAuthUI();
        alert('Registration successful! You are now logged in.');
    });
    
    // Checkout
    checkoutBtn.addEventListener('click', function() {
        if (!isLoggedIn) {
            alert('Please login or register to proceed with checkout');
            cartModal.style.display = 'none';
            loginModal.style.display = 'flex';
            return;
        }
        
        if (cart.length === 0) {
            alert('Your cart is empty');
            return;
        }
        
        cartModal.style.display = 'none';
        checkoutModal.style.display = 'flex';
        // Reset checkout steps
        shippingStep.classList.remove('hidden');
        paymentStep.classList.add('hidden');
        confirmationStep.classList.add('hidden');
        step1.classList.add('active');
        step2.classList.remove('active');
        step3.classList.remove('active');
    });
    
    // Checkout Steps Navigation
    nextToPayment.addEventListener('click', function() {
        const shippingForm = document.getElementById('shippingForm');
        let isValid = true;
        
        // Simple validation
        shippingForm.querySelectorAll('[required]').forEach(input => {
            if (!input.value.trim()) {
                isValid = false;
                input.style.borderColor = 'var(--danger-color)';
            } else {
                input.style.borderColor = '#ddd';
            }
        });
        
        if (isValid) {
            shippingStep.classList.add('hidden');
            paymentStep.classList.remove('hidden');
            step1.classList.remove('active');
            step2.classList.add('active');
        } else {
            alert('Please fill in all required fields');
        }
    });
    
    backToShipping.addEventListener('click', function() {
        paymentStep.classList.add('hidden');
        shippingStep.classList.remove('hidden');
        step2.classList.remove('active');
        step1.classList.add('active');
    });
    
    // Payment Method Selection
    paymentMethods.forEach(method => {
        method.addEventListener('click', function() {
            paymentMethods.forEach(m => m.style.borderColor = '#ddd');
            this.style.borderColor = 'var(--primary-color)';
        });
    });
    
    // Confirm Order
    confirmOrder.addEventListener('click', function() {
        const selectedMethod = document.querySelector('.payment-method[style*="border-color: rgb(255, 117, 140)"]');
        
        if (!selectedMethod) {
            alert('Please select a payment method');
            return;
        }
        
        const method = selectedMethod.dataset.method;
        
        // Process payment based on method
        if (method === 'gcash' || method === 'paymaya' || method === 'paypal') {
            // In a real app, you'd redirect to the payment gateway
            alert(`Redirecting to ${method} payment...`);
            
            // Simulate payment processing
            setTimeout(() => {
                paymentStep.classList.add('hidden');
                confirmationStep.classList.remove('hidden');
                step2.classList.remove('active');
                step3.classList.add('active');
                
                // Clear cart after successful payment
                cart = [];
                localStorage.setItem('cart', JSON.stringify(cart));
                updateCartUI();
            }, 1500);
        } else {
            // Cash on delivery
            paymentStep.classList.add('hidden');
            confirmationStep.classList.remove('hidden');
            step2.classList.remove('active');
            step3.classList.add('active');
            
            // Clear cart after order confirmation
            cart = [];
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartUI();
        }
    });
    
    // Close Checkout
    closeCheckout.addEventListener('click', function() {
        checkoutModal.style.display = 'none';
    });
    
    // Functions
    function updateAuthUI() {
        if (isLoggedIn) {
            loginBtn.textContent = 'Logout';
            registerBtn.style.display = 'none';
            
            // Change login button to logout
            loginBtn.removeEventListener('click', () => loginModal.style.display = 'flex');
            loginBtn.addEventListener('click', function() {
                isLoggedIn = false;
                currentUser = null;
                localStorage.setItem('isLoggedIn', 'false');
                localStorage.removeItem('currentUser');
                updateAuthUI();
                loginBtn.textContent = 'Login';
                registerBtn.style.display = 'block';
                
                // Re-add original event listener
                loginBtn.addEventListener('click', () => loginModal.style.display = 'flex');
            });
        }
    }
    
    function fetchProducts() {
        // Using FakeStoreAPI to get products
        fetch('https://fakestoreapi.com/products')
            .then(res => res.json())
            .then(data => {
                products = data;
                displayProducts(products);
            })
            .catch(err => {
                console.error('Error fetching products:', err);
                // Fallback data if API fails
                products = [
                    {
                        id: 1,
                        title: "Smartphone X",
                        price: 599.99,
                        description: "Latest model with advanced features",
                        category: "electronics",
                        image: "https://via.placeholder.com/300x300?text=Smartphone+X",
                        rating: { rate: 4.5, count: 120 }
                    },
                    {
                        id: 2,
                        title: "Wireless Headphones",
                        price: 149.99,
                        description: "Noise cancelling wireless headphones",
                        category: "electronics",
                        image: "https://via.placeholder.com/300x300?text=Wireless+Headphones",
                        rating: { rate: 4.2, count: 85 }
                    },
                    {
                        id: 3,
                        title: "Smart Watch",
                        price: 199.99,
                        description: "Track your fitness with this smart watch",
                        category: "electronics",
                        image: "https://via.placeholder.com/300x300?text=Smart+Watch",
                        rating: { rate: 4.0, count: 65 }
                    },
                    {
                        id: 4,
                        title: "Laptop Pro",
                        price: 999.99,
                        description: "High performance laptop for professionals",
                        category: "electronics",
                        image: "https://via.placeholder.com/300x300?text=Laptop+Pro",
                        rating: { rate: 4.7, count: 210 }
                    },
                    {
                        id: 5,
                        title: "Bluetooth Speaker",
                        price: 79.99,
                        description: "Portable speaker with great sound quality",
                        category: "electronics",
                        image: "https://via.placeholder.com/300x300?text=Bluetooth+Speaker",
                        rating: { rate: 4.3, count: 95 }
                    },
                    {
                        id: 6,
                        title: "4K TV",
                        price: 799.99,
                        description: "55-inch 4K Ultra HD Smart TV",
                        category: "electronics",
                        image: "https://via.placeholder.com/300x300?text=4K+TV",
                        rating: { rate: 4.6, count: 180 }
                    }
                ];
                displayProducts(products);
            });
    }
    
    function searchProducts() {
        const searchTerm = searchInput.value.trim().toLowerCase();
        
        if (searchTerm === '') {
            displayProducts(products);
            return;
        }
        
        const filteredProducts = products.filter(product => 
            product.title.toLowerCase().includes(searchTerm) || 
            product.description.toLowerCase().includes(searchTerm) ||
            product.category.toLowerCase().includes(searchTerm)
        );
        
        displayProducts(filteredProducts);
        
        if (filteredProducts.length === 0) {
            productsGrid.innerHTML = `<p class="no-results">No products found for "${searchTerm}"</p>`;
        }
    }
    
    function displayProducts(productsToDisplay) {
        productsGrid.innerHTML = '';
        
        productsToDisplay.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            productCard.innerHTML = `
                <img src="${product.image}" alt="${product.title}" class="product-image">
                <div class="product-info">
                    <h3 class="product-title">${product.title}</h3>
                    <p class="product-shop">Kurumai Official Store</p>
                    <div class="product-rating">
                        <span class="star-rating">${generateStarRating(product.rating.rate)}</span>
                        <span>(${product.rating.count})</span>
                    </div>
                    <p class="product-price">₱${product.price.toFixed(2)}</p>
                    <button class="add-to-cart" data-id="${product.id}">Add to Cart</button>
                </div>
            `;
            
            productsGrid.appendChild(productCard);
        });
        
        // Add event listeners to all "Add to Cart" buttons
        document.querySelectorAll('.add-to-cart').forEach(button => {
            button.addEventListener('click', function() {
                const productId = this.dataset.id;
                addToCart(productId, products);
            });
        });
    }
    
    function generateStarRating(rating) {
        const fullStars = Math.floor(rating);
        const halfStar = rating % 1 >= 0.5 ? 1 : 0;
        const emptyStars = 5 - fullStars - halfStar;
        
        return '★'.repeat(fullStars) + (halfStar ? '½' : '') + '☆'.repeat(emptyStars);
    }
    
    function addToCart(productId, products) {
        const product = products.find(p => p.id == productId);
        
        if (!product) return;
        
        const existingItem = cart.find(item => item.id == productId);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                id: product.id,
                title: product.title,
                price: product.price,
                image: product.image,
                shop: "Kurumai Official Store",
                quantity: 1
            });
        }
        
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartUI();
        
        // Show a quick notification
        const notification = document.createElement('div');
        notification.className = 'cart-notification';
        notification.textContent = `${product.title} added to cart`;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    }
    
    function updateCartUI() {
        cartCount.textContent = cart.reduce((total, item) => total + item.quantity, 0);
        
        if (cart.length === 0) {
            cartItems.innerHTML = '<p class="empty-cart-message">Your cart is empty</p>';
            cartTotal.textContent = '₱0.00';
            return;
        }
        
        cartItems.innerHTML = '';
        let total = 0;
        
        cart.forEach(item => {
            total += item.price * item.quantity;
            
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.innerHTML = `
                <img src="${item.image}" alt="${item.title}" class="cart-item-img">
                <div class="cart-item-details">
                    <h4 class="cart-item-title">${item.title}</h4>
                    <p class="cart-item-shop">${item.shop}</p>
                    <p class="cart-item-price">₱${(item.price * item.quantity).toFixed(2)}</p>
                </div>
                <div class="cart-item-actions">
                    <input type="number" min="1" value="${item.quantity}" class="cart-item-quantity" data-id="${item.id}">
                    <button class="remove-item" data-id="${item.id}">×</button>
                </div>
            `;
            
            cartItems.appendChild(cartItem);
        });
        
        cartTotal.textContent = `₱${total.toFixed(2)}`;
        
        // Add event listeners to quantity inputs
        document.querySelectorAll('.cart-item-quantity').forEach(input => {
            input.addEventListener('change', function() {
                const itemId = this.dataset.id;
                const newQuantity = parseInt(this.value);
                
                if (newQuantity < 1) {
                    this.value = 1;
                    return;
                }
                
                const item = cart.find(i => i.id == itemId);
                if (item) {
                    item.quantity = newQuantity;
                    localStorage.setItem('cart', JSON.stringify(cart));
                    updateCartUI();
                }
            });
        });
        
        // Add event listeners to remove buttons
        document.querySelectorAll('.remove-item').forEach(button => {
            button.addEventListener('click', function() {
                const itemId = this.dataset.id;
                cart = cart.filter(item => item.id != itemId);
                localStorage.setItem('cart', JSON.stringify(cart));
                updateCartUI();
            });
        });
    }
    
    function showPolicyPage(policy) {
        mainContent.classList.add('hidden');
        policyPages.classList.remove('hidden');
        
        const policies = {
            faqs: {
                title: "Frequently Asked Questions",
                content: `
                    <h3>General Questions</h3>
                    <p><strong>Q: How do I place an order?</strong><br>
                    A: Simply browse our products, add items to your cart, and proceed to checkout.</p>
                    
                    <p><strong>Q: What payment methods do you accept?</strong><br>
                    A: We accept GCash, PayMaya, PayPal, and Cash on Delivery.</p>
                    
                    <h3>Shipping Questions</h3>
                    <p><strong>Q: How long does shipping take?</strong><br>
                    A: Standard shipping takes 3-5 business days within Metro Manila, 5-7 days for provincial areas.</p>
                `
            },
            shipping: {
                title: "Shipping Policy",
                content: `
                    <h3>Shipping Options</h3>
                    <p>We offer several shipping options to meet your needs:</p>
                    <ul>
                        <li><strong>Standard Shipping:</strong> 3-5 business days (Metro Manila), 5-7 days (Provincial)</li>
                        <li><strong>Express Shipping:</strong> 1-2 business days (Metro Manila only)</li>
                    </ul>
                    
                    <h3>Shipping Fees</h3>
                    <p>Shipping fees vary depending on your location and the size/weight of your order. Fees will be calculated at checkout.</p>
                    
                    <h3>Order Tracking</h3>
                    <p>Once your order ships, you'll receive a tracking number via email to monitor your package's progress.</p>
                `
            },
            story: {
                title: "Our Story",
                content: `
                    <h3>Who We Are</h3>
                    <p>Kurumai was founded in 2023 with a vision to revolutionize online shopping in the Philippines. Our name comes from the Japanese word for "coming" or "arrival," symbolizing our commitment to bringing the future of e-commerce to your doorstep.</p>
                    
                    <h3>Our Mission</h3>
                    <p>We aim to provide a seamless, futuristic shopping experience with a carefully curated selection of products, competitive prices, and exceptional customer service.</p>
                    
                    <h3>The Team</h3>
                    <p>Our team consists of passionate individuals from diverse backgrounds, united by our love for technology and innovation in retail.</p>
                `
            },
            careers: {
                title: "Careers at Kurumai",
                content: `
                    <h3>Join Our Team</h3>
                    <p>At Kurumai, we're always looking for talented individuals to join our growing team. We offer competitive salaries, benefits, and opportunities for growth.</p>
                    
                    <h3>Current Openings</h3>
                    <ul>
                        <li>Frontend Developer</li>
                        <li>Customer Service Representative</li>
                        <li>Marketing Specialist</li>
                        <li>Logistics Coordinator</li>
                    </ul>
                    
                    <p>To apply, please send your resume to careers@kurumai.com with the position title as the subject line.</p>
                `
            },
            privacy: {
                title: "Privacy Policy",
                content: `
                    <h3>Information We Collect</h3>
                    <p>We collect personal information you provide when you create an account, place an order, or contact customer service. This may include your name, email address, shipping address, and payment information.</p>
                    
                    <h3>How We Use Your Information</h3>
                    <p>Your information is used to process orders, provide customer support, and improve our services. We do not sell or share your personal information with third parties for marketing purposes.</p>
                    
                    <h3>Data Security</h3>
                    <p>We implement industry-standard security measures to protect your personal information. All transactions are processed through secure payment gateways.</p>
                `
            }
        };
        
        if (policies[policy]) {
            policyTitle.textContent = policies[policy].title;
            policyContent.innerHTML = policies[policy].content;
        } else {
            policyTitle.textContent = "Policy Not Found";
            policyContent.innerHTML = "<p>The requested policy page could not be found.</p>";
        }
    }
    
    function showMainContent() {
        policyPages.classList.add('hidden');
        mainContent.classList.remove('hidden');
        window.scrollTo(0, 0);
    }
    
    // Add some CSS for the notification
    const style = document.createElement('style');
    style.textContent = `
        .cart-notification {
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: var(--dark-color);
            color: white;
            padding: 12px 24px;
            border-radius: 30px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
            z-index: 3000;
            animation: slideUp 0.3s ease-out;
        }
        
        .no-results {
            text-align: center;
            padding: 2rem;
            font-size: 1.2rem;
            color: var(--text-muted);
            grid-column: 1 / -1;
        }
        
        .fade-out {
            animation: fadeOut 0.3s ease-out forwards;
        }
        
        @keyframes slideUp {
            from {
                opacity: 0;
                transform: translate(-50%, 20px);
            }
            to {
                opacity: 1;
                transform: translate(-50%, 0);
            }
        }
        
        @keyframes fadeOut {
            to {
                opacity: 0;
                transform: translate(-50%, -20px);
            }
        }
    `;
    document.head.appendChild(style);
});