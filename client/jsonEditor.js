const jsonContent = {
    "email": "test@example.com",
    "amount": "20",
    "billingAddress": {
        "region": "CA",
        "surname": "Doe",
        "locality": "Oakland",
        "givenName": "Jill",
        "postalCode": "12345",
        "phoneNumber": "8101234567",
        "streetAddress": "555 Smith St.",
        "extendedAddress": "#5",
        "countryCodeAlpha2": "US"
    },
    "requestedExemptionType": "low_value",
    "additionalInformation": {
        "shippingPhone": "8101234567",
        "shippingAddress": {
            "region": "CA",
            "locality": "Oakland",
            "postalCode": "12345",
            "streetAddress": "555 Smith st",
            "extendedAddress": "#5",
            "countryCodeAlpha2": "US"
        },
        "shippingSurname": "Doe",
        "workPhoneNumber": "5555555555",
        "shippingGivenName": "Jill"
    }
}

const container = document.getElementById("jsoneditor");
const options = {
    modes: ["text", "code", "tree", "form", "view"],
    mode: "tree",
    search: true,
};
const editor = new JSONEditor(container, options);

editor.set(jsonContent);
editor.expandAll();