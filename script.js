/* =========================================================
   BLOOD CONNECT
   COMPLETE FRONTEND JAVASCRIPT
   Works with index.html + style.css
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       1. BASIC HELPERS
       ===================================================== */

    const $ = (selector, parent = document) =>
        parent.querySelector(selector);

    const $$ = (selector, parent = document) =>
        [...parent.querySelectorAll(selector)];

    const safeJSONParse = (value, fallback = []) => {
        try {
            return value ? JSON.parse(value) : fallback;
        } catch {
            return fallback;
        }
    };

    const getStorage = (key) =>
        safeJSONParse(localStorage.getItem(key), []);

    const setStorage = (key, value) =>
        localStorage.setItem(key, JSON.stringify(value));

    const escapeHTML = (value = "") =>
        String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    const generateID = (prefix) => {
        const random = Math.floor(100000 + Math.random() * 900000);
        return `${prefix}-${random}`;
    };

    const formatDate = (date = new Date()) => {
        return new Intl.DateTimeFormat("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }).format(new Date(date));
    };

    const formatDateTime = (date = new Date()) => {
        return new Intl.DateTimeFormat("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }).format(new Date(date));
    };


    /* =====================================================
       2. STORAGE KEYS
       ===================================================== */

    const STORAGE = {
        emergencies: "bc_emergencies",
        registrations: "bc_registrations",
        bankRequests: "bc_bank_requests",
        activities: "bc_activities"
    };


    /* =====================================================
       3. INITIALIZATION
       ===================================================== */

    let emergencies = getStorage(STORAGE.emergencies);
    let registrations = getStorage(STORAGE.registrations);
    let bankRequests = getStorage(STORAGE.bankRequests);
    let activities = getStorage(STORAGE.activities);


    /* =====================================================
       4. ACTIVITY SYSTEM
       ===================================================== */

    function addActivity(title, description) {

        activities.unshift({
            id: generateID("ACT"),
            title,
            description,
            date: new Date().toISOString()
        });

        activities = activities.slice(0, 20);

        setStorage(STORAGE.activities, activities);
    }


    /* =====================================================
       5. TOAST SYSTEM
       ===================================================== */

    function showToast(title, message, type = "success") {

        const container = $("#toastContainer");

        if (!container) return;

        const icon =
            type === "error" ? "!" :
            type === "warning" ? "!" :
            "✓";

        const toast = document.createElement("div");

        toast.className = "toast";

        toast.innerHTML = `
            <div class="toast-icon">${icon}</div>

            <div>
                <strong>${escapeHTML(title)}</strong>
                <span>${escapeHTML(message)}</span>
            </div>
        `;

        container.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = "0";
            toast.style.transform = "translateX(20px)";

            setTimeout(() => {
                toast.remove();
            }, 300);

        }, 3500);
    }


    /* =====================================================
       6. MODAL SYSTEM
       ===================================================== */

    const modal = $("#modal");
    const modalContent = $("#modalContent");
    const modalClose = $("#modalClose");

    function openModal(content) {

        if (!modal || !modalContent) return;

        modalContent.innerHTML = content;

        modal.classList.add("show");

        document.body.style.overflow = "hidden";
    }

    function closeModal() {

        if (!modal) return;

        modal.classList.remove("show");

        document.body.style.overflow = "";

        setTimeout(() => {
            if (!modal.classList.contains("show")) {
                modalContent.innerHTML = "";
            }
        }, 250);
    }

    if (modalClose) {
        modalClose.addEventListener("click", closeModal);
    }

    if (modal) {

        modal.addEventListener("click", (event) => {

            if (
                event.target.classList.contains("modal-backdrop") ||
                event.target === modal
            ) {
                closeModal();
            }

        });
    }

    document.addEventListener("keydown", (event) => {

        if (event.key === "Escape") {
            closeModal();
        }

    });


    /* =====================================================
       7. PAGE NAVIGATION
       ===================================================== */

    function showPage(pageID) {

        const pages = $$(".page");

        pages.forEach(page => {
            page.classList.remove("active");
        });

        const target = document.getElementById(pageID);

        if (!target) {
            console.warn(`Page "${pageID}" not found.`);
            return;
        }

        target.classList.add("active");

        $$(".nav-link").forEach(button => {

            button.classList.toggle(
                "active",
                button.dataset.page === pageID
            );

        });

        if (pageID === "dashboard") {
            renderDashboard();
        }

        if (pageID === "emergency") {
            renderEmergencyHistory();
        }

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }


    $$("[data-page]").forEach(button => {

        button.addEventListener("click", () => {

            const pageID = button.dataset.page;

            if (pageID) {
                showPage(pageID);
            }

        });

    });


    /* =====================================================
       8. HOME QUICK ACCESS
       ===================================================== */

    $$(".quick-card[data-page]").forEach(card => {

        card.addEventListener("click", () => {

            showPage(card.dataset.page);

        });

    });


    /* =====================================================
       9. FEATURE BUTTONS
       ===================================================== */

    $$("[data-feature-page]").forEach(button => {

        button.addEventListener("click", () => {

            showPage(button.dataset.featurePage);

        });

    });


    /* =====================================================
       10. PROFILE DROPDOWN
       ===================================================== */

    const profileButton = $("#profileButton");
    const profileDropdown = $("#profileDropdown");

    if (profileButton && profileDropdown) {

        profileButton.addEventListener("click", (event) => {

            event.stopPropagation();

            profileDropdown.classList.toggle("show");

        });

        document.addEventListener("click", (event) => {

            if (
                !profileDropdown.contains(event.target) &&
                event.target !== profileButton
            ) {
                profileDropdown.classList.remove("show");
            }

        });
    }


    /* =====================================================
       11. LANGUAGE
       ===================================================== */

    const languageSelect = $("#languageSelect");

    if (languageSelect) {

        languageSelect.addEventListener("change", () => {

            const language = languageSelect.value;

            const messages = {
                en: "English selected.",
                hi: "Hindi selected.",
                mr: "Marathi selected.",
                ur: "Urdu selected."
            };

            showToast(
                "Language",
                messages[language] || "Language changed."
            );

        });
    }


    /* =====================================================
       12. CAMP TABS
       ===================================================== */

    $$(".camp-tab-button").forEach(button => {

        button.addEventListener("click", () => {

            const target = button.dataset.campTab;

            $$(".camp-tab-button").forEach(btn => {
                btn.classList.remove("active");
            });

            button.classList.add("active");

            $$(".camp-tab-content").forEach(panel => {
                panel.classList.remove("active");
            });

            const panel = document.getElementById(target);

            if (panel) {
                panel.classList.add("active");
            }

        });

    });


    /* =====================================================
       13. SEARCH TABS
       ===================================================== */

    $$(".search-tab-button").forEach(button => {

        button.addEventListener("click", () => {

            const target = button.dataset.searchTab;

            $$(".search-tab-button").forEach(btn => {
                btn.classList.remove("active");
            });

            button.classList.add("active");

            $$(".search-panel").forEach(panel => {
                panel.classList.remove("active");
            });

            const panel = document.getElementById(target);

            if (panel) {
                panel.classList.add("active");
            }

        });

    });


    /* =====================================================
       14. HLA TOGGLE
       ===================================================== */

    const hlaToggle = $("#hlaToggle");
    const hlaFields = $("#hlaFields");

    if (hlaToggle && hlaFields) {

        hlaToggle.addEventListener("change", () => {

            hlaFields.classList.toggle(
                "show",
                hlaToggle.checked
            );

        });
    }


    /* =====================================================
       15. EMERGENCY FORM
       ===================================================== */

    const emergencyForm = $("#emergencyForm");

    if (emergencyForm) {

        emergencyForm.addEventListener("submit", (event) => {

            event.preventDefault();

            const formData = new FormData(emergencyForm);

            const request = {

                id: generateID("EMG"),

                name: formData.get("name") || "",

                age: formData.get("age") || "",

                bloodGroup: formData.get("bloodGroup") || "",

                units: formData.get("units") || "1",

                phone: formData.get("phone") || "",

                email: formData.get("email") || "",

                hospital: formData.get("hospital") || "",

                location: formData.get("location") || "",

                urgency: formData.get("urgency") || "High",

                hlaEnabled: hlaToggle
                    ? hlaToggle.checked
                    : false,

                hlaA: formData.get("hlaA") || "",

                hlaB: formData.get("hlaB") || "",

                hlaC: formData.get("hlaC") || "",

                hlaDR: formData.get("hlaDR") || "",

                notes: formData.get("notes") || "",

                status: "Active",

                createdAt: new Date().toISOString()

            };

            if (!request.name || !request.bloodGroup) {

                showToast(
                    "Missing information",
                    "Please fill in the required fields.",
                    "warning"
                );

                return;
            }

            emergencies.unshift(request);

            setStorage(
                STORAGE.emergencies,
                emergencies
            );

            addActivity(
                "Emergency request created",
                `${request.bloodGroup} blood requested for ${request.name}`
            );

            renderEmergencyHistory();

            emergencyForm.reset();

            if (hlaFields) {
                hlaFields.classList.remove("show");
            }

            if (hlaToggle) {
                hlaToggle.checked = false;
            }

            showEmergencySuccess(request);

        });
    }


    /* =====================================================
       16. EMERGENCY SUCCESS
       ===================================================== */

    function showEmergencySuccess(request) {

        openModal(`

            <div class="modal-success">

                <div class="success-icon">
                    ✓
                </div>

                <h2>Emergency Request Created</h2>

                <p>
                    Your blood request has been saved successfully.
                    The request is now available in your Blood Connect dashboard.
                </p>

                <div class="success-details">

                    <div class="success-detail">
                        <span>Request ID</span>
                        <strong>${escapeHTML(request.id)}</strong>
                    </div>

                    <div class="success-detail">
                        <span>Status</span>
                        <strong>${escapeHTML(request.status)}</strong>
                    </div>

                    <div class="success-detail">
                        <span>Blood Group</span>
                        <strong>${escapeHTML(request.bloodGroup)}</strong>
                    </div>

                    <div class="success-detail">
                        <span>Units</span>
                        <strong>${escapeHTML(request.units)}</strong>
                    </div>

                    <div class="success-detail">
                        <span>Hospital</span>
                        <strong>${escapeHTML(request.hospital || "Not provided")}</strong>
                    </div>

                    <div class="success-detail">
                        <span>Created</span>
                        <strong>${escapeHTML(formatDateTime(request.createdAt))}</strong>
                    </div>

                </div>

                <div class="modal-actions">

                    <button
                        class="primary-button"
                        id="viewEmergencyDashboard"
                    >
                        View Dashboard
                    </button>

                    <button
                        class="secondary-button"
                        id="closeSuccessModal"
                    >
                        Close
                    </button>

                </div>

            </div>
        `);

        const dashboardButton = $("#viewEmergencyDashboard");

        if (dashboardButton) {

            dashboardButton.addEventListener("click", () => {

                closeModal();

                setTimeout(() => {
                    showPage("dashboard");
                }, 250);

            });
        }

        const closeButton = $("#closeSuccessModal");

        if (closeButton) {
            closeButton.addEventListener(
                "click",
                closeModal
            );
        }
    }


    /* =====================================================
       17. EMERGENCY HISTORY
       ===================================================== */

    function renderEmergencyHistory() {

        const container = $("#emergencyHistory");

        if (!container) return;

        emergencies = getStorage(STORAGE.emergencies);

        if (!emergencies.length) {

            container.innerHTML = `
                <div class="empty-state glass">

                    <div class="empty-icon">♥</div>

                    <h3>No emergency requests yet</h3>

                    <p>
                        Your active and previous blood emergency
                        requests will appear here.
                    </p>

                </div>
            `;

            return;
        }

        container.innerHTML = emergencies.map(request => `

            <div class="history-item">

                <div class="history-icon">
                    ♥
                </div>

                <div>

                    <strong>
                        ${escapeHTML(request.bloodGroup)}
                        · ${escapeHTML(request.units)} unit(s)
                    </strong>

                    <small>
                        ${escapeHTML(request.hospital || "Hospital not specified")}
                        · ${escapeHTML(formatDateTime(request.createdAt))}
                    </small>

                    <small>
                        Request ID: ${escapeHTML(request.id)}
                    </small>

                </div>

                <div>

                    <span class="history-status">
                        ${escapeHTML(request.status)}
                    </span>

                    ${
                        request.status === "Active"
                        ? `
                            <button
                                class="small-outline-button cancel-emergency"
                                data-id="${escapeHTML(request.id)}"
                            >
                                Cancel
                            </button>
                        `
                        : ""
                    }

                </div>

            </div>

        `).join("");

        $$(".cancel-emergency").forEach(button => {

            button.addEventListener("click", () => {

                cancelEmergency(button.dataset.id);

            });

        });
    }


    /* =====================================================
       18. CANCEL EMERGENCY
       ===================================================== */

    function cancelEmergency(id) {

        emergencies = getStorage(STORAGE.emergencies);

        const request = emergencies.find(
            item => item.id === id
        );

        if (!request) return;

        request.status = "Cancelled";

        setStorage(
            STORAGE.emergencies,
            emergencies
        );

        addActivity(
            "Emergency request cancelled",
            `Request ${id} was cancelled`
        );

        renderEmergencyHistory();

        showToast(
            "Request cancelled",
            `Emergency request ${id} has been cancelled.`
        );

        renderDashboard();
    }


    /* =====================================================
       19. CAMP REGISTRATION
       ===================================================== */

    $$(".register-btn").forEach(button => {

        button.addEventListener("click", () => {

            const card = button.closest(".camp-card");

            if (!card) return;

            const campName =
                card.dataset.camp ||
                card.querySelector("h3")?.textContent.trim() ||
                "Blood Donation Camp";

            const campDate =
                card.dataset.date ||
                card.querySelector(".camp-date")?.textContent.trim() ||
                "";

            openCampRegistration(
                campName,
                campDate
            );

        });

    });


    /* =====================================================
       20. CAMP REGISTRATION MODAL
       ===================================================== */

    function openCampRegistration(
        campName,
        campDate
    ) {

        openModal(`

            <h2 class="modal-title">
                Register for Blood Camp
            </h2>

            <p class="modal-subtitle">
                Complete the registration form below for
                <strong>${escapeHTML(campName)}</strong>.
            </p>

            <form
                id="campRegistrationForm"
                class="modal-form"
            >

                <input
                    type="hidden"
                    name="campName"
                    value="${escapeHTML(campName)}"
                >

                <input
                    type="hidden"
                    name="campDate"
                    value="${escapeHTML(campDate)}"
                >

                <div class="form-grid">

                    <div class="form-group">
                        <label>
                            Full Name *
                        </label>

                        <input
                            name="fullName"
                            type="text"
                            placeholder="Enter your full name"
                            required
                        >
                    </div>

                    <div class="form-group">
                        <label>
                            Age *
                        </label>

                        <input
                            name="age"
                            type="number"
                            min="18"
                            max="70"
                            placeholder="18"
                            required
                        >
                    </div>

                    <div class="form-group">
                        <label>
                            Gender *
                        </label>

                        <select name="gender" required>

                            <option value="">
                                Select gender
                            </option>

                            <option value="Female">
                                Female
                            </option>

                            <option value="Male">
                                Male
                            </option>

                            <option value="Other">
                                Other
                            </option>

                        </select>
                    </div>

                    <div class="form-group">
                        <label>
                            Blood Group *
                        </label>

                        <select
                            name="bloodGroup"
                            required
                        >

                            <option value="">
                                Select blood group
                            </option>

                            <option>A+</option>
                            <option>A-</option>
                            <option>B+</option>
                            <option>B-</option>
                            <option>AB+</option>
                            <option>AB-</option>
                            <option>O+</option>
                            <option>O-</option>

                        </select>
                    </div>

                    <div class="form-group">
                        <label>
                            Phone Number *
                        </label>

                        <input
                            name="phone"
                            type="tel"
                            placeholder="10-digit mobile number"
                            pattern="[0-9]{10}"
                            required
                        >
                    </div>

                    <div class="form-group">
                        <label>
                            Email
                        </label>

                        <input
                            name="email"
                            type="email"
                            placeholder="you@example.com"
                        >
                    </div>

                    <div class="form-group full-width">

                        <label>
                            Address / Location *
                        </label>

                        <input
                            name="address"
                            type="text"
                            placeholder="Enter your address"
                            required
                        >

                    </div>

                    <div class="form-group">

                        <label>
                            Preferred Date
                        </label>

                        <input
                            name="preferredDate"
                            type="date"
                            required
                        >

                    </div>

                    <div class="form-group">

                        <label>
                            Preferred Time
                        </label>

                        <input
                            name="preferredTime"
                            type="time"
                            required
                        >

                    </div>

                    <div class="form-group">

                        <label>
                            Donated Blood Before?
                        </label>

                        <select name="previousDonation">

                            <option value="No">
                                No
                            </option>

                            <option value="Yes">
                                Yes
                            </option>

                        </select>

                    </div>

                    <div class="form-group">

                        <label>
                            Last Donation Date
                        </label>

                        <input
                            name="lastDonationDate"
                            type="date"
                        >

                    </div>

                    <div class="form-group">

                        <label>
                            HLA Type (Optional)
                        </label>

                        <input
                            name="hla"
                            type="text"
                            placeholder="e.g. A*02 B*07"
                        >

                    </div>

                    <div class="form-group">

                        <label>
                            Emergency Contact
                        </label>

                        <input
                            name="emergencyContact"
                            type="tel"
                            placeholder="Emergency contact number"
                        >

                    </div>

                </div>

                <label class="checkbox-row">

                    <input
                        name="consent"
                        type="checkbox"
                        required
                    >

                    <span>
                        I confirm that the information provided is
                        accurate and I agree to participate in the
                        blood donation camp according to applicable
                        eligibility and medical screening requirements.
                    </span>

                </label>

                <button
                    type="submit"
                    class="primary-button large-button"
                >
                    Confirm Registration
                </button>

            </form>
        `);

        const form = $("#campRegistrationForm");

        if (!form) return;

        form.addEventListener(
            "submit",
            handleCampRegistration
        );
    }


    /* =====================================================
       21. HANDLE CAMP REGISTRATION
       ===================================================== */

    function handleCampRegistration(event) {

        event.preventDefault();

        const form = event.target;

        const data = new FormData(form);

        const registration = {

            id: generateID("REG"),

            campName: data.get("campName") || "",

            campDate: data.get("campDate") || "",

            fullName: data.get("fullName") || "",

            age: data.get("age") || "",

            gender: data.get("gender") || "",

            bloodGroup: data.get("bloodGroup") || "",

            phone: data.get("phone") || "",

            email: data.get("email") || "",

            address: data.get("address") || "",

            preferredDate: data.get("preferredDate") || "",

            preferredTime: data.get("preferredTime") || "",

            previousDonation:
                data.get("previousDonation") || "No",

            lastDonationDate:
                data.get("lastDonationDate") || "",

            hla: data.get("hla") || "",

            emergencyContact:
                data.get("emergencyContact") || "",

            status: "Confirmed",

            createdAt: new Date().toISOString()

        };

        registrations.unshift(registration);

        setStorage(
            STORAGE.registrations,
            registrations
        );

        addActivity(
            "Camp registration completed",
            `${registration.fullName} registered for ${registration.campName}`
        );

        showRegistrationSuccess(
            registration
        );

        renderDashboard();
    }


    /* =====================================================
       22. REGISTRATION SUCCESS
       ===================================================== */

    function showRegistrationSuccess(
        registration
    ) {

        openModal(`

            <div class="modal-success">

                <div class="success-icon">
                    ✓
                </div>

                <h2>
                    Registration Successful
                </h2>

                <p>
                    Your blood donation camp registration has
                    been confirmed successfully.
                </p>

                <div class="success-details">

                    <div class="success-detail">
                        <span>Registration ID</span>
                        <strong>
                            ${escapeHTML(registration.id)}
                        </strong>
                    </div>

                    <div class="success-detail">
                        <span>Camp</span>
                        <strong>
                            ${escapeHTML(registration.campName)}
                        </strong>
                    </div>

                    <div class="success-detail">
                        <span>Participant</span>
                        <strong>
                            ${escapeHTML(registration.fullName)}
                        </strong>
                    </div>

                    <div class="success-detail">
                        <span>Blood Group</span>
                        <strong>
                            ${escapeHTML(registration.bloodGroup)}
                        </strong>
                    </div>

                    <div class="success-detail">
                        <span>Preferred Date</span>
                        <strong>
                            ${escapeHTML(
                                registration.preferredDate ||
                                registration.campDate ||
                                "Not specified"
                            )}
                        </strong>
                    </div>

                    <div class="success-detail">
                        <span>Registered On</span>
                        <strong>
                            ${escapeHTML(
                                formatDateTime(
                                    registration.createdAt
                                )
                            )}
                        </strong>
                    </div>

                </div>

                <div class="modal-actions">

                    <button
                        class="primary-button"
                        id="viewRegistrationButton"
                    >
                        View Registration
                    </button>

                    <button
                        class="secondary-button"
                        id="cancelRegistrationButton"
                    >
                        Cancel Registration
                    </button>

                </div>

            </div>
        `);

        const viewButton =
            $("#viewRegistrationButton");

        if (viewButton) {

            viewButton.addEventListener(
                "click",
                () => {

                    showRegistrationDetails(
                        registration
                    );

                }
            );
        }

        const cancelButton =
            $("#cancelRegistrationButton");

        if (cancelButton) {

            cancelButton.addEventListener(
                "click",
                () => {

                    cancelRegistration(
                        registration.id
                    );

                }
            );
        }
    }


    /* =====================================================
       23. VIEW REGISTRATION
       ===================================================== */

    function showRegistrationDetails(
        registration
    ) {

        openModal(`

            <h2 class="modal-title">
                Registration Details
            </h2>

            <p class="modal-subtitle">
                Registration ID:
                <strong>
                    ${escapeHTML(registration.id)}
                </strong>
            </p>

            <div class="success-details">

                <div class="success-detail">
                    <span>Camp</span>
                    <strong>
                        ${escapeHTML(registration.campName)}
                    </strong>
                </div>

                <div class="success-detail">
                    <span>Status</span>
                    <strong>
                        ${escapeHTML(registration.status)}
                    </strong>
                </div>

                <div class="success-detail">
                    <span>Name</span>
                    <strong>
                        ${escapeHTML(registration.fullName)}
                    </strong>
                </div>

                <div class="success-detail">
                    <span>Age</span>
                    <strong>
                        ${escapeHTML(registration.age)}
                    </strong>
                </div>

                <div class="success-detail">
                    <span>Gender</span>
                    <strong>
                        ${escapeHTML(registration.gender)}
                    </strong>
                </div>

                <div class="success-detail">
                    <span>Blood Group</span>
                    <strong>
                        ${escapeHTML(registration.bloodGroup)}
                    </strong>
                </div>

                <div class="success-detail">
                    <span>Phone</span>
                    <strong>
                        ${escapeHTML(registration.phone)}
                    </strong>
                </div>

                <div class="success-detail">
                    <span>Email</span>
                    <strong>
                        ${escapeHTML(
                            registration.email ||
                            "Not provided"
                        )}
                    </strong>
                </div>

                <div class="success-detail">
                    <span>Preferred Date</span>
                    <strong>
                        ${escapeHTML(
                            registration.preferredDate ||
                            "Not specified"
                        )}
                    </strong>
                </div>

                <div class="success-detail">
                    <span>Preferred Time</span>
                    <strong>
                        ${escapeHTML(
                            registration.preferredTime ||
                            "Not specified"
                        )}
                    </strong>
                </div>

                <div class="success-detail">
                    <span>Previous Donation</span>
                    <strong>
                        ${escapeHTML(
                            registration.previousDonation
                        )}
                    </strong>
                </div>

                <div class="success-detail">
                    <span>HLA</span>
                    <strong>
                        ${escapeHTML(
                            registration.hla ||
                            "Not provided"
                        )}
                    </strong>
                </div>

                <div class="success-detail">
                    <span>Emergency Contact</span>
                    <strong>
                        ${escapeHTML(
                            registration.emergencyContact ||
                            "Not provided"
                        )}
                    </strong>
                </div>

                <div class="success-detail">
                    <span>Registered On</span>
                    <strong>
                        ${escapeHTML(
                            formatDateTime(
                                registration.createdAt
                            )
                        )}
                    </strong>
                </div>

            </div>

            <div class="modal-actions">

                <button
                    class="secondary-button"
                    id="closeRegistrationDetails"
                >
                    Close
                </button>

            </div>
        `);

        const closeButton =
            $("#closeRegistrationDetails");

        if (closeButton) {

            closeButton.addEventListener(
                "click",
                closeModal
            );
        }
    }


    /* =====================================================
       24. CANCEL REGISTRATION
       ===================================================== */

    function cancelRegistration(id) {

        registrations =
            getStorage(STORAGE.registrations);

        const registration =
            registrations.find(
                item => item.id === id
            );

        if (!registration) return;

        registration.status = "Cancelled";

        setStorage(
            STORAGE.registrations,
            registrations
        );

        addActivity(
            "Camp registration cancelled",
            `Registration ${id} was cancelled`
        );

        closeModal();

        showToast(
            "Registration cancelled",
            `Registration ${id} has been cancelled.`
        );

        renderDashboard();
    }


    /* =====================================================
       25. BLOOD GROUP SEARCH
       ===================================================== */

    const bloodSearchForm =
        $("#bloodSearchForm");

    if (bloodSearchForm) {

        bloodSearchForm.addEventListener(
            "submit",
            (event) => {

                event.preventDefault();

                const formData =
                    new FormData(
                        bloodSearchForm
                    );

                const bloodGroup =
                    formData.get("bloodGroup");

                const component =
                    formData.get("component") ||
                    "Whole Blood";

                const location =
                    formData.get("location") ||
                    "Nearby";

                if (!bloodGroup) {

                    showToast(
                        "Select blood group",
                        "Please select a blood group first.",
                        "warning"
                    );

                    return;
                }

                renderBloodResults(
                    bloodGroup,
                    component,
                    location
                );

            }
        );
    }


    /* =====================================================
       26. BLOOD SEARCH RESULTS
       ===================================================== */

    function renderBloodResults(
        bloodGroup,
        component,
        location
    ) {

        const results =
            $("#bloodSearchResults");

        const resultCount =
            $("#bloodResultCount");

        if (!results) return;

        const sampleResults = [

            {
                name: "City Blood Centre",
                location: location,
                units: Math.floor(Math.random() * 9) + 4,
                distance: "2.4 km"
            },

            {
                name: "LifeCare Blood Bank",
                location: location,
                units: Math.floor(Math.random() * 8) + 2,
                distance: "4.1 km"
            },

            {
                name: "Regional Medical Blood Centre",
                location: location,
                units: Math.floor(Math.random() * 7) + 3,
                distance: "6.8 km"
            },

            {
                name: "Community Blood Network",
                location: location,
                units: Math.floor(Math.random() * 6) + 2,
                distance: "8.2 km"
            }

        ];

        if (resultCount) {

            resultCount.textContent =
                `${sampleResults.length} matching centres`;

        }

        results.innerHTML = `

            <div class="empty-state glass">

                <div class="empty-icon">
                    ✓
                </div>

                <h3>
                    Blood search completed
                </h3>

                <p>
                    Showing prototype availability for
                    ${escapeHTML(bloodGroup)}
                    · ${escapeHTML(component)}
                    near ${escapeHTML(location)}.
                </p>

            </div>

            ${sampleResults.map(item => `

                <div class="search-result-card">

                    <div class="search-result-top">

                        <div class="result-blood-group">
                            ${escapeHTML(bloodGroup)}
                        </div>

                        <div class="match-score">
                            ${item.units} units available
                        </div>

                    </div>

                    <h3>
                        ${escapeHTML(item.name)}
                    </h3>

                    <p>
                        ${escapeHTML(component)}
                    </p>

                    <div class="result-meta">

                        <span>
                            ${escapeHTML(item.location)}
                        </span>

                        <span>
                            ${escapeHTML(item.distance)}
                        </span>

                    </div>

                    <button
                        class="small-button bank-request-button"
                        data-bank="${escapeHTML(item.name)}"
                    >
                        Request Blood
                    </button>

                </div>

            `).join("")}

        `;

        $$(".bank-request-button").forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    openBankRequest(
                        button.dataset.bank,
                        bloodGroup
                    );

                }
            );

        });

        showToast(
            "Search completed",
            `${sampleResults.length} matching centres found.`
        );

        addActivity(
            "Blood search performed",
            `${bloodGroup} blood search near ${location}`
        );
    }


    /* =====================================================
       27. HLA SEARCH
       ===================================================== */

    const hlaSearchForm =
        $("#hlaSearchForm");

    if (hlaSearchForm) {

        hlaSearchForm.addEventListener(
            "submit",
            (event) => {

                event.preventDefault();

                const formData =
                    new FormData(
                        hlaSearchForm
                    );

                const hlaA =
                    formData.get("hlaA") || "";

                const hlaB =
                    formData.get("hlaB") || "";

                const hlaC =
                    formData.get("hlaC") || "";

                const hlaDR =
                    formData.get("hlaDR") || "";

                renderHLAResults({
                    hlaA,
                    hlaB,
                    hlaC,
                    hlaDR
                });

            }
        );
    }


    /* =====================================================
       28. HLA RESULTS
       ===================================================== */

    function renderHLAResults(values) {

        const results =
            $("#hlaSearchResults");

        if (!results) return;

        const matches = [

            {
                name: "Compatible Donor Network",
                location: "Nearby region",
                score: "96%"
            },

            {
                name: "Regional HLA Registry",
                location: "National network",
                score: "91%"
            },

            {
                name: "Specialized Donor Centre",
                location: "Partner centre",
                score: "87%"
            }

        ];

        results.innerHTML = matches.map(match => `

            <div class="search-result-card">

                <div class="search-result-top">

                    <div class="result-blood-group">
                        HLA
                    </div>

                    <div class="match-score">
                        ${match.score} match
                    </div>

                </div>

                <h3>
                    ${escapeHTML(match.name)}
                </h3>

                <p>
                    ${escapeHTML(match.location)}
                </p>

                <div class="result-meta">

                    <span>
                        A: ${escapeHTML(values.hlaA || "—")}
                    </span>

                    <span>
                        B: ${escapeHTML(values.hlaB || "—")}
                    </span>

                    <span>
                        C: ${escapeHTML(values.hlaC || "—")}
                    </span>

                    <span>
                        DR: ${escapeHTML(values.hlaDR || "—")}
                    </span>

                </div>

                <button
                    class="small-button"
                    onclick="window.showToastMessage('Match selected','This is a prototype HLA match.')"
                >
                    View Match
                </button>

            </div>

        `).join("");

        showToast(
            "HLA search completed",
            "Prototype compatibility matches generated."
        );

        addActivity(
            "HLA search performed",
            "HLA compatibility search completed"
        );
    }


    /* =====================================================
       29. BLOOD BANK REQUEST
       ===================================================== */

    function openBankRequest(
        bankName,
        selectedBloodGroup = ""
    ) {

        openModal(`

            <h2 class="modal-title">
                Request Blood
            </h2>

            <p class="modal-subtitle">
                Submit a request to
                <strong>${escapeHTML(bankName)}</strong>.
            </p>

            <form
                id="bankRequestForm"
                class="modal-form"
            >

                <input
                    type="hidden"
                    name="bankName"
                    value="${escapeHTML(bankName)}"
                >

                <div class="form-grid">

                    <div class="form-group">
                        <label>
                            Patient Name *
                        </label>

                        <input
                            name="patientName"
                            type="text"
                            placeholder="Patient full name"
                            required
                        >
                    </div>

                    <div class="form-group">
                        <label>
                            Blood Group *
                        </label>

                        <select
                            name="bloodGroup"
                            required
                        >

                            <option value="">
                                Select blood group
                            </option>

                            <option
                                ${selectedBloodGroup === "A+" ? "selected" : ""}
                            >A+</option>

                            <option
                                ${selectedBloodGroup === "A-" ? "selected" : ""}
                            >A-</option>

                            <option
                                ${selectedBloodGroup === "B+" ? "selected" : ""}
                            >B+</option>

                            <option
                                ${selectedBloodGroup === "B-" ? "selected" : ""}
                            >B-</option>

                            <option
                                ${selectedBloodGroup === "AB+" ? "selected" : ""}
                            >AB+</option>

                            <option
                                ${selectedBloodGroup === "AB-" ? "selected" : ""}
                            >AB-</option>

                            <option
                                ${selectedBloodGroup === "O+" ? "selected" : ""}
                            >O+</option>

                            <option
                                ${selectedBloodGroup === "O-" ? "selected" : ""}
                            >O-</option>

                        </select>
                    </div>

                    <div class="form-group">
                        <label>
                            Units Required *
                        </label>

                        <input
                            name="units"
                            type="number"
                            min="1"
                            max="20"
                            value="1"
                            required
                        >
                    </div>

                    <div class="form-group">
                        <label>
                            Contact Number *
                        </label>

                        <input
                            name="phone"
                            type="tel"
                            pattern="[0-9]{10}"
                            placeholder="10-digit mobile number"
                            required
                        >
                    </div>

                    <div class="form-group full-width">
                        <label>
                            Hospital Name *
                        </label>

                        <input
                            name="hospital"
                            type="text"
                            placeholder="Hospital / medical centre"
                            required
                        >
                    </div>

                    <div class="form-group full-width">
                        <label>
                            Additional Information
                        </label>

                        <textarea
                            name="notes"
                            placeholder="Add any relevant information..."
                        ></textarea>
                    </div>

                </div>

                <button
                    type="submit"
                    class="primary-button large-button"
                >
                    Submit Blood Request
                </button>

            </form>
        `);

        const form =
            $("#bankRequestForm");

        if (form) {

            form.addEventListener(
                "submit",
                handleBankRequest
            );

        }
    }


    /* =====================================================
       30. HANDLE BANK REQUEST
       ===================================================== */

    function handleBankRequest(event) {

        event.preventDefault();

        const data =
            new FormData(event.target);

        const request = {

            id: generateID("BRQ"),

            bankName:
                data.get("bankName") || "",

            patientName:
                data.get("patientName") || "",

            bloodGroup:
                data.get("bloodGroup") || "",

            units:
                data.get("units") || "1",

            phone:
                data.get("phone") || "",

            hospital:
                data.get("hospital") || "",

            notes:
                data.get("notes") || "",

            status: "Submitted",

            createdAt:
                new Date().toISOString()

        };

        bankRequests.unshift(request);

        setStorage(
            STORAGE.bankRequests,
            bankRequests
        );

        addActivity(
            "Blood bank request submitted",
            `${request.bloodGroup} requested from ${request.bankName}`
        );

        showBankRequestSuccess(request);

        renderDashboard();
    }


    /* =====================================================
       31. BANK REQUEST SUCCESS
       ===================================================== */

    function showBankRequestSuccess(request) {

        openModal(`

            <div class="modal-success">

                <div class="success-icon">
                    ✓
                </div>

                <h2>
                    Request Submitted
                </h2>

                <p>
                    Your blood request has been recorded
                    successfully.
                </p>

                <div class="success-details">

                    <div class="success-detail">
                        <span>Request ID</span>
                        <strong>
                            ${escapeHTML(request.id)}
                        </strong>
                    </div>

                    <div class="success-detail">
                        <span>Blood Group</span>
                        <strong>
                            ${escapeHTML(request.bloodGroup)}
                        </strong>
                    </div>

                    <div class="success-detail">
                        <span>Units</span>
                        <strong>
                            ${escapeHTML(request.units)}
                        </strong>
                    </div>

                    <div class="success-detail">
                        <span>Blood Bank</span>
                        <strong>
                            ${escapeHTML(request.bankName)}
                        </strong>
                    </div>

                    <div class="success-detail">
                        <span>Hospital</span>
                        <strong>
                            ${escapeHTML(request.hospital)}
                        </strong>
                    </div>

                    <div class="success-detail">
                        <span>Status</span>
                        <strong>
                            ${escapeHTML(request.status)}
                        </strong>
                    </div>

                </div>

                <div class="modal-actions">

                    <button
                        class="primary-button"
                        id="closeBankSuccess"
                    >
                        Done
                    </button>

                </div>

            </div>
        `);

        const done =
            $("#closeBankSuccess");

        if (done) {
            done.addEventListener(
                "click",
                closeModal
            );
        }
    }


    /* =====================================================
       32. BLOOD BANK "VIEW DETAILS"
       ===================================================== */

    $$(".bank-details-button").forEach(button => {

        button.addEventListener("click", () => {

            const card =
                button.closest(".full-bank-card") ||
                button.closest(".bank-card");

            if (!card) return;

            const name =
                card.querySelector("h3")?.textContent.trim() ||
                "Blood Bank";

            const location =
                card.querySelector("p")?.textContent.trim() ||
                "Location information unavailable";

            openModal(`

                <div class="modal-success">

                    <div class="success-icon">
                        +
                    </div>

                    <h2>
                        ${escapeHTML(name)}
                    </h2>

                    <p>
                        ${escapeHTML(location)}
                    </p>

                    <div class="success-details">

                        <div class="success-detail">
                            <span>Service</span>
                            <strong>
                                Blood Availability
                            </strong>
                        </div>

                        <div class="success-detail">
                            <span>Network</span>
                            <strong>
                                Blood Connect Prototype
                            </strong>
                        </div>

                        <div class="success-detail">
                            <span>Request</span>
                            <strong>
                                Available
                            </strong>
                        </div>

                        <div class="success-detail">
                            <span>Support</span>
                            <strong>
                                24 × 7 prototype workflow
                            </strong>
                        </div>

                    </div>

                    <div class="modal-actions">

                        <button
                            class="primary-button"
                            id="requestFromBank"
                        >
                            Request Blood
                        </button>

                        <button
                            class="secondary-button"
                            id="closeBankDetails"
                        >
                            Close
                        </button>

                    </div>

                </div>

            `);

            const requestButton =
                $("#requestFromBank");

            if (requestButton) {

                requestButton.addEventListener(
                    "click",
                    () => {

                        openBankRequest(
                            name
                        );

                    }
                );
            }

            const closeButton =
                $("#closeBankDetails");

            if (closeButton) {

                closeButton.addEventListener(
                    "click",
                    closeModal
                );
            }

        });

    });


    /* =====================================================
       33. DASHBOARD
       ===================================================== */

    function renderDashboard() {

        emergencies =
            getStorage(STORAGE.emergencies);

        registrations =
            getStorage(STORAGE.registrations);

        bankRequests =
            getStorage(STORAGE.bankRequests);

        activities =
            getStorage(STORAGE.activities);

        const campCount =
            $("#campRegistrationCount");

        const emergencyCount =
            $("#emergencyRequestCount");

        const bankCount =
            $("#bankRequestCount");

        const totalActivity =
            $("#activityCount");

        if (campCount) {
            campCount.textContent =
                registrations.filter(
                    item => item.status !== "Cancelled"
                ).length;
        }

        if (emergencyCount) {
            emergencyCount.textContent =
                emergencies.filter(
                    item => item.status === "Active"
                ).length;
        }

        if (bankCount) {
            bankCount.textContent =
                bankRequests.length;
        }

        if (totalActivity) {
            totalActivity.textContent =
                activities.length;
        }

        renderActivity();
    }


    /* =====================================================
       34. ACTIVITY
       ===================================================== */

    function renderActivity() {

        const container =
            $("#activityList");

        if (!container) return;

        activities =
            getStorage(STORAGE.activities);

        if (!activities.length) {

            container.innerHTML = `

                <div class="empty-activity">
                    No activity yet.
                </div>

            `;

            return;
        }

        container.innerHTML =
            activities.slice(0, 8).map(activity => `

                <div class="activity-item">

                    <div class="activity-icon">
                        ✓
                    </div>

                    <div>

                        <strong>
                            ${escapeHTML(activity.title)}
                        </strong>

                        <small>
                            ${escapeHTML(activity.description)}
                            ·
                            ${escapeHTML(
                                formatDateTime(
                                    activity.date
                                )
                            )}
                        </small>

                    </div>

                </div>

            `).join("");
    }


    /* =====================================================
       35. DASHBOARD QUICK ACTIONS
       ===================================================== */

    $$(".dashboard-action").forEach(button => {

        button.addEventListener("click", () => {

            const target =
                button.dataset.page;

            if (target) {
                showPage(target);
            }

        });

    });


    /* =====================================================
       36. BANK SEARCH FILTER
       ===================================================== */

    const bankFilter =
        $("#bankFilter");

    const bankLocationFilter =
        $("#bankLocationFilter");

    function filterBanks() {

        const search =
            bankFilter
                ? bankFilter.value.toLowerCase().trim()
                : "";

        const location =
            bankLocationFilter
                ? bankLocationFilter.value.toLowerCase()
                : "all";

        $$(".full-bank-card").forEach(card => {

            const text =
                card.textContent.toLowerCase();

            const matchesSearch =
                !search ||
                text.includes(search);

            const matchesLocation =
                location === "all" ||
                text.includes(location);

            card.style.display =
                matchesSearch && matchesLocation
                    ? ""
                    : "none";

        });
    }

    if (bankFilter) {
        bankFilter.addEventListener(
            "input",
            filterBanks
        );
    }

    if (bankLocationFilter) {
        bankLocationFilter.addEventListener(
            "change",
            filterBanks
        );
    }


    /* =====================================================
       37. DONOR BUTTONS
       ===================================================== */

    $$("[data-donor-action]").forEach(button => {

        button.addEventListener("click", () => {

            const action =
                button.dataset.donorAction;

            if (action === "camps") {
                showPage("camps");
            }

            if (action === "search") {
                showPage("search");
            }

        });

    });


    /* =====================================================
       38. RECIPIENT BUTTONS
       ===================================================== */

    $$("[data-recipient-action]").forEach(button => {

        button.addEventListener("click", () => {

            const action =
                button.dataset.recipientAction;

            if (action === "emergency") {
                showPage("emergency");
            }

            if (action === "search") {
                showPage("search");
            }

        });

    });


    /* =====================================================
       39. GLOBAL CUSTOM TOAST FUNCTION
       Used by inline prototype buttons if present.
       ===================================================== */

    window.showToastMessage = (
        title,
        message
    ) => {

        showToast(
            title,
            message
        );

    };


    /* =====================================================
       40. DEMO DATA INITIALIZATION
       ===================================================== */

    function initializeDemoActivity() {

        activities =
            getStorage(STORAGE.activities);

        if (activities.length > 0) {
            return;
        }

        const demoActivities = [

            {
                id: "ACT-DEMO-01",
                title: "Blood Connect initialized",
                description:
                    "Your connected blood-care dashboard is ready.",
                date:
                    new Date().toISOString()
            }

        ];

        setStorage(
            STORAGE.activities,
            demoActivities
        );

        activities = demoActivities;
    }

    initializeDemoActivity();


    /* =====================================================
       41. SET DEFAULT PAGE
       ===================================================== */

    const activePage =
        $(".page.active");

    if (!activePage) {

        const home =
            $("#home");

        if (home) {
            home.classList.add("active");
        }
    }

    /* =====================================================
       42. FIRST DASHBOARD RENDER
       ===================================================== */

    renderDashboard();

    renderEmergencyHistory();


    /* =====================================================
       43. FINAL READY MESSAGE
       ===================================================== */

    console.log(
        "Blood Connect initialized successfully."
    );

});
