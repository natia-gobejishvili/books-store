import {useCallback, useEffect, useState, type ChangeEvent, type FormEvent,} from "react";
import { useTranslation } from "react-i18next";

import { addressService } from "../services/addressService";
import type { Address, AddressRequest } from "../types/address";

import "../styles/addresses.css";

const INITIAL_FORM: AddressRequest = {
    label: "",
    fullName: "",
    phone: "",
    city: "",
    address: "",
    isDefault: false,
};

export default function AddressesPage() {
    const { t } = useTranslation();

    const [addresses, setAddresses] = useState<Address[]>([]);
    const [form, setForm] = useState<AddressRequest>(INITIAL_FORM);
    const [editingId, setEditingId] = useState<string | null>(null);

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const translateMessage = (message: string | null) => {
        if (!message) return null;

        return message.startsWith("addresses.")
            ? t(message)
            : message;
    };

    const loadAddresses = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await addressService.getAddresses();
            setAddresses(response.items);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "addresses.loadError",
            );
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadAddresses();
    }, [loadAddresses]);

    function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
        const { name, value, type, checked } = event.target;

        setForm((current) => ({
            ...current,
            [name]: type === "checkbox" ? checked : value,
        }));
    }

    function resetForm() {
        setForm(INITIAL_FORM);
        setEditingId(null);
        setError(null);
    }

    function handleEdit(address: Address) {
        setForm({
            label: address.label,
            fullName: address.fullName,
            phone: address.phone,
            city: address.city,
            address: address.address,
            isDefault: address.isDefault,
        });

        setEditingId(address.id);
        setError(null);
        setSuccess(null);

        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setError(null);
        setSuccess(null);

        if (
            !form.label.trim() ||
            !form.fullName.trim() ||
            !form.phone.trim() ||
            !form.city.trim() ||
            !form.address.trim()
        ) {
            setError("addresses.requiredFields");
            return;
        }

        setIsSaving(true);

        const currentAddress = addresses.find(
            (address) => address.id === editingId,
        );

        const requestData: AddressRequest = {
            label: form.label.trim(),
            fullName: form.fullName.trim(),
            phone: form.phone.trim(),
            city: form.city.trim(),
            address: form.address.trim(),
            ...(
                !editingId || !currentAddress?.isDefault || form.isDefault
                    ? { isDefault: form.isDefault }
                    : {}
            ),
        };

        try {
            if (editingId) {
                await addressService.updateAddress(editingId, requestData);
                setSuccess("addresses.updateSuccess");
            } else {
                await addressService.createAddress(requestData);
                setSuccess("addresses.addSuccess");
            }

            resetForm();
            await loadAddresses();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "addresses.operationError",
            );
        } finally {
            setIsSaving(false);
        }
    }

    async function handleSetDefault(id: string) {
        setError(null);
        setSuccess(null);

        try {
            await addressService.updateAddress(id, {
                isDefault: true,
            });

            setSuccess("addresses.defaultSuccess");
            await loadAddresses();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "addresses.defaultError",
            );
        }
    }

    async function handleDelete(id: string) {
        const confirmed = window.confirm(
            t("addresses.deleteConfirmation"),
        );

        if (!confirmed) return;

        setError(null);
        setSuccess(null);

        try {
            await addressService.deleteAddress(id);

            if (editingId === id) {
                resetForm();
            }

            setSuccess("addresses.deleteSuccess");
            await loadAddresses();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "addresses.deleteError",
            );
        }
    }

    return (
        <main className="addresses-page">
            <div className="addresses-container">
                <header className="addresses-header">
                    <div>
                        <p className="addresses-eyebrow">BOOKS STORE</p>
                        <h1>{t("addresses.title")}</h1>
                        <p className="addresses-description">
                            {t("addresses.description")}
                        </p>
                    </div>

                    <a href="/catalog" className="back-to-catalog">
                        ← {t("addresses.backToCatalog")}
                    </a>
                </header>

                {error && (
                    <div className="address-message address-error">
                        {translateMessage(error)}
                    </div>
                )}

                {success && (
                    <div className="address-message address-success">
                        {translateMessage(success)}
                    </div>
                )}

                <section className="address-form-section">
                    <div className="section-heading">
                        <h2>
                            {editingId
                                ? t("addresses.editTitle")
                                : t("addresses.addTitle")}
                        </h2>

                        <span>
                            {t("addresses.addressCount", {
                                count: addresses.length,
                                max: 10,
                            })}
                        </span>
                    </div>

                    <form className="address-form" onSubmit={handleSubmit}>
                        <div className="address-form-grid">
                            <label className="address-field">
                                <span>{t("addresses.label")} *</span>
                                <input
                                    type="text"
                                    name="label"
                                    value={form.label}
                                    onChange={handleInputChange}
                                    placeholder={t("addresses.labelPlaceholder")}
                                    maxLength={50}
                                    required
                                />
                            </label>

                            <label className="address-field">
                                <span>{t("addresses.fullName")} *</span>
                                <input
                                    type="text"
                                    name="fullName"
                                    value={form.fullName}
                                    onChange={handleInputChange}
                                    placeholder={t("addresses.fullNamePlaceholder")}
                                    required
                                />
                            </label>

                            <label className="address-field">
                                <span>{t("addresses.phone")} *</span>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={form.phone}
                                    onChange={handleInputChange}
                                    placeholder={t("addresses.phonePlaceholder")}
                                    required
                                />
                            </label>

                            <label className="address-field">
                                <span>{t("addresses.city")} *</span>
                                <input
                                    type="text"
                                    name="city"
                                    value={form.city}
                                    onChange={handleInputChange}
                                    placeholder={t("addresses.cityPlaceholder")}
                                    required
                                />
                            </label>

                            <label className="address-field address-field-full">
                                <span>{t("addresses.address")} *</span>
                                <input
                                    type="text"
                                    name="address"
                                    value={form.address}
                                    onChange={handleInputChange}
                                    placeholder={t("addresses.addressPlaceholder")}
                                    required
                                />
                            </label>
                        </div>

                        <label className="default-address-checkbox">
                            <input
                                type="checkbox"
                                name="isDefault"
                                checked={form.isDefault}
                                onChange={handleInputChange}
                            />
                            <span>{t("addresses.setAsDefault")}</span>
                        </label>

                        <div className="address-form-actions">
                            <button
                                type="submit"
                                className="address-primary-button"
                                disabled={
                                    isSaving ||
                                    (!editingId && addresses.length >= 10)
                                }
                            >
                                {isSaving
                                    ? t("addresses.processing")
                                    : editingId
                                        ? t("addresses.saveChanges")
                                        : t("addresses.addAddress")}
                            </button>

                            {editingId && (
                                <button
                                    type="button"
                                    className="address-cancel-button"
                                    onClick={resetForm}
                                    disabled={isSaving}
                                >
                                    {t("addresses.cancel")}
                                </button>
                            )}
                        </div>

                        {!editingId && addresses.length >= 10 && (
                            <p className="address-limit-message">
                                {t("addresses.limitReached")}
                            </p>
                        )}
                    </form>
                </section>

                <section className="saved-addresses-section">
                    <div className="section-heading">
                        <h2>{t("addresses.savedTitle")}</h2>
                    </div>

                    {isLoading ? (
                        <div className="addresses-loading">
                            {t("addresses.loading")}
                        </div>
                    ) : addresses.length === 0 ? (
                        <div className="addresses-empty">
                            <h3>{t("addresses.emptyTitle")}</h3>
                            <p>{t("addresses.emptyDescription")}</p>
                        </div>
                    ) : (
                        <div className="addresses-list">
                            {addresses.map((address) => (
                                <article
                                    className="address-card"
                                    key={address.id}
                                >
                                    <div className="address-card-top">
                                        <div>
                                            <h3>{address.label}</h3>
                                            {address.isDefault && (
                                                <span className="default-address-badge">
                                                    {t("addresses.defaultBadge")}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="address-card-details">
                                        <p>
                                            <strong>{t("addresses.recipient")}:</strong>{" "}
                                            {address.fullName}
                                        </p>
                                        <p>
                                            <strong>{t("addresses.phone")}:</strong>{" "}
                                            {address.phone}
                                        </p>
                                        <p>
                                            <strong>{t("addresses.city")}:</strong>{" "}
                                            {address.city}
                                        </p>
                                        <p>
                                            <strong>{t("addresses.address")}:</strong>{" "}
                                            {address.address}
                                        </p>
                                    </div>

                                    <div className="address-card-actions">
                                        {!address.isDefault && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    void handleSetDefault(address.id)
                                                }
                                            >
                                                {t("addresses.makeDefault")}
                                            </button>
                                        )}

                                        <button
                                            type="button"
                                            onClick={() => handleEdit(address)}
                                        >
                                            {t("addresses.edit")}
                                        </button>

                                        <button
                                            type="button"
                                            className="address-delete-button"
                                            onClick={() =>
                                                void handleDelete(address.id)
                                            }
                                        >
                                            {t("addresses.delete")}
                                        </button>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}
