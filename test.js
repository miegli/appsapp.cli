import {unirest} from "unirest";

let optionValidator = {
    target: [1, 2],
    source: {
        url: 'https://jsonplaceholder.typicode.com/users/',
        mapping: {
            text: 'address.geo.lat', value: 'id', disabled: (item) => {
                return item ? false : false
            }
        }
    },
    getOptions: () => {

        return new Promise(function (resolve, reject) {

            if (unirest) {
                var Request = unirest.get(optionValidator.source.url).type('json').end(function (response) {
                    let options = [];
                    if (response.error) {
                        reject(response.error);
                    } else {
                        response.body.forEach((item) => {
                            options.push({
                                value: optionValidator._getPropertyFromObject(item, optionValidator.source.mapping.value),
                                text: optionValidator._getPropertyFromObject(item, optionValidator.source.mapping.text),
                                disabled: optionValidator.source.mapping.disabled !== undefined ? optionValidator._getPropertyFromObject(item, optionValidator.source.mapping.disabled) : false,
                            })
                        });

                        resolve(options);
                    }

                });
            }

        });


    },

    _getPropertyFromObject: (inputObject, property) => {

        if (typeof property == 'function') {
            return inputObject !== undefined ? property(inputObject) : null;
        }

        if (property.indexOf(".") > 0) {
            return optionValidator._getPropertyFromObject(inputObject[property.substr(0, property.indexOf("."))], property.substr(property.indexOf(".") + 1));
        } else {
            return inputObject[property];
        }

    }
}


optionValidator.getOptions().then((options) => {

    let allValide = true;
    let values = {};
    options.forEach((option) => {
        if (!option.disabled) {
            values[option.value] = true;
        }
    });
    optionValidator.target.forEach((value) => {
        if (values[value] == undefined) {
            allValide = false;
        }
    });

    console.log(allValide);

}).catch((error) => {
    console.log(error);
});