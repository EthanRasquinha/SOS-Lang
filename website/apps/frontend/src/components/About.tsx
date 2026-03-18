import React from 'react';

export const About: React.FC = () => {
    return (
        <div className="about-container">
            <h1>About Us</h1>
            
            <section className="about-section">
                <h2>Our Mission</h2>
                <p>
                    We are dedicated to creating innovative solutions that make a difference.
                    Our team is committed to delivering high-quality products and services.
                </p>
            </section>

            <section className="about-section">
                <h2>Who We Are</h2>
                <p>
                    Founded with a passion for excellence, we bring together talented
                    individuals from diverse backgrounds to solve complex problems.
                </p>
            </section>

            <section className="about-section">
                <h2>Get In Touch</h2>
                <p>
                    Have questions? We'd love to hear from you.
                    Contact us at: <a href="mailto:info@example.com">info@example.com</a>
                </p>
            </section>
        </div>
    );
};

export default About;