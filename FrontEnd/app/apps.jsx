import "../global.css"
import {useTranslation} from "react-i18next";

export default function Apps() {

    const {t} = useTranslation();
    return (
        <div className="qr-landing-page">
            <div className="background-elements">
                <div className="circle circle-1"></div>
                <div className="circle circle-2"></div>
                <div className="circle circle-3"></div>
            </div>
            
            <header className="header">
                <h1>FaceLinked</h1>
            </header>
            
            <main className="main-content">
                <div className="hero-section">
                    <h2>{t("available.soon")}</h2>
                </div>
                
                <section className="download-section">                    
                    <div className="store-badges">
                        {/* App Store Badge Placeholder */}
                        <a href="#" className="badge app-store-badge">
                            <div className="placeholder-badge">
                                <svg viewBox="0 0 24 24" className="store-icon"><path fill="currentColor" d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.53 4.08zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.32 2.32-1.66 4.22-3.74 4.25z"/></svg>
                                <span className="store-text">App Store</span>
                            </div>
                        </a>
                        
                        {/* Google Play Badge Placeholder */}
                        <a href="https://play.google.com/store/apps/details?id=com.orion.facelinked" className="badge play-store-badge">
                            <div className="placeholder-badge">
                                <svg viewBox="0 0 24 24" className="store-icon">
                                    <path fill="#4285F4" d="M12.954 11.616l2.957-2.957L6.36 3.291c-.633-.342-1.226-.39-1.746-.016l8.34 8.341z"/>
                                    <path fill="#EA4335" d="M3.766 2.435c-.235.234-.37.554-.37.891v17.348c0 .34.134.662.372.896l8.374-8.373-8.376-8.762z"/>
                                    <path fill="#34A853" d="M19.24 10.616l-2.45-1.428-3.255 3.255 3.255 3.255 2.45-1.428c.684-.396 1.18-1.135 1.18-1.827 0-.692-.496-1.431-1.18-1.827z"/>
                                    <path fill="#FBBC05" d="M4.612 20.676c.514.328 1.086.305 1.685-.044l9.063-5.292-2.957-2.957-7.791 8.293z"/>
                                </svg>
                                <span className="store-text">Google Play</span>
                            </div>
                        </a>
                    </div>
                </section>
                
                <section className="website-section">
                    <a href="/" className="website-button">{t("view.website")}</a>
                </section>
            </main>
            
            <footer className="footer">
                <p>© 2025 FaceLinked</p>
            </footer>
            
            <style jsx>{`
                :root {
                    --primary-color: #6c2bd9;
                    --primary-gradient: linear-gradient(135deg, #7e22ce, #3b82f6);
                    --secondary-color: #111827;
                    --accent-color: #f43f5e;
                    --text-color: #e5e7eb;
                    --light-text: #9ca3af;
                    --background: #0f172a;
                    --card-bg: rgba(17, 24, 39, 0.7);
                }

                .qr-landing-page {
                    font-family: 'Helvetica Neue', Arial, sans-serif;
                    max-width: 100%;
                    margin: 0;
                    padding: 0;
                    text-align: center;
                    min-height: 100vh;
                    display: flex;
                    flex-direction: column;
                    background: var(--background);
                    color: var(--text-color);
                    position: relative;
                    overflow-x: hidden;
                }

                .background-elements {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    z-index: 0;
                    overflow: hidden;
                }

                .circle {
                    position: absolute;
                    border-radius: 50%;
                    filter: blur(80px);
                }

                .circle-1 {
                    top: -10%;
                    right: -5%;
                    width: 500px;
                    height: 500px;
                    background: rgba(126, 34, 206, 0.25);
                }

                .circle-2 {
                    bottom: -15%;
                    left: -10%;
                    width: 600px;
                    height: 600px;
                    background: rgba(59, 130, 246, 0.2);
                }

                .circle-3 {
                    top: 40%;
                    left: 30%;
                    width: 300px;
                    height: 300px;
                    background: rgba(244, 63, 94, 0.15);
                }

                .header {
                    padding: 40px 20px;
                    position: relative;
                    z-index: 1;
                }

                .header h1 {
                    font-size: 3rem;
                    font-weight: 800;
                    margin: 0;
                    letter-spacing: -0.5px;
                    background: var(--primary-gradient);
                    -webkit-background-clip: text;
                    background-clip: text;
                    color: transparent;
                    text-shadow: 0 0 30px rgb(23, 74, 212);
                }

                .main-content {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    padding: 20px;
                    max-width: 500px;
                    margin: 0 auto;
                    position: relative;
                    z-index: 1;
                }

                .hero-section {
                    margin-bottom: 60px;
                }

                .hero-section h2 {
                    font-size: 1.8rem;
                    font-weight: 600;
                    max-width: 400px;
                    margin: 0 auto;
                    line-height: 1.3;
                }

                .download-section {
                    margin-bottom: 40px;
                    width: 100%;
                }

                .store-badges {
                    display: flex;
                    justify-content: center;
                    gap: 24px;
                    margin: 30px 0;
                }

                .badge {
                    text-decoration: none;
                    width: 180px;
                    transition: all 0.3s ease;
                }

                .badge:hover {
                    transform: translateY(-5px);
                    filter: brightness(1.1);
                }

                .placeholder-badge {
                    background: var(--card-bg);
                    color: white;
                    padding: 16px 20px;
                    border-radius: 12px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }

                .store-icon {
                    width: 32px;
                    height: 32px;
                    margin-bottom: 10px;
                }

                .simple-g-icon {
                    width: 32px;
                    height: 32px;
                    margin-bottom: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 24px;
                    font-weight: bold;
                }

                .store-text {
                    font-weight: bold;
                    font-size: 1.1rem;
                }

                .website-section {
                    margin-top: 20px;
                }

                .website-button {
                    display: inline-block;
                    background: transparent;
                    color: var(--text-color);
                    padding: 12px 24px;
                    border-radius: 8px;
                    text-decoration: none;
                    font-weight: 500;
                    transition: all 0.3s ease;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    backdrop-filter: blur(10px);
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
                }

                .website-button:hover {
                    border-color: rgba(255, 255, 255, 0.4);
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
                }

                .footer {
                    padding: 30px;
                    color: var(--light-text);
                    font-size: 0.9rem;
                    position: relative;
                    z-index: 1;
                }

                @media (max-width: 600px) {
                    .store-badges {
                        flex-direction: column;
                        align-items: center;
                    }

                    .header h1 {
                        font-size: 2.5rem;
                    }

                    .hero-section h2 {
                        font-size: 1.5rem;
                    }
                }
            `}</style>
        </div>
    )
}
