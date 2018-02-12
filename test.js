var getNestedValue = (property, value) => {

    if (property.indexOf(".") > 0) {
        return getNestedValue(property.substr(property.indexOf('.')+1), value[property.substr(0,property.indexOf("."))]);
    } else {
        return value[property];
    }

}


console.log(getNestedValue('a.c.d',{a: {b: 1, c: {d: 2}}}));
