'use client';

import { Button } from "./button";

const BackButton = () => {
    const handleBack = () => {
        window.history.back();
    };

    return (
        <Button onClick={handleBack}>
        Volver
        </Button>
    );
};

export default BackButton;
