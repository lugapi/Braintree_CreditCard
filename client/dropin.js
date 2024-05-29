const enable3DSCheckbox = document.getElementById('enable-3ds-dropin');
const submitButton = document.getElementById('submit-button');
const responsesDiv = document.getElementById('responsesDiv');
const customerIdToSend = document.getElementById('customerId');
const customerIdGeneratedOrUsed = document.getElementById('customerIdGeneratedOrUsed');
const customerIdGeneratedOrUsedValue = document.getElementById('customerIdGeneratedOrUsedValue');
const showPayPal = document.getElementById('showPayPal');
const ppOptions = document.getElementById('ppOptions');

function resetDropIn() {
    document.getElementById('dropin-container').innerHTML = "";
    document.getElementById('response3DS').innerHTML = "";
    submitButton.classList.add('hidden');
    responsesDiv.classList.add('hidden');
    customerIdGeneratedOrUsed.classList.add('hidden');
}

// Reload the script when the "Enable 3DS" checkbox changes
enable3DSCheckbox.addEventListener('change', function () {
    resetDropIn()
});
customerIdToSend.addEventListener('input', function () {
    resetDropIn()
});

enable3DSCheckbox.addEventListener('change', function () {
    if (enable3DSCheckbox.checked) {
        document.getElementById('jsoneditor').classList.remove('hidden');
    } else {
        document.getElementById('jsoneditor').classList.add('hidden');
    }
});

// Load Braintree Drop In onclick loadDropInBtn
document.getElementById('loadDropInBtn').onclick = function () {
    loadBTDropin();
    submitButton.classList.remove('hidden');
};

function loadBTDropin() {
    document.getElementById('dropin-container').innerHTML = "";
    document.getElementById('response3DS').innerHTML = "";

    fetch('./clientToken', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                customerID: customerIdToSend.value
            }) // Add any data to send in the request body
        })
        .then(response => response.json())
        .then(data => {
            var threeDSecureParameters = editor.get();

            submitButton.classList.remove('hidden');
            if (data.clientToken.customer) {
                customerIdToSend.value = data.clientToken.customer.id;

                let url = "https://sandbox.braintreegateway.com/merchants/"+mid+"/customers/"+data.clientToken.customer.id;
                customerIdGeneratedOrUsedValue.innerText = data.clientToken.customer.id;
                customerIdGeneratedOrUsedValue.href = url;
            
                customerIdGeneratedOrUsed.classList.remove('hidden');
            }

            var config = {
                authorization: data.clientToken.clientToken,
                container: '#dropin-container',
                threeDSecure: document.getElementById('enable-3ds-dropin').checked,
                vaultManager: true
            };
            
            // Include PayPal config only if ppOptions is checked
            if (showPayPal.checked) {
                config.paypal = getPaypalConfig();
            }

            braintree.dropin.create(config, function (createErr, instance) {
                submitButton.addEventListener('click', function (e) {
                    e.preventDefault();

                    // Verify if the 3DS checkbox is checked
                    var enable3DS = enable3DSCheckbox.checked;

                    instance.requestPaymentMethod({
                        threeDSecure: enable3DS ? threeDSecureParameters : false
                    }).then(function (payload) {
                        //  Send payload.nonce to your server
                        console.log(payload);
                        document.getElementById('response3DS').innerHTML = prettyPrintObject(payload);
                        responsesDiv.classList.remove('hidden');
                    }).catch(function (error) {
                        console.log(error);
                    });
                });
            });
        })
        .catch(error => console.error(error));
}

// Function to get the PayPal configuration based on the flow
function getPaypalConfig() {
    const flow = document.getElementById('flow').value;
    const amount = document.getElementById('amount').value;

    if (flow === 'checkout') {
        return {
            flow: 'checkout',
            amount: amount,
            currency: currency,
        };
    } else if (flow === 'vault') {
        return {
            flow: 'vault',
            // ... additional configurations for Vault
        };
    } else {
        return {};
    }
}

// On flow selection display amount or not
document.getElementById('flow').addEventListener('change', function () {
    if (this.value === 'checkout') {
        document.getElementById('amountSection').classList.remove('hidden');
    } else {
        document.getElementById('amountSection').classList.add('hidden');
    }
})

document.getElementById('showPayPal').addEventListener('change', function () {
    if (this.checked) {
        console.log('pp checked')
        ppOptions.classList.remove('hidden');
    } else {
        console.log('pp not checked')
        ppOptions.classList.add('hidden');
    }
})