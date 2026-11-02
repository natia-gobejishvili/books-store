import { useCallback, useEffect, useState, type ChangeEvent, type FormEvent, } from "react";

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
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [form, setForm] = useState<AddressRequest>(INITIAL_FORM);
    const [editingId, setEditingId] = useState<string | null>(null);

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

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
                    : "მისამართების ჩატვირთვა ვერ მოხერხდა.",
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
            setError("გთხოვ, შეავსო ყველა სავალდებულო ველი.");
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
                setSuccess("მისამართი წარმატებით განახლდა.");
            } else {
                await addressService.createAddress(requestData);
                setSuccess("მისამართი წარმატებით დაემატა.");
            }

            resetForm();
            await loadAddresses();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "ოპერაციის შესრულება ვერ მოხერხდა.",
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

            setSuccess("ძირითადი მისამართი წარმატებით შეიცვალა.");
            await loadAddresses();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "ძირითადი მისამართის შეცვლა ვერ მოხერხდა.",
            );
        }
    }

    async function handleDelete(id: string) {
        const confirmed = window.confirm(
            "ნამდვილად გსურს ამ მისამართის წაშლა?",
        );

        if (!confirmed) return;

        setError(null);
        setSuccess(null);

        try {
            await addressService.deleteAddress(id);

            if (editingId === id) {
                resetForm();
            }

            setSuccess("მისამართი წარმატებით წაიშალა.");
            await loadAddresses();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "მისამართის წაშლა ვერ მოხერხდა.",
            );
        }
    }

    return (
        <main className="addresses-page">
            <div className="addresses-container">
                <header className="addresses-header">
                    <div>
                        <p className="addresses-eyebrow">BOOKS STORE</p>
                        <h1>ჩემი მისამართები</h1>
                        <p className="addresses-description">
                            მართე მიწოდების მისამართები ერთ სივრცეში.
                        </p>
                    </div>

                    <a href="/catalog" className="back-to-catalog">
                        ← კატალოგზე დაბრუნება
                    </a>
                </header>

                {error && (
                    <div className="address-message address-error">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="address-message address-success">
                        {success}
                    </div>
                )}

                <section className="address-form-section">
                    <div className="section-heading">
                        <h2>
                            {editingId
                                ? "მისამართის რედაქტირება"
                                : "ახალი მისამართის დამატება"}
                        </h2>

                        <span>{addresses.length}/10 მისამართი</span>
                    </div>

                    <form className="address-form" onSubmit={handleSubmit}>
                        <div className="address-form-grid">
                            <label className="address-field">
                                <span>მისამართის დასახელება *</span>
                                <input
                                    type="text"
                                    name="label"
                                    value={form.label}
                                    onChange={handleInputChange}
                                    placeholder="მაგ. სახლი, სამსახური"
                                    maxLength={50}
                                    required
                                />
                            </label>

                            <label className="address-field">
                                <span>სახელი და გვარი *</span>
                                <input
                                    type="text"
                                    name="fullName"
                                    value={form.fullName}
                                    onChange={handleInputChange}
                                    placeholder="შეიყვანე სახელი და გვარი"
                                    required
                                />
                            </label>

                            <label className="address-field">
                                <span>ტელეფონის ნომერი *</span>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={form.phone}
                                    onChange={handleInputChange}
                                    placeholder="მაგ. 599123456"
                                    required
                                />
                            </label>

                            <label className="address-field">
                                <span>ქალაქი *</span>
                                <input
                                    type="text"
                                    name="city"
                                    value={form.city}
                                    onChange={handleInputChange}
                                    placeholder="შეიყვანე ქალაქი"
                                    required
                                />
                            </label>

                            <label className="address-field address-field-full">
                                <span>სრული მისამართი *</span>
                                <input
                                    type="text"
                                    name="address"
                                    value={form.address}
                                    onChange={handleInputChange}
                                    placeholder="ქუჩა, სახლის ნომერი, ბინა..."
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
                            <span>ძირითად მისამართად მონიშვნა</span>
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
                                    ? "მუშავდება..."
                                    : editingId
                                      ? "ცვლილებების შენახვა"
                                      : "მისამართის დამატება"}
                            </button>

                            {editingId && (
                                <button
                                    type="button"
                                    className="address-cancel-button"
                                    onClick={resetForm}
                                    disabled={isSaving}
                                >
                                    გაუქმება
                                </button>
                            )}
                        </div>

                        {!editingId && addresses.length >= 10 && (
                            <p className="address-limit-message">
                                მიღწეულია მისამართების მაქსიმალური რაოდენობა.
                                ახალი მისამართის დასამატებლად წაშალე არსებული.
                            </p>
                        )}
                    </form>
                </section>

                <section className="saved-addresses-section">
                    <div className="section-heading">
                        <h2>შენახული მისამართები</h2>
                    </div>

                    {isLoading ? (
                        <div className="addresses-loading">
                            მისამართები იტვირთება...
                        </div>
                    ) : addresses.length === 0 ? (
                        <div className="addresses-empty">
                            <h3>მისამართები ჯერ არ გაქვს დამატებული</h3>
                            <p>
                                დაამატე მისამართი, რათა შეკვეთის გაფორმება
                                უფრო მარტივად შეძლო.
                            </p>
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
                                                    ძირითადი მისამართი
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="address-card-details">
                                        <p>
                                            <strong>მიმღები:</strong>{" "}
                                            {address.fullName}
                                        </p>
                                        <p>
                                            <strong>ტელეფონი:</strong>{" "}
                                            {address.phone}
                                        </p>
                                        <p>
                                            <strong>ქალაქი:</strong>{" "}
                                            {address.city}
                                        </p>
                                        <p>
                                            <strong>მისამართი:</strong>{" "}
                                            {address.address}
                                        </p>
                                    </div>

                                    <div className="address-card-actions">
                                        {!address.isDefault && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    void handleSetDefault(
                                                        address.id,
                                                    )
                                                }
                                            >
                                                ძირითადად არჩევა
                                            </button>
                                        )}

                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleEdit(address)
                                            }
                                        >
                                            რედაქტირება
                                        </button>

                                        <button
                                            type="button"
                                            className="address-delete-button"
                                            onClick={() =>
                                                void handleDelete(address.id)
                                            }
                                        >
                                            წაშლა
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