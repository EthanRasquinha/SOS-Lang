import * as React from "react";
type InformedConsentProps = {
    open: boolean;
    onClose: () => void;
    onConsent: () => void;
};
export declare const InformedConsent: ({ open, onClose, onConsent }: InformedConsentProps) => React.JSX.Element | null;
export default InformedConsent;
