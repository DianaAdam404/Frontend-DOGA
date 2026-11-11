import { useState } from "react";
import axios from "axios";
import "./OrderForm.css";

const initialFormData = {
    name: "",
    email: "",
    phone: "",
    postalCode: "",
    city: "",
    address: "",
    paymentMethod: "",
};

const paymentMethods = ["Készpénz", "Előre utalás", "Utánvét", "Bankkártya"];
const orderEndpoint = import.meta.env.VITE_ORDER_API_URL;

function validateStep(step, formData) {
    const errors = {};

    if (step === 1) {
        if (!formData.name.trim()) {
            errors.name = "A név megadása kötelező.";
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
            errors.email = "Adj meg egy érvényes e-mail címet.";
        }

        if (formData.phone.trim().length < 9) {
            errors.phone = "A telefonszám legalább 9 karakter hosszú legyen.";
        }
    }

    if (step === 2) {
        if (!/^\d{4}$/.test(formData.postalCode)) {
            errors.postalCode =
                "Az irányítószám pontosan 4 számjegyből álljon.";
        }

        if (formData.city.trim().length < 2) {
            errors.city = "A város neve legalább 2 karakter hosszú legyen.";
        }

        if (formData.address.trim().length < 6) {
            errors.address =
                "Az utca és házszám legalább 6 karakter hosszú legyen.";
        }
    }

    if (step === 3 && !paymentMethods.includes(formData.paymentMethod)) {
        errors.paymentMethod = "Válassz egy fizetési módot. ";
    }
    return errors;
}

export default function OrderForm() {
    const [formData, setFormData] = useState(initialFormData);
    const [step, setStep] = useState(1);
    const [errors, setErrors] = useState({});
    const [message, setMessage] = useState({ text: "", type: "" });
    const [loading, setLoading] = useState(false);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((currentData) => ({ ...currentData, [name]: value }));
        setErrors((currentErrors) => {
            const { [name]: _removedError, ...remainingErrors } = currentErrors;
            return remainingErrors;
        });
        setMessage({ text: "", type: "" });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const stepErrors = validateStep(step, formData);
        setErrors(stepErrors);
        setMessage({ text: "", type: "" });

        if (Object.keys(stepErrors).length > 0) {
            return;
        }

        if (step < 3) {
            setStep((currentStep) => currentStep + 1);
            return;
        }

        setLoading(true);
        try {
            await axios.post(orderEndpoint, formData);
            setMessage({
                text: "A megrendelést sikeresen elküldtük.",
                type: "success",
            });
        } catch (error) {
            const serverMessage = error.response?.data?.message;
            setMessage({
                text:
                    typeof serverMessage === "string"
                        ? `A megrendelés elküldése nem sikerült: ${serverMessage}`
                        : "A megrendelés elküldése nem sikerült. Próbáld újra később.",
                type: "error",
            });
        } finally {
            setLoading(false);
        }
    };

    const goBack = () => {
        setStep((currentStep) => Math.max(1, currentStep - 1));
        setErrors({});
        setMessage({ text: "", type: "" });
    };

    const fieldError = (name) =>
        errors[name] ? (
            <span className="order-field-error" id={`${name}-error`}>
                {errors[name]}
            </span>
        ) : null;

    return (
        <main className="order-page">
            <section className="order-card">
                <h1 className="order-title" id="order-title">
                    Megrendelés véglegesítése
                </h1>

                <ol className="order-progress">
                    {["Személyes adatok", "Szállítás", "Összegzés"].map(
                        (label, index) => {
                            const stepNumber = index + 1;
                            const state =
                                stepNumber === step
                                    ? "current"
                                    : stepNumber < step
                                      ? "complete"
                                      : "upcoming";
                            <div></div>;
                            return (
                                <li
                                    className={`order-progress-step order-progress-step--${state}`}
                                    key={label}
                                    aria-current={
                                        stepNumber === step ? "step" : undefined
                                    }
                                >
                                    <span
                                        className="order-progress-number"
                                        aria-hidden="true"
                                    >
                                        {stepNumber < step ? "✓" : stepNumber}
                                    </span>
                                    <span className="order-progress-label">
                                        {label}
                                    </span>
                                </li>
                            );
                        },
                    )}
                </ol>
                <form className="order-form" onSubmit={handleSubmit} noValidate>
                    {step === 1 && (
                        <section
                            className="order-step"
                            aria-labelledby="personal-title"
                        >
                            <h2 id="personal-title">
                                1. Lépés: Személyes adatok
                            </h2>
                            <div className="order-fields">
                                <div className="order-field">
                                    <label htmlFor="name">Név</label>
                                    <input
                                        autoComplete="name"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        aria-invalid={Boolean(errors.name)}
                                        aria-describedby={
                                            errors.name
                                                ? "name-error"
                                                : undefined
                                        }
                                    />
                                    {fieldError("name")}
                                </div>
                                <div className="order-field">
                                    <label htmlFor="email">E-mail cím</label>
                                    <input
                                        autoComplete="email"
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        aria-invalid={Boolean(errors.email)}
                                        aria-describedby={
                                            errors.email
                                                ? "email-error"
                                                : undefined
                                        }
                                    />
                                    {fieldError("email")}
                                </div>
                                <div className="order-field">
                                    <label htmlFor="phone">Telefonszám</label>
                                    <input
                                        autoComplete="tel"
                                        id="phone"
                                        name="phone"
                                        type="tel"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        aria-invalid={Boolean(errors.phone)}
                                        aria-describedby={
                                            errors.phone
                                                ? "phone-error"
                                                : undefined
                                        }
                                    />
                                    {fieldError("phone")}
                                </div>
                            </div>
                        </section>
                    )}

                    {step === 2 && (
                        <section
                            className="order-step"
                            aria-labelledby="shipping-title"
                        >
                            <h2 id="shipping-title">
                                2. Lépés: Szállítási cím és fizetési mód
                            </h2>
                            <div className="order-fields">
                                <div className="order-field">
                                    <label htmlFor="postalCode">
                                        Irányítószám
                                    </label>
                                    <input
                                        autoComplete="postal-code"
                                        id="postalCode"
                                        inputMode="numeric"
                                        maxLength={4}
                                        name="postalCode"
                                        value={formData.postalCode}
                                        onChange={handleChange}
                                        aria-invalid={Boolean(
                                            errors.postalCode,
                                        )}
                                        aria-describedby={
                                            errors.postalCode
                                                ? "postalCode-error"
                                                : undefined
                                        }
                                    />
                                    {fieldError("postalCode")}
                                </div>
                                <div className="order-field">
                                    <label htmlFor="city">Város</label>
                                    <input
                                        autoComplete="address-level2"
                                        id="city"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleChange}
                                        aria-invalid={Boolean(errors.city)}
                                        aria-describedby={
                                            errors.city
                                                ? "city-error"
                                                : undefined
                                        }
                                    />
                                    {fieldError("city")}
                                </div>
                                <div className="order-field">
                                    <label htmlFor="address">
                                        Utca, házszám
                                    </label>
                                    <input
                                        autoComplete="street-address"
                                        id="address"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        aria-invalid={Boolean(errors.address)}
                                        aria-describedby={
                                            errors.address
                                                ? "address-error"
                                                : undefined
                                        }
                                    />
                                    {fieldError("address")}
                                </div>
                            </div>
                        </section>
                    )}

                    {step === 3 && (
                        <section
                            className="order-step"
                            aria-labelledby="summary-title"
                        >
                            <h2 id="summary-title">
                                3. Lépés:Fizetés és összegzés
                            </h2>
                            <fieldset className="order-payment">
                                <legend>Fizetési mód</legend>
                                {paymentMethods.map((method) => (
                                    <label
                                        className="order-payment-option"
                                        key={method}
                                    >
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value={method}
                                            checked={
                                                formData.paymentMethod ===
                                                method
                                            }
                                            onChange={handleChange}
                                            aria-invalid={Boolean(
                                                errors.paymentMethod,
                                            )}
                                            aria-describedby={
                                                errors.paymentMethod
                                                    ? "paymentMethod-error"
                                                    : undefined
                                            }
                                        />
                                        <span>{method}</span>
                                    </label>
                                ))}
                                {fieldError("paymentMethod")}
                            </fieldset>
                            <div className="order-summary">
                                <h3>Rendelés áttekintése</h3>
                                <dl>
                                    <div>
                                        <dt>Név</dt>
                                        <dd>{formData.name}</dd>
                                    </div>
                                    <div>
                                        <dt>E-mail</dt>
                                        <dd>{formData.email}</dd>
                                    </div>
                                    <div>
                                        <dt>Telefonszám</dt>
                                        <dd>{formData.phone}</dd>
                                    </div>
                                    <div>
                                        <dt>Szállítási cím</dt>
                                        <dd>
                                            {formData.postalCode}{" "}
                                            {formData.city}, {formData.address}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt>Fizetési mód</dt>
                                        <dd>
                                            {formData.paymentMethod ||
                                                "Nincs kiválasztva"}
                                        </dd>
                                    </div>
                                    <div className="order-summary-total">
                                        <dt>Végösszeg</dt>
                                        <dd>12 990 Ft</dd>
                                    </div>
                                </dl>
                            </div>
                        </section>
                    )}

                    {message.text && (
                        <p
                            className={`order-message order-message--${message.type}`}
                            role="status"
                        >
                            {message.text}
                        </p>
                    )}

                    <div className="order-actions">
                        {step > 1 && (
                            <button
                                className="order-button order-button--secondary"
                                type="button"
                                onClick={goBack}
                            >
                                Vissza
                            </button>
                        )}
                        {step < 3 ? (
                            <button
                                className="order-button order-button--primary"
                                type="submit"
                            >
                                Tovább
                            </button>
                        ) : (
                            <button
                                className="order-button order-button--primary"
                                type="submit"
                                disabled={loading}
                            >
                                {loading
                                    ? "Küldés folyamatban…"
                                    : "Megrendelés elküldése"}
                            </button>
                        )}
                    </div>
                </form>
            </section>
        </main>
    );
}
//kicsit tulkomplikaltam, de mukodik :)
