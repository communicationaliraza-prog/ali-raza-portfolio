document.addEventListener('DOMContentLoaded', () => {
    // Mobile Menu Toggle
    const mobileMenu = document.getElementById('mobile-menu');
    const navLinks = document.querySelector('.nav-links');
    const navItems = document.querySelectorAll('.nav-links a');

    mobileMenu.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        const icon = mobileMenu.querySelector('i');
        if (navLinks.classList.contains('active')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
        } else {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    });

    // Close mobile menu when a link is clicked
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            if (navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                mobileMenu.querySelector('i').classList.remove('fa-times');
                mobileMenu.querySelector('i').classList.add('fa-bars');
            }
        });
    });

    // Sticky Navigation
    const header = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('sticky');
        } else {
            header.classList.remove('sticky');
        }
    });

    // Active Navigation Link on Scroll
    const sections = document.querySelectorAll('section');
    
    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (scrollY >= (sectionTop - 200)) {
                current = section.getAttribute('id');
            }
        });

        navItems.forEach(a => {
            a.classList.remove('active');
            if (a.getAttribute('href').substring(1) === current) {
                a.classList.add('active');
            }
        });
    });

    // 3D Tilt Effect for Hero Image
    const profileTilt = document.getElementById('profile-tilt');
    if (profileTilt) {
        // Only apply on desktop devices where hover is supported
        if (window.matchMedia("(pointer: fine)").matches && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            profileTilt.addEventListener('mousemove', (e) => {
                const rect = profileTilt.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                // Calculate rotation based on cursor position (-10deg to 10deg)
                const xRotation = ((y - rect.height / 2) / rect.height) * -20;
                const yRotation = ((x - rect.width / 2) / rect.width) * 20;
                
                profileTilt.style.transform = `perspective(1000px) scale(1.05) rotateX(${xRotation}deg) rotateY(${yRotation}deg)`;
                profileTilt.style.transition = 'transform 0.1s ease-out';
            });
            
            profileTilt.addEventListener('mouseleave', () => {
                profileTilt.style.transform = 'perspective(1000px) scale(1) rotateX(0) rotateY(0)';
                profileTilt.style.transition = 'transform 0.5s ease-out';
            });
        }
    }

    // Scroll Reveal Animation (Intersection Observer)
    const appearOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };

    const appearOnScroll = new IntersectionObserver(function(entries, observer) {
        entries.forEach(entry => {
            if (!entry.isIntersecting) {
                return;
            } else {
                entry.target.classList.add('appear');
                observer.unobserve(entry.target);
            }
        });
    }, appearOptions);

    const faders = document.querySelectorAll('.fade-in, .fade-up');
    faders.forEach(fader => {
        appearOnScroll.observe(fader);
    });

    // Form submission simulation (Prevent default reload)
    const contactForm = document.querySelector('.contact-form');
    if(contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = contactForm.querySelector('button');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            
            // Simulate network request
            setTimeout(() => {
                btn.innerHTML = '<i class="fas fa-check"></i> Message Sent!';
                btn.style.backgroundColor = '#10b981'; // green
                btn.style.borderColor = '#10b981';
                contactForm.reset();
                
                setTimeout(() => {
                    btn.innerHTML = originalText;
                    btn.style.backgroundColor = '';
                    btn.style.borderColor = '';
                }, 3000);
            }, 1500);
        });
    }

    // AI Chatbot Functionality
    const chatToggle = document.getElementById('chat-toggle');
    const chatClose = document.getElementById('chat-close');
    const chatBox = document.getElementById('chat-box');
    const chatMessages = document.getElementById('chat-messages');
    const chatInput = document.getElementById('chat-input');
    const chatSendBtn = document.getElementById('chat-send');
    const quickBtns = document.querySelectorAll('.quick-btn');

    // Toggle Chat
    chatToggle.addEventListener('click', () => {
        chatBox.classList.toggle('active');
        if (chatBox.classList.contains('active')) {
            chatInput.focus();
        }
    });

    chatClose.addEventListener('click', () => {
        chatBox.classList.remove('active');
    });

    // Send Message
    const sendMessage = async (text) => {
        if (!text.trim()) return;

        // Add user message to UI
        appendMessage(text, 'user-message');
        chatInput.value = '';

        // Show typing indicator
        const typingId = showTypingIndicator();

        try {
            // Send request to backend
            const response = await fetch('chat_api.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text })
            });
            const data = await response.json();
            
            // Remove typing indicator
            removeTypingIndicator(typingId);
            
            if (data.reply) {
                appendMessage(data.reply, 'bot-message');
            } else if (data.error) {
                appendMessage("System message: " + data.error, 'bot-message');
            } else {
                appendMessage("Sorry, I encountered an error connecting to the server.", 'bot-message');
            }
        } catch (error) {
            removeTypingIndicator(typingId);
            appendMessage("Sorry, I couldn't reach the AI server. Please check your connection and API configuration.", 'bot-message');
        }
    };

    // Append Message to UI
    const appendMessage = (text, className) => {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${className}`;
        msgDiv.textContent = text;
        chatMessages.appendChild(msgDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    };

    // Show Typing Indicator
    const showTypingIndicator = () => {
        const id = 'typing-' + Date.now();
        const typingDiv = document.createElement('div');
        typingDiv.className = 'typing-indicator';
        typingDiv.id = id;
        typingDiv.innerHTML = `
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        `;
        chatMessages.appendChild(typingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        return id;
    };

    // Remove Typing Indicator
    const removeTypingIndicator = (id) => {
        const typingDiv = document.getElementById(id);
        if (typingDiv) {
            typingDiv.remove();
        }
    };

    // Event Listeners for sending
    chatSendBtn.addEventListener('click', () => {
        sendMessage(chatInput.value);
    });

    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage(chatInput.value);
        }
    });

    // Quick Reply Buttons
    quickBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const text = btn.textContent;
            sendMessage(text);
            // Hide quick replies after clicking
            const quickRepliesContainer = document.querySelector('.chat-quick-replies');
            if (quickRepliesContainer && quickRepliesContainer.style.display !== 'none') {
                quickRepliesContainer.style.display = 'none';
            }
        });
    });
});
