
import { useAuth } from "../context/AuthContext";
import Button from "../shared/ui/Button";

export default function CatalogPage() {
    const { user, logout } = useAuth();
    
    return (
        <main className="auth-page">
            <section className="auth-intro">
                <span className="auth-eyebrow">BOOKS STORE</span>
                <h1>მოგესალმები წიგნების სამყაროში!</h1>
                <p>ავტორიზაცია წარმატებულია. შემდეგ ეტაპზე აქ გამოჩნდება წიგნების კატალოგი.</p>
            </section>
            
            <section className="auth-card">
                <h2 className="auth-card__heading">შენი ანგარიში</h2>
                <p className="auth-card__description">შესული ხარ როგორც {user?.name || user?.email}.</p>
                
                <Button fullWidth onClick={logout}>გამოსვლა</Button>
            </section>
        </main>
    );
}
