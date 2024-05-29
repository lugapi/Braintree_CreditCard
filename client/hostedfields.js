async function getClientToken() {
    try {
        const response = await fetch('./clientToken', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                // customerId: customerIdToSend.value
            })
        });

        if (!response.ok) {
            throw new Error('Unable to fetch client token');
        }

        const data = await response.json();
        loadBT(data.clientToken);
        console.log(data.clientToken);
    } catch (error) {
        console.error(error);
    }
}

let clientInstance;
let threeDSecure;
const enable3DS = document.getElementById('enable3DS');


enable3DS.addEventListener('change', function () {
    if (enable3DS.checked) {
        document.getElementById('jsoneditor').classList.remove('hidden');
    } else {
        document.getElementById('jsoneditor').classList.add('hidden');
    }
});

getClientToken();

function loadBT(clientToken) {
    braintree.client.create({
        authorization: clientToken.clientToken
    }).then(function (instance) {
        clientInstance = instance;

        return braintree.hostedFields.create({
            client: clientInstance,
            styles: {
                'input': {
                    'color': '#282c37',
                    'font-size': '16px',
                    'transition': 'color 0.1s',
                    'line-height': '3'
                },
                'input.invalid': {
                    'color': '#E53A40'
                },
                '::-webkit-input-placeholder': {
                    'color': 'rgba(0,0,0,0.6)'
                },
                ':-moz-placeholder': {
                    'color': 'rgba(0,0,0,0.6)'
                },
                '::-moz-placeholder': {
                    'color': 'rgba(0,0,0,0.6)'
                },
                ':-ms-input-placeholder': {
                    'color': 'rgba(0,0,0,0.6)'
                },
                'input::-ms-clear': {
                    'opacity': '0'
                }
            },
            fields: {
                number: {
                    selector: '#card-number',
                    placeholder: '1111 1111 1111 1111'
                },
                cvv: {
                    selector: '#cvv',
                    placeholder: '123'
                },
                expirationDate: {
                    selector: '#expiration-date',
                    placeholder: '10 / 2019'
                }
            }
        });
    }).then(function (hostedFieldsInstance) {
        hostedFieldsInstance.on('validityChange', function (event) {
            var formValid = Object.keys(event.fields).every(function (key) {
                return event.fields[key].isValid;
            });

            const buttonPay = document.getElementById('button-pay');
            if (formValid) {
                buttonPay.classList.add('show-button');
            } else {
                buttonPay.classList.remove('show-button');
            }
        });

        hostedFieldsInstance.on('empty', function (event) {
            document.querySelector('header').classList.remove('header-slide');
            document.querySelector('#card-image').classList.remove();
        });

        hostedFieldsInstance.on('cardTypeChange', function (event) {
            if (event.cards.length === 1) {
                document.querySelector('#card-image').classList.remove();
                document.querySelector('#card-image').classList.add(event.cards[0].type);
                document.querySelector('header').classList.add('header-slide');

                // Add the CSS class to the form here based on the card type
                const form = document.getElementById('my-sample-form');
                form.classList.remove('visa', 'mastercard');
                form.classList.add(event.cards[0].type.toLowerCase());

                if (event.cards[0].code.size === 4) {
                    hostedFieldsInstance.setAttribute({
                        field: 'cvv',
                        attribute: 'placeholder',
                        value: '1234'
                    });
                }
            } else {
                hostedFieldsInstance.setAttribute({
                    field: 'cvv',
                    attribute: 'placeholder',
                    value: '123'
                });
            }
        });

        // Select the submit button by its ID
        const submitButton = document.getElementById('button-pay');

        // Select the form by its ID
        const form = document.getElementById('my-sample-form');

        // Listen for click events on the submit button
        submitButton.addEventListener('click', function (event) {
            event.preventDefault();

            console.log("enable3DS.checked", enable3DS.checked);

            hostedFieldsInstance.tokenize().then(function (payload) {
                if (enable3DS.checked) {
                    const threeDSecureParameters = {
                        nonce: payload.nonce,
                        bin: payload.details.bin,
                        onLookupComplete: function (data, next) {
                            console.log("lookup-complete");
                            console.log(JSON.stringify(data));
                            document.getElementById('response3DS').innerHTML = prettyPrintObject(data);
                            document.querySelector('.step2').classList.remove('hidden');
                            next();
                        }
                    };

                    Object.assign(threeDSecureParameters, editor.get());

                    console.log("threeDSecureParameters", threeDSecureParameters);

                    braintree.threeDSecure.create({
                        client: clientInstance,
                        version: '2'
                    }).then(function (threeDSecure) {
                        return threeDSecure.verifyCard(threeDSecureParameters);
                    }).then(function (response) {
                        // Handle response
                        console.log("threeDSecure.verifyCard : ", response);
                        document.getElementById('responseHostedFieldsFinal').innerHTML = prettyPrintObject(response);
                        document.querySelector('.step3').classList.remove('hidden');
                    }).catch(function (error) {
                        // Handle error
                        console.error(error);
                    });
                } else {
                    document.querySelector('.divTransactionSale').classList.remove('hidden');
                }

                document.getElementById('responseHostedFields').innerHTML = prettyPrintObject(payload);
                document.querySelector('.step1').classList.remove('hidden');
                console.log("payload", payload);
            }).catch(function (err) {
                console.error(err);
            });
        }, false);
    }).catch(function (err) {
        console.error(err);
    });
}