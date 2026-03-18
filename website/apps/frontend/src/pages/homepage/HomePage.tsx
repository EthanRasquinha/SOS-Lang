import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const HomePage = () => {
    console.log('HomePage rendering');
    return (
        <div className="home-page  min-h-screen min-w-screen">

            <main className="main-content">
                <Card className="hero">
                    <CardHeader>
                        <CardTitle>Hero Section</CardTitle>
                        <CardDescription>Add your hero content here</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p>Welcome to SOS-LANG, your ultimate programming language solution.</p>
                    </CardContent>
                </Card>

                <Card className="features">
                    <CardHeader>
                        <CardTitle>Features</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="feature-grid">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Feature One</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p>Description of feature one</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Feature Two</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p>Description of feature two</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Feature Three</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p>Description of feature three</p>
                                </CardContent>
                            </Card>
                        </div>
                    </CardContent>
                </Card>
            </main>

            <footer className="footer">
                <p>&copy; 2024 Your Company. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default HomePage;